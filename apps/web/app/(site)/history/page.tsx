import type { Metadata } from "next";
import {
  AboutHistoryTimeline,
  Footer,
  Hero,
  PortfolioShowcase,
} from "@/widgets";
import {
  fetchAboutPageData,
  fetchPortfolioPageData,
  fetchSiteSettings,
} from "@/shared/api/data-provider";
import { buildPageMetadata } from "@/shared/lib/metadata";
import { ABOUT_HERO_LEAD, pickAboutHeroMetrics } from "@/shared/lib/about-hero";
import { Container } from "@/shared/ui/Container";

export const metadata: Metadata = buildPageMetadata({
  path: "/history",
  title: "История центра — Национальный центр финансовой грамотности | НЦФГ",
  description:
    "История развития НЦФГ с 2005 года: от ИНФИС и ИФП до центра методологии и проектной деятельности в области финансового благополучия населения.",
  openGraphTitle: "История центра — НЦФГ",
  openGraphDescription:
    "Ключевые этапы развития НЦФГ и портфолио федеральных и региональных проектов.",
});

export const revalidate = 60;

function buildFooterData(siteSetting: Awaited<ReturnType<typeof fetchSiteSettings>>) {
  return {
    organization: {
      fullName: siteSetting.organizationFullName,
      shortName: siteSetting.organizationShortName,
    },
    contacts: {
      phone: siteSetting.contactsPhone,
      email: siteSetting.contactsEmail,
    },
    social: siteSetting.socialLinks.map((link) => ({ label: link.label, href: link.href })),
    legalLinks: siteSetting.legalLinks.map((link) => ({ label: link.label, href: link.href })),
    legalDocuments: {
      title: siteSetting.legalDocumentsTitle ?? "Юридические документы",
      items: siteSetting.legalDocuments.map((document) => ({
        label: document.label,
        href: document.href,
        type: document.type,
      })),
    },
    copyright: {
      years: siteSetting.copyrightYears ?? "",
      text: siteSetting.copyrightText ?? "",
      notice: siteSetting.copyrightNotice ?? "",
    },
  };
}

export default async function HistoryPage() {
  const [siteSetting, aboutPage, portfolioPage] = await Promise.all([
    fetchSiteSettings(),
    fetchAboutPageData(),
    fetchPortfolioPageData(),
  ]);

  const heroMetrics = pickAboutHeroMetrics(siteSetting.metrics);

  return (
    <>
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

        <section data-scroll-reveal="" className="pt-4 md:pt-8">
          <Container>
            <div className="flex min-h-[280px] flex-col gap-8 px-6 py-6 md:min-h-[360px] md:px-10 md:py-8">
              <div className="mx-auto my-auto w-full max-w-5xl text-center">
                <h2 className="text-4xl font-bold tracking-tight text-[#1E3A5F] sm:text-5xl md:text-6xl lg:text-[72px] lg:leading-[1.0]">
                  {portfolioPage.title}
                </h2>
                {portfolioPage.lead && (
                  <p className="mx-auto mt-5 max-w-4xl text-base leading-relaxed text-[#3F5C86] sm:text-lg md:text-xl lg:text-2xl lg:leading-[1.3]">
                    {portfolioPage.lead}
                  </p>
                )}
              </div>
            </div>
          </Container>
        </section>

        <PortfolioShowcase
          title={undefined}
          lead={undefined}
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

      <Footer data={buildFooterData(siteSetting)} />
    </>
  );
}
