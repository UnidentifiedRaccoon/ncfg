import type { MetadataRoute } from "next";

import { seasonOffer2026Content } from "@/widgets/SeasonOffer2026";
import {
  fetchAboutPageData,
  fetchBlogPageData,
  fetchCareerPageData,
  fetchCompaniesPageData,
  fetchHomePageData,
  fetchIndividualsPageData,
  fetchNewsArticles,
  fetchPortfolioPageData,
  fetchServicesData,
  fetchVacancies,
} from "@/shared/api/data-provider";
import { pickLatestDate } from "@/shared/lib/date-values";
import { getSiteUrl } from "@/shared/lib/metadata";

export const revalidate = 0;

const STATIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/companies", priority: 0.9, changeFrequency: "weekly" },
  {
    path: "/companies/season-offer",
    priority: 0.8,
    changeFrequency: "monthly",
    lastModified: seasonOffer2026Content.updatedAt,
  },
  { path: "/individuals", priority: 0.9, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/history", priority: 0.75, changeFrequency: "monthly" },
  { path: "/portfolio", priority: 0.8, changeFrequency: "monthly" },
  { path: "/rekomendacii", priority: 0.8, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.8, changeFrequency: "daily" },
  { path: "/vacancies", priority: 0.75, changeFrequency: "weekly" },
] satisfies ReadonlyArray<{
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly";
  lastModified?: string;
}>;

type SitemapEntry = MetadataRoute.Sitemap[number];

const KEY_STATIC_ROUTE_LASTMOD_LOADERS = [
  { path: "/", load: fetchHomePageData },
  { path: "/companies", load: fetchCompaniesPageData },
  { path: "/individuals", load: fetchIndividualsPageData },
  { path: "/about", load: fetchAboutPageData },
  {
    path: "/history",
    load: async () => ({
      updatedAt: pickLatestDate(
        [(await fetchAboutPageData()).updatedAt, (await fetchPortfolioPageData()).updatedAt],
        "history page sitemap"
      ),
    }),
  },
  { path: "/portfolio", load: fetchPortfolioPageData },
  { path: "/blog", load: fetchBlogPageData },
  {
    path: "/vacancies",
    load: async () => {
      const [careerPage, vacancies] = await Promise.all([
        fetchCareerPageData(),
        fetchVacancies().catch(() => []),
      ]);

      return {
        updatedAt: pickLatestDate(
          [
            careerPage.updatedAt,
            ...vacancies.flatMap((vacancy) => [vacancy.updatedAt, vacancy.publishedDate]),
          ],
          "vacancies page sitemap"
        ),
      };
    },
  },
] as const;

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

async function getStaticRouteLastModified(): Promise<Map<string, Date>> {
  const settled = await Promise.allSettled(
    KEY_STATIC_ROUTE_LASTMOD_LOADERS.map(async ({ path, load }) => ({
      path,
      lastModified: new Date((await load()).updatedAt),
    }))
  );
  const byPath = new Map<string, Date>();

  for (const result of settled) {
    if (result.status === "fulfilled") {
      byPath.set(result.value.path, result.value.lastModified);
      continue;
    }

    const details = result.reason instanceof Error ? result.reason.message : String(result.reason);
    console.error(`[sitemap] Failed to resolve static route lastModified: ${details}`);
  }

  return byPath;
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

async function getCareerEntries(siteUrl: string): Promise<SitemapEntry[]> {
  try {
    const vacancies = await fetchVacancies();

    return vacancies.map((vacancy) => ({
      url: toAbsoluteUrl(`/vacancies/${vacancy.slug}`, siteUrl),
      lastModified: new Date(vacancy.updatedAt || vacancy.publishedDate),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    console.error(`[sitemap] Failed to fetch vacancies for sitemap: ${details}`);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const [staticRouteLastModified, serviceEntries, blogEntries, careerEntries] =
    await Promise.all([
      getStaticRouteLastModified(),
      getServiceEntries(siteUrl),
      getBlogEntries(siteUrl),
      getCareerEntries(siteUrl),
    ]);
  const staticEntries: SitemapEntry[] = STATIC_ROUTES.map((route) => {
    const lastModified =
      "lastModified" in route && route.lastModified
        ? new Date(route.lastModified)
        : staticRouteLastModified.get(route.path);

    return {
      url: toAbsoluteUrl(route.path, siteUrl),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      ...(lastModified ? { lastModified } : {}),
    };
  });

  return dedupeEntries([
    ...staticEntries,
    ...serviceEntries,
    ...blogEntries,
    ...careerEntries,
  ]);
}
