/**
 * Services API Functions
 * 
 * Fetch functions for services and service categories from Strapi CMS.
 */

import { fetchAPI, buildQueryString, StrapiResponse } from '../lib/strapi';
import type { StrapiService, StrapiServiceCategory, StrapiTextItem } from './types/strapi';

// ==================
// Service Categories
// ==================

export async function getServiceCategories(): Promise<StrapiServiceCategory[]> {
  const query = buildQueryString({
    populate: {
      services: {
        populate: ['benefits', 'howWeWork', 'examples', 'cta'],
        sort: ['order:asc'],
      },
    },
    sort: 'order:asc',
  });

  const response = await fetchAPI<StrapiResponse<StrapiServiceCategory[]>>(
    `/service-categories${query}`,
    { tags: ['services'] }
  );

  return response.data;
}

export async function getServiceCategory(slug: string): Promise<StrapiServiceCategory | null> {
  const query = buildQueryString({
    populate: {
      services: {
        populate: '*',
        sort: ['order:asc'],
      },
    },
    filters: {
      slug: { $eq: slug },
    },
  });

  const response = await fetchAPI<StrapiResponse<StrapiServiceCategory[]>>(
    `/service-categories${query}`,
    { tags: ['services', `service-category-${slug}`] }
  );

  return response.data[0] || null;
}

// ==================
// Services
// ==================

export async function getServices(): Promise<StrapiService[]> {
  const query = buildQueryString({
    populate: '*',
    sort: 'order:asc',
    pagination: { limit: 100 },
  });

  const response = await fetchAPI<StrapiResponse<StrapiService[]>>(
    `/services${query}`,
    { tags: ['services'] }
  );

  return response.data;
}

export async function getService(slug: string): Promise<StrapiService | null> {
  const query = buildQueryString({
    populate: '*',
    filters: {
      slug: { $eq: slug },
    },
  });

  const response = await fetchAPI<StrapiResponse<StrapiService[]>>(
    `/services${query}`,
    { tags: ['services', `service-${slug}`] }
  );

  return response.data[0] || null;
}

export async function getPublishedServices(): Promise<StrapiService[]> {
  const query = buildQueryString({
    populate: '*',
    filters: {
      status: { $eq: 'published' },
    },
    sort: 'order:asc',
    pagination: { limit: 100 },
  });

  const response = await fetchAPI<StrapiResponse<StrapiService[]>>(
    `/services${query}`,
    { tags: ['services'] }
  );

  return response.data;
}

// ==================
// Helper: Transform to legacy format
// ==================

import type { Service, ServiceCategory, ServiceExample, ServiceCTA, ServicesData } from './types/service';

function extractTextItems(items: StrapiTextItem[] | null | undefined): string[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map(item => item.text);
}

export function transformToLegacyService(service: StrapiService): Service {
  const examples: ServiceExample[] | undefined = service.examples?.length ?
    service.examples.map(ex => ({
      id: ex.exampleId || ex.id,
      title: ex.title,
      type: ex.type === 'custom' ? undefined : ex.type || undefined,
      link: ex.link || undefined,
      description: ex.description || undefined,
      notes: ex.notes || undefined,
    })) : undefined;

  const cta: ServiceCTA = {
    label: service.cta?.label || '',
    type: service.cta?.type === 'form' || service.cta?.type === 'link'
      ? service.cta.type
      : 'form',
  };

  return {
    id: service.slug,
    order: service.order,
    status: service.status,
    title: service.title,
    shortDescription: service.shortDescription || '',
    fullDescription: service.fullDescription || '',
    benefits: extractTextItems(service.benefits),
    examples,
    howWeWork: extractTextItems(service.howWeWork),
    cta,
  };
}

export function transformToLegacyCategory(category: StrapiServiceCategory): ServiceCategory {
  return {
    id: category.slug,
    order: category.order,
    title: category.title,
    description: category.description || '',
    services: category.services?.map(transformToLegacyService) || [],
  };
}

export async function getServicesDataLegacy(): Promise<ServicesData> {
  const categories = await getServiceCategories();
  
  return {
    meta: {
      contentType: 'services-catalog',
      organization: 'НЦФГ',
      experienceYears: 25,
      locale: 'ru',
      updatedAt: new Date().toISOString().split('T')[0],
    },
    serviceCategories: categories.map(transformToLegacyCategory),
  };
}
