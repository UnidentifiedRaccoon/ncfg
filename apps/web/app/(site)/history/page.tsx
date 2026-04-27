import type { Metadata } from "next";
import {
  AboutHistoryTimeline,
  Footer,
  Hero,
  mapSiteSettingsToFooterData,
  PortfolioShowcase,
} from "@/widgets";
import {
  fetchAboutPageData,
  fetchPortfolioPageData,
  fetchSiteSettings,
} from "@/shared/api/data-provider";
import { buildPageMetadata } from "@/shared/lib/metadata";
import { buildBreadcrumbList } from "@/shared/lib/structured-data";
import { ABOUT_HERO_LEAD, pickAboutHeroMetrics } from "@/shared/lib/about-hero";
import { CenteredPageIntro } from "@/shared/ui";
import { StructuredDataScript } from "@/shared/ui/StructuredDataScript";

export const metadata: Metadata = buildPageMetadata({
  path: "/history",
  title: "История центра",
  description:
    "На странице собрана история НЦФГ с ключевыми этапами развития центра и его проектов с 2005 года.",
});

export const revalidate = 60;

export default async function HistoryPage() {
  const [siteSetting, aboutPage, portfolioPage] = await Promise.all([
    fetchSiteSettings(),
    fetchAboutPageData(),
    fetchPortfolioPageData(),
  ]);

  const heroMetrics = pickAboutHeroMetrics(siteSetting.metrics);
  const breadcrumbStructuredData = buildBreadcrumbList([
    { name: "Главная", path: "/" },
    { name: "История", path: "/history" },
  ]);

  return (
    <>
      <StructuredDataScript data={breadcrumbStructuredData} />
      <main className="pb-10 md:pb-12">
        <Hero
          noSentinel
          headline={aboutPage.heroHeadline ?? ""}
          lead={ABOUT_HERO_LEAD}
          primaryCta={
            aboutPage.heroCta
              ? { label: aboutPage.heroCta.label, href: aboutPage.heroCta.href }
              : undefined
          }
          metrics={heroMetrics}
        />

        <AboutHistoryTimeline />

        <div data-header-hero-end aria-hidden="true" className="h-px" />

        <CenteredPageIntro
          as="h2"
          title={portfolioPage.title}
          lead={portfolioPage.lead}
          sectionClassName="pt-4 md:pt-8"
        />

        <PortfolioShowcase
          projects={portfolioPage.projects.map((project) => ({
            id: project.id,
            title: project.title,
            description: project.description,
            period: project.period,
          }))}
          presentation={
            portfolioPage.presentationHref && portfolioPage.presentationLabel
              ? {
                  label: portfolioPage.presentationLabel,
                  href: portfolioPage.presentationHref,
                }
              : undefined
          }
        />
      </main>

      <Footer data={mapSiteSettingsToFooterData(siteSetting)} />
    </>
  );
}
