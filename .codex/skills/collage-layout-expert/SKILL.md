---
name: collage-layout-expert
description: Computational collage composition and layout: choose collage type (grid, mosaic, scrapbook, editorial, mood board), select layout algorithms, and plan blending/color cohesion. Use for collage layout decisions, algorithm selection, and production-ready composition guidance.
---

# Collage and Layout Composition Expert

## Inputs I Need

- Purpose: social grid, mood board, editorial, memory wall, art project, mosaic
- Target output: aspect ratio, resolution, number of images (k)
- Constraints: negative space, text overlays, brand palette, chronology/story
- Allowed edits: cropping, grading, blending, generating backgrounds/textures
- Performance constraints (interactive vs offline render)

## Outputs I Will Produce

- Recommended collage type + layout rules
- Algorithm choices with tradeoffs (packing, force layout, mosaic matching, blending)
- A composition checklist (hierarchy, visual weight, breathing room)
- If needed: a data structure sketch for an implementation

## Workflow

1. Pick the collage type based on purpose and audience.
2. Establish hierarchy:
   - hero image(s)
   - supporting images
   - whitespace budget
3. Choose layout strategy:
   - strict grid vs organic scatter vs editorial layout
4. Choose technical approach:
   - mosaic tile matching
   - seam blending (local Poisson where needed)
   - edge-based assembly for joiner styles
5. Ensure color cohesion (often via `$color-theory-palette-harmony-expert`).
6. Validate readability if text is included (contrast and spacing).

## Quality Bar

- There is a focal point and clear hierarchy (not uniform sameness).
- Whitespace is intentional (avoid overfilling the canvas).
- Blending is local and preserves contrast (avoid washed-out global blends).
- The algorithm choice matches constraints (interactive vs offline).

## References

| File | Use when |
| --- | --- |
| `references/collage-types.md` | Need type selection and layout patterns |
| `references/algorithms.md` | Need algorithm details and implementation notes |
| `references/advanced-techniques.md` | Need narrative sequencing and advanced composition tricks |
| `references/edge-assembly.md` | Need joiner/edge-based assembly details |
| `references/implementation-guide.md` | Need performance guidance and platform notes |
| `references/line-detection.md` | Need line/edge extraction methods |
| `references/mathematical-foundations.md` | Need the math background |
| `references/art-historical-styles.md` | Need art-historical style constraints |
| `references/hockney-technique.md` | Need Hockney joiner specifics |
| `references/upstream.md` | Need the original long-form upstream guidance |
