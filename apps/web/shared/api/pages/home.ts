/**
 * Home Page API Functions
 *
 * Fetch home page content from Strapi CMS.
 */

import { buildQueryString, fetchAPI, type StrapiResponse } from '../../lib/strapi';
import type { StrapiHomePage } from '../types/strapi';

export async function getHomePage(): Promise<StrapiHomePage | null> {
  const query = buildQueryString({ populate: '*' });

  const response = await fetchAPI<StrapiResponse<StrapiHomePage | null>>(
    `/home-page${query}`,
    { tags: ['home-page'] }
  );

  return response.data ?? null;
}

