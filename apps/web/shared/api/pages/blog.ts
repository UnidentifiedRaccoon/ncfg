/**
 * Blog Page API Functions
 *
 * Fetch blog page meta content from Strapi CMS.
 */

import { buildQueryString, fetchAPI, type StrapiResponse } from '../../lib/strapi';
import type { StrapiBlogPage } from '../types/strapi';

export async function getBlogPage(): Promise<StrapiBlogPage | null> {
  const query = buildQueryString({ populate: '*' });

  const response = await fetchAPI<StrapiResponse<StrapiBlogPage | null>>(
    `/blog-page${query}`,
    { tags: ['blog-page'] }
  );

  return response.data ?? null;
}

