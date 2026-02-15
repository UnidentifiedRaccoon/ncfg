import type { Metadata } from "next";
import {
  HeroIndividuals,
  ProductShowcase,
  FAQ,
  LeadForm,
  Footer,
} from "@/widgets";
import { fetchIndividualsPageData, fetchSiteSettings } from "@/shared/api/data-provider";

export const metadata: Metadata = {
  title: "Частным лицам — Финансовая грамотность для вас и вашей семьи | НЦФГ",
  description:
    "Программы финансовой грамотности для частных лиц: клуб ФинЗдоровье, финансовое воспитание детей, онлайн-курсы. Научитесь управлять личными финансами.",
  openGraph: {
    title: "Частным лицам — Финансовая грамотность | НЦФГ",
    description:
      "Программы финансовой грамотности для частных лиц: клуб ФинЗдоровье, финансовое воспитание детей, онлайн-курсы.",
    type: "website",
  },
};

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

  return (
    <>
      <main>
        <HeroIndividuals
          headline={hero?.headline ?? ""}
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
