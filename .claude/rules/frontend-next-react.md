---
paths:
  - "**/*.{ts,tsx,js,jsx}"
  - "**/*.{css,scss}"
---

# Frontend rules (Next.js + React)

## Next.js architecture
- Prefer Server Components by default; Client Components only when needed (state, effects, browser APIs).
- Data fetching: keep a single “data layer” (e.g., lib/api/*) with typed functions.
- Avoid over-fetching from Strapi: request only fields needed for the page/section.

## UI implementation
- Component boundaries: Page -> Sections -> UI components (buttons/cards/typography).
- Keep styles consistent: spacing scale, typography scale, shared tokens.

## Performance
- Avoid unnecessary hydration; keep marketing pages mostly server-rendered.
- Prevent layout shifts: reserve image sizes, avoid late-loading font surprises.

## Accessibility
- Semantic HTML first.
- Visible focus states, correct heading levels, form labels, meaningful alt text.
