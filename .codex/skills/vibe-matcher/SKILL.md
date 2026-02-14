---
name: vibe-matcher
description: Translate abstract vibe and brand adjectives into concrete visual specs (colors, typography, layout, motion) with rationale. Use when the user describes how something should feel (e.g., premium, edgy, playful, trustworthy) and needs actionable design direction rather than code.
---

# Vibe Matcher

## Inputs I Need

- What is being designed (portfolio, SaaS landing, dashboard, mobile app, e-commerce)?
- Target audience and their expectations (B2B, consumers, age range, region).
- Primary vibe words (1-2) and secondary vibe words (up to 3).
- "Never be" boundaries (what vibes to avoid).
- Constraints: existing brand colors, accessibility, dark mode, platform.

## Outputs I Will Produce

- A `VisualDNA` spec (JSON) with:
  - `colors` (hexes + usage + rationale)
  - `typography` (families/weights/scale direction + rationale)
  - `layout` (grid/density/hierarchy + rationale)
  - `interactions` (timing/patterns + rationale)
  - `moodBoard` (optional reference links + takeaways)
- A short explanation of tradeoffs (why this matches the domain).

## Workflow

1. Intake: extract domain, audience, constraints, and the exact meaning of each vibe word in context.
2. Resolve conflicts: pick a primary vibe; treat other vibes as accents, not equals.
3. Translate to concrete decisions:
   - Colors: dominant + accent; include neutrals; plan dark mode.
   - Type: heading/body roles; pick hierarchy style (calm vs loud).
   - Layout: symmetry vs asymmetry; whitespace strategy; focal points.
   - Motion: speed and interaction personality; respect reduced motion.
4. Package as `VisualDNA` JSON and ensure every section has a non-empty `rationale`.
5. If writing JSON to disk, validate with `scripts/validate_visual_dna.sh`.

## Quality Bar

- Specs are domain-aware (\"premium\" differs in fintech vs wellness vs fashion).
- Colors are valid hex and have role/usage (not just a palette).
- Typography decisions include hierarchy intent, not just font names.
- Interactions are intentional and limited to a few memorable moments.
- All rationales are explicit and non-empty (the validator checks this).

## References

| File | Use when |
| --- | --- |
| `references/vibe-examples.md` | Need translation tables, vocab, examples, and anti-patterns |
