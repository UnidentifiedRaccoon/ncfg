#!/usr/bin/env bash
#
# Import a small, pinned subset of skills from:
#   https://github.com/erichowens/some_claude_skills (MIT)
#
# Copies the selected skills into:
#   - ./.claude/skills/<skill>   (Claude version; keep upstream as-is)
#
# For Codex, keeps curated skill roots intact and only refreshes:
#   - ./.codex/skills/<skill>/references/*
#   - ./.codex/skills/<skill>/scripts/* (if present)
#   - ./.codex/skills/<skill>/references/upstream.md (verbatim upstream SKILL.md snapshot)
#
# Also writes:
#   - ./scripts/skills/third_party_some_claude_skills.VERSION
#   - ./third_party/erichowens-some_claude_skills.LICENSE
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

REPO_GIT_URL="https://github.com/erichowens/some_claude_skills.git"
VERSION_FILE="$ROOT_DIR/scripts/skills/third_party_some_claude_skills.VERSION"
LICENSE_OUT="$ROOT_DIR/third_party/erichowens-some_claude_skills.LICENSE"

CLAUDE_SKILLS_DIR="$ROOT_DIR/.claude/skills"
CODEX_SKILLS_DIR="$ROOT_DIR/.codex/skills"

SKILLS=(
  "native-app-designer"
  "vaporwave-glassomorphic-ui-designer"
  "windows-3-1-web-designer"
  "competitive-cartographer"
  "collage-layout-expert"
  "photo-composition-critic"
  "adhd-design-expert"
)

usage() {
  cat <<'EOF'
Usage:
  scripts/skills/import_some_claude_skills.sh [--update] [--force]

Options:
  --update  Refresh the pinned upstream SHA (writes VERSION file).
  --force   Overwrite existing skill folders in .claude/skills (Codex stays curated).
EOF
}

FORCE=0
UPDATE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force) FORCE=1 ;;
    --update) UPDATE=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "[ERROR] Unknown argument: $1" >&2; usage >&2; exit 1 ;;
  esac
  shift
done

fetch_main_sha() {
  git ls-remote "$REPO_GIT_URL" "refs/heads/main" | awk '{print $1}'
}

read_pinned_sha() {
  if [[ -f "$VERSION_FILE" ]]; then
    head -n 1 "$VERSION_FILE" | awk '{print $1}'
  fi
}

write_version_file() {
  local sha="$1"
  mkdir -p "$(dirname "$VERSION_FILE")"
  cat >"$VERSION_FILE" <<EOF
$sha
repo=https://github.com/erichowens/some_claude_skills
ref=refs/heads/main
EOF
}

sha="$(read_pinned_sha || true)"
if [[ -z "${sha:-}" || "$UPDATE" -eq 1 ]]; then
  sha="$(fetch_main_sha)"
  if [[ -z "$sha" ]]; then
    echo "[ERROR] Failed to fetch main SHA from $REPO_GIT_URL" >&2
    exit 1
  fi
  write_version_file "$sha"
fi

tmp_dir="$(mktemp -d)"
cleanup() { rm -rf "$tmp_dir"; }
trap cleanup EXIT

repo_root="$tmp_dir/some_claude_skills"
echo "[INFO] Sparse-fetching $REPO_GIT_URL @ $sha"

git init -q "$repo_root"
git -C "$repo_root" remote add origin "$REPO_GIT_URL"

# Configure sparse checkout BEFORE checkout to avoid downloading huge artifacts.
git -C "$repo_root" sparse-checkout init --no-cone

sparse_paths=()
for skill in "${SKILLS[@]}"; do
  sparse_paths+=("/.claude/skills/$skill/")
done
# License file path in upstream varies; include common candidates.
sparse_paths+=("/LICENSE" "/LICENSE.md")

git -C "$repo_root" sparse-checkout set --no-cone "${sparse_paths[@]}"

