---
name: vaporwave-glassomorphic-ui-designer
description: Vaporwave and glassmorphism UI direction for photo/memory apps: neon pastels, frosted-glass materials, retro-futuristic motion, and accessibility-safe transparency fallbacks. Use when the user asks for vaporwave, Y2K, neon, or glassmorphic/frosted UI.
---

# Vaporwave and Glassomorphic UI Designer

## Inputs I Need

- Platform: SwiftUI app vs web app (and the tech stack)
- Domain: photo/memory app vs general UI (content type matters)
- Vibe keywords (e.g., vaporwave, retro-futuristic, dreamy, neon)
- Accessibility constraints: reduce transparency, reduced motion, contrast targets
- Screens/components to style (modals, cards, nav, onboarding)

## Outputs I Will Produce

- Palette roles (primary/secondary/accent/neutrals) + gradient presets
- Material hierarchy guidance (blur levels, borders, depth)
- Component styling rules (cards, sheets, buttons, overlays) with states
- Motion timings and interaction personality (few memorable moments)
- Fallback rules for reduce-transparency users

## Workflow

1. Define the content priority (photos are usually the hero; UI supports).
2. Choose a material strategy:
   - where blur is allowed
   - what must be opaque for readability
3. Define color system:
   - neon accents + restrained neutrals
   - 1-2 signature gradients
4. Define motion:
   - quick feedback, smooth transitions, occasional dramatic moments
   - respect reduced motion
5. Validate accessibility:
   - contrast over images/blur
   - reduce transparency fallbacks

## Quality Bar

- Glass effects do not hurt readability (contrast and thickness are intentional).
- Vaporwave accents are constrained (avoid rainbow overload).
- Motion is sparse and purposeful; performance stays smooth.
- Reduce-transparency and reduce-motion fallbacks are defined.

## References

| File | Use when |
| --- | --- |
| `references/glassmorphism-patterns.md` | Need detailed glass card/material patterns |
| `references/vaporwave-aesthetic.md` | Need palette/typography motifs and aesthetic cues |
| `references/animations-interactions.md` | Need motion patterns, glows, and interaction recipes |
| `references/metal-shaders.md` | Need shader-driven neon/glass effects |
| `references/upstream.md` | Need the original long-form upstream guidance |
