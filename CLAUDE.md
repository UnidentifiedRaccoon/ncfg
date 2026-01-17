# NCFG website (Next.js + React + Strapi)

## Goal
Corporate website for NCFG: about, projects/portfolio, team, partners, reviews, news, articles, materials (PDF), contacts.

## Quick start
```bash
# Frontend (Next.js)
cd apps/web && pnpm dev

# CMS (Strapi)
cd apps/cms && pnpm develop
```

## Tech stack
- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript
- **CMS**: Strapi 4+ (content types for pages, news, articles, materials, team, partners)
- **Styling**: Tailwind CSS
- **UI components**: shadcn/ui
- **Package manager**: pnpm

## Project structure

> **Architecture:** See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed Feature-Sliced Design documentation.

```
apps/
  web/                     # Next.js frontend (Adapted FSD)
    app/                   # Next.js App Router (routing layer)
      (marketing)/         # Route group: public pages
      api/                 # API routes
    widgets/               # Complex UI blocks (Header, Footer, HeroSection)
    features/              # User interactions (ContactForm, Search)
    entities/              # Business domain (Article, TeamMember, Project)
    shared/                # Reusable foundation
      ui/                  # UI primitives (shadcn/ui)
      lib/                 # Utilities (cn, strapi client)
      api/                 # API types
      hooks/               # Shared React hooks
  cms/                     # Strapi CMS
    src/
      api/                 # Content types (article, team-member, etc.)
      components/          # Reusable Strapi components (seo, hero, etc.)
```

**Import direction:** `app → widgets → features → entities → shared` (never upward)

## Naming conventions
| Entity | Convention | Example |
|--------|------------|---------|
| React components | PascalCase | `HeroSection.tsx`, `TeamCard.tsx` |
| Utility functions | camelCase | `formatDate.ts`, `cn.ts` |
| API fetch functions | `get*` / `fetch*` prefix | `getArticles.ts`, `fetchTeamMembers.ts` |
| Strapi content types | kebab-case | `news-article`, `team-member` |
| CSS variables | kebab-case with prefix | `--color-primary`, `--space-4` |
| Route segments | kebab-case | `/about-us`, `/news-article` |

## Data fetching pattern
```typescript
// lib/api/articles.ts
import { Article, StrapiResponse } from './types';

const STRAPI_URL = process.env.STRAPI_URL;

export async function getArticles(locale = 'ru'): Promise<Article[]> {
  const res = await fetch(
    `${STRAPI_URL}/api/articles?locale=${locale}&populate=*`,
    { next: { revalidate: 60 } } // ISR: revalidate every 60s
  );

  if (!res.ok) throw new Error('Failed to fetch articles');

  const data: StrapiResponse<Article[]> = await res.json();
  return data.data;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const res = await fetch(
    `${STRAPI_URL}/api/articles?filters[slug][$eq]=${slug}&populate=*`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) return null;

  const data: StrapiResponse<Article[]> = await res.json();
  return data.data[0] ?? null;
}
```

## Component structure pattern
```typescript
// components/sections/HeroSection.tsx
interface HeroSectionProps {
  title: string;
  lead?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function HeroSection({ title, lead, ctaText, ctaHref }: HeroSectionProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <h1 className="text-4xl md:text-6xl font-bold">{title}</h1>
        {lead && <p className="mt-4 text-xl text-muted-foreground">{lead}</p>}
        {ctaText && ctaHref && (
          <Button asChild className="mt-8">
            <Link href={ctaHref}>{ctaText}</Link>
          </Button>
        )}
      </div>
    </section>
  );
}
```

## Key constraints

### Performance
- Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Always use `next/image` with explicit width/height
- Lazy-load below-fold images and heavy components
- Minimal client-side JS on marketing pages

### Accessibility
- Semantic HTML: proper heading hierarchy (h1 → h2 → h3)
- Keyboard navigation: all interactive elements focusable
- Focus states: visible outline (never `outline: none`)
- Color contrast: minimum 4.5:1 for text
- Form labels: always associate with inputs

### SEO
- Every page: unique title + meta description
- OG image for social sharing
- Canonical URLs for duplicate content
- Structured data (JSON-LD) for articles, organization
- Sitemap generation

## Coding standards
- **Server Components by default** — use `'use client'` only when needed (state, effects, browser APIs)
- **No inline styles** — use Tailwind classes or CSS variables
- **Avoid over-fetching** — request only fields needed with Strapi populate
- **Keep components small** — one responsibility per component
- **Russian for UI text, English for code** — comments, variable names, commits in English

## Environment variables
```bash
# apps/web/.env.local (DO NOT COMMIT)
STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# apps/cms/.env (DO NOT COMMIT)
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```
