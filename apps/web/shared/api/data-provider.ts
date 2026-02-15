/**
 * Data Provider
 *
 * Unified interface for fetching data from Strapi CMS.
 *
 * This module prefers Strapi CMS, but can fall back to static JSON content
 * during local development / migration.
 */

import { getNews, getNewsArticle, getLatestNews, transformToLegacyNews } from './news';
import { getServicesDataLegacy } from './services';
import { getPeople, transformToLegacyPerson, type LegacyPerson } from './people';
import type { ServicesData } from './types/service';
import { getSiteSetting } from './site-settings';
import { getHomePage } from './pages/home';
import { getCompaniesPage } from './pages/companies';
import { getIndividualsPage } from './pages/individuals';
import { getAboutPage } from './pages/about';
import { getBlogPage } from './pages/blog';
import { getServiceUiIconMap } from './service-ui';
import type {
  StrapiAboutPage,
  StrapiBlogPage,
  StrapiCompaniesPage,
  StrapiHomePage,
  StrapiIndividualsPage,
  StrapiSiteSetting,
} from './types/strapi';

const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

function assertStrapiConfigured(): void {
  if (!STRAPI_URL || !STRAPI_API_TOKEN) {
    throw new Error(
      'Strapi is required. Set STRAPI_URL and STRAPI_API_TOKEN (see apps/web/.env.local.example).'
    );
  }
}

function stripEllipsis(text: string): string {
  return text.replace(/\.{2,}$/, '');
}

function withLeadingSlash(path: string): string {
  if (!path) return path;
  return path.startsWith('/') ? path : `/${path}`;
}

function isIndividualsProductIconKey(
  value: unknown
): value is 'graduation-cap' | 'trending-up' | 'zap' {
  return value === 'graduation-cap' || value === 'trending-up' || value === 'zap';
}

function getFallbackUpdatedAt(): string {
  // Keep it stable/deterministic for builds.
  return '2026-01-31';
}

// ==================
// Static content types (fallback JSON)
// ==================

interface FallbackLink {
  label: string;
  href: string;
}

