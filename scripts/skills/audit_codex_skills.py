#!/usr/bin/env python3
"""
Audit repo-managed Codex skills under ./.codex/skills.

Checks:
  - SKILL.md frontmatter exists and contains ONLY name/description keys
  - name matches folder name and is hyphen-case
  - agents/openai.yaml exists with display_name/short_description/default_prompt
  - short_description length is 25-64 characters
  - default_prompt mentions $<skill-name>
  - root folder has no junk files (CHANGELOG.md, README.md, Untitled, .DS_Store)
  - referenced files in the "## References" section exist on disk

No external dependencies.
"""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass
from pathlib import Path


SKILL_NAME_RE = re.compile(r"^[a-z0-9-]+$")
FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n?", re.DOTALL)
FM_KEY_RE = re.compile(r"^([A-Za-z0-9_-]+):")

INLINE_CODE_RE = re.compile(r"`([^`]+)`")

DISALLOWED_ROOT_FILES = {"CHANGELOG.md", "README.md", "Untitled", ".DS_Store"}


@dataclass(frozen=True)
class Finding:
    skill: str
    message: str


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def parse_frontmatter(skill_md: Path) -> tuple[dict[str, str], str]:
    content = read_text(skill_md)
    m = FRONTMATTER_RE.match(content)
    if not m:
        raise ValueError("Missing/invalid YAML frontmatter block")
    fm_text = m.group(1)
    body = content[m.end() :]

    fm: dict[str, str] = {}
    for line in fm_text.splitlines():
        line = line.rstrip()
        if not line.strip():
            continue
        km = FM_KEY_RE.match(line)
        if not km:
            continue
        key = km.group(1)
        value = line.split(":", 1)[1].strip()
        fm[key] = value
    return fm, body


def parse_openai_yaml(openai_yaml: Path) -> dict[str, str]:
    # Minimal parser: we only care about interface.* keys.
    lines = read_text(openai_yaml).splitlines()
    in_interface = False
    out: dict[str, str] = {}
    for raw in lines:
        line = raw.rstrip("\n")
        if not line.strip():
            continue
        if line.strip() == "interface:":
            in_interface = True
            continue
        if not in_interface:
            continue
        if re.match(r"^[A-Za-z0-9_-]+:", line) and not line.startswith(" "):
            # next top-level section (we don't expect any)
            break
        m = re.match(r"^\s{2}([A-Za-z0-9_-]+):\s*(.+)$", line)
        if not m:
            continue
        key = m.group(1)
        value = m.group(2).strip()
        if len(value) >= 2 and value[0] == value[-1] == '"':
            value = value[1:-1]
        out[key] = value
    return out


def extract_reference_paths(skill_md_body: str) -> list[str]:
    lines = skill_md_body.splitlines()
    try:
        start = next(i for i, l in enumerate(lines) if l.strip() == "## References")
    except StopIteration:
        return []

    refs_block: list[str] = []
    for l in lines[start + 1 :]:
        if l.startswith("## "):
            break
        refs_block.append(l)

    paths: list[str] = []
    for l in refs_block:
        for code in INLINE_CODE_RE.findall(l):
            code = code.strip()
            if not code:
                continue
            if "://" in code:
                continue
            if " " in code:
                continue
            if "/" not in code:
                continue
            # Only treat relative paths as references.
            if code.startswith("./"):
                code = code[2:]
            if code.startswith("/"):
                continue
            paths.append(code)
    # stable + unique
    seen: set[str] = set()
    uniq: list[str] = []
    for p in paths:
        if p in seen:
            continue
        seen.add(p)
        uniq.append(p)
    return uniq


def main() -> int:
    root_dir = Path(__file__).resolve().parents[2]
    skills_dir = root_dir / ".codex" / "skills"
    if not skills_dir.exists():
        print(f"[ERROR] Missing skills directory: {skills_dir}", file=sys.stderr)
        return 1

    findings: list[Finding] = []

    for skill_dir in sorted([p for p in skills_dir.iterdir() if p.is_dir()]):
        skill = skill_dir.name
        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            findings.append(Finding(skill, "Missing SKILL.md"))
            continue

        try:
            fm, body = parse_frontmatter(skill_md)
        except Exception as exc:
            findings.append(Finding(skill, f"SKILL.md frontmatter error: {exc}"))
            continue

        unexpected_keys = sorted(set(fm.keys()) - {"name", "description"})
        if unexpected_keys:
            findings.append(
                Finding(
                    skill,
                    f"SKILL.md frontmatter has unexpected keys: {', '.join(unexpected_keys)}",
                )
            )

        name = fm.get("name", "").strip()
        if name != skill:
            findings.append(Finding(skill, f"Frontmatter name mismatch: '{name}' != '{skill}'"))
        if not SKILL_NAME_RE.match(skill):
            findings.append(Finding(skill, "Folder name is not hyphen-case"))

        desc = fm.get("description", "").strip()
        if not desc:
            findings.append(Finding(skill, "Missing description in frontmatter"))
        if "<" in desc or ">" in desc:
            findings.append(Finding(skill, "Description must not contain < or >"))
        if len(desc) > 1024:
            findings.append(Finding(skill, f"Description too long: {len(desc)} chars"))

        for junk in DISALLOWED_ROOT_FILES:
            if (skill_dir / junk).exists():
                findings.append(Finding(skill, f"Disallowed file in skill root: {junk}"))

        openai_yaml = skill_dir / "agents" / "openai.yaml"
        if not openai_yaml.exists():
            findings.append(Finding(skill, "Missing agents/openai.yaml"))
        else:
            interface = parse_openai_yaml(openai_yaml)
            for key in ("display_name", "short_description", "default_prompt"):
                if key not in interface or not interface[key].strip():
                    findings.append(Finding(skill, f"agents/openai.yaml missing interface.{key}"))

            short_desc = interface.get("short_description", "")
            if short_desc and not (25 <= len(short_desc) <= 64):
                findings.append(
                    Finding(
                        skill,
                        f"short_description length must be 25-64 (got {len(short_desc)})",
                    )
                )

            default_prompt = interface.get("default_prompt", "")
            if default_prompt and f"${skill}" not in default_prompt:
                findings.append(Finding(skill, f"default_prompt must mention ${skill}"))

        # References section paths must exist.
        for rel in extract_reference_paths(body):
            target = skill_dir / rel
            if not target.exists():
                findings.append(Finding(skill, f"Missing referenced file: {rel}"))

    if findings:
        print("[FAIL] Codex skills audit failed:\n", file=sys.stderr)
        for f in findings:
            print(f"- {f.skill}: {f.message}", file=sys.stderr)
        print(f"\nTotal findings: {len(findings)}", file=sys.stderr)
        return 1

    print(f"[OK] Codex skills audit passed ({skills_dir})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

