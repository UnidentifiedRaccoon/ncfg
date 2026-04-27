import type { Metadata } from "next";
import { fetchCertificates, fetchRecommendations, fetchSiteSettings } from "@/shared/api/data-provider";
import { buildPageMetadata } from "@/shared/lib/metadata";
import { buildBreadcrumbList } from "@/shared/lib/structured-data";
import { CenteredPageIntro } from "@/shared/ui";
import { Container } from "@/shared/ui/Container";
import { StructuredDataScript } from "@/shared/ui/StructuredDataScript";
import {
  Footer,
  mapSiteSettingsToFooterData,
  RecommendationsShowcase,
} from "@/widgets";
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
        <CenteredPageIntro
          title="Опыт клиентов"
          lead="Что говорят о нас наши партнёры и клиенты"
          leadClassName="md:text-2xl lg:text-[38px] lg:leading-[1.2]"
        />

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
      <Footer data={mapSiteSettingsToFooterData(siteSetting)} />
    </>
  );
}
