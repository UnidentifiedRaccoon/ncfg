import {
  fetchHomePageData,
  fetchLatestNewsArticles,
  fetchServicesData,
  fetchSiteSettings,
} from "@/shared/api/data-provider";
import { makeFooterData } from "@/shared/lib/footer-data";
import { makeHeroMetrics } from "@/shared/lib/hero-metrics";

export async function getHomePageModel() {
  const [homePage, siteSetting, servicesData, latestNews] = await Promise.all([
    fetchHomePageData(),
    fetchSiteSettings(),
    fetchServicesData(),
    fetchLatestNewsArticles(4),
  ]);

  const hero = homePage.hero;
  const heroMetrics = makeHeroMetrics(siteSetting.metrics);
  const clientsCarousel = homePage.partners?.clientsCarousel;
  const awards = homePage.partners?.awards ?? [];
  const testimonials = homePage.partners?.testimonials;

  const mappedAwards = awards.map((award) => ({
    id: award.id,
    title: award.title,
    year: award.year ?? null,
    img: award.imgPath ?? undefined,
  }));

  const mappedClientsCarousel = clientsCarousel
    ? {
        title: clientsCarousel.title,
        categories: clientsCarousel.categories.map((category) => ({
          id: category.key,
          name: category.name,
          logos: category.logos.map((logo) => ({
            id: logo.id,
            title: logo.title,
            href: logo.href ?? null,
            img: logo.imgPath ?? "",
          })),
          more: {
            display: category.moreDisplay ?? "",
            value: category.moreValue ?? 0,
            unit: category.moreUnit ?? "",
          },
        })),
        archiveCta: clientsCarousel.archiveCta
          ? { label: clientsCarousel.archiveCta.label, href: clientsCarousel.archiveCta.href }
          : { label: "Все клиенты", href: "/companies" },
      }
    : {
        title: "",
        categories: [],
        archiveCta: { label: "Все клиенты", href: "/companies" },
      };

  const mappedTestimonials = testimonials
    ? {
        title: testimonials.title,
        items: testimonials.items.map((item) => ({
          id: item.id,
          company: item.company,
          logoImg: item.logoImgPath ?? "",
          quote: item.quote,
        })),
        more: testimonials.more
          ? {
              labelTop: testimonials.more.labelTop,
              labelBottom: testimonials.more.labelBottom,
              href: testimonials.more.href,
            }
          : { labelTop: "", labelBottom: "", href: "/companies" },
      }
    : {
        title: "",
        items: [],
        more: { labelTop: "", labelBottom: "", href: "/companies" },
      };

  return {
    heroProps: {
      headline: hero?.headline ?? "",
      lead: hero?.lead ?? undefined,
      primaryCta: hero?.primaryCta
        ? { label: hero.primaryCta.label, href: hero.primaryCta.href }
        : undefined,
      metrics: heroMetrics,
    },
    servicesProps: {
      title: homePage.servicesTitle ?? "Услуги",
      services: servicesData.serviceCategories.slice(0, 3).map((category) => ({
        id: category.id,
        title: category.title,
        description: category.description,
        href: `/companies#services-${category.id}`,
      })),
    },
    partnersProps: {
      awards: mappedAwards,
      clientsCarousel: mappedClientsCarousel,
      testimonials: mappedTestimonials,
    },
    newsProps: {
      title: homePage.newsTitle ?? "Новости",
      lead: homePage.newsTeaser ?? undefined,
      posts: latestNews,
      archiveHref: homePage.newsArchiveLink?.href ?? "/blog",
    },
    footerData: makeFooterData(siteSetting),
  };
}

