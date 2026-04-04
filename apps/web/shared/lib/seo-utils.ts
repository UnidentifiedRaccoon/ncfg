export function normalizeInlineText(value: string | null | undefined): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

export function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed || trimmed === "/") {
    return "/";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function toAbsoluteUrl(value: string, siteUrl: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return new URL(normalizePath(value), `${siteUrl}/`).toString();
}
