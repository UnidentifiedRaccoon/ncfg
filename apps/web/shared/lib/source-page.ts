const MAX_SOURCE_PAGE_URL_LENGTH = 2048;

function isAllowedProtocol(protocol: string) {
  return protocol === "http:" || protocol === "https:";
}

export function normalizeSourcePageUrl(value: unknown) {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_SOURCE_PAGE_URL_LENGTH) {
    return undefined;
  }

  try {
    const url = new URL(trimmed);
    if (!isAllowedProtocol(url.protocol)) {
      return undefined;
    }

    url.hash = "";

    const normalized = url.toString();
    return normalized.length <= MAX_SOURCE_PAGE_URL_LENGTH ? normalized : undefined;
  } catch {
    return undefined;
  }
}

export function captureCurrentPageUrl() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return normalizeSourcePageUrl(window.location.href);
}

export function resolveSourcePageUrl(request: Request, candidate?: unknown) {
  return (
    normalizeSourcePageUrl(candidate) ??
    normalizeSourcePageUrl(request.headers.get("referer"))
  );
}