if ! git -C "$repo_root" fetch -q --depth 1 --filter=blob:none origin "$sha"; then
  echo "[ERROR] Failed to fetch pinned SHA $sha from upstream." >&2
  echo "        Try running again with --update to pin the current main SHA." >&2
  exit 1
fi
git -C "$repo_root" checkout -q FETCH_HEAD

license_src=""
for candidate in "$repo_root/LICENSE" "$repo_root/LICENSE.md"; do
  if [[ -f "$candidate" ]]; then
    license_src="$candidate"
    break
  fi
done
if [[ -z "$license_src" ]]; then
  echo "[ERROR] Upstream LICENSE not found after sparse checkout in $repo_root" >&2
  exit 1
fi

mkdir -p "$ROOT_DIR/third_party"
cp "$license_src" "$LICENSE_OUT"

mkdir -p "$CLAUDE_SKILLS_DIR" "$CODEX_SKILLS_DIR"

copy_skill_dir() {
  local src="$1"
  local dst="$2"

  if [[ -d "$dst" && "$FORCE" -eq 0 ]]; then
    echo "[SKIP] $dst exists (use --force to overwrite)"
    return 0
  fi

mkdir -p "$(dirname "$dst")"
  rsync -a --delete --exclude '.DS_Store' "$src"/ "$dst"/
  echo "[OK] Copied $(basename "$dst") -> $dst"
}

refresh_codex_skill_from_upstream() {
  local upstream_skill_dir="$1" # .../.claude/skills/<skill>
  local codex_skill_dir="$2"    # ./.codex/skills/<skill>
  local skill_name="$3"

  mkdir -p "$codex_skill_dir/references"

  # Keep curated SKILL.md + agents/openai.yaml intact; only refresh references/scripts.
  if [[ -d "$upstream_skill_dir/references" ]]; then
    rsync -a --delete --exclude '.DS_Store' --exclude 'upstream.md' \
      "$upstream_skill_dir/references"/ "$codex_skill_dir/references"/
  fi

  if [[ -d "$upstream_skill_dir/scripts" ]]; then
    mkdir -p "$codex_skill_dir/scripts"
    rsync -a --delete --exclude '.DS_Store' \
      "$upstream_skill_dir/scripts"/ "$codex_skill_dir/scripts"/
  fi

  # Always refresh upstream snapshot file (verbatim SKILL.md).
  local upstream_md="$upstream_skill_dir/SKILL.md"
  if [[ -f "$upstream_md" ]]; then
    cat >"$codex_skill_dir/references/upstream.md" <<EOF
# Upstream SKILL.md (verbatim copy)

Source: erichowens/some_claude_skills@$sha (.claude/skills/$skill_name/SKILL.md)
License: MIT (see /third_party/erichowens-some_claude_skills.LICENSE)

EOF
    cat "$upstream_md" >>"$codex_skill_dir/references/upstream.md"
  fi
}

for skill in "${SKILLS[@]}"; do
  src_dir="$repo_root/.claude/skills/$skill"
  if [[ ! -d "$src_dir" ]]; then
    echo "[ERROR] Skill folder not found in upstream checkout: $skill" >&2
    echo "        Expected: $src_dir" >&2
    exit 1
  fi

  copy_skill_dir "$src_dir" "$CLAUDE_SKILLS_DIR/$skill"

  # Codex side: do not clobber curated SKILL.md; only refresh upstream-derived assets.
  codex_dir="$CODEX_SKILLS_DIR/$skill"
  if [[ ! -d "$codex_dir" ]]; then
    echo "[WARN] Missing codex skill directory: $codex_dir"
    echo "       Creating a baseline copy (you likely need to curate/trim it afterwards)."
    rsync -a --delete --exclude '.DS_Store' --exclude 'CHANGELOG.md' "$src_dir"/ "$codex_dir"/
  fi
  refresh_codex_skill_from_upstream "$src_dir" "$codex_dir" "$skill"
done

echo "[DONE] Imported some_claude_skills @ $sha"
