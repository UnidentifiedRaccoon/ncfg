#!/usr/bin/env bash
#
# Install (sync) repo-managed Codex skills into the user's Codex home:
#   source:  ./.codex/skills
#   target:  ~/.codex/skills
#
# Only syncs the explicitly listed skills and never touches:
#   ~/.codex/skills/.system
#   ~/.codex/skills/sora
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC_DIR="$ROOT_DIR/.codex/skills"
DST_DIR="${HOME}/.codex/skills"

SKILLS=(
  "adhd-design-expert"
  "collage-layout-expert"
  "color-theory-palette-harmony-expert"
  "competitive-cartographer"
  "design-archivist"
  "design-system-creator"
  "explaining-code"
  "frontend-design"
  "native-app-designer"
  "photo-composition-critic"
  "typography-expert"
  "vaporwave-glassomorphic-ui-designer"
  "vibe-matcher"
  "web-design-expert"
  "windows-3-1-web-designer"
)

mkdir -p "$DST_DIR"

for skill in "${SKILLS[@]}"; do
  src="$SRC_DIR/$skill"
  dst="$DST_DIR/$skill"

  if [[ ! -d "$src" ]]; then
    echo "[ERROR] Missing source skill directory: $src" >&2
    exit 1
  fi

  mkdir -p "$dst"
  rsync -a --delete --exclude '.DS_Store' "$src"/ "$dst"/
  echo "[OK] Synced $skill"
done

echo "[DONE] Synced ${#SKILLS[@]} skills into $DST_DIR"

