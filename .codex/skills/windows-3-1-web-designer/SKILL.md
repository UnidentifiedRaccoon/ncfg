---
name: windows-3-1-web-designer
description: Create modern web UIs with authentic Windows 3.1 aesthetic: solid navy title bars, Program Manager navigation, beveled borders, bitmap-style UI rhythm, and single window control. Use for Win31 retro dashboards, docs sites, or playful product UIs (not Win95).
---

# Windows 3.1 Web Designer

## Inputs I Need

- What you are building (dashboard, docs, app, chatbot UI) and key screens
- Authenticity level: strict Win31 vs \"Win31-inspired\" modern
- Target devices: desktop only vs responsive/mobile
- Components needed: windows, menus, buttons, lists, dialogs, icons
- Any constraints: fonts, performance, accessibility

## Outputs I Will Produce

- Design system tokens (CSS variables) for Win31 palette + bevel rules
- Component recipes (window chrome, title bar, controls, buttons, inputs)
- Layout patterns (Program Manager navigation, tiled/cascaded windows)
- Responsive guidance (how Win31 metaphors adapt to mobile)

## Workflow

1. Lock the era: Win31 (solid navy title bar, Program Manager, bevel-only depth).
2. Define tokens:
   - system grays + navy title bar
   - bevel shadow/highlight colors
3. Define primitives:
   - raised (outset) vs sunken (inset) surfaces
   - consistent pixel rhythm (spacing, borders, typography)
4. Implement core components:
   - window frame + title bar + single control
   - buttons, fields, menus, list boxes
5. Define navigation:
   - Program Manager groups as the primary IA
6. Validate:
   - readability/contrast
   - keyboard/focus states (do not lose accessibility)

## Quality Bar

- Title bars are solid navy (no Win95 gradients).
- Bevel rules are consistent across components (raised vs sunken).
- Icons and typography match the era, but content remains usable.
- Focus states are visible; keyboard navigation works.

## References

| File | Use when |
| --- | --- |
| `references/design-system.md` | Need full token set and CSS variable examples |
| `references/component-patterns.md` | Need detailed component recipes |
| `references/anti-patterns.md` | Need what breaks the illusion (Win95 leakage, modern tropes) |
| `references/ai-assistant-patterns.md` | Need chatbot and wizard UI patterns in Win31 style |
| `references/mobile-pocket-computing.md` | Need mobile extrapolation patterns |
| `references/upstream.md` | Need the original long-form upstream guidance |
