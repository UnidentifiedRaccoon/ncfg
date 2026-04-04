import type { Metadata } from "next";
import { Footer, PortfolioShowcase } from "@/widgets";
import { fetchPortfolioPageData, fetchSiteSettings } from "@/shared/api/data-provider";
import { buildPageMetadata } from "@/shared/lib/metadata";
import { buildBreadcrumbList } from "@/shared/lib/structured-data";
import { Container } from "@/shared/ui/Container";
import { StructuredDataScript } from "@/shared/ui/StructuredDataScript";

export const metadata: Metadata = buildPageMetadata({
  path: "/portfolio",
  title: "Портфолио",
  description:
    "В портфолио НЦФГ собраны ключевые проекты и инициативы по финансовой грамотности федерального и регионального уровня.",
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
        <section data-scroll-reveal="" className="pt-10 md:pt-14">
          <Container>
            <div className="flex min-h-[280px] flex-col gap-8 px-6 py-6 md:min-h-[360px] md:px-10 md:py-8">
              <div className="mx-auto my-auto w-full max-w-5xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-[#1E3A5F] sm:text-5xl md:text-6xl lg:text-[72px] lg:leading-[1.0]">
                  {portfolioPage.title}
                </h1>
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
      <Footer
        data={{
          organization: {
            fullName: siteSetting.organizationFullName,
            shortName: siteSetting.organizationShortName,
          },
          contacts: {
            phone: siteSetting.contactsPhone,
            email: siteSetting.contactsEmail,
          },
          social: siteSetting.socialLinks.map((l) => ({ label: l.label, href: l.href })),
          legalLinks: siteSetting.legalLinks.map((l) => ({ label: l.label, href: l.href })),
          legalDocuments: {
            title: siteSetting.legalDocumentsTitle ?? "Юридические документы",
            items: siteSetting.legalDocuments.map((d) => ({
              label: d.label,
              href: d.href,
              type: d.type,
            })),
          },
          copyright: {
            years: siteSetting.copyrightYears ?? "",
            text: siteSetting.copyrightText ?? "",
            notice: siteSetting.copyrightNotice ?? "",
          },
        }}
      />
    </>
  );
}
