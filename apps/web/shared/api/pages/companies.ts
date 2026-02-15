/**
 * Companies Page API Functions
 *
 * Fetch companies page content from Strapi CMS.
 */

import { buildQueryString, fetchAPI, type StrapiResponse } from '../../lib/strapi';
import type { StrapiCompaniesPage } from '../types/strapi';

export async function getCompaniesPage(): Promise<StrapiCompaniesPage | null> {
  const query = buildQueryString({ populate: '*' });

  const response = await fetchAPI<StrapiResponse<StrapiCompaniesPage | null>>(
    `/companies-page${query}`,
    { tags: ['companies-page'] }
  );

  return response.data ?? null;
}

