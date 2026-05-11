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

const NEWS_ARTICLE_POPULATE = ['anonsImage', 'postImage', 'category'] as const;
const DEFAULT_QUESTION_FORM_TITLE = 'Есть вопрос по другой теме?';
const DEFAULT_QUESTION_FORM_DESCRIPTION = 'Задайте его специалисту НЦФГ';
const BLOG_CONTENT_REVALIDATE = 0;
const DEFAULT_QUESTION_FORM_BUTTON_TEXT = 'Задать вопрос';
const DEFAULT_QUESTION_FORM_EXPANDED_TITLE = 'Задайте вопрос специалисту';
const DEFAULT_QUESTION_FORM_QUESTION_LABEL = 'Ваш вопрос';

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
    { revalidate: BLOG_CONTENT_REVALIDATE }
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
    populate: [...NEWS_ARTICLE_POPULATE],
    filters: {
      slug: { $eq: slug },
    },
  });

  const response = await fetchAPI<StrapiResponse<StrapiNewsArticle[]>>(
    `/news-articles${query}`,
    { revalidate: BLOG_CONTENT_REVALIDATE }
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
    `/news-articles${query}`
  );

  return response.data;
}

// ==================
// Helper: Transform to legacy format
// ==================

export interface LegacyNewsArticleQuestionForm {
  isVisible: boolean;
  title: string;
  description: string;
  buttonText: string;
  expandedTitle: string;
  questionLabel: string;
}

export interface LegacyNewsArticle {
  id: string;
  title: string;
  category: { slug: string; title: string } | null;
  slug: string;
  body: string;
  anonsImage: string | null;
  postImage: string | null;
  questionForm: LegacyNewsArticleQuestionForm;
  createdAt: string;
  updatedAt: string;
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getQuestionForm(article: StrapiNewsArticle): LegacyNewsArticleQuestionForm {
  return {
    isVisible: article.showQuestionForm !== false,
    title: normalizeOptionalText(article.questionFormTitle) ?? DEFAULT_QUESTION_FORM_TITLE,
    description:
      normalizeOptionalText(article.questionFormDescription) ??
      DEFAULT_QUESTION_FORM_DESCRIPTION,
    buttonText:
      normalizeOptionalText(article.questionFormButtonText) ??
      DEFAULT_QUESTION_FORM_BUTTON_TEXT,
    expandedTitle:
      normalizeOptionalText(article.questionFormExpandedTitle) ??
      DEFAULT_QUESTION_FORM_EXPANDED_TITLE,
    questionLabel:
      normalizeOptionalText(article.questionFormQuestionLabel) ??
      DEFAULT_QUESTION_FORM_QUESTION_LABEL,
  };
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
    questionForm: getQuestionForm(article),
    createdAt: article.publishedDate || article.createdAt,
    updatedAt: article.updatedAt || article.publishedDate || article.createdAt,
  };
}
