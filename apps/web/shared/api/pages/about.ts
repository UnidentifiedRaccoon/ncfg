/**
 * About Page API Functions
 *
 * Fetch about page content from Strapi CMS.
 */

import { buildQueryString, fetchAPI, type StrapiResponse } from '../../lib/strapi';
import type { StrapiAboutPage } from '../types/strapi';

export async function getAboutPage(): Promise<StrapiAboutPage | null> {
  const query = buildQueryString({ populate: '*' });

  const response = await fetchAPI<StrapiResponse<StrapiAboutPage | null>>(
    `/about-page${query}`,
    { tags: ['about-page'] }
  );

  return response.data ?? null;
}

