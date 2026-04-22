import type { Metadata } from "next";
import {
  HeroIndividuals,
  ProductShowcase,
  FAQ,
  LeadForm,
  Footer,
} from "@/widgets";
import { fetchIndividualsPageData, fetchSiteSettings } from "@/shared/api/data-provider";
import { buildPageMetadata } from "@/shared/lib/metadata";
import {
  buildBreadcrumbList,
  buildFAQPageStructuredData,
} from "@/shared/lib/structured-data";
import { StructuredDataScript } from "@/shared/ui/StructuredDataScript";

export const metadata: Metadata = buildPageMetadata({
  path: "/individuals",
  title: "Финансовая грамотность для частных лиц",
  description:
    "Программы, материалы и практические рекомендации НЦФГ для тех, кто хочет увереннее управлять личными и семейными финансами.",
});

export default async function IndividualsPage() {
  const [siteSetting, individualsPage] = await Promise.all([
    fetchSiteSettings(),
    fetchIndividualsPageData(),
  ]);

  const hero = individualsPage.hero;
  const products = individualsPage.products.map((p) => ({
    title: p.title,
    description: p.description,
    href: p.href,
    icon: p.iconKey ?? undefined,
    audience: p.audience ?? undefined,
    image: p.imagePath ?? undefined,
  }));
  const faqItems = [...individualsPage.faqItems]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({ question: item.question, answer: item.answer }));
  const breadcrumbStructuredData = buildBreadcrumbList([
    { name: "Главная", path: "/" },
    { name: "Частным лицам", path: "/individuals" },
  ]);
  const faqStructuredData = buildFAQPageStructuredData(faqItems);

  return (
    <>
      <StructuredDataScript data={breadcrumbStructuredData} />
      {faqStructuredData ? <StructuredDataScript data={faqStructuredData} /> : null}
      <main>
        <HeroIndividuals
          headline="Финансовая грамотность для частных лиц"
          lead={hero?.lead ?? undefined}
          primaryCta={
            hero?.primaryCta
              ? { label: hero.primaryCta.label, href: hero.primaryCta.href }
              : undefined
          }
        />
        <ProductShowcase
          title={individualsPage.productsTitle ?? "Наши услуги"}
          lead={individualsPage.productsLead ?? undefined}
          products={products}
        />
        <LeadForm />
        <FAQ title="Частые вопросы" items={faqItems} />
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
