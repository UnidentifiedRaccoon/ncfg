import { fetchIndividualsPageData, fetchSiteSettings } from "@/shared/api/data-provider";
import { mapOrderedFaqItems } from "@/shared/lib/faq";
import { makeFooterData } from "@/shared/lib/footer-data";

export async function getIndividualsPageModel() {
  const [siteSetting, individualsPage] = await Promise.all([
    fetchSiteSettings(),
    fetchIndividualsPageData(),
  ]);

  const hero = individualsPage.hero;

  return {
    heroProps: {
      headline: hero?.headline ?? "",
      lead: hero?.lead ?? undefined,
      primaryCta: hero?.primaryCta
        ? { label: hero.primaryCta.label, href: hero.primaryCta.href }
        : undefined,
    },
    productShowcaseProps: {
      title: individualsPage.productsTitle ?? "Наши услуги",
      lead: individualsPage.productsLead ?? undefined,
      products: individualsPage.products.map((p) => ({
        title: p.title,
        description: p.description,
        href: p.href,
        icon: p.iconKey ?? undefined,
        audience: p.audience ?? undefined,
        image: p.imagePath ?? undefined,
      })),
    },
    faqItems: mapOrderedFaqItems(individualsPage.faqItems),
    footerData: makeFooterData(siteSetting),
  };
}

