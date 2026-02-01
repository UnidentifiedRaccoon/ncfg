/**
 * Data Provider
 * 
 * Provides a unified interface for fetching data from either Strapi CMS
 * or static JSON files. Falls back to static files if Strapi is unavailable.
 */

import { getNews, getNewsArticle, getLatestNews, transformToLegacyNews } from './news';
import { getServiceCategories, getServicesDataLegacy } from './services';
import { getPeople, getTeamMembers, getExperts, transformToLegacyPerson, type LegacyPerson } from './people';
import type { LegacyNewsArticle } from './news';
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
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/0e19e85a-50b5-4c87-aa61-382b8bbf87ce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'data-provider.ts:fetchNewsArticles',message:'Fetch start',data:{USE_STRAPI,STRAPI_URL},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4-H5'})}).catch(()=>{});
  // #endregion
  
  if (USE_STRAPI) {
    try {
      const { articles } = await getNews({ pageSize: 100 });
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/0e19e85a-50b5-4c87-aa61-382b8bbf87ce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'data-provider.ts:fetchNewsArticles',message:'Strapi success',data:{articlesCount:articles.length,firstArticle:articles[0]?{id:articles[0].id,slug:articles[0].slug,anonsImage:articles[0].anonsImage}:null},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2-H3'})}).catch(()=>{});
      // #endregion
      return articles.map(transformToLegacyNews);
    } catch (error) {
      console.warn('Failed to fetch news from Strapi, falling back to static JSON:', error);
    }
  }

  // Fallback to static JSON
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/0e19e85a-50b5-4c87-aa61-382b8bbf87ce',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'data-provider.ts:fetchNewsArticles',message:'Using fallback JSON',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
  // #endregion
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
  return servicesData.default;
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
// People
// ==================

export interface PeopleData {
  people: LegacyPerson[];
  teamPeopleIds: string[];
  expertPeopleIds: string[];
}

export async function fetchPeopleData(): Promise<PeopleData> {
  if (USE_STRAPI) {
    try {
      const people = await getPeople();
      const legacyPeople = people.map(transformToLegacyPerson);
      
      return {
        people: legacyPeople,
        teamPeopleIds: legacyPeople.filter(p => p.isTeam).map(p => p.id),
        expertPeopleIds: legacyPeople.filter(p => p.isExpert).map(p => p.id),
      };
    } catch (error) {
      console.warn('Failed to fetch people from Strapi, falling back to static JSON:', error);
    }
  }

  // Fallback to static JSON
  const peopleData = await import('@/public/content/ncfg_finzdorov_people.json');
  const data = peopleData.default as {
    people: Array<{
      id: string;
      fullName: string;
      isTeam: boolean;
      isExpert: boolean;
      notes?: string | null;
      team?: {
        unit: string;
        title: string;
        department: string | null;
      } | null;
      expertProfile?: {
        headline?: string | null;
        roles?: string[];
        specialization?: string | null;
        organization?: string | null;
        registry?: string | null;
        experienceYears?: number | null;
        experienceText?: string | null;
        metrics?: {
          courseParticipants?: string | null;
          moneySavedRub?: string | null;
          returnedTaxesRub?: string | null;
          eventsCount?: string | null;
          audienceSize?: string | null;
        };
        activities?: string[];
        education?: string[];
        background?: string[];
        statuses?: string[];
        products?: string[];
        books?: string[];
        mediaMentions?: string[];
      } | null;
    }>;
    indexes: {
      teamPeopleIds: string[];
      expertPeopleIds: string[];
    };
  };

  // Transform to LegacyPerson format
  const people: LegacyPerson[] = data.people.map(p => ({
    id: p.id,
    fullName: p.fullName,
    isTeam: p.isTeam,
    isExpert: p.isExpert,
    notes: p.notes || null,
    team: p.team ? {
      unit: p.team.unit || '',
      title: p.team.title || '',
      department: p.team.department || null,
    } : null,
    expertProfile: p.expertProfile ? {
      headline: p.expertProfile.headline || null,
      roles: p.expertProfile.roles || [],
      specialization: p.expertProfile.specialization || null,
      organization: p.expertProfile.organization || null,
      registry: p.expertProfile.registry || null,
      experienceYears: p.expertProfile.experienceYears || null,
      experienceText: p.expertProfile.experienceText || null,
      metrics: {
        courseParticipants: p.expertProfile.metrics?.courseParticipants || null,
        moneySavedRub: p.expertProfile.metrics?.moneySavedRub || null,
        returnedTaxesRub: p.expertProfile.metrics?.returnedTaxesRub || null,
        eventsCount: p.expertProfile.metrics?.eventsCount || null,
        audienceSize: p.expertProfile.metrics?.audienceSize || null,
      },
      activities: p.expertProfile.activities || [],
      education: p.expertProfile.education || [],
      background: p.expertProfile.background || [],
      statuses: p.expertProfile.statuses || [],
      products: p.expertProfile.products || [],
      books: p.expertProfile.books || [],
      mediaMentions: p.expertProfile.mediaMentions || [],
    } : null,
    photoUrl: null,
  }));

  return {
    people,
    teamPeopleIds: data.indexes.teamPeopleIds,
    expertPeopleIds: data.indexes.expertPeopleIds,
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
