import { getNews, getNewsArticle, getLatestNews, transformToLegacyNews } from '../news';

import { assertStrapiConfigured } from './env';

export interface NewsArticleCategoryData {
  slug: string;
  title: string;
}

export interface NewsArticleData {
  id: string;
  title: string;
  category: NewsArticleCategoryData | null;
  slug: string;
  body: string;
  anonsImage: string | null;
  createdAt: string;
}

export async function fetchNewsArticles(options: { category?: string } = {}): Promise<NewsArticleData[]> {
  assertStrapiConfigured();

  const { articles } = await getNews({ pageSize: 100, category: options.category });
  return articles.map(transformToLegacyNews);
}

export async function fetchNewsArticle(slug: string): Promise<NewsArticleData | null> {
  assertStrapiConfigured();

  const article = await getNewsArticle(slug);
  return article ? transformToLegacyNews(article) : null;
}

export async function fetchLatestNewsArticles(
  limit: number = 5,
  options: { category?: string } = {}
): Promise<NewsArticleData[]> {
  assertStrapiConfigured();

  const articles = await getLatestNews(limit, options);
  return articles.map(transformToLegacyNews);
}
