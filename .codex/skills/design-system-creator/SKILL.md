---
name: design-system-creator
description: Create and audit design systems: design tokens, semantic token architecture, CSS custom properties, theming (incl. dark mode), component documentation, and CSS organization. Use when building a design system from scratch or extracting one from an existing UI/codebase.
---

# Design System Creator

## Inputs I Need

- Scope: one product vs multi-brand/white-label; web only vs multi-platform
- Existing artifacts: Figma, CSS/Tailwind, components, screenshots
- Constraints: dark mode, accessibility level, token governance, naming conventions
- Deliverable format: CSS vars, JSON tokens, docs (MD), Storybook or not

## Outputs I Will Produce

- Token architecture proposal (primitive -> semantic -> component)
- Initial token set (colors, type, spacing, radius, shadows, motion)
- Component documentation template + example entries
- CSS organization plan (folders/layers) and naming rules
- Audit notes: inconsistencies, consolidation opportunities, anti-patterns

## Workflow

1. Audit existing UI: collect repeated patterns (colors, spacing, type, radii, shadows).
2. Define scales:
   - spacing scale (small and opinionated)
   - type scale (base + headings) and line-height rules
3. Define token tiers:
   - primitives: raw values
   - semantics: intent (primary, surface, text-muted)
   - component tokens: only when needed to avoid leaking details
4. Define theming: light/dark, and optionally brand A/B mapping.
5. Document components:
   - anatomy, variants, states, accessibility, responsive behavior
6. Establish CSS architecture and governance:
   - where tokens live, how changes are reviewed, how deprecations work

## Quality Bar

- Tokens are minimal but sufficient (avoid token explosion).
- Components do not reference primitives directly unless justified.
- Semantic tokens support theming without touching component code.
- Docs match implementation (no drift) and include states + a11y.

## References

| File | Use when |
| --- | --- |
| `references/token-architecture.md` | Need full examples for multi-brand and dark mode token mapping |
| `references/css-organization.md` | Need ITCSS/BEM conventions and folder structures |
| `references/component-documentation.md` | Need component doc templates and checklists |
| `references/mcp-tooling.md` | Need optional MCP-based workflows (Figma, scaffolding) |
