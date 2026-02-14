---
name: native-app-designer
description: Design native-feel app UI and motion for iOS/macOS (SwiftUI/UIKit) and the web (React/Vue/Svelte). Use for micro-interactions, onboarding flows, physics-based animations, and UI specifications that avoid generic AI aesthetics.
---

# Native App Designer

## Inputs I Need

- Platform and stack: iOS (SwiftUI/UIKit), macOS, web (React/Vue/Svelte)
- Screen(s) to design and the primary user task
- Brand adjectives and constraints (existing colors, type, logo)
- Accessibility constraints: reduced motion/transparency, Dynamic Type
- Performance constraints (60fps targets, low-end devices)

## Outputs I Will Produce

- UI spec: layout, spacing, hierarchy, components, states
- Motion spec: timings, easing/spring parameters, interaction rules
- Implementation-ready snippets (SwiftUI or React) when requested
- A short checklist to avoid common \"generic\" UI traps

## Workflow

1. Clarify context: job-to-be-done, platform conventions, accessibility settings.
2. Pick an aesthetic direction with 1-2 signature elements (texture, motion motif).
3. Define component system for the screen(s): buttons, lists, cards, sheets, nav.
4. Define motion rules:
   - immediate feedback (0-100ms)
   - transitions (150-300ms)
   - special moments (300-600ms, sparingly)
5. Validate:
   - readable hierarchy
   - reduced motion/transparency fallbacks
   - spacing consistency (grid-based)
6. Deliver spec and code snippets (if requested).

## Quality Bar

- Motion feels physical and intentional (not linear slide spam).
- Spacing follows a clear scale (no random 13px).
- States are complete: hover/press/focus/disabled/loading/error.
- Accessibility fallbacks exist for reduced motion/transparency.

## References

| File | Use when |
| --- | --- |
| `references/swiftui-patterns.md` | Need SwiftUI component + motion patterns |
| `references/react-patterns.md` | Need React animation and interaction patterns |
| `references/custom-shaders.md` | Need shader-driven effects (Metal/WebGL) |
| `references/upstream.md` | Need the original long-form upstream guidance |
