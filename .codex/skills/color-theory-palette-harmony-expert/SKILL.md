---
name: color-theory-palette-harmony-expert
description: Perceptual color science for palette harmony and sequencing across image sets: LAB/LCH, CIEDE2000, warm/cool classification, hue ordering, and optimal-transport palette matching (EMD/Sinkhorn) with diversity constraints. Use for collage color cohesion, palette-based selection, and ordering photos into harmonious sequences.
---

# Color Theory and Palette Harmony Expert

## Inputs I Need

- Task: pick a palette, select images, order a sequence, or score harmony
- Medium/context: collage, slideshow, feed grid, print
- Constraints: warm/cool alternation, neutral-with-accent, brand colors, max saturation
- Dataset size and target output size (k)
- Whether global grading is allowed (subtle normalization vs no edits)

## Outputs I Will Produce

- A target palette (with roles: dominant/neutral/accent) and rationale
- A selection strategy (how to pick k images) and a scoring function
- An ordering strategy (hue-sorted, warm/cool rhythm, temperature wave, etc.)
- Parameter suggestions (e.g., diversity lambda, Sinkhorn epsilon) and tradeoffs

## Workflow

1. Convert colors to perceptual space (LAB or LCH); avoid raw RGB distances.
2. Extract compact palettes per image (e.g., 5-8 colors + proportions).
3. Compare palettes:
   - Use CIEDE2000 for point distances.
   - Use EMD/Sinkhorn to compare distributions (palette-to-palette).
4. Classify temperature and other coarse attributes (lightness, chroma).
5. Choose a composition pattern:
   - Hue-sorted gradient
   - Warm/cool alternation
   - Neutral-with-accent distribution
6. Add a diversity constraint so optimization does not pick near-duplicates.
7. (Optional) Apply subtle global grading to reduce white-balance drift.

## Quality Bar

- All distances and matching are done in perceptual space (LAB/LCH + CIEDE2000).
- The solution explains the pattern (why this ordering feels coherent).
- The selection avoids monotony (explicit diversity constraint).
- If grading is used, it is subtle and does not destroy local contrast.

## References

| File | Use when |
| --- | --- |
| `references/perceptual-color-spaces.md` | Need LAB/LCH details and deltaE guidance |
| `references/optimal-transport.md` | Need EMD/Sinkhorn and parameter details |
| `references/temperature-classification.md` | Need warm/cool rules and thresholds |
| `references/arrangement-patterns.md` | Need pattern catalog and scoring ideas |
| `references/diversity-algorithms.md` | Need MMR/DPP/submodular diversity methods |
| `references/implementation-guide.md` | Need implementation tips and performance targets |
