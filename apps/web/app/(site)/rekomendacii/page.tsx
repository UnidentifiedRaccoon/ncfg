import type { Metadata } from "next";
import { fetchRecommendations, fetchSiteSettings } from "@/shared/api/data-provider";
import { buildPageMetadata } from "@/shared/lib/metadata";
import { Container } from "@/shared/ui/Container";
import { Footer, RecommendationsShowcase } from "@/widgets";

export const metadata: Metadata = buildPageMetadata({
  path: "/rekomendacii",
  title: "Рекомендации | НЦФГ",
  description:
    "Рекомендации партнеров и клиентов НЦФГ на отдельной странице в формате Capital Grid.",
  openGraphDescription:
    "Отдельная страница «Рекомендации» в стиле Capital Grid и визуальной системе НЦФГ.",
});

export const revalidate = 60;

export default async function RecommendationsPage() {
  const [recommendations, siteSetting] = await Promise.all([
    fetchRecommendations(),
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

  return (
    <>
      <main className="pb-10 md:pb-12">
        <section data-scroll-reveal="" className="pt-10 md:pt-14">
          <Container>
            <div className="flex min-h-[280px] flex-col gap-8 px-6 py-6 md:min-h-[360px] md:px-10 md:py-8">
              <div className="mx-auto my-auto w-full max-w-5xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-[#1E3A5F] sm:text-5xl md:text-6xl lg:text-[72px] lg:leading-[1.0]">
                  Рекомендации
                </h1>
                <p className="mx-auto mt-5 max-w-4xl text-base leading-relaxed text-[#3F5C86] sm:text-lg md:text-2xl lg:text-[38px] lg:leading-[1.2]">
                  Что говорят о нас наши партнёры и клиенты
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
