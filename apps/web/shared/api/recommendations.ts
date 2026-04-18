/**
 * Recommendations API Functions
 *
 * Fetch functions for partner/client recommendations from Strapi CMS.
 */

import { buildQueryString, fetchAPI, type StrapiResponse } from '../lib/strapi';
import type { StrapiRecommendation } from './types/strapi';

export interface LegacyRecommendation {
  id: number;
  company: string;
  quote: string;
  fullQuote: string | null;
  logoImg: string | null;
  sourceLink: string | null;
  order: number;
}

export async function getRecommendations(limit?: number): Promise<StrapiRecommendation[]> {
  const query = buildQueryString({
    fields: ['company', 'slug', 'quote', 'fullQuote', 'logoImg', 'sourceLink', 'order'],
    sort: ['order:asc', 'id:asc'],
    ...(typeof limit === 'number' ? { pagination: { limit } } : {}),
  });

  const response = await fetchAPI<StrapiResponse<StrapiRecommendation[]>>(
    `/recommendations${query}`
  );

  return response.data;
}

export function transformToLegacyRecommendation(
  recommendation: StrapiRecommendation
): LegacyRecommendation {
  return {
    id: recommendation.id,
    company: recommendation.company,
    quote: recommendation.quote,
    fullQuote: recommendation.fullQuote,
    logoImg: recommendation.logoImg,
    sourceLink: recommendation.sourceLink,
    order: recommendation.order,
  };
}
