/**
 * Services API Functions
 *
 * Fetch functions for services and service categories from Strapi CMS.
 */

import { fetchAPI, buildQueryString, StrapiResponse } from '../lib/strapi';
import type {
  StrapiService,
  StrapiServiceCategory,
  StrapiServiceWebinar,
  StrapiTextItem,
} from './types/strapi';

// ==================
// Service Categories
// ==================

const SERVICES_POPULATE = {
  benefits: true,
  howWeWork: true,
  webinars: {
    populate: {
      items: true,
    },
  },
  examples: true,
  cta: true,
} as const;

async function getServiceCategories(): Promise<StrapiServiceCategory[]> {
  const buildCategoriesQuery = (servicesPopulate: Record<string, unknown>) =>
    buildQueryString({
      populate: {
        services: {
          populate: servicesPopulate,
          sort: ['order:asc'],
        },
      },
      sort: 'order:asc',
      publicationState: 'live',
    });

  const response = await fetchAPI<StrapiResponse<StrapiServiceCategory[]>>(
    `/service-categories${buildCategoriesQuery(SERVICES_POPULATE)}`
  );

  return response.data;
}

// ==================
// Helper: Transform to legacy format
// ==================

import type {
  Service,
  ServiceCategory,
  ServiceCTA,
  ServiceExample,
  ServiceWebinar,
  ServicesData,
} from './types/service';

function normalizeOptionalText(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function extractTextItems(items: StrapiTextItem[] | null | undefined): string[] {
  if (!items || !Array.isArray(items)) return [];

  return items
    .map((item) => (typeof item.text === 'string' ? item.text.trim() : ''))
    .filter((item) => item.length > 0);
}

function extractWebinars(webinars: StrapiServiceWebinar[] | null | undefined): ServiceWebinar[] {
  if (!Array.isArray(webinars)) return [];

  return webinars
    .map((webinar) => {
      const title = typeof webinar?.title === 'string' ? webinar.title.trim() : '';
      const items = extractTextItems(webinar?.items);

      return { title, items };
    })
    .filter((webinar) => webinar.title.length > 0 || webinar.items.length > 0);
}

function transformToLegacyService(service: StrapiService): Service {
  const examples: ServiceExample[] | undefined = service.examples?.length ?
    service.examples.map(ex => ({
      id: ex.exampleId || ex.id,
      title: ex.title,
      type: ex.type || undefined,
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
    title: service.title,
    shortDescription: service.shortDescription || '',
    fullDescriptionTitle: normalizeOptionalText(service.fullDescriptionTitle),
    fullDescription: normalizeOptionalText(service.fullDescription),
    benefitsTitle: normalizeOptionalText(service.benefitsTitle),
    benefits: extractTextItems(service.benefits),
    htmlSectionBefore: normalizeOptionalText(service.htmlSectionBefore),
    usefulInformation: normalizeOptionalText(service.usefulInformation),
    htmlSectionAfter: normalizeOptionalText(service.htmlSectionAfter),
    howWeWorkTitle: normalizeOptionalText(service.howWeWorkTitle),
    webinarsTitle: normalizeOptionalText(service.webinarsTitle),
    webinars: extractWebinars(service.webinars),
    examplesTitle: normalizeOptionalText(service.examplesTitle),
    examples,
    howWeWork: extractTextItems(service.howWeWork),
    cta,
  };
}

function transformToLegacyCategory(category: StrapiServiceCategory): ServiceCategory {
  return {
    id: category.slug,
    order: category.order,
    title: category.title,
    description: category.description || '',
    services: (category.services ?? [])
      .filter((service) => Boolean(service.publishedAt))
      .map(transformToLegacyService),
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
