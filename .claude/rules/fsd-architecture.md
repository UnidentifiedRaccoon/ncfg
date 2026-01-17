---
paths:
  - "apps/web/**"
  - "**/widgets/**"
  - "**/features/**"
  - "**/entities/**"
  - "**/shared/**"
---

# Feature-Sliced Design Rules

This project uses Adapted FSD. See [ARCHITECTURE.md](/ARCHITECTURE.md) for full documentation.

## Layer Hierarchy (top to bottom)

```
app/      → routing, layouts, page composition
widgets/  → complex UI blocks (Header, HeroSection, NewsFeed)
features/ → user interactions (ContactForm, Search, ThemeToggle)
entities/ → business objects (Article, TeamMember, Project)
shared/   → reusable foundation (UI primitives, utils, types)
```

## Import Rules (Critical)

- **Only import from layers BELOW**
- Never import upward (shared cannot import from entities)
- Always import from slice root: `@/features/contact-form`, not `@/features/contact-form/ui/ContactForm`

## When Creating New Code

### Where does it go?

| Type | Layer | Example |
|------|-------|---------|
| Route/page | `app/` | `app/(marketing)/about/page.tsx` |
| Page section | `widgets/` | `widgets/hero-section/` |
| Form/action | `features/` | `features/contact-form/` |
| Data type + display | `entities/` | `entities/article/` |
| UI primitive | `shared/ui/` | `shared/ui/button.tsx` |
| Utility function | `shared/lib/` | `shared/lib/format-date.ts` |

### Slice structure

```
slice-name/
├── ui/           # Components
├── model/        # Logic, hooks, types
├── api/          # Data fetching
└── index.ts      # Public API exports
```

### Public API pattern

Every slice MUST have `index.ts` that exports only public interface:

```typescript
// features/contact-form/index.ts
export { ContactForm } from './ui/ContactForm';
export { useContactForm } from './model/useContactForm';
export type { ContactFormData } from './model/types';
```

## Common Mistakes to Avoid

1. **Importing internal modules** — always use slice root
2. **Business logic in shared** — move to appropriate entity/feature
3. **Feature calling another feature** — extract to widget or shared
4. **God components** — split into widget + features + entities
