import type { Metadata } from "next";

const DEFAULT_SITE_URL = "https://ncfg.ru";
const DEFAULT_OG_IMAGE = "/logo.svg";
const DEFAULT_LOCALE = "ru_RU";

interface BuildPageMetadataInput {
  path: string;
  title: string;
  description: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
  openGraphType?: "website" | "article";
  imagePath?: string;
  locale?: string;
  publishedTime?: string;
  robots?: Metadata["robots"];
}

function normalizeSiteUrl(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    return DEFAULT_SITE_URL;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed || trimmed === "/") {
    return "/";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function toAbsoluteUrl(value: string, siteUrl: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return new URL(normalizePath(value), `${siteUrl}/`).toString();
}

export function getSiteUrl(): string {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

export function getMetadataBase(): URL {
  return new URL(`${getSiteUrl()}/`);
}

export function buildPageMetadata({
  path,
  title,
  description,
  openGraphTitle,
  openGraphDescription,
  openGraphType = "website",
  imagePath = DEFAULT_OG_IMAGE,
  locale = DEFAULT_LOCALE,
  publishedTime,
  robots,
}: BuildPageMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const canonicalUrl = toAbsoluteUrl(path, siteUrl);
  const imageUrl = toAbsoluteUrl(imagePath, siteUrl);
  const ogTitle = openGraphTitle ?? title;
  const ogDescription = openGraphDescription ?? description;
  const openGraph = {
    title: ogTitle,
    description: ogDescription,
    type: openGraphType,
    locale,
    url: canonicalUrl,
    images: [imageUrl],
    ...(openGraphType === "article" && publishedTime ? { publishedTime } : {}),
  };

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph,
    twitter: {
      card: "summary",
      title: ogTitle,
      description: ogDescription,
      images: [imageUrl],
    },
    robots,
  };
}
