const LEGACY_REDIRECTS = new Map([["/news", "/blog"]]);
const GONE_PATHS = new Set(["/wp-login.php", "/xmlrpc.php", "/feed"]);

interface CanonicalRequestContext {
  host?: string | null;
  protocol?: string | null;
}

export function getSeoRedirectPathname(pathname: string): string {
  return LEGACY_REDIRECTS.get(pathname) ?? pathname;
}

export function isSeoGonePath(pathname: string): boolean {
  return GONE_PATHS.has(pathname);
}

function normalizeProtocol(protocol: string | null | undefined, fallback: string): string {
  if (!protocol) {
    return fallback;
  }

  return protocol.endsWith(":") ? protocol : `${protocol}:`;
}

function normalizeHostname(
  host: string | null | undefined,
  protocol: string,
  fallback: string
): string {
  if (!host) {
    return fallback;
  }

  try {
    return new URL(`${protocol}//${host}`).hostname;
  } catch {
    return fallback;
  }
}

export function buildCanonicalRedirectUrl(
  requestUrl: string,
  siteUrl: string,
  requestContext: CanonicalRequestContext = {}
): URL | null {
  const request = new URL(requestUrl);
  const canonical = new URL(siteUrl);
  const canonicalPathname = getSeoRedirectPathname(request.pathname);
  const effectiveProtocol = normalizeProtocol(requestContext.protocol, request.protocol);
  const effectiveHostname = normalizeHostname(requestContext.host, effectiveProtocol, request.hostname);
  const isCanonicalHost =
    effectiveProtocol === canonical.protocol && effectiveHostname === canonical.hostname;

  if (isCanonicalHost && canonicalPathname === request.pathname) {
    return null;
  }

  const target = new URL(canonical);
  target.pathname = canonicalPathname;
  target.search = request.search;

  return target;
}
