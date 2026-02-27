import type { Metadata } from "next";
import { fetchRecommendations, fetchSiteSettings } from "@/shared/api/data-provider";
import { buildPageMetadata } from "@/shared/lib/metadata";
import { Button } from "@/shared/ui/Button";
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
            <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 md:p-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.54] bg-[radial-gradient(920px_360px_at_8%_0%,rgba(59,130,246,0.13),transparent_62%),radial-gradient(620px_240px_at_100%_100%,rgba(88,168,224,0.12),transparent_60%),linear-gradient(to_right,rgba(226,232,240,0.52)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.52)_1px,transparent_1px)] bg-[size:auto,auto,24px_24px,24px_24px]"
              />
              <div className="relative z-10">
                <h1 className="text-3xl font-bold tracking-tight text-[#1E3A5F] md:text-5xl">
                  Рекомендации
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#475569] md:text-lg">
                  Отзывы партнеров и клиентов о совместных проектах и программах НЦФГ.
                </p>
                <div className="mt-6">
                  <Button href="/" variant="secondary" className="w-full sm:w-auto">
                    На главную
                  </Button>
                </div>
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
            legalAddress: siteSetting.contactsLegalAddress ?? "",
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
