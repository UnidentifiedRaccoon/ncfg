import { assertStrapiWriteAllowed } from "@/shared/lib/external-effects";
import {
  getResolvedStrapiWriteConfigOrThrow,
  getStrapiSourceOrThrow,
} from "@/shared/lib/strapi-config";

function normalizeBaseUrl(value: string, envName: string): string {
  const normalized = value.replace(/\/+$/, "");
  let parsed: URL;

  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error(
      `Invalid ${envName}. Expected an absolute http(s) URL, got: "${normalized}".`
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `Invalid ${envName} protocol "${parsed.protocol}". Expected http: or https:.`
    );
  }

  return normalized;
}

function normalizeEndpoint(endpoint: string) {
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload !== "object" || payload === null) {
    return fallback;
  }

  const record = payload as Record<string, unknown>;
  const error = record.error;
  if (typeof error === "object" && error !== null) {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  const message = record.message;
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  return fallback;
}

export async function postStrapiWriteJSON<TResponse>(
  endpoint: string,
  payload: unknown
): Promise<TResponse> {
  assertStrapiWriteAllowed(getStrapiSourceOrThrow());
  const { url: baseUrlRaw, token, urlEnv } = getResolvedStrapiWriteConfigOrThrow();
  const baseUrl = normalizeBaseUrl(baseUrlRaw, urlEnv);
  const url = `${baseUrl}/api${normalizeEndpoint(endpoint)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const responseText = await response.text();
  let parsedBody: unknown = null;

  try {
    parsedBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    parsedBody = null;
  }

  if (!response.ok) {
    throw new Error(
      `Strapi write API error (${response.status}): ${extractErrorMessage(
        parsedBody,
        responseText.slice(0, 300) || `HTTP ${response.status}`
      )}`
    );
  }

  return parsedBody as TResponse;
}
