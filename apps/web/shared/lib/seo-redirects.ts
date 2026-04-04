const LEGACY_REDIRECTS = new Map([["/news", "/blog"]]);
const GONE_PATHS = new Set(["/wp-login.php", "/xmlrpc.php", "/feed"]);
const STATIC_ASSET_EXTENSIONS = new Set([
  "avif",
  "bmp",
  "css",
  "doc",
  "docx",
  "gif",
  "ico",
  "icns",
  "jpg",
  "jpeg",
  "js",
  "json",
  "map",
  "mjs",
  "mp3",
  "mp4",
  "otf",
  "pdf",
  "png",
  "svg",
  "ttf",
  "wav",
  "webm",
  "webmanifest",
  "webp",
  "woff",
  "woff2",
  "xml.gz",
  "zip",
]);

interface CanonicalRequestContext {
  host?: string | null;
  protocol?: string | null;
}

export function getSeoRedirectPathname(pathname: string): string {
  const normalizedPathname =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const exactRedirect = LEGACY_REDIRECTS.get(normalizedPathname);

  if (exactRedirect) {
    return exactRedirect;
  }

  if (normalizedPathname.startsWith("/news/")) {
    const legacySlug = normalizedPathname.slice("/news/".length);

    if (legacySlug.length > 0 && !legacySlug.includes("/")) {
      return `/blog/${legacySlug}`;
    }
  }

  return normalizedPathname;
}

export function isSeoGonePath(pathname: string): boolean {
  return GONE_PATHS.has(pathname);
}

export function isStaticAssetPathname(pathname: string): boolean {
  const lastSegment = pathname.split("/").pop();

  if (!lastSegment || !lastSegment.includes(".")) {
    return false;
  }

  const lowerSegment = lastSegment.toLowerCase();

  for (const extension of STATIC_ASSET_EXTENSIONS) {
    if (lowerSegment.endsWith(`.${extension}`)) {
      return true;
    }
  }

  return false;
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