interface FallbackFooterData {
  organization?: { fullName?: string; shortName?: string };
  contacts?: { phone?: string; email?: string; legalAddress?: string };
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
  awards?: Array<{ id?: number; title?: string; year?: number; img?: string }>;
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
  testimonials?: {
    title?: string;
    items?: Array<{ id?: number; company?: string; logoImg?: string; quote?: string }>;
    more?: { labelTop?: string; labelBottom?: string; href?: string };
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
  principles?: Array<{ id?: string; order?: number; title?: string; description?: string }>;
}

interface FallbackPersonJson {
  id?: string;
  fullName?: string;
  photo?: string;
  isTeam?: boolean;
  isExpert?: boolean;
  team?: { title?: string } | null;
  expertProfile?: { headline?: string; experienceYears?: number } | null;
}

interface FallbackPeopleJson {
  people?: FallbackPersonJson[];
}

// ==================
// News
// ==================

export interface NewsArticleData {
  id: string;
  title: string;
  tags: string[];
  slug: string;
  body: string;
  anonsImage: string | null;
  createdAt: string;
}

export async function fetchNewsArticles(): Promise<NewsArticleData[]> {
  try {
    assertStrapiConfigured();

    const { articles } = await getNews({ pageSize: 100 });
    return articles.map(transformToLegacyNews);
  } catch (_error) {
    const fallback = (await import('@/public/content/news/ncfg_news.json')).default as NewsArticleData[];
    return fallback.map((item) => ({
      ...item,
      anonsImage: item.anonsImage ? withLeadingSlash(item.anonsImage) : null,
    }));
  }
}

export async function fetchNewsArticle(slug: string): Promise<NewsArticleData | null> {
  try {
    assertStrapiConfigured();
    const article = await getNewsArticle(slug);
    return article ? transformToLegacyNews(article) : null;
  } catch (_error) {
    const fallback = (await import('@/public/content/news/ncfg_news.json')).default as NewsArticleData[];
    const found = fallback.find((item) => item.slug === slug) ?? null;
    if (!found) return null;
    return {
      ...found,
      anonsImage: found.anonsImage ? withLeadingSlash(found.anonsImage) : null,
    };
  }
}

export async function fetchLatestNewsArticles(limit: number = 5): Promise<NewsArticleData[]> {
  try {
    assertStrapiConfigured();
    const articles = await getLatestNews(limit);
    return articles.map(transformToLegacyNews);
  } catch (_error) {
    const fallback = (await import('@/public/content/news/ncfg_news.json')).default as NewsArticleData[];
    return fallback
      .slice(0, limit)
      .map((item) => ({
        ...item,
        anonsImage: item.anonsImage ? withLeadingSlash(item.anonsImage) : null,
      }));
  }
}

// ==================
// Services
// ==================

export async function fetchServicesData(): Promise<ServicesData> {
  try {
    assertStrapiConfigured();
    return await getServicesDataLegacy();
  } catch (_error) {
    const fallback = (await import('@/public/content/ncfg_services.json')).default as ServicesData;
    return fallback;
  }
}

// ==================
// Pages / Settings
// ==================

export async function fetchSiteSettings(): Promise<StrapiSiteSetting> {
  try {
    assertStrapiConfigured();

    const settings = await getSiteSetting();
    if (!settings) {
      throw new Error('Site settings are not configured in Strapi (site-setting is empty).');
    }

    return settings;
  } catch (_error) {
    const home = (await import('@/public/content/home.json')).default as unknown as FallbackHomeJson;
    const footer = home.sections?.Footer?.data;
    const statsItems = home.sections?.Stats?.data?.items ?? [];
    const updatedAt = home.meta?.updatedAt ?? getFallbackUpdatedAt();

    return {
      id: 1,
      documentId: 'fallback-site-setting',
      organizationFullName: footer?.organization?.fullName ?? 'Национальный центр финансовой грамотности',
      organizationShortName: footer?.organization?.shortName ?? 'НЦФГ',
      contactsPhone: footer?.contacts?.phone ?? '',
      contactsEmail: footer?.contacts?.email ?? '',
      contactsLegalAddress: footer?.contacts?.legalAddress ?? null,
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
}

export async function fetchHomePageData(): Promise<StrapiHomePage> {
  try {
    assertStrapiConfigured();

    const page = await getHomePage();
    if (!page) {
      throw new Error('Home page is not configured in Strapi (home-page is empty).');
    }

    return page;
  } catch (_error) {
    const home = (await import('@/public/content/home.json')).default as unknown as FallbackHomeJson;
    const hero = home.sections?.Hero?.data;
    const partners = home.sections?.Partners?.data;
    const updatedAt = home.meta?.updatedAt ?? getFallbackUpdatedAt();

    return {
      id: 1,
      documentId: 'fallback-home-page',
      hero: hero
        ? {
            id: 1,
            headline: hero.headline ?? '',
            lead: hero.lead ?? null,
            primaryCta: hero.primaryCta
              ? { id: 1, label: stripEllipsis(hero.primaryCta.label ?? 'Подробнее'), href: hero.primaryCta.href ?? '#' }
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
                  href: l.href ?? '#',
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
                  imgPath: a.img ?? null,
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
                        href: partners.clientsCarousel.archiveCta.href ?? '/companies',
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
            testimonials: partners?.testimonials
              ? {
                  id: 1,
                  title: partners.testimonials.title ?? '',
                  items: partners.testimonials.items
                    ? partners.testimonials.items.map((t, idx) => ({
                        id: typeof t.id === 'number' ? t.id : idx + 1,
                        company: t.company ?? '',
                        logoImgPath: t.logoImg ?? null,
                        quote: t.quote ?? '',
                      }))
                    : [],
                  more: partners.testimonials.more
                    ? {
                        id: 1,
                        labelTop: partners.testimonials.more.labelTop ?? '',
                        labelBottom: partners.testimonials.more.labelBottom ?? '',
                        href: partners.testimonials.more.href ?? '/companies',
                      }
                    : null,
                }
              : null,
          }
        : null,
      faqTitle: home.sections?.FAQ?.data?.title ?? null,
      newsTitle: home.sections?.News?.data?.title ?? null,
      newsTeaser: home.sections?.News?.data?.teaser ?? null,
      newsArchiveLink: Array.isArray(home.sections?.News?.data?.links) && home.sections?.News?.data?.links?.[0]
        ? {
            id: 1,
            label: stripEllipsis(home.sections.News.data.links[0].label ?? 'Архив'),
            href: home.sections.News.data.links[0].href ?? '/blog',
          }
        : null,
      createdAt: updatedAt,
      updatedAt: updatedAt,
      publishedAt: updatedAt,
    };
  }
}

export async function fetchCompaniesPageData(): Promise<StrapiCompaniesPage> {
  try {
    assertStrapiConfigured();

    const page = await getCompaniesPage();
    if (!page) {
      throw new Error('Companies page is not configured in Strapi (companies-page is empty).');
    }

    return page;
  } catch (_error) {
    const fallback = (await import('@/public/content/companies.json')).default as unknown as FallbackCompaniesJson;
    const updatedAt = fallback.meta?.updatedAt ?? getFallbackUpdatedAt();

    return {
      id: 1,
      documentId: 'fallback-companies-page',
      hero: fallback.hero
        ? {
            id: 1,
            headline: fallback.hero.headline ?? '',
            lead: fallback.hero.lead ?? null,
            primaryCta: fallback.hero.primaryCta
              ? {
                  id: 1,
                  label: stripEllipsis(fallback.hero.primaryCta.label ?? 'Оставить заявку'),
                  href: fallback.hero.primaryCta.href ?? '#lead-form',
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
}

export async function fetchIndividualsPageData(): Promise<StrapiIndividualsPage> {
  try {
    assertStrapiConfigured();

    const page = await getIndividualsPage();
    if (!page) {
      throw new Error('Individuals page is not configured in Strapi (individuals-page is empty).');
    }

    return page;
  } catch (_error) {
    const fallback = (await import('@/public/content/individuals.json')).default as unknown as FallbackIndividualsJson;
    const updatedAt = fallback.meta?.updatedAt ?? getFallbackUpdatedAt();

    return {
      id: 1,
      documentId: 'fallback-individuals-page',
      hero: fallback.hero
        ? {
            id: 1,
            headline: fallback.hero.headline ?? '',
            lead: fallback.hero.lead ?? null,
            primaryCta: fallback.hero.primaryCta
              ? {
                  id: 1,
                  label: stripEllipsis(fallback.hero.primaryCta.label ?? 'Оставить заявку'),
                  href: fallback.hero.primaryCta.href ?? '#lead-form',
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
}

export async function fetchAboutPageData(): Promise<StrapiAboutPage> {
  try {
    assertStrapiConfigured();

    const page = await getAboutPage();
    if (!page) {
      throw new Error('About page is not configured in Strapi (about-page is empty).');
    }

    return page;
  } catch (_error) {
    const howWeWork = (await import('@/public/content/ncfg_how_we_work.json')).default as unknown as FallbackHowWeWorkJson;
    const principles = (await import('@/public/content/ncfg_principles.json')).default as unknown as FallbackPrinciplesJson;
    const updatedAt = howWeWork.meta?.updatedAt ?? getFallbackUpdatedAt();

    return {
      id: 1,
      documentId: 'fallback-about-page',
      heroHeadline:
        'Национальный центр финансовой грамотности — лидер в сфере финансового просвещения с 2005 года',
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
          }))
        : [],
      faqItems: [],
      createdAt: updatedAt,
      updatedAt: updatedAt,
      publishedAt: updatedAt,
    };
  }
}

export async function fetchBlogPageData(): Promise<StrapiBlogPage> {
  try {
    assertStrapiConfigured();

    const page = await getBlogPage();
    if (!page) {
      throw new Error('Blog page is not configured in Strapi (blog-page is empty).');
    }

    return page;
  } catch (_error) {
    const updatedAt = getFallbackUpdatedAt();
    return {
      id: 1,
      documentId: 'fallback-blog-page',
      title: 'Блог',
      lead: 'Полезные материалы о финансовой грамотности',
      createdAt: updatedAt,
      updatedAt: updatedAt,
      publishedAt: updatedAt,
    };
  }
}

export async function fetchServiceUiIconMap(): Promise<Record<string, string>> {
  try {
    assertStrapiConfigured();
    return await getServiceUiIconMap();
  } catch (_error) {
    return {};
  }
}

// ==================
// People (with fallback to static JSON)
// ==================

export interface PeopleData {
  people: LegacyPerson[];
  teamPeopleIds: string[];
  expertPeopleIds: string[];
}

export async function fetchPeopleData(): Promise<PeopleData> {
  try {
    assertStrapiConfigured();
    const people = await getPeople();
    const legacyPeople = people.map(transformToLegacyPerson);

    return {
      people: legacyPeople,
      teamPeopleIds: legacyPeople.filter((p) => p.isTeam).map((p) => p.id),
      expertPeopleIds: legacyPeople.filter((p) => p.isExpert).map((p) => p.id),
    };
  } catch (error) {
    const fallback = (await import('@/public/content/ncfg_finzdorov_people.json'))
      .default as unknown as FallbackPeopleJson;
    const people: FallbackPersonJson[] = Array.isArray(fallback.people)
      ? fallback.people
      : [];

    const legacyPeople: LegacyPerson[] = people.map((p) => ({
      id: String(p.id ?? ''),
      fullName: String(p.fullName ?? ''),
      photoUrl: p.photo ? String(p.photo) : null,
      position: p.team?.title ? String(p.team.title) : null,
      headline: p.expertProfile?.headline ? String(p.expertProfile.headline) : null,
      experienceYears:
        typeof p.expertProfile?.experienceYears === 'number'
          ? p.expertProfile.experienceYears
          : null,
      isTeam: Boolean(p.isTeam),
      isExpert: Boolean(p.isExpert),
    }));

    return {
      people: legacyPeople,
      teamPeopleIds: legacyPeople.filter((p) => p.isTeam).map((p) => p.id),
      expertPeopleIds: legacyPeople.filter((p) => p.isExpert).map((p) => p.id),
    };
  }
}

export async function fetchTeamMembers(): Promise<LegacyPerson[]> {
  const data = await fetchPeopleData();
  return data.people.filter(p => p.isTeam);
}

export async function fetchExperts(): Promise<LegacyPerson[]> {
  const data = await fetchPeopleData();
  return data.people.filter(p => p.isExpert);
}

// ==================
// Export data source status
// ==================

export function isUsingStrapi(): boolean {
  return Boolean(STRAPI_URL && STRAPI_API_TOKEN);
}
