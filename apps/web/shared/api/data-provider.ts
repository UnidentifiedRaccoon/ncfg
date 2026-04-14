/**
 * Data Provider
 *
 * Unified interface for fetching:
 * - Dynamic content from Strapi CMS (fail-fast; no fallbacks).
 * - Static page content from local JSON files (no Strapi requests).
 */

import {
  getLatestNews,
  getNews,
  getNewsArticle,
  transformToLegacyNews,
  type LegacyNewsArticle,
} from './news';
import { getPeople, transformToLegacyPerson, type LegacyPerson } from './people';
import {
  getRecommendations,
  transformToLegacyRecommendation,
  type LegacyRecommendation,
} from './recommendations';
import {
  getCertificates,
  transformToCertificateData,
  type CertificateData,
} from './certificates';
import { pickLatestDate } from '@/shared/lib/date-values';
import { getServicesDataLegacy } from './services';
import type {
  StrapiAboutPage,
  StrapiBlogPage,
  StrapiCompaniesPage,
  StrapiHomePage,
  StrapiIndividualsPage,
  StrapiPortfolioPage,
  StrapiSiteSetting,
} from './types/strapi';
import type { ServicesData } from './types/service';

function stripEllipsis(text: string): string {
  return text.replace(/\.{2,}$/, '');
}

function isIndividualsProductIconKey(
  value: unknown
): value is 'graduation-cap' | 'trending-up' | 'zap' {
  return value === 'graduation-cap' || value === 'trending-up' || value === 'zap';
}

