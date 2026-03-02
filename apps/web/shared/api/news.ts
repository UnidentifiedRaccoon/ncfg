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

const NEWS_ARTICLE_POPULATE_WITH_POST_IMAGE = ['anonsImage', 'postImage', 'category'] as const;
const NEWS_ARTICLE_POPULATE_LEGACY = ['anonsImage', 'category'] as const;

function isInvalidPopulateKeyError(error: unknown, key: string): boolean {
  return error instanceof Error && error.message.includes(`Invalid key ${key}`);
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
  const buildNewsArticleQuery = (populate: readonly string[]) =>
    buildQueryString({
      populate: [...populate],
      filters: {
        slug: { $eq: slug },
      },
    });

  try {
    const response = await fetchAPI<StrapiResponse<StrapiNewsArticle[]>>(
      `/news-articles${buildNewsArticleQuery(NEWS_ARTICLE_POPULATE_WITH_POST_IMAGE)}`,
      { tags: ['news', `news-${slug}`] }
    );

    return response.data[0] || null;
  } catch (error: unknown) {
    if (!isInvalidPopulateKeyError(error, 'postImage')) {
      throw error;
    }

    const fallbackResponse = await fetchAPI<StrapiResponse<StrapiNewsArticle[]>>(
      `/news-articles${buildNewsArticleQuery(NEWS_ARTICLE_POPULATE_LEGACY)}`,
      { tags: ['news', `news-${slug}`] }
    );

    return fallbackResponse.data[0] || null;
  }
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

interface LegacyNewsArticle {
  id: string;
  title: string;
  category: { slug: string; title: string } | null;
  slug: string;
  body: string;
  anonsImage: string | null;
  postImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export function transformToLegacyNews(article: StrapiNewsArticle): LegacyNewsArticle {
  const transformedAnonsUrl = getStrapiMediaUrl(article.anonsImage?.url);
  const transformedPostUrl = getStrapiMediaUrl(article.postImage?.url);

  return {
    id: String(article.id),
    title: article.title,
    category: article.category ? { slug: article.category.slug, title: article.category.title } : null,
    slug: article.slug,
    body: article.body || '',
    anonsImage: transformedAnonsUrl,
    postImage: transformedPostUrl,
    createdAt: article.publishedDate || article.createdAt,
    updatedAt: article.updatedAt || article.publishedDate || article.createdAt,
  };
}
