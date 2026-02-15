/**
 * News API Functions
 * 
 * Fetch functions for news articles from Strapi CMS.
 */

import { fetchAPI, buildQueryString, StrapiResponse, getStrapiMediaUrl } from '../lib/strapi';
import type { StrapiNewsArticle } from './types/strapi';

// ==================
// News Articles
// ==================

interface GetNewsOptions {
  page?: number;
  pageSize?: number;
  category?: string;
}

export async function getNews(options: GetNewsOptions = {}): Promise<{
  articles: StrapiNewsArticle[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}> {
  const { page = 1, pageSize = 10, category } = options;

  const filters: Record<string, unknown> = {};
  if (category) {
    filters['category'] = {
      slug: { $eq: category },
    };
  }

  const query = buildQueryString({
    populate: ['anonsImage', 'category'],
    filters,
    sort: 'publishedDate:desc',
    pagination: { page, pageSize },
  });

  const response = await fetchAPI<StrapiResponse<StrapiNewsArticle[]>>(
    `/news-articles${query}`,
    { tags: ['news'] }
  );

  return {
    articles: response.data,
    pagination: response.meta.pagination || {
      page: 1,
      pageSize: 10,
      pageCount: 1,
      total: response.data.length,
    },
  };
}

export async function getNewsArticle(slug: string): Promise<StrapiNewsArticle | null> {
  const query = buildQueryString({
    populate: ['anonsImage', 'category'],
    filters: {
      slug: { $eq: slug },
    },
  });

  const response = await fetchAPI<StrapiResponse<StrapiNewsArticle[]>>(
    `/news-articles${query}`,
    { tags: ['news', `news-${slug}`] }
  );

  return response.data[0] || null;
}

export async function getLatestNews(
  limit: number = 5,
  options: { category?: string } = {}
): Promise<StrapiNewsArticle[]> {
  const filters: Record<string, unknown> = {};
  if (options.category) {
    filters['category'] = {
      slug: { $eq: options.category },
    };
  }

  const query = buildQueryString({
    populate: ['anonsImage', 'category'],
    filters,
    sort: 'publishedDate:desc',
    pagination: { limit },
  });

  const response = await fetchAPI<StrapiResponse<StrapiNewsArticle[]>>(
    `/news-articles${query}`,
    { tags: ['news'] }
  );

  return response.data;
}

// ==================
// Helper: Transform to legacy format
// ==================

export interface LegacyNewsArticle {
  id: string;
  title: string;
  category: { slug: string; title: string } | null;
  slug: string;
  body: string;
  anonsImage: string | null;
  createdAt: string;
}

export function transformToLegacyNews(article: StrapiNewsArticle): LegacyNewsArticle {
  const transformedUrl = getStrapiMediaUrl(article.anonsImage?.url);

  return {
    id: String(article.id),
    title: article.title,
    category: article.category ? { slug: article.category.slug, title: article.category.title } : null,
    slug: article.slug,
    body: article.body || '',
    anonsImage: transformedUrl,
    createdAt: article.publishedDate || article.createdAt,
  };
}