function getOptionalEnvValue(name: string): string | null {
  const value = process.env[name];
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function resolvePortfolioPresentationHref(fallbackHref: string | undefined): string | null {
  return getOptionalEnvValue('PORTFOLIO_PRESENTATION_URL') ?? fallbackHref ?? null;
}

// ==================
// Static content types (JSON source)
// ==================

interface FallbackLink {
  label: string;
  href: string;
}

interface FallbackFooterData {
  organization?: { fullName?: string; shortName?: string };
  contacts?: { phone?: string; email?: string };
  social?: Array<{ label?: string; href?: string }>;
  legalLinks?: Array<{ label?: string; href?: string }>;
  legalDocuments?: {
    title?: string;
    items?: Array<{ id?: number; label?: string; href?: string; type?: string }>;
  };
  copyright?: { years?: string; text?: string; notice?: string };
}

interface FallbackHomeStatsItem {
  key: string;
  label: string;
  displayValue: string;
  value?: number;
}

interface FallbackHomeHeroProofPoint {
  strong?: boolean;
  text?: string;
  links?: FallbackLink[];
}

interface FallbackHomeHeroData {
  headline?: string;
  lead?: string;
  primaryCta?: FallbackLink;
  supportingHeadings?: string[];
  proofPoints?: FallbackHomeHeroProofPoint[];
}

interface FallbackHomePartnersData {
  awards?: Array<{ id?: number; title?: string; year?: number }>;
  clientsCarousel?: {
    title?: string;
    archiveCta?: FallbackLink;
    categories?: Array<{
      id?: string;
      name?: string;
      logos?: Array<{ id?: number; title?: string; href?: string | null; img?: string }>;
      more?: { display?: string; value?: number; unit?: string };
    }>;
  };
}

interface FallbackHomeJson {
  meta?: { updatedAt?: string };
  sections?: {
    Footer?: { data?: FallbackFooterData };
    Stats?: { data?: { items?: FallbackHomeStatsItem[] } };
    Hero?: { data?: FallbackHomeHeroData };
    Services?: { data?: { title?: string } };
    Partners?: { data?: FallbackHomePartnersData };
    FAQ?: { data?: { title?: string } };
    News?: { data?: { title?: string; teaser?: string; links?: FallbackLink[] } };
  };
}

interface FallbackCompaniesJson {
  meta?: { updatedAt?: string };
  hero?: { headline?: string; lead?: string; primaryCta?: FallbackLink };
  faq?: Array<{ id?: number; question?: string; answer?: string }>;
}

interface FallbackIndividualsJson {
  meta?: { updatedAt?: string };
  hero?: { headline?: string; lead?: string; primaryCta?: FallbackLink };
  productsTitle?: string;
  productsLead?: string;
  products?: Array<{
    title?: string;
    description?: string;
    href?: string;
    audience?: string;
    icon?: string;
    image?: string;
  }>;
  faq?: Array<{ id?: number; question?: string; answer?: string }>;
}

interface FallbackHowWeWorkJson {
  meta?: { updatedAt?: string };
  title?: string;
  description?: string;
  steps?: Array<{ id?: number; title?: string; description?: string }>;
}

interface FallbackPrinciplesJson {
  meta?: { updatedAt?: string };
  title?: string;
  description?: string;
  principles?: Array<{
    id?: string;
    order?: number;
    title?: string;
    description?: string;
    linkLabel?: string;
    href?: string;
  }>;
}

interface FallbackBlogJson {
  meta?: { updatedAt?: string; title?: string; lead?: string };
}

interface FallbackPortfolioJson {
  meta?: { updatedAt?: string };
  title?: string;
  lead?: string;
  projects?: Array<{
    id?: string;
    title?: string;
    description?: string;
    period?: string | null;
  }>;
  presentation?: {
    label?: string;
    href?: string;
  };
}

// ==================
// News
// ==================

export type NewsArticleData = LegacyNewsArticle;

export async function fetchNewsArticles(options: { category?: string } = {}): Promise<NewsArticleData[]> {
  const { articles } = await getNews({ pageSize: 100, category: options.category });
  return articles.map(transformToLegacyNews);
}

export async function fetchNewsArticle(slug: string): Promise<NewsArticleData | null> {
  const article = await getNewsArticle(slug);
  return article ? transformToLegacyNews(article) : null;
}

export async function fetchLatestNewsArticles(
  limit: number = 5,
  options: { category?: string } = {}
): Promise<NewsArticleData[]> {
  const articles = await getLatestNews(limit, options);
  return articles.map(transformToLegacyNews);
}

// ==================
// Recommendations
// ==================

export type RecommendationData = LegacyRecommendation;

export async function fetchRecommendations(limit?: number): Promise<RecommendationData[]> {
  const recommendations = await getRecommendations(limit);
  return recommendations.map(transformToLegacyRecommendation);
}

// ==================
// Certificates
// ==================

export type CertificatesData = CertificateData;

export async function fetchCertificates(limit?: number): Promise<CertificatesData[]> {
  const certificates = await getCertificates(limit);
  return certificates.map(transformToCertificateData);
}

// ==================
// Services
// ==================

export async function fetchServicesData(): Promise<ServicesData> {
  return await getServicesDataLegacy();
}

// ==================
// Pages / Settings (JSON-only)
// ==================

export async function fetchSiteSettings(): Promise<StrapiSiteSetting> {
  const home = (await import('@/public/content/home.json')).default as unknown as FallbackHomeJson;
  const footer = home.sections?.Footer?.data;
  const statsItems = home.sections?.Stats?.data?.items ?? [];
  const updatedAt = home.meta?.updatedAt;

  if (!updatedAt) {
    throw new Error('Missing updatedAt in home.json');
  }

  return {
    id: 1,
    documentId: 'json-site-setting',
    organizationFullName: footer?.organization?.fullName ?? 'Национальный центр финансовой грамотности',
    organizationShortName: footer?.organization?.shortName ?? 'НЦФГ',
    contactsPhone: footer?.contacts?.phone ?? '',
    contactsEmail: footer?.contacts?.email ?? '',
    socialLinks: footer?.social
      ? footer.social.map((l, idx) => ({
          id: idx + 1,
          label: l.label ?? '',
          href: l.href ?? '',
        }))
      : [],
    legalLinks: footer?.legalLinks
      ? footer.legalLinks.map((l, idx) => ({
          id: idx + 1,
          label: l.label ?? '',
          href: l.href ?? '',
        }))
      : [],
    legalDocumentsTitle: footer?.legalDocuments?.title ?? null,
    legalDocuments: footer?.legalDocuments?.items
      ? footer.legalDocuments.items.map((d, idx) => ({
          id: typeof d.id === 'number' ? d.id : idx + 1,
          label: d.label ?? '',
          href: d.href ?? '',
          type: d.type === 'pdf' || d.type === 'docx' ? d.type : 'other',
        }))
      : [],
    copyrightYears: footer?.copyright?.years ?? null,
    copyrightText: footer?.copyright?.text ?? null,
    copyrightNotice: footer?.copyright?.notice ?? null,
    metrics: statsItems.map((m, idx) => ({
      id: idx + 1,
      key: m.key,
      label: m.label,
      displayValue: m.displayValue,
      valueNumber: typeof m.value === 'number' ? m.value : null,
    })),
    createdAt: updatedAt,
    updatedAt: updatedAt,
    publishedAt: updatedAt,
  };
}

export async function fetchHomePageData(): Promise<StrapiHomePage> {
  const home = (await import('@/public/content/home.json')).default as unknown as FallbackHomeJson;
  const hero = home.sections?.Hero?.data;
  const partners = home.sections?.Partners?.data;
  const updatedAt = home.meta?.updatedAt;

  if (!updatedAt) {
    throw new Error('Missing updatedAt in home.json');
  }

  return {
    id: 1,
    documentId: 'json-home-page',
    hero: hero
      ? {
          id: 1,
          headline: hero.headline ?? '',
          lead: hero.lead ?? null,
          primaryCta: hero.primaryCta
            ? { id: 1, label: stripEllipsis(hero.primaryCta.label ?? ''), href: hero.primaryCta.href ?? '' }
            : null,
        }
      : null,
    supportingHeadings: Array.isArray(hero?.supportingHeadings)
      ? hero.supportingHeadings.map((t, idx) => ({ id: idx + 1, text: t ?? '' }))
      : [],
    proofPoints: Array.isArray(hero?.proofPoints)
      ? hero.proofPoints.map((p, idx) => ({
          id: idx + 1,
          strong: Boolean(p?.strong),
          text: p?.text ?? '',
          links: Array.isArray(p?.links)
            ? p.links.map((l, lidx) => ({
                id: lidx + 1,
                label: stripEllipsis(l.label ?? 'Подробнее'),
                href: l.href ?? '',
              }))
            : [],
        }))
      : [],
    servicesTitle: home.sections?.Services?.data?.title ?? null,
    partners: partners
      ? {
          id: 1,
          awards: partners.awards
            ? partners.awards.map((a, idx) => ({
                id: typeof a.id === 'number' ? a.id : idx + 1,
                title: a.title ?? '',
                year: typeof a.year === 'number' ? a.year : null,
              }))
            : [],
          clientsCarousel: partners?.clientsCarousel
            ? {
                id: 1,
                title: partners.clientsCarousel.title ?? '',
                archiveCta: partners.clientsCarousel.archiveCta
                  ? {
                      id: 1,
                      label: stripEllipsis(partners.clientsCarousel.archiveCta.label ?? 'Все клиенты'),
                      href: partners.clientsCarousel.archiveCta.href ?? '',
                    }
                  : null,
                categories: Array.isArray(partners.clientsCarousel.categories)
                  ? partners.clientsCarousel.categories.map((c, idx) => ({
                      id: idx + 1,
                      key: c.id ?? String(idx + 1),
                      name: c.name ?? '',
                      logos: c.logos
                        ? c.logos.map((l) => ({
                            id: typeof l.id === 'number' ? l.id : 0,
                            title: l.title ?? '',
                            href: l.href ?? null,
                            imgPath: l.img ?? null,
                          }))
                        : [],
                      moreDisplay: c.more?.display ?? null,
                      moreValue: typeof c.more?.value === 'number' ? c.more.value : null,
                      moreUnit: c.more?.unit ?? null,
                    }))
                  : [],
              }
            : null,
        }
      : null,
    newsTitle: home.sections?.News?.data?.title ?? null,
    newsTeaser: home.sections?.News?.data?.teaser ?? null,
    newsArchiveLink:
      Array.isArray(home.sections?.News?.data?.links) && home.sections?.News?.data?.links?.[0]
        ? {
            id: 1,
            label: stripEllipsis(home.sections.News.data.links[0].label ?? 'Архив'),
            href: home.sections.News.data.links[0].href ?? '',
          }
        : null,
    createdAt: updatedAt,
    updatedAt: updatedAt,
    publishedAt: updatedAt,
  };
}

export async function fetchCompaniesPageData(): Promise<StrapiCompaniesPage> {
  const fallback = (await import('@/public/content/companies.json')).default as unknown as FallbackCompaniesJson;
  const updatedAt = fallback.meta?.updatedAt;

  if (!updatedAt) {
    throw new Error('Missing updatedAt in companies.json');
  }

  return {
    id: 1,
    documentId: 'json-companies-page',
    hero: fallback.hero
      ? {
          id: 1,
          headline: fallback.hero.headline ?? '',
          lead: fallback.hero.lead ?? null,
          primaryCta: fallback.hero.primaryCta
            ? {
                id: 1,
                label: stripEllipsis(fallback.hero.primaryCta.label ?? 'Оставить заявку'),
                href: fallback.hero.primaryCta.href ?? '',
              }
            : null,
        }
      : null,
    faqItems: Array.isArray(fallback.faq)
      ? fallback.faq.map((item, idx) => ({
          id: typeof item.id === 'number' ? item.id : idx + 1,
          question: item.question ?? '',
          answer: item.answer ?? '',
          order: typeof item.id === 'number' ? item.id : idx + 1,
        }))
      : [],
    createdAt: updatedAt,
    updatedAt: updatedAt,
    publishedAt: updatedAt,
  };
}

export async function fetchIndividualsPageData(): Promise<StrapiIndividualsPage> {
  const fallback = (await import('@/public/content/individuals.json')).default as unknown as FallbackIndividualsJson;
  const updatedAt = fallback.meta?.updatedAt;

  if (!updatedAt) {
    throw new Error('Missing updatedAt in individuals.json');
  }

  return {
    id: 1,
    documentId: 'json-individuals-page',
    hero: fallback.hero
      ? {
          id: 1,
          headline: fallback.hero.headline ?? '',
          lead: fallback.hero.lead ?? null,
          primaryCta: fallback.hero.primaryCta
            ? {
                id: 1,
                label: stripEllipsis(fallback.hero.primaryCta.label ?? 'Оставить заявку'),
                href: fallback.hero.primaryCta.href ?? '',
              }
            : null,
        }
      : null,
    productsTitle: fallback.productsTitle ?? null,
    productsLead: fallback.productsLead ?? null,
    products: Array.isArray(fallback.products)
      ? fallback.products.map((p, idx) => ({
          id: idx + 1,
          title: p.title ?? '',
          description: p.description ?? '',
          href: p.href ?? '',
          audience: p.audience ?? null,
          iconKey: isIndividualsProductIconKey(p.icon) ? p.icon : null,
          imagePath: p.image ?? null,
        }))
      : [],
    faqItems: Array.isArray(fallback.faq)
      ? fallback.faq.map((item, idx) => ({
          id: typeof item.id === 'number' ? item.id : idx + 1,
          question: item.question ?? '',
          answer: item.answer ?? '',
          order: typeof item.id === 'number' ? item.id : idx + 1,
        }))
      : [],
    createdAt: updatedAt,
    updatedAt: updatedAt,
    publishedAt: updatedAt,
  };
}

export async function fetchPortfolioPageData(): Promise<StrapiPortfolioPage> {
  const fallback = (await import('@/public/content/portfolio.json')).default as unknown as FallbackPortfolioJson;
  const updatedAt = fallback.meta?.updatedAt;

  if (!updatedAt) {
    throw new Error('Missing updatedAt in portfolio.json');
  }

  return {
    id: 1,
    documentId: 'json-portfolio-page',
    title: fallback.title ?? '',
    lead: fallback.lead ?? null,
    projects: Array.isArray(fallback.projects)
      ? fallback.projects.map((project, idx) => ({
          id: idx + 1,
          title: project.title ?? '',
          description: project.description ?? '',
          period: project.period ?? null,
        }))
      : [],
    presentationLabel: fallback.presentation?.label ?? null,
    presentationHref: resolvePortfolioPresentationHref(fallback.presentation?.href),
    createdAt: updatedAt,
    updatedAt: updatedAt,
    publishedAt: updatedAt,
  };
}

export async function fetchAboutPageData(): Promise<StrapiAboutPage> {
  const howWeWork = (await import('@/public/content/ncfg_how_we_work.json')).default as unknown as FallbackHowWeWorkJson;
  const principles = (await import('@/public/content/ncfg_principles.json')).default as unknown as FallbackPrinciplesJson;
  const updatedAt = pickLatestDate(
    [howWeWork.meta?.updatedAt, principles.meta?.updatedAt],
    'about page content'
  );

  return {
    id: 1,
    documentId: 'json-about-page',
    heroHeadline: 'Лидер финансового просвещения с 2005 года',
    heroCta: { id: 1, label: 'Наши проекты', href: '/companies' },
    howWeWorkTitle: howWeWork.title ?? 'Как мы работаем',
    howWeWorkLead: howWeWork.description ?? null,
    howWeWorkSteps: Array.isArray(howWeWork.steps)
      ? howWeWork.steps.map((s, idx) => ({
          id: idx + 1,
          order: typeof s.id === 'number' ? s.id : idx + 1,
          title: s.title ?? '',
          description: s.description ?? null,
        }))
      : [],
    principlesTitle: principles.title ?? 'Наши принципы',
    principlesLead: principles.description ?? null,
    principles: Array.isArray(principles.principles)
      ? principles.principles.map((p, idx) => ({
          id: idx + 1,
          key: p.id ?? `principle_${idx + 1}`,
          order: typeof p.order === 'number' ? p.order : idx + 1,
          title: p.title ?? '',
          description: p.description ?? '',
          linkLabel: p.linkLabel ?? null,
          href: p.href ?? null,
        }))
      : [],
    faqItems: [],
    createdAt: updatedAt,
    updatedAt: updatedAt,
    publishedAt: updatedAt,
  };
}

export async function fetchBlogPageData(): Promise<StrapiBlogPage> {
  const blog = (await import('@/public/content/blog.json')).default as unknown as FallbackBlogJson;
  const updatedAt = blog.meta?.updatedAt;

  if (!updatedAt) {
    throw new Error('Missing updatedAt in blog.json');
  }

  return {
    id: 1,
    documentId: 'json-blog-page',
    title: blog.meta?.title ?? '',
    lead: blog.meta?.lead ?? null,
    createdAt: updatedAt,
    updatedAt: updatedAt,
    publishedAt: updatedAt,
  };
}

// ==================
// People
// ==================

interface PeopleData {
  people: LegacyPerson[];
  teamPeopleIds: string[];
  expertPeopleIds: string[];
}

export async function fetchPeopleData(): Promise<PeopleData> {
  const people = await getPeople();
  const legacyPeople = people.map(transformToLegacyPerson);

  return {
    people: legacyPeople,
    teamPeopleIds: legacyPeople.filter((p) => p.isTeam).map((p) => p.id),
    expertPeopleIds: legacyPeople.filter((p) => p.isExpert).map((p) => p.id),
  };
}
