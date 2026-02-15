export const BLOG_RUBRICS = [
  { title: "Новости", slug: "news", order: 10 },
  { title: "Анонс", slug: "announce", order: 20 },
  { title: "Пострелиз", slug: "postrelease", order: 30 },
  { title: "Статьи", slug: "articles", order: 40 },
  { title: "Исследования", slug: "research", order: 50 },
] as const;

export type BlogRubricSlug = (typeof BLOG_RUBRICS)[number]["slug"];

export function isBlogRubricSlug(value: unknown): value is BlogRubricSlug {
  return BLOG_RUBRICS.some((r) => r.slug === value);
}

export type BlogLayoutVariant = "pills" | "rail";

export function isBlogLayoutVariant(value: unknown): value is BlogLayoutVariant {
  return value === "pills" || value === "rail";
}

export function getBlogRubricTitle(slug: BlogRubricSlug): string {
  return BLOG_RUBRICS.find((r) => r.slug === slug)?.title ?? slug;
}

