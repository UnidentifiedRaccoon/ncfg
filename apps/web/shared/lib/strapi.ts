/**
 * Strapi API Client
 * 
 * Provides typed fetch functions for interacting with Strapi CMS.
 */

import { getResolvedStrapiConfigOrThrow } from './strapi-config';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeBaseUrl(value: string, envName: string): string {
  const normalized = value.replace(/\/+$/, '');
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error(
      `Invalid ${envName}. Expected an absolute http(s) URL, got: "${normalized}".`
    );
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(
      `Invalid ${envName} protocol "${parsed.protocol}". Expected http: or https:.`
    );
  }

  return normalized;
}

function getStrapiConfigOrThrow(): { url: string; token: string } {
  const { url: urlRaw, token, urlEnv } = getResolvedStrapiConfigOrThrow();

  return { url: normalizeBaseUrl(urlRaw, urlEnv), token };
}

// ==================
// Types
// ==================

export interface StrapiMeta {
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface StrapiResponse<T> {
  data: T;
  meta: StrapiMeta;
}

// ==================
// Base Client
// ==================

interface FetchOptions extends RequestInit {
  revalidate?: number;
}

// In development, disable cache for instant updates from Strapi
const isDev = process.env.NODE_ENV === 'development';
const DEFAULT_REVALIDATE = 60;

function getFetchErrorCauseMessage(error: unknown): string | null {
  if (!isRecord(error)) return null;
  const cause = error.cause;
  if (cause instanceof Error) return cause.message;
  if (typeof cause === 'string') return cause;
  return null;
}

function getFetchFailureHint(errorMessage: string, requestUrl: string): string | null {
  const normalized = errorMessage.toLowerCase();
  let host = '';
  try {
    host = new URL(requestUrl).host.toLowerCase();
  } catch {
    host = '';
  }

  const isLocalStrapi = host === 'localhost:1337' || host === '127.0.0.1:1337';

  if (normalized.includes('fetch failed') && isLocalStrapi) {
    return (
      'Hint: local Strapi is unreachable. ' +
      'Start CMS (`cd apps/cms && npm run develop`) and ensure AWS_* vars are set in apps/cms/.env (S3-only mode).'
    );
  }

  if (normalized.includes('econnrefused')) {
    return (
      'Hint: Strapi is not reachable (connection refused). ' +
      'If developing locally, start CMS: `cd apps/cms && npm run develop`.'
    );
  }

  if (normalized.includes('enotfound') || normalized.includes('getaddrinfo')) {
    return "Hint: selected Strapi hostname can't be resolved (DNS). Check active STRAPI_*_URL variable.";
  }

  if (normalized.includes('certificate') || normalized.includes('self signed') || normalized.includes('tls')) {
    return 'Hint: TLS/certificate issue. Check active STRAPI_*_URL protocol (http vs https) and certs.';
  }

  return null;
}

/**
 * Make a request to the Strapi API
 */
export async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { revalidate = DEFAULT_REVALIDATE, ...fetchOptions } = options;
  
  const { url: baseUrl, token } = getStrapiConfigOrThrow();
  const url = `${baseUrl}/api${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...fetchOptions,
      headers,
      // In dev mode, don't cache; in prod, use ISR with revalidate
      ...(isDev ? { cache: 'no-store' as const } : { next: { revalidate } }),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const causeMessage = getFetchErrorCauseMessage(error);
    const hint = getFetchFailureHint(causeMessage ?? errorMessage, url);

    const details: string[] = [
      `Strapi fetch failed: ${url}`,
      `Error: ${errorMessage}`,
      ...(causeMessage && causeMessage !== errorMessage ? [`Cause: ${causeMessage}`] : []),
      ...(hint ? [hint] : []),
    ];

    throw new Error(details.join('\n'));
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Strapi API error (${res.status}): ${errorText}`);
  }

  return res.json();
}

/**
 * Get the full URL for a Strapi media file
 */
export function getStrapiMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const normalizedUrl = url.trim();
  if (!normalizedUrl) return null;

  // S3 migration is strict: media URLs must already be absolute.
  if (normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://')) {
    return normalizedUrl;
  }

  throw new Error(
    `Strapi media URL must be absolute after S3 migration. Got relative value: "${normalizedUrl}".`
  );
}

// ==================
// Query Helpers
// ==================

type PopulateValue = boolean | string | string[] | Record<string, unknown>;

interface QueryParams {
  populate?: PopulateValue;
  filters?: Record<string, unknown>;
  sort?: string | string[];
  pagination?: {
    page?: number;
    pageSize?: number;
    start?: number;
    limit?: number;
  };
  fields?: string[];
  locale?: string;
  publicationState?: 'live' | 'preview';
}

/**
 * Build query string from params
 */
export function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();

  // Populate
  if (params.populate) {
    if (params.populate === true || params.populate === '*') {
      searchParams.append('populate', '*');
    } else if (Array.isArray(params.populate)) {
      params.populate.forEach((field, index) => {
        searchParams.append(`populate[${index}]`, field);
      });
    } else if (typeof params.populate === 'object') {
      // Deep populate
      const flattenPopulate = (obj: Record<string, unknown>, prefix = 'populate'): void => {
        Object.entries(obj).forEach(([key, value]) => {
          const newKey = `${prefix}[${key}]`;
          if (typeof value === 'object' && value !== null) {
            flattenPopulate(value as Record<string, unknown>, newKey);
          } else {
            searchParams.append(newKey, String(value));
          }
        });
      };
      flattenPopulate(params.populate as Record<string, unknown>);
    } else {
      searchParams.append('populate', String(params.populate));
    }
  }

  // Filters
  if (params.filters) {
    const flattenFilters = (obj: Record<string, unknown>, prefix = 'filters'): void => {
      Object.entries(obj).forEach(([key, value]) => {
        const newKey = `${prefix}[${key}]`;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flattenFilters(value as Record<string, unknown>, newKey);
        } else {
          searchParams.append(newKey, String(value));
        }
      });
    };
    flattenFilters(params.filters);
  }

  // Sort
  if (params.sort) {
    if (Array.isArray(params.sort)) {
      params.sort.forEach((field, index) => {
        searchParams.append(`sort[${index}]`, field);
      });
    } else {
      searchParams.append('sort', params.sort);
    }
  }

  // Pagination
  if (params.pagination) {
    Object.entries(params.pagination).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(`pagination[${key}]`, String(value));
      }
    });
  }

  // Fields
  if (params.fields) {
    params.fields.forEach((field, index) => {
      searchParams.append(`fields[${index}]`, field);
    });
  }

  // Locale
  if (params.locale) {
    searchParams.append('locale', params.locale);
  }

  // Publication state
  if (params.publicationState) {
    searchParams.append('publicationState', params.publicationState);
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}
