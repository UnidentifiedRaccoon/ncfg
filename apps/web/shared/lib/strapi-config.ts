type StrapiSource = 'default' | 'local' | 'prod';

interface StrapiSourceConfig {
  urlEnv: string;
  tokenEnv: string;
}

interface ResolvedStrapiConfig {
  source: StrapiSource;
  url: string;
  token: string;
  urlEnv: string;
  tokenEnv: string;
}

const STRAPI_SOURCE_ENV = 'STRAPI_SOURCE';
const STRAPI_SOURCE_VALUES: readonly StrapiSource[] = ['default', 'local', 'prod'];
const STRAPI_SOURCE_CONFIG: Record<StrapiSource, StrapiSourceConfig> = {
  default: {
    urlEnv: 'STRAPI_URL',
    tokenEnv: 'STRAPI_API_TOKEN',
  },
  local: {
    urlEnv: 'STRAPI_LOCAL_URL',
    tokenEnv: 'STRAPI_LOCAL_API_TOKEN',
  },
  prod: {
    urlEnv: 'STRAPI_PROD_URL',
    tokenEnv: 'STRAPI_PROD_API_TOKEN',
  },
};

function normalizeToken(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // Allow passing either raw token or "Bearer <token>" (common in CI/secrets).
  return trimmed.replace(/^Bearer\s+/i, '');
}

function trimEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function getStrapiSourceOrThrow(): StrapiSource {
  const sourceRaw = trimEnv(STRAPI_SOURCE_ENV);
  if (!sourceRaw) return 'default';

  const source = sourceRaw.toLowerCase();
  if (source === 'default' || source === 'local' || source === 'prod') {
    return source;
  }

  throw new Error(
    `Invalid ${STRAPI_SOURCE_ENV}="${sourceRaw}". Use one of: ${STRAPI_SOURCE_VALUES.join(', ')}.`
  );
}

function getRequiredMessage(source: StrapiSource, missingVars: string[]): string {
  const missing = missingVars.join(' and ');
  const config = STRAPI_SOURCE_CONFIG[source];

  return (
    `Strapi is required. Set ${missing} for ${STRAPI_SOURCE_ENV}=${source}. ` +
    `Selected env pair: ${config.urlEnv} + ${config.tokenEnv}. ` +
    'See apps/web/.env.local.example.'
  );
}

export function getResolvedStrapiConfigOrThrow(): ResolvedStrapiConfig {
  const source = getStrapiSourceOrThrow();
  const { urlEnv, tokenEnv } = STRAPI_SOURCE_CONFIG[source];

  const url = trimEnv(urlEnv);
  const token = normalizeToken(trimEnv(tokenEnv));
  if (!url || !token) {
    const missingVars: string[] = [];
    if (!url) missingVars.push(urlEnv);
    if (!token) missingVars.push(tokenEnv);
    throw new Error(getRequiredMessage(source, missingVars));
  }

  return { source, url, token, urlEnv, tokenEnv };
}
