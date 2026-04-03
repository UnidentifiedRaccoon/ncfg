const LEGACY_REDIRECTS = new Map([["/news", "/blog"]]);
const GONE_PATHS = new Set(["/wp-login.php", "/xmlrpc.php", "/feed"]);

export function getSeoRedirectPathname(pathname: string): string {
  return LEGACY_REDIRECTS.get(pathname) ?? pathname;
}

export function isSeoGonePath(pathname: string): boolean {
  return GONE_PATHS.has(pathname);
}

export function buildCanonicalRedirectUrl(requestUrl: string, siteUrl: string): URL | null {
  const request = new URL(requestUrl);
  const canonical = new URL(siteUrl);
  const canonicalPathname = getSeoRedirectPathname(request.pathname);
  const isCanonicalHost =
    request.protocol === canonical.protocol && request.hostname === canonical.hostname;

  if (isCanonicalHost && canonicalPathname === request.pathname) {
    return null;
  }

  const target = new URL(canonical);
  target.pathname = canonicalPathname;
  target.search = request.search;

  return target;
}
