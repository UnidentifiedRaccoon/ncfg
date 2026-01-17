# General project rules (NCFG)

## Working style
- Prefer small, reviewable diffs. If a change is large — split into steps.
- Before editing: quickly inspect existing patterns in the repo (components, fetching, styles).
- When uncertain, propose 2–3 options with tradeoffs, then pick one and implement.

## Output quality bar
- No “placeholder-ish” UI: every block needs clear hierarchy (H1 → lead → CTA).
- Text must be simple Russian, short sentences, minimal jargon.

## Reusability
- Prefer reusable “sections” and “blocks” over one-off page markup.
- Keep design tokens centralized (CSS vars / theme module) instead of per-component ad-hoc values.

## Definition of done for a page/section
- Responsive: mobile/tablet/desktop
- A11y basics: semantic tags, labels, keyboard focus, contrast
- SEO basics: title/description + OG image when relevant
