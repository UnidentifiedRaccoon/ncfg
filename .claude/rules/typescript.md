---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript rules

## Type safety

- **Avoid `any`** — use `unknown` with type guards when type is truly unknown
- **No type assertions without validation** — prefer type guards over `as Type`
- **Export types from dedicated files** — keep shared types in `types.ts`
- **Use `satisfies`** — for type inference with compile-time validation

```typescript
// Good: satisfies for config objects
const config = {
  apiUrl: process.env.STRAPI_URL,
  revalidate: 60,
} satisfies StrapiConfig;

// Good: type guard
function isArticle(data: unknown): data is Article {
  return typeof data === 'object' && data !== null && 'slug' in data;
}

// Avoid: type assertion without validation
const article = data as Article; // dangerous
```

## Strapi types

```typescript
// lib/api/types.ts

// Generic Strapi response wrapper
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Content type with Strapi attributes pattern
export interface StrapiEntity<T> {
  id: number;
  attributes: T & {
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
  };
}

// Example content type
export interface ArticleAttributes {
  title: string;
  slug: string;
  content: string;
  lead?: string;
  seo?: SeoAttributes;
}

export type Article = StrapiEntity<ArticleAttributes>;
```

## React components

```typescript
// Props interface naming: ComponentNameProps
interface HeroSectionProps {
  title: string;
  lead?: string;
  children?: React.ReactNode;
}

// Prefer explicit function declaration over React.FC
export function HeroSection({ title, lead, children }: HeroSectionProps) {
  return <section>...</section>;
}

// For components with generic props
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

export function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map(renderItem)}</ul>;
}
```

## Utility types

```typescript
// Extract non-nullable
type NonNullableArticle = NonNullable<Article | null>;

// Pick specific fields
type ArticlePreview = Pick<ArticleAttributes, 'title' | 'slug' | 'lead'>;

// Omit fields
type ArticleInput = Omit<ArticleAttributes, 'createdAt' | 'updatedAt'>;

// Partial for updates
type ArticleUpdate = Partial<ArticleAttributes>;
```

## Import organization

```typescript
// 1. React/Next.js
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 2. Third-party libraries
import { clsx } from 'clsx';

// 3. Internal aliases (@/)
import { Button } from '@/components/ui/button';
import { getArticles } from '@/lib/api/articles';

// 4. Relative imports
import { formatDate } from './utils';

// 5. Types (last, with type keyword)
import type { Article } from '@/lib/api/types';
```
