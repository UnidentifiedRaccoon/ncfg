import { DEFAULT_OG_IMAGE, SITE_FULL_NAME, SITE_NAME, getSiteUrl } from "./metadata";
import { normalizeInlineText, toAbsoluteUrl } from "./seo-utils";

const SCHEMA_CONTEXT = "https://schema.org";
const DEFAULT_LANGUAGE = "ru-RU";
const WEBSITE_SCHEMA_FRAGMENT = "#website";
const ORGANIZATION_SCHEMA_FRAGMENT = "#organization";
const ORGANIZATION_POSTAL_CODE = "125239";
const ORGANIZATION_LOCALITY = "Москва";
const ORGANIZATION_STREET_ADDRESS = "б-р Матроса Железняка, д. 13, кв. 31";
const ORGANIZATION_COUNTRY = "RU";

export interface StructuredDataSchema {
  "@context": typeof SCHEMA_CONTEXT;
  "@type": string;
  [key: string]: unknown;
}

export interface OrganizationStructuredDataInput {
  organizationFullName: string;
  organizationShortName: string;
  contactsPhone: string;
  contactsEmail: string;
  socialLinks: Array<{ href: string }>;
}

export interface BlogPostingStructuredDataInput {
  title: string;
  slug: string;
  category: { title: string } | null;
  createdAt: string;
  updatedAt: string;
  postImage: string | null;
  anonsImage: string | null;
  description: string;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

function buildSchemaId(fragment: string, siteUrl: string): string {
  return `${siteUrl}/${fragment}`;
}

function buildOrganizationLogo(siteUrl: string) {
  return {
    "@type": "ImageObject",
    url: toAbsoluteUrl(DEFAULT_OG_IMAGE, siteUrl),
  };
}

function pickBlogPostingImageUrl(input: BlogPostingStructuredDataInput, siteUrl: string): string {
  const imagePath = input.postImage ?? input.anonsImage ?? DEFAULT_OG_IMAGE;
  return toAbsoluteUrl(imagePath, siteUrl);
}

export function buildWebsiteStructuredData(): StructuredDataSchema {
  const siteUrl = getSiteUrl();

  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "WebSite",
    "@id": buildSchemaId(WEBSITE_SCHEMA_FRAGMENT, siteUrl),
    name: SITE_FULL_NAME,
    alternateName: [SITE_NAME, "ncfg.ru"],
    url: toAbsoluteUrl("/", siteUrl),
  };
}

export function buildOrganizationStructuredData(
  input: OrganizationStructuredDataInput
): StructuredDataSchema {
  const siteUrl = getSiteUrl();
  const legalName = normalizeInlineText(input.organizationFullName) || SITE_FULL_NAME;
  const shortName = normalizeInlineText(input.organizationShortName);
  const telephone = normalizeInlineText(input.contactsPhone);
  const email = normalizeInlineText(input.contactsEmail);
  const sameAs = input.socialLinks
    .map((link) => normalizeInlineText(link.href))
    .filter((href) => href.length > 0);

  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Organization",
    "@id": buildSchemaId(ORGANIZATION_SCHEMA_FRAGMENT, siteUrl),
    name: SITE_FULL_NAME,
    legalName,
    ...(shortName ? { alternateName: [shortName] } : {}),
    url: toAbsoluteUrl("/", siteUrl),
    logo: buildOrganizationLogo(siteUrl),
    ...(telephone ? { telephone } : {}),
    ...(email ? { email } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    address: {
      "@type": "PostalAddress",
      postalCode: ORGANIZATION_POSTAL_CODE,
      addressLocality: ORGANIZATION_LOCALITY,
      streetAddress: ORGANIZATION_STREET_ADDRESS,
      addressCountry: ORGANIZATION_COUNTRY,
    },
  };
}

export function buildBreadcrumbList(items: BreadcrumbItem[]): StructuredDataSchema {
  const siteUrl = getSiteUrl();

  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: normalizeInlineText(item.name),
      item: toAbsoluteUrl(item.path, siteUrl),
    })),
  };
}

export function buildBlogPostingStructuredData(
  input: BlogPostingStructuredDataInput
): StructuredDataSchema {
  const siteUrl = getSiteUrl();
  const canonicalUrl = toAbsoluteUrl(`/blog/${input.slug}`, siteUrl);
  const organizationId = buildSchemaId(ORGANIZATION_SCHEMA_FRAGMENT, siteUrl);
  const articleSection = normalizeInlineText(input.category?.title);
  const description = normalizeInlineText(input.description);

  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BlogPosting",
    headline: normalizeInlineText(input.title),
    datePublished: input.createdAt,
    dateModified: input.updatedAt,
    image: pickBlogPostingImageUrl(input, siteUrl),
    author: {
      "@id": organizationId,
    },
    publisher: {
      "@type": "Organization",
      "@id": organizationId,
      name: SITE_FULL_NAME,
      logo: buildOrganizationLogo(siteUrl),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    url: canonicalUrl,
    description,
    inLanguage: DEFAULT_LANGUAGE,
    ...(articleSection ? { articleSection } : {}),
  };
}
