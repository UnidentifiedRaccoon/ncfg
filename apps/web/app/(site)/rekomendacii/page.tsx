import type { Metadata } from "next";
import { fetchCertificates, fetchRecommendations, fetchSiteSettings } from "@/shared/api/data-provider";
import { buildPageMetadata } from "@/shared/lib/metadata";
import { buildBreadcrumbList } from "@/shared/lib/structured-data";
import { Container } from "@/shared/ui/Container";
import { StructuredDataScript } from "@/shared/ui/StructuredDataScript";
import { Footer, RecommendationsShowcase } from "@/widgets";
import { RecommendationLettersRail } from "@/widgets/RecommendationLettersRail";

export const metadata: Metadata = buildPageMetadata({
  path: "/rekomendacii",
  title: "Опыт клиентов",
  description:
    "На этой странице собраны отзывы и рекомендации партнеров и клиентов НЦФГ о совместной работе.",
});

export const revalidate = 0;

export default async function RecommendationsPage() {
  const [recommendations, certificates, siteSetting] = await Promise.all([
    fetchRecommendations(),
    fetchCertificates(),
    fetchSiteSettings(),
  ]);

  const recommendationItems =
    recommendations
      .filter((item) => item.quote.trim().length > 0)
      .map((item) => ({
        id: item.id,
        company: item.company,
        quote: item.fullQuote ?? item.quote,
      }));
  const breadcrumbStructuredData = buildBreadcrumbList([
    { name: "Главная", path: "/" },
    { name: "Опыт клиентов", path: "/rekomendacii" },
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
                  Опыт клиентов
                </h1>
                <p className="mx-auto mt-5 max-w-4xl text-base leading-relaxed text-[#3F5C86] sm:text-lg md:text-2xl lg:text-[38px] lg:leading-[1.2]">
                  Что говорят о нас наши партнёры и клиенты
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section data-scroll-reveal="" className="pt-6 md:pt-8">
          <Container>
            <RecommendationsShowcase items={recommendationItems} />
          </Container>
        </section>

        <section data-scroll-reveal="" className="pt-12 md:pt-16">
          <Container>
            <div className="space-y-8 md:space-y-10">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-[#1E3A5F] md:text-4xl">
                  Благодарственные письма и дипломы
                </h2>
              </div>

              <RecommendationLettersRail items={certificates} />
            </div>
          </Container>
        </section>
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
