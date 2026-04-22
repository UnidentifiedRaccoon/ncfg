const CMS_DRIVEN_EXACT_PATHS = new Set([
  "/",
  "/about",
  "/blog",
  "/companies",
  "/rekomendacii",
  "/vacancies",
]);

const CMS_DRIVEN_PREFIXES = ["/blog/", "/companies/", "/vacancies/", "/diagnostika/"];

function stripQueryAndHash(value: string): string {
  const hashIndex = value.indexOf("#");
  const queryIndex = value.indexOf("?");
  const cutIndex =
    hashIndex === -1
      ? queryIndex
      : queryIndex === -1
        ? hashIndex
        : Math.min(hashIndex, queryIndex);

  return cutIndex === -1 ? value : value.slice(0, cutIndex);
}

function normalizePathname(pathname: string): string {
  const normalized = stripQueryAndHash(pathname).trim();

  if (!normalized) return "/";
  if (normalized === "/") return normalized;

  return normalized.endsWith("/") ? normalized.replace(/\/+$/, "") || "/" : normalized;
}

export function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

export function isCmsDrivenPath(pathname: string): boolean {
  const normalizedPathname = normalizePathname(pathname);

  if (CMS_DRIVEN_EXACT_PATHS.has(normalizedPathname)) {
    return true;
  }

  return CMS_DRIVEN_PREFIXES.some((prefix) => normalizedPathname.startsWith(prefix));
}

export function shouldUseNativeDocumentNavigation(href: string): boolean {
  const normalizedHref = href.trim().toLowerCase();

  if (
    normalizedHref.startsWith("#") ||
    normalizedHref.startsWith("mailto:") ||
    normalizedHref.startsWith("tel:")
  ) {
    return true;
  }

  if (!isInternalHref(href)) {
    return true;
  }

  return isCmsDrivenPath(href);
}
