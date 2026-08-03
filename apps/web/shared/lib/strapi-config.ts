export type StrapiSource = 'default' | 'local' | 'prod';

interface StrapiSourceConfig {
  urlEnv: string;
  tokenEnv: string;
  writeTokenEnv?: string;
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
    writeTokenEnv: 'STRAPI_WRITE_API_TOKEN',
  },
  local: {
    urlEnv: 'STRAPI_LOCAL_URL',
    tokenEnv: 'STRAPI_LOCAL_API_TOKEN',
    writeTokenEnv: 'STRAPI_LOCAL_WRITE_API_TOKEN',
  },
  prod: {
    urlEnv: 'STRAPI_PROD_URL',
    tokenEnv: 'STRAPI_PROD_API_TOKEN',
    writeTokenEnv: 'STRAPI_PROD_WRITE_API_TOKEN',
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

export function getStrapiSourceOrThrow(): StrapiSource {
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

function getRequiredMessage(
  source: StrapiSource,
  missingVars: string[],
  tokenEnv: string,
  mode: 'read' | 'write'
): string {
  const missing = missingVars.join(' and ');
  const config = STRAPI_SOURCE_CONFIG[source];
  const requirement =
    mode === 'write' ? 'Strapi write access is required.' : 'Strapi is required.';

  return (
    `${requirement} Set ${missing} for ${STRAPI_SOURCE_ENV}=${source}. ` +
    `Selected env pair: ${config.urlEnv} + ${tokenEnv}. ` +
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
    throw new Error(getRequiredMessage(source, missingVars, tokenEnv, 'read'));
  }

  return { source, url, token, urlEnv, tokenEnv };
}

export function getResolvedStrapiWriteConfigOrThrow(): ResolvedStrapiConfig {
  const source = getStrapiSourceOrThrow();
  const { urlEnv, writeTokenEnv } = STRAPI_SOURCE_CONFIG[source];
  const effectiveWriteTokenEnv = writeTokenEnv || 'STRAPI_WRITE_API_TOKEN';

  const url = trimEnv(urlEnv);
  const token = normalizeToken(trimEnv(effectiveWriteTokenEnv));

  if (!url || !token) {
    const missingVars: string[] = [];
    if (!url) missingVars.push(urlEnv);
    if (!token) {
      missingVars.push(effectiveWriteTokenEnv);
    }
    throw new Error(getRequiredMessage(source, missingVars, effectiveWriteTokenEnv, 'write'));
  }

  return {
    source,
    url,
    token,
    urlEnv,
    tokenEnv: effectiveWriteTokenEnv,
  };
}
