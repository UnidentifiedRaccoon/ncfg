import {
  fetchAboutPageData,
  fetchPeopleData,
  fetchSiteSettings,
} from "@/shared/api/data-provider";
import { mapOrderedFaqItems } from "@/shared/lib/faq";
import { makeFooterData } from "@/shared/lib/footer-data";
import { makeHeroMetrics } from "@/shared/lib/hero-metrics";

export async function getAboutPageModel() {
  const [siteSetting, aboutPage, peopleData] = await Promise.all([
    fetchSiteSettings(),
    fetchAboutPageData(),
    fetchPeopleData(),
  ]);

  const howWeWorkSteps = [...aboutPage.howWeWorkSteps]
    .sort((a, b) => a.order - b.order)
    .map((step, index) => ({
      id: step.order > 0 ? step.order : index + 1,
      title: step.title,
      description: step.description ?? undefined,
    }));

  const principles = [...aboutPage.principles]
    .sort((a, b) => a.order - b.order)
    .map((p) => ({
      id: p.key,
      order: p.order,
      title: p.title,
      description: p.description,
    }));

  return {
    heroProps: {
      headline: aboutPage.heroHeadline ?? "",
      primaryCta: aboutPage.heroCta
        ? { label: aboutPage.heroCta.label, href: aboutPage.heroCta.href }
        : undefined,
      metrics: makeHeroMetrics(siteSetting.metrics),
    },
    howWeWorkProps: {
      title: aboutPage.howWeWorkTitle ?? "Как мы работаем",
      lead: aboutPage.howWeWorkLead ?? undefined,
      steps: howWeWorkSteps,
    },
    principlesProps: {
      title: aboutPage.principlesTitle ?? "Наши принципы",
      lead: aboutPage.principlesLead ?? undefined,
      principles,
    },
    people: peopleData.people,
    faqProps: {
      title: "Частые вопросы",
      items: mapOrderedFaqItems(aboutPage.faqItems),
    },
    footerData: makeFooterData(siteSetting),
  };
}

