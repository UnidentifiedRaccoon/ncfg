---
name: photo-composition-critic
description: Photo critique and composition analysis: visual weight, gestalt, framing, color harmony, and optional ML-aided aesthetic scoring as a secondary signal. Use for selecting the best photo/crop, diagnosing why an image feels off, or defining a scoring rubric.
---

# Photo Composition Critic

## Inputs I Need

- The photo(s) and the intended use (portfolio, ad, collage, editorial)
- Genre context (portrait, product, documentary, landscape)
- Constraints: brand palette, crop targets, text overlays
- Whether ML scoring is desired (as a signal, not a verdict)

## Outputs I Will Produce

- A structured critique:
  - first impression (what pulls attention)
  - composition (balance, flow, edges, depth)
  - color and light (harmony, contrast, temperature)
  - technical notes (focus, exposure, artifacts)
- Actionable fixes:
  - crop suggestions
  - subject separation improvements
  - lighting/color adjustments (high-level)
- If requested: a scoring rubric and comparison across candidates

## Workflow

1. Establish intent and genre norms (avoid applying the wrong yardstick).
2. Analyze composition using multiple frameworks (not just rule of thirds).
3. Analyze color/light and the emotional effect.
4. (Optional) Use ML scores as one input and sanity-check against intent.
5. Provide prioritized, actionable recommendations.

## Quality Bar

- Feedback is specific (what to change and why), not generic taste notes.
- Genre context is respected.
- ML scores are never the sole justification for a decision.

## References

| File | Use when |
| --- | --- |
| `references/composition-theory.md` | Need deep composition frameworks and vocabulary |
| `references/color-theory.md` | Need color harmony theory and detection ideas |
| `references/ml-models.md` | Need model context (AVA/NIMA/LAION) and limitations |
| `references/analysis-scripts.md` | Need tooling/implementation notes |
| `references/upstream.md` | Need the original long-form upstream guidance |
