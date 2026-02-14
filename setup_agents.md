# Agent Setup (Claude + Codex)

This repo supports using Claude and Codex side-by-side via two separate skill sets:

- `./.claude` is used by Claude Code (project rules + Claude skills).
- `./.codex/skills` is the source of truth for Codex skills and must be installed into `~/.codex/skills`.

## TL;DR

After `git clone` (or after `git pull`):

```bash
python3 scripts/skills/audit_codex_skills.py
bash scripts/skills/install_codex_skills.sh
```

## Claude (`./.claude`)

No install step is required.

- Open this repo in Claude Code and it will automatically pick up `./.claude/*`.
- Rules live in `./.claude/rules/*.md`, skills live in `./.claude/skills/*`.

## Codex (`./.codex` -> `~/.codex`)

Codex reads skills from your home directory, so sync repo skills into `~/.codex/skills`:

```bash
bash scripts/skills/install_codex_skills.sh
```

The script:

- Syncs only the explicitly listed skills from `./.codex/skills` into `~/.codex/skills`.
- Never touches `~/.codex/skills/.system` or `~/.codex/skills/sora`.

Note: if you already have skills with the same names in `~/.codex/skills`, they will be overwritten.

## Verification (Recommended)

Audit Codex skill structure and UI metadata:

```bash
python3 scripts/skills/audit_codex_skills.py
```

## Maintenance (Rare)

Some skills are imported from the MIT-licensed repository `erichowens/some_claude_skills`.

To refresh the pinned SHA and update upstream-derived files:

```bash
bash scripts/skills/import_some_claude_skills.sh --update --force
python3 scripts/skills/audit_codex_skills.py
bash scripts/skills/install_codex_skills.sh
```

Note: `import_some_claude_skills.sh` updates the Claude version under `./.claude/skills/*` and refreshes upstream-derived files inside Codex skills (e.g., `references/*` and `references/upstream.md`) without overwriting curated Codex `SKILL.md` files.
