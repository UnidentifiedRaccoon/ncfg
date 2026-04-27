import type { Metadata } from "next";
import {
  Footer,
  mapSiteSettingsToFooterData,
  PortfolioShowcase,
} from "@/widgets";
import { fetchPortfolioPageData, fetchSiteSettings } from "@/shared/api/data-provider";
import { buildPageMetadata } from "@/shared/lib/metadata";
import { buildBreadcrumbList } from "@/shared/lib/structured-data";
import { CenteredPageIntro } from "@/shared/ui";
import { StructuredDataScript } from "@/shared/ui/StructuredDataScript";

export const metadata: Metadata = buildPageMetadata({
  path: "/portfolio",
  title: "Портфолио",
  description:
    "В портфолио НЦФГ собраны ключевые проекты и инициативы по финансовой грамотности федерального и регионального уровня.",
});

export default async function PortfolioPage() {
  const [siteSetting, portfolioPage] = await Promise.all([
    fetchSiteSettings(),
    fetchPortfolioPageData(),
  ]);
  const breadcrumbStructuredData = buildBreadcrumbList([
    { name: "Главная", path: "/" },
    { name: "Портфолио", path: "/portfolio" },
  ]);

  return (
    <>
      <StructuredDataScript data={breadcrumbStructuredData} />
      <main className="pb-10 md:pb-12">
        <CenteredPageIntro
          title={portfolioPage.title}
          lead={portfolioPage.lead}
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
