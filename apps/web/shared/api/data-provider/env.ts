const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

export function assertStrapiConfigured(): void {
  if (!STRAPI_URL || !STRAPI_API_TOKEN) {
    throw new Error(
      'Strapi is required. Set STRAPI_URL and STRAPI_API_TOKEN (see apps/web/.env.local.example).'
    );
  }
}

export function isUsingStrapi(): boolean {
  return Boolean(STRAPI_URL && STRAPI_API_TOKEN);
}

