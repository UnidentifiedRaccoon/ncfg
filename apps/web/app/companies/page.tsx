import type { Metadata } from "next";
import {
  HeroCompanies,
  ServiceCatalog,
  FAQ,
  LeadForm,
  Footer,
} from "@/widgets";
import {
  fetchCompaniesPageData,
  fetchServiceUiIconMap,
  fetchServicesData,
  fetchSiteSettings,
} from "@/shared/api/data-provider";

export const metadata: Metadata = {
  title: "Компаниям — Программы финансового благополучия для сотрудников | НЦФГ",
  description:
    "Комплексные программы финансовой грамотности для бизнеса: консалтинг, обучение, поддержка сотрудников. Повысьте финансовое благополучие вашей команды.",
  openGraph: {
    title: "Компаниям — Финансовая грамотность для бизнеса | НЦФГ",
    description:
      "Комплексные программы финансовой грамотности для бизнеса: консалтинг, обучение, поддержка сотрудников.",
    type: "website",
  },
};

export default async function CompaniesPage() {
  const [siteSetting, companiesPage, servicesData, serviceIconMap] = await Promise.all([
    fetchSiteSettings(),
    fetchCompaniesPageData(),
    fetchServicesData(),
    fetchServiceUiIconMap(),
  ]);

  const hero = companiesPage.hero;

  const serviceBlocks = servicesData.serviceCategories.map((category) => ({
    id: category.id,
    title: category.title,
    description: category.description,
    items: category.services
      .map((service) => ({
        title: service.title,
        description: service.shortDescription,
        href: `/companies/${service.id}`,
        icon: serviceIconMap[service.id] ?? "target",
      })),
  }));

  const faqItems = [...companiesPage.faqItems]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({ question: item.question, answer: item.answer }));

  return (
    <>
      <main>
        <HeroCompanies
          headline={hero?.headline ?? ""}
          lead={hero?.lead ?? undefined}
          primaryCta={
            hero?.primaryCta
              ? { label: hero.primaryCta.label, href: hero.primaryCta.href }
              : undefined
          }
        />
        <ServiceCatalog services={serviceBlocks} variant="glass" showBadges={false} />
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
