/**
 * UTM parameter capture and storage.
 *
 * On first page load, saves UTM params from the URL to sessionStorage.
 * Later calls to `getUtmParams()` return them for analytics enrichment.
 */

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const STORAGE_KEY = "ncfg.utm";

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

/** Extract UTM params from current URL and persist in sessionStorage. */
export function captureUtmParams(): void {
  if (typeof window === "undefined") return;

  // Don't overwrite if already captured in this session
  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
  } catch {
    return;
  }

  const url = new URL(window.location.href);
  const params: UtmParams = {};
  let hasAny = false;

  for (const key of UTM_KEYS) {
    const value = url.searchParams.get(key);
    if (value) {
      params[key] = value;
      hasAny = true;
    }
  }

  if (!hasAny) return;

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch {
    // Private browsing or storage full — silently ignore
  }
}

/** Retrieve previously captured UTM params (or empty object). */
export function getUtmParams(): UtmParams {
  if (typeof window === "undefined") return {};

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UtmParams;
  } catch {
    return {};
  }
}
