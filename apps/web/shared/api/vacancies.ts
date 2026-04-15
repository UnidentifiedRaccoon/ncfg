import {
  buildQueryString,
  fetchAPI,
  getStrapiMediaUrl,
  type StrapiResponse,
} from '../lib/strapi';
import type { StrapiVacancy } from './types/strapi';
import type { VacancyData } from './types/vacancy';
import {
  getVacancyEmploymentTypeLabel,
  getVacancyWorkFormatLabel,
  resolveVacancyPublishedDate,
} from '@/shared/lib/vacancies';

interface GetVacanciesOptions {
  page?: number;
  pageSize?: number;
}

const VACANCY_POPULATE = ['department', 'coverImage'] as const;

function isStrapiNotFoundError(error: unknown): boolean {
  return error instanceof Error && error.message.includes('Strapi API error (404)');
}

async function withMissingVacancyEndpointFallback<T>(
  load: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await load();
  } catch (error) {
    if (isStrapiNotFoundError(error)) {
      return fallback;
    }

    throw error;
  }
}

export async function getVacancies(options: GetVacanciesOptions = {}): Promise<{
  vacancies: StrapiVacancy[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}> {
  const { page = 1, pageSize = 100 } = options;

  return withMissingVacancyEndpointFallback(async () => {
    const query = buildQueryString({
      populate: [...VACANCY_POPULATE],
      publicationState: 'live',
      sort: ['publishedDate:desc', 'createdAt:desc'],
      pagination: { page, pageSize },
    });

    const response = await fetchAPI<StrapiResponse<StrapiVacancy[]>>(`/vacancies${query}`, {
      tags: ['vacancies'],
    });

    return {
      vacancies: response.data,
      pagination: response.meta.pagination || {
        page: 1,
        pageSize,
        pageCount: 1,
        total: response.data.length,
      },
    };
  }, {
    vacancies: [],
    pagination: {
      page: 1,
      pageSize,
      pageCount: 0,
      total: 0,
    },
  });
}

export async function getVacancy(slug: string): Promise<StrapiVacancy | null> {
  return withMissingVacancyEndpointFallback(async () => {
    const query = buildQueryString({
      populate: [...VACANCY_POPULATE],
      publicationState: 'live',
      filters: {
        slug: { $eq: slug },
      },
    });

    const response = await fetchAPI<StrapiResponse<StrapiVacancy[]>>(`/vacancies${query}`, {
      tags: ['vacancies', `vacancy-${slug}`],
    });

    return response.data[0] || null;
  }, null);
}

export async function getLatestVacancies(limit: number = 3): Promise<StrapiVacancy[]> {
  return withMissingVacancyEndpointFallback(async () => {
    const query = buildQueryString({
      populate: [...VACANCY_POPULATE],
      publicationState: 'live',
      sort: ['publishedDate:desc', 'createdAt:desc'],
      pagination: { limit },
    });

    const response = await fetchAPI<StrapiResponse<StrapiVacancy[]>>(`/vacancies${query}`, {
      tags: ['vacancies'],
    });

    return response.data;
  }, []);
}

export async function getVacancySlugs(): Promise<string[]> {
  return withMissingVacancyEndpointFallback(async () => {
    const query = buildQueryString({
      fields: ['slug'],
      publicationState: 'live',
      sort: ['publishedDate:desc', 'createdAt:desc'],
      pagination: { page: 1, pageSize: 100 },
    });

    const response = await fetchAPI<StrapiResponse<Array<Pick<StrapiVacancy, 'slug'>>>>(
      `/vacancies${query}`,
      {
        tags: ['vacancies'],
      }
    );

    return response.data
      .map((vacancy) => vacancy.slug)
      .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0);
  }, []);
}

export async function getPublishedVacancySummaryBySlug(
  slug: string
): Promise<Pick<StrapiVacancy, 'slug' | 'title' | 'publishedAt'> | null> {
  return withMissingVacancyEndpointFallback(async () => {
    const query = buildQueryString({
      fields: ['slug', 'title', 'publishedAt'],
      publicationState: 'live',
      filters: {
        slug: { $eq: slug },
      },
    });

    const response = await fetchAPI<
      StrapiResponse<Array<Pick<StrapiVacancy, 'slug' | 'title' | 'publishedAt'>>>
    >(`/vacancies${query}`, {
      tags: ['vacancies', `vacancy-${slug}`],
    });

    return response.data[0] || null;
  }, null);
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function transformToVacancyData(vacancy: StrapiVacancy): VacancyData {
  return {
    id: String(vacancy.id),
    title: vacancy.title,
    slug: vacancy.slug,
    lead: normalizeOptionalText(vacancy.lead),
    body: vacancy.body || '',
    department: vacancy.department
      ? {
          id: String(vacancy.department.id),
          slug: vacancy.department.slug,
          title: vacancy.department.title,
          order: vacancy.department.order,
          description: vacancy.department.description,
        }
      : null,
    employmentType: vacancy.employmentType,
    employmentTypeLabel: getVacancyEmploymentTypeLabel(vacancy.employmentType),
    workFormat: vacancy.workFormat,
    workFormatLabel: getVacancyWorkFormatLabel(vacancy.workFormat),
    location: normalizeOptionalText(vacancy.location),
    salaryText: normalizeOptionalText(vacancy.salaryText),
    coverImage: getStrapiMediaUrl(vacancy.coverImage?.url),
    publishedDate: resolveVacancyPublishedDate({
      publishedDate: vacancy.publishedDate,
      createdAt: vacancy.createdAt,
    }),
    createdAt: vacancy.createdAt,
    updatedAt: vacancy.updatedAt,
  };
}
