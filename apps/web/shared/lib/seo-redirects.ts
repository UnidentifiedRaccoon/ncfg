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

  if (request.origin === canonical.origin && canonicalPathname === request.pathname) {
    return null;
  }

  const target = new URL(requestUrl);
  target.protocol = canonical.protocol;
  target.host = canonical.host;
  target.pathname = canonicalPathname;

  return target;
}
