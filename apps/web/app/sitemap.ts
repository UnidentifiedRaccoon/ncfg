import type { MetadataRoute } from "next";
import { fetchNewsArticles, fetchServicesData } from "@/shared/api/data-provider";
import { getSiteUrl } from "@/shared/lib/metadata";

export const revalidate = 3600; // Refresh sitemap hourly.

const STATIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/companies", priority: 0.9, changeFrequency: "weekly" },
  { path: "/individuals", priority: 0.9, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/portfolio", priority: 0.8, changeFrequency: "monthly" },
  { path: "/rekomendacii", priority: 0.8, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.8, changeFrequency: "daily" },
  { path: "/politika-konfidencialnosti", priority: 0.4, changeFrequency: "yearly" },
  { path: "/polzovatelskoe-soglashenie", priority: 0.4, changeFrequency: "yearly" },
] as const;

type SitemapEntry = MetadataRoute.Sitemap[number];

function toAbsoluteUrl(path: string, siteUrl: string): string {
  return new URL(path, `${siteUrl}/`).toString();
}

function dedupeEntries(entries: SitemapEntry[]): SitemapEntry[] {
  const byUrl = new Map<string, SitemapEntry>();

  for (const entry of entries) {
    const existing = byUrl.get(entry.url);
    if (!existing) {
      byUrl.set(entry.url, entry);
      continue;
    }

    const existingTime = existing.lastModified ? new Date(existing.lastModified).getTime() : 0;
    const entryTime = entry.lastModified ? new Date(entry.lastModified).getTime() : 0;

    if (entryTime > existingTime) {
      byUrl.set(entry.url, entry);
    }
  }

  return Array.from(byUrl.values()).sort((a, b) => a.url.localeCompare(b.url));
}

async function getServiceEntries(siteUrl: string): Promise<SitemapEntry[]> {
  try {
    const servicesData = await fetchServicesData();
    const lastModified = new Date(servicesData.meta.updatedAt);

    return servicesData.serviceCategories.flatMap((category) =>
      category.services.map((service) => ({
        url: toAbsoluteUrl(`/companies/${service.id}`, siteUrl),
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      }))
    );
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    console.error(`[sitemap] Failed to fetch services for sitemap: ${details}`);
    return [];
  }
}

async function getBlogEntries(siteUrl: string): Promise<SitemapEntry[]> {
  try {
    const articles = await fetchNewsArticles();

    return articles.map((article) => ({
      url: toAbsoluteUrl(`/blog/${article.slug}`, siteUrl),
      lastModified: new Date(article.updatedAt || article.createdAt),
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    console.error(`[sitemap] Failed to fetch blog articles for sitemap: ${details}`);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticEntries: SitemapEntry[] = STATIC_ROUTES.map((route) => ({
    url: toAbsoluteUrl(route.path, siteUrl),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [serviceEntries, blogEntries] = await Promise.all([
    getServiceEntries(siteUrl),
    getBlogEntries(siteUrl),
  ]);

  return dedupeEntries([...staticEntries, ...serviceEntries, ...blogEntries]);
}
