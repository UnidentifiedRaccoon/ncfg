import type { Metadata } from "next";
import { makeExcerpt, stripHtmlToText } from "./excerpt";
import { normalizeInlineText, toAbsoluteUrl } from "./seo-utils";

export const SITE_NAME = "НЦФГ";
export const SITE_FULL_NAME = "Национальный центр финансовой грамотности";
export const SITE_THEME_COLOR = "#1E3A5F";
export const DEFAULT_SITE_URL = "https://ncfg.ru";
export const DEFAULT_OG_IMAGE = "/logo.svg";
const DEFAULT_LOCALE = "ru_RU";
const TITLE_DELIMITER = " | ";
const TITLE_SITE_SUFFIX_PATTERN = /(?:\s*(?:\||—|-)\s*НЦФГ\s*)+$/u;

interface BuildPageMetadataInput {
  path: string;
  title: string;
  description: string;
  openGraphType?: "website" | "article";
  imagePath?: string;
  locale?: string;
  publishedTime?: string;
  robots?: Metadata["robots"];
}

interface BlogPostDescriptionInput {
  title: string;
  body?: string | null;
  category?: { title?: string | null } | null;
}

interface VacancyDescriptionInput {
  title: string;
  lead?: string | null;
  department?: { title?: string | null } | null;
  location?: string | null;
  employmentTypeLabel?: string | null;
  workFormatLabel?: string | null;
}

interface ServiceDescriptionInput {
  title: string;
  shortDescription?: string | null;
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

function looksLikeSentence(value: string): boolean {
  return /[.!?…]$/u.test(value);
}

export function formatPageTitle(subject: string): string {
  const normalizedSubject = normalizeInlineText(subject).replace(TITLE_SITE_SUFFIX_PATTERN, "").trim();

  if (!normalizedSubject || normalizedSubject === SITE_NAME) {
    return SITE_NAME;
  }

  return `${normalizedSubject}${TITLE_DELIMITER}${SITE_NAME}`;
}

export function getSiteUrl(): string {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

export function getMetadataBase(): URL {
  return new URL(`${getSiteUrl()}/`);
}

export function buildBlogPostDescription(post: BlogPostDescriptionInput): string {
  const bodyExcerpt = makeExcerpt(stripHtmlToText(post.body ?? ""), 170);
  if (bodyExcerpt) {
    return bodyExcerpt;
  }

  const title = normalizeInlineText(post.title);
  const categoryTitle = normalizeInlineText(post.category?.title);

  if (!title) {
    return "Материал НЦФГ с практическими выводами и рекомендациями.";
  }

  const categoryFragment = categoryTitle ? ` в рубрике «${categoryTitle}»` : "";
  return `Материал НЦФГ «${title}»${categoryFragment} с практическими выводами и рекомендациями.`;
}

export function buildVacancyPageDescription(vacancy: VacancyDescriptionInput): string {
  const lead = normalizeInlineText(vacancy.lead);
  if (lead) {
    return lead;
  }

  const title = normalizeInlineText(vacancy.title);
  if (!title) {
    return 'Открытая вакансия НЦФГ.';
  }

  const fragments = [
    normalizeInlineText(vacancy.department?.title),
    normalizeInlineText(vacancy.employmentTypeLabel),
    normalizeInlineText(vacancy.workFormatLabel),
    normalizeInlineText(vacancy.location),
  ].filter((item) => item.length > 0);

  return fragments.length > 0
    ? `Вакансия НЦФГ «${title}»: ${fragments.join(', ')}.`
    : `Вакансия НЦФГ «${title}».`;
}

export function buildServiceDescription(service: ServiceDescriptionInput): string {
  const normalizedShortDescription = normalizeInlineText(service.shortDescription);

  if (normalizedShortDescription && looksLikeSentence(normalizedShortDescription)) {
    return normalizedShortDescription;
  }

  const title = normalizeInlineText(service.title);
  if (!title) {
    return "Услуга НЦФГ для компаний, которым нужна программа финансовой грамотности и финансового благополучия сотрудников.";
  }

  return `Услуга НЦФГ «${title}» для компаний, которым нужна программа финансовой грамотности и финансового благополучия сотрудников.`;
}

export function buildPageMetadata({
  path,
  title,
  description,
  openGraphType = "website",
  imagePath = DEFAULT_OG_IMAGE,
  locale = DEFAULT_LOCALE,
  publishedTime,
  robots,
}: BuildPageMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const canonicalUrl = toAbsoluteUrl(path, siteUrl);
  const imageUrl = toAbsoluteUrl(imagePath, siteUrl);
  const formattedTitle = formatPageTitle(title);
  const openGraph = {
    title: formattedTitle,
    description,
    type: openGraphType,
    siteName: SITE_NAME,
    locale,
    url: canonicalUrl,
    images: [imageUrl],
    ...(openGraphType === "article" && publishedTime ? { publishedTime } : {}),
  };

  return {
    title: formattedTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph,
    twitter: {
      card: "summary",
      title: formattedTitle,
      description,
      images: [imageUrl],
    },
    robots,
  };
}
