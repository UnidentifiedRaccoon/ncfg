---
name: typography-expert
description: Typography planning and implementation: font pairing, hierarchy, type scales (modular and fluid), variable fonts, OpenType features, and performance (loading, subsetting, CLS). Use for choosing fonts for a brand/design system, defining typography tokens, or fixing font-related a11y/perf issues.
---

# Typography Expert

## Inputs I Need

- Product type: marketing site, web app UI, editorial/long-form, dashboard
- Audience + brand adjectives (3-5 words)
- Languages/scripts: Latin, Cyrillic, CJK, RTL; any special glyph needs
- Constraints: self-host vs Google Fonts, variable font allowed, font budget (KB), CDN
- Current issues (if any): CLS, FOIT/FOUT, slow load, unreadable hierarchy

## Outputs I Will Produce

- Font pairing recommendation (usually max 2 families) with rationale
- Type scale spec: base size, headings, line-heights, spacing rules
- Fluid typography formulas (clamp) with min/max viewport assumptions
- Loading plan: preload, font-display, subsetting, fallback stack, size-adjust
- Token sketch (CSS variables) suitable for a design system
- A11y notes: resizing, line length, contrast assumptions, spacing overrides

## Workflow

1. Classify the content: UI vs long-form reading; pick a base size and line length target.
2. Choose families:
   - Prefer 1 superfamily or 2 complementary families (heading + body).
   - Validate glyph coverage for required scripts and weights.
3. Define hierarchy:
   - Pick a scale ratio or use a small set of heading sizes.
   - Set per-level line-height (headings tighter, body looser).
4. Make it responsive:
   - Use clamp for body and headings.
   - Verify min/max sizes at the smallest and largest target viewports.
5. Make it fast:
   - WOFF2 only; subset by script; preload critical fonts.
   - Use font-display: swap and match fallback metrics (size-adjust) to avoid CLS.
6. Ship tokens + docs:
   - Map decisions to semantic tokens (e.g., --font-body, --text-h1).
   - Provide copy-pastable CSS snippets.

## Quality Bar

- No more than 2 families loaded unless you can justify it.
- No visible layout jump when fonts load (fallback metrics matched).
- Type hierarchy is obvious on mobile and desktop.
- The font set covers all required languages (no tofu boxes).
- Meets basic WCAG expectations for resizing and readability.
- Loading plan has an explicit budget target (KB and number of files).

## References

| File | Use when |
| --- | --- |
| `references/typography-playbook.md` | Need ratios/tables, OpenType, anti-patterns, and extended examples |
