import {
  fetchCompaniesPageData,
  fetchServicesData,
  fetchSiteSettings,
} from "@/shared/api/data-provider";
import { mapOrderedFaqItems } from "@/shared/lib/faq";
import { makeFooterData } from "@/shared/lib/footer-data";

export async function getCompaniesPageModel() {
  const [siteSetting, companiesPage, servicesData] = await Promise.all([
    fetchSiteSettings(),
    fetchCompaniesPageData(),
    fetchServicesData(),
  ]);

  const hero = companiesPage.hero;

  const serviceBlocks = servicesData.serviceCategories.map((category) => ({
    id: category.id,
    title: category.title,
    description: category.description,
    items: category.services.map((service) => ({
      title: service.title,
      description: service.shortDescription,
      href: `/companies/${service.id}`,
    })),
  }));

  return {
    heroProps: {
      headline: hero?.headline ?? "",
      lead: hero?.lead ?? undefined,
      primaryCta: hero?.primaryCta
        ? { label: hero.primaryCta.label, href: hero.primaryCta.href }
        : undefined,
    },
    serviceBlocks,
    faqItems: mapOrderedFaqItems(companiesPage.faqItems),
    footerData: makeFooterData(siteSetting),
  };
}
