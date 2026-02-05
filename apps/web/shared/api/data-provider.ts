/**
 * Data Provider
 * 
 * Provides a unified interface for fetching data from either Strapi CMS
 * or static JSON files. Falls back to static files if Strapi is unavailable.
 */

import { getNews, getNewsArticle, getLatestNews, transformToLegacyNews } from './news';
import { getServicesDataLegacy } from './services';
import { getPeople, transformToLegacyPerson, type LegacyPerson } from './people';
import type { ServicesData } from './types/service';

// Check if Strapi is configured
const STRAPI_URL = process.env.STRAPI_URL;
const USE_STRAPI = Boolean(STRAPI_URL && process.env.STRAPI_API_TOKEN);

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
  if (USE_STRAPI) {
    try {
      const { articles } = await getNews({ pageSize: 100 });
      return articles.map(transformToLegacyNews);
    } catch (error) {
      console.warn('Failed to fetch news from Strapi, falling back to static JSON:', error);
    }
  }

  // Fallback to static JSON
  const newsData = await import('@/public/content/news/ncfg_news.json');
  const articles = newsData.default as NewsArticleData[];
  
  // Normalize image paths - ensure they start with /
  return articles.map(article => ({
    ...article,
    anonsImage: article.anonsImage 
      ? (article.anonsImage.startsWith('/') || article.anonsImage.startsWith('http') 
          ? article.anonsImage 
          : `/${article.anonsImage}`)
      : null,
  }));
}

export async function fetchNewsArticle(slug: string): Promise<NewsArticleData | null> {
  if (USE_STRAPI) {
    try {
      const article = await getNewsArticle(slug);
      if (article) {
        return transformToLegacyNews(article);
      }
      return null;
    } catch (error) {
      console.warn('Failed to fetch article from Strapi, falling back to static JSON:', error);
    }
  }

  // Fallback to static JSON
  const newsData = await import('@/public/content/news/ncfg_news.json');
  const articles = newsData.default as NewsArticleData[];
  const article = articles.find(a => a.slug === slug);
  if (!article) return null;
  
  // Normalize image path
  return {
    ...article,
    anonsImage: article.anonsImage 
      ? (article.anonsImage.startsWith('/') || article.anonsImage.startsWith('http') 
          ? article.anonsImage 
          : `/${article.anonsImage}`)
      : null,
  };
}

export async function fetchLatestNewsArticles(limit: number = 5): Promise<NewsArticleData[]> {
  if (USE_STRAPI) {
    try {
      const articles = await getLatestNews(limit);
      return articles.map(transformToLegacyNews);
    } catch (error) {
      console.warn('Failed to fetch latest news from Strapi, falling back to static JSON:', error);
    }
  }

  // Fallback to static JSON
  const newsData = await import('@/public/content/news/ncfg_news.json');
  const articles = (newsData.default as NewsArticleData[])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
  
  // Normalize image paths
  return articles.map(article => ({
    ...article,
    anonsImage: article.anonsImage 
      ? (article.anonsImage.startsWith('/') || article.anonsImage.startsWith('http') 
          ? article.anonsImage 
          : `/${article.anonsImage}`)
      : null,
  }));
}

// ==================
// Services
// ==================

export async function fetchServicesData(): Promise<ServicesData> {
  if (USE_STRAPI) {
    try {
      return await getServicesDataLegacy();
    } catch (error) {
      console.warn('Failed to fetch services from Strapi, falling back to static JSON:', error);
    }
  }

  // Fallback to static JSON
  const servicesData = await import('@/public/content/ncfg_services.json');
  return servicesData.default as ServicesData;
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
// People (Strapi only, no JSON fallback)
// ==================

export interface PeopleData {
  people: LegacyPerson[];
  teamPeopleIds: string[];
  expertPeopleIds: string[];
}

export async function fetchPeopleData(): Promise<PeopleData> {
  const people = await getPeople();
  const legacyPeople = people.map(transformToLegacyPerson);

  return {
    people: legacyPeople,
    teamPeopleIds: legacyPeople.filter(p => p.isTeam).map(p => p.id),
    expertPeopleIds: legacyPeople.filter(p => p.isExpert).map(p => p.id),
  };
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
  return USE_STRAPI;
}
