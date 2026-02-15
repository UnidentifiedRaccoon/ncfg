/**
 * Site Settings API Functions
 *
 * Fetch global site settings (footer, contacts, metrics) from Strapi CMS.
 */

import { buildQueryString, fetchAPI, type StrapiResponse } from '../lib/strapi';
import type { StrapiSiteSetting } from './types/strapi';

export async function getSiteSetting(): Promise<StrapiSiteSetting | null> {
  const query = buildQueryString({ populate: '*' });

  const response = await fetchAPI<StrapiResponse<StrapiSiteSetting | null>>(
    `/site-setting${query}`,
    { tags: ['site-setting'] }
  );

  return response.data ?? null;
}

