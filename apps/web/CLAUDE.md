# Commands

- From repository root, `npm run dev`: canonical local website profile
- From repository root, `npm run dev:full`: fully local CMS + website profile
- From repository root, `npm run dev:verify`: readiness of running services
- `npm run lint`: Run the style and type checker
- `npm run test`: Run tests (prefer single test files for speed)
- `npx --no-install tsc --noEmit`: Run the TypeScript checker

# Code style

- See `components/Button.tsx` for canonical component structure

# Workflow

- Always typecheck after making a series of code changes
- Do not use this app-level `npm run dev` as the default infrastructure entrypoint;
  the root launcher owns env selection, safety gates, dependencies, and readiness
- API routes go in `app/api/` following existing patterns
