/**
 * Data Provider
 *
 * Unified interface for fetching data from Strapi CMS.
 *
 * This module is intentionally "fail fast": if Strapi is not configured or
 * unavailable, it throws instead of silently falling back to static JSON.
 */

import { getNews, getNewsArticle, getLatestNews, transformToLegacyNews } from './news';
import { getServicesDataLegacy } from './services';
import { getPeople, transformToLegacyPerson, type LegacyPerson } from './people';
import type { ServicesData } from './types/service';

const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

function assertStrapiConfigured(): void {
  if (!STRAPI_URL || !STRAPI_API_TOKEN) {
    throw new Error(
      'Strapi is required. Set STRAPI_URL and STRAPI_API_TOKEN (see apps/web/.env.local.example).'
    );
  }
}

// ==================
// News
// ==================

export interface NewsArticleData {
  id: string;
  title: string;
  tags: string[];
  slug: string;
  body: string;
  anonsImage: string | null;
  createdAt: string;
}

export async function fetchNewsArticles(): Promise<NewsArticleData[]> {
  assertStrapiConfigured();

  try {
    const { articles } = await getNews({ pageSize: 100 });
    return articles.map(transformToLegacyNews);
  } catch (error) {
    throw new Error('Failed to fetch news from Strapi.', { cause: error });
  }
}

export async function fetchNewsArticle(slug: string): Promise<NewsArticleData | null> {
  assertStrapiConfigured();

  try {
    const article = await getNewsArticle(slug);
    return article ? transformToLegacyNews(article) : null;
  } catch (error) {
    throw new Error(`Failed to fetch article from Strapi (slug: ${slug}).`, { cause: error });
  }
}

export async function fetchLatestNewsArticles(limit: number = 5): Promise<NewsArticleData[]> {
  assertStrapiConfigured();

  try {
    const articles = await getLatestNews(limit);
    return articles.map(transformToLegacyNews);
  } catch (error) {
    throw new Error(`Failed to fetch latest news from Strapi (limit: ${limit}).`, { cause: error });
  }
}

// ==================
// Services
// ==================

export async function fetchServicesData(): Promise<ServicesData> {
  assertStrapiConfigured();

  try {
    return await getServicesDataLegacy();
  } catch (error) {
    throw new Error('Failed to fetch services from Strapi.', { cause: error });
  }
}

// ==================
// Companies page
// ==================

export async function fetchCompaniesPageData() {
  // TODO: switch to Strapi when the content type is modeled
  const companiesData = await import('@/public/content/companies.json');
  return companiesData.default;
}

// ==================
// People (with fallback to static JSON)
// ==================

export interface PeopleData {
  people: LegacyPerson[];
  teamPeopleIds: string[];
  expertPeopleIds: string[];
}

export async function fetchPeopleData(): Promise<PeopleData> {
  assertStrapiConfigured();

  try {
    const people = await getPeople();
    const legacyPeople = people.map(transformToLegacyPerson);

    return {
      people: legacyPeople,
      teamPeopleIds: legacyPeople.filter((p) => p.isTeam).map((p) => p.id),
      expertPeopleIds: legacyPeople.filter((p) => p.isExpert).map((p) => p.id),
    };
  } catch (error) {
    throw new Error('Failed to fetch people from Strapi.', { cause: error });
  }
}

export async function fetchTeamMembers(): Promise<LegacyPerson[]> {
  const data = await fetchPeopleData();
  return data.people.filter(p => p.isTeam);
}

export async function fetchExperts(): Promise<LegacyPerson[]> {
  const data = await fetchPeopleData();
  return data.people.filter(p => p.isExpert);
}

// ==================
// Export data source status
// ==================

export function isUsingStrapi(): boolean {
  return Boolean(STRAPI_URL && STRAPI_API_TOKEN);
}
