/**
 * Service UI API Functions
 *
 * Fetch service UI mappings (icons) from Strapi CMS.
 */

import { buildQueryString, fetchAPI, type StrapiResponse } from '../lib/strapi';
import type { StrapiServiceUi } from './types/strapi';

export async function getServiceUis(): Promise<StrapiServiceUi[]> {
  const query = buildQueryString({
    populate: ['service'],
    sort: 'updatedAt:desc',
    pagination: { limit: 100 },
  });

  const response = await fetchAPI<StrapiResponse<StrapiServiceUi[]>>(
    `/service-uis${query}`,
    { tags: ['service-ui'] }
  );

  return response.data;
}

export async function getServiceUiIconMap(): Promise<Record<string, string>> {
  const items = await getServiceUis();
  const map: Record<string, string> = {};

  for (const item of items) {
    const slug = item.service?.slug;
    if (!slug) continue;
    map[slug] = item.iconKey;
  }

  return map;
}

