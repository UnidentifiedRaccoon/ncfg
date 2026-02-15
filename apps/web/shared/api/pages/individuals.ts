/**
 * Individuals Page API Functions
 *
 * Fetch individuals page content from Strapi CMS.
 */

import { buildQueryString, fetchAPI, type StrapiResponse } from '../../lib/strapi';
import type { StrapiIndividualsPage } from '../types/strapi';

export async function getIndividualsPage(): Promise<StrapiIndividualsPage | null> {
  const query = buildQueryString({ populate: '*' });

  const response = await fetchAPI<StrapiResponse<StrapiIndividualsPage | null>>(
    `/individuals-page${query}`,
    { tags: ['individuals-page'] }
  );

  return response.data ?? null;
}

