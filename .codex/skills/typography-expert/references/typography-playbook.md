# Typography Playbook

This file is a deeper reference for `$typography-expert`. Keep `SKILL.md` lean; load this only when you need tables, examples, or implementation details.

## Font Selection (Heuristics)

### Serif vs Sans (quick decision tree)

- Need formal/traditional/authoritative -> serif
- Need modern/clean/technical -> sans
- Need friendly/approachable -> humanist sans
- Need geometric/structured/tech-forward -> geometric sans
- Need long-form/editorial reading -> reading-optimized serif

### Pairing rules

1. Contrast, not conflict: distinct roles, compatible proportions.
2. Match x-height (or compensate with CSS metrics).
3. Prefer superfamilies when you need safety (serif + sans from same family).
4. Limit variety: usually 2 families max (head + body).

## Type Scales

### Common modular ratios

| Ratio | Name | Typical use |
| --- | --- | --- |
| 1.067 | Minor Second | dense UIs, small screens |
| 1.125 | Major Second | general web content |
| 1.2 | Minor Third | balanced hierarchy |
| 1.25 | Major Third | marketing and big headings |
| 1.333 | Perfect Fourth | bold hero sections |

### Fluid typography (recommended baseline pattern)

```css
/* Body: 16px @ 320px -> 20px @ 1200px */
font-size: clamp(1rem, 0.875rem + 0.5vw, 1.25rem);

/* Heading: 32px @ 320px -> 64px @ 1200px */
font-size: clamp(2rem, 1rem + 3.6vw, 4rem);
```

## Variable Fonts

### Useful axes

| Axis | Tag | Typical range | Use |
| --- | --- | --- | --- |
| weight | wght | 100-900 | weights without extra files |
| width | wdth | 75-125 | fit headings to containers |
| optical size | opsz | 8-144 | better contrast per size |
| grade | GRAD | -200..150 | weight without reflow (great for dark mode) |

### Dark mode compensation

```css
@media (prefers-color-scheme: dark) {
  body {
    /* If supported */
    font-variation-settings: "GRAD" 50;
    /* Or nudge weight slightly */
    font-weight: 450;
  }
}
```

## Performance and CLS

### Loading priorities

1. Prefer WOFF2 only.
2. Subset by script (latin vs cyrillic) and by weights you actually use.
3. Preload the primary face used above the fold.
4. `font-display: swap` to avoid invisible text.
5. Match fallback metrics (`size-adjust`, `ascent-override`, etc.) to reduce CLS.

### Budget guideline (rule of thumb)

| Tier | Total font budget | Files |
| --- | --- | --- |
| Fast (Core Web Vitals) | < 100KB | 2-3 WOFF2 |
| Balanced | 100-200KB | 4-5 WOFF2 |
| Rich typography | 200-400KB | 6-8 WOFF2 |

### Size-adjust example

```css
@font-face {
  font-family: "Brand Sans";
  src: url("brand-sans.woff2") format("woff2");
  font-display: swap;
  size-adjust: 107%;
}
```

## Common Anti-Patterns

- Too many typefaces: 4+ families kills hierarchy and performance.
- Global line-height for everything: headings need tighter leading than body.
- Huge weight jumps: 400 body and 700 headings can feel harsh; try 400/600.
- Fixed px sizes everywhere: prefer rem + clamp for accessibility and responsiveness.
- Loading full character sets: subset to what you actually need.

## OpenType Features (practical)

```css
/* Tabular numerals for tables and dashboards */
font-variant-numeric: tabular-nums;

/* Fractions (if supported by the font) */
font-variant-numeric: diagonal-fractions;
```

## Accessibility Checks (typography-specific)

- Text must be resizable to 200% without breaking content.
- Avoid long line lengths (target ~45-75 characters).
- Ensure your layout tolerates increased line/word/letter spacing.

## Quick Reference

- Ideal line length: ~65ch for body copy.
- Limit: 2 font families; use weights/styles for variety.
