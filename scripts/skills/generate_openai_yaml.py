#!/usr/bin/env python3
"""
Generate agents/openai.yaml for a skill folder without external deps.

Usage:
  scripts/skills/generate_openai_yaml.py <skill_dir> [--interface key=value ...]

Notes:
  - Writes interface fields only (no dependencies/policy).
  - Quotes all string values.
  - Validates short_description length (25-64 chars).
  - default_prompt must mention the skill as $<skill-name>.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ALLOWED_INTERFACE_KEYS = {
    "display_name",
    "short_description",
    "default_prompt",
    "icon_small",
    "icon_large",
    "brand_color",
}

ACRONYMS = {
    "ADHD",
    "AI",
    "API",
    "CSS",
    "HTML",
    "MCP",
    "UI",
    "UX",
    "Y2K",
}


def yaml_quote(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
    return f'"{escaped}"'


def read_frontmatter_name(skill_md: Path) -> str:
    content = skill_md.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        raise ValueError("Invalid or missing YAML frontmatter")
    fm = match.group(1).splitlines()
    for line in fm:
        if line.startswith("name:"):
            name = line.split(":", 1)[1].strip()
            if not name:
                break
            return name
    raise ValueError("Frontmatter is missing name:")


def format_display_name(skill_name: str) -> str:
    parts = [p for p in skill_name.split("-") if p]
    out: list[str] = []
    i = 0
    while i < len(parts):
        part = parts[i]
        # Join digit-digit tokens as "3.1" (e.g., windows-3-1-...)
        if part.isdigit() and i + 1 < len(parts) and parts[i + 1].isdigit():
            out.append(f"{part}.{parts[i + 1]}")
            i += 2
            continue

        lower = part.lower()
        upper = part.upper()
        if upper in ACRONYMS:
            out.append(upper)
        elif lower == "ios":
            out.append("iOS")
        elif lower == "macos":
            out.append("macOS")
        else:
            out.append(part.capitalize())
        i += 1
    return " ".join(out)


def generate_short_description(display_name: str) -> str:
    # Avoid the generic "Help with ... tasks" phrasing.
    desc = f"{display_name} workflows"
    if len(desc) < 25:
        desc = f"{display_name} workflows and checklists"
    if len(desc) < 25:
        desc = f"{display_name} guidance and workflows"

    if len(desc) > 64:
        desc = f"{display_name} workflows"
    if len(desc) > 64:
        desc = f"{display_name} guidance"
    if len(desc) > 64:
        desc = f"{display_name} helper"
    if len(desc) > 64:
        desc = desc[:64].rstrip()

    if len(desc) < 25:
        desc = (desc + " workflows")[:64].rstrip()
    return desc


def parse_interface_overrides(items: list[str]) -> dict[str, str]:
    overrides: dict[str, str] = {}
    for item in items:
        if "=" not in item:
            raise ValueError(f"Invalid override '{item}'. Use key=value.")
        key, value = item.split("=", 1)
        key = key.strip()
        value = value.strip()
        if key not in ALLOWED_INTERFACE_KEYS:
            allowed = ", ".join(sorted(ALLOWED_INTERFACE_KEYS))
            raise ValueError(f"Unknown interface key '{key}'. Allowed: {allowed}")
        overrides[key] = value
    return overrides


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate agents/openai.yaml for a skill folder.")
    parser.add_argument("skill_dir", help="Path to the skill directory")
    parser.add_argument(
        "--interface",
        action="append",
        default=[],
        help="Interface override in key=value format (repeatable)",
    )
    args = parser.parse_args()

    skill_dir = Path(args.skill_dir).resolve()
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        print(f"[ERROR] SKILL.md not found: {skill_md}", file=sys.stderr)
        return 1

    skill_name = read_frontmatter_name(skill_md)
    overrides = parse_interface_overrides(args.interface)

    display_name = overrides.get("display_name") or format_display_name(skill_name)
    short_description = overrides.get("short_description") or generate_short_description(display_name)
    default_prompt = overrides.get("default_prompt") or f"Use ${skill_name} to help with {display_name}."

    if not (25 <= len(short_description) <= 64):
        print(
            f"[ERROR] short_description must be 25-64 characters (got {len(short_description)}).",
            file=sys.stderr,
        )
        return 1

    if f"${skill_name}" not in default_prompt:
        print(
            f"[ERROR] default_prompt must mention the skill as ${skill_name}.",
            file=sys.stderr,
        )
        return 1

    interface_lines = [
        "interface:",
        f"  display_name: {yaml_quote(display_name)}",
        f"  short_description: {yaml_quote(short_description)}",
    ]

    # Optional fields in stable order.
    for key in ("icon_small", "icon_large", "brand_color", "default_prompt"):
        value = overrides.get(key)
        if value is not None:
            interface_lines.append(f"  {key}: {yaml_quote(value)}")
    if "default_prompt" not in overrides:
        interface_lines.append(f"  default_prompt: {yaml_quote(default_prompt)}")

    agents_dir = skill_dir / "agents"
    agents_dir.mkdir(parents=True, exist_ok=True)
    out_path = agents_dir / "openai.yaml"
    out_path.write_text("\n".join(interface_lines) + "\n", encoding="utf-8")
    print(f"[OK] Wrote {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

