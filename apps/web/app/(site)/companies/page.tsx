import type { Metadata } from "next";
import {
  HeroCompanies,
  ServiceCatalog,
  FAQ,
  LeadForm,
  Footer,
  mapSiteSettingsToFooterData,
} from "@/widgets";
import {
  fetchCompaniesPageData,
  fetchServicesData,
  fetchSiteSettings,
} from "@/shared/api/data-provider";
import { buildPageMetadata } from "@/shared/lib/metadata";
import {
  buildBreadcrumbList,
  buildFAQPageStructuredData,
} from "@/shared/lib/structured-data";
import { StructuredDataScript } from "@/shared/ui/StructuredDataScript";

export const revalidate = 0;

export const metadata: Metadata = buildPageMetadata({
  path: "/companies",
  title: "Финансовая грамотность сотрудников для компаний",
  description:
    "НЦФГ помогает компаниям запускать программы финансовой грамотности, финансового благополучия и обучения сотрудников на рабочем месте.",
});

export default async function CompaniesPage() {
  const [siteSetting, companiesPage, servicesData] = await Promise.all([
    fetchSiteSettings(),
    fetchCompaniesPageData(),
    fetchServicesData(),
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
      })),
  }));

  const faqItems = [...companiesPage.faqItems]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({ question: item.question, answer: item.answer }));
  const breadcrumbStructuredData = buildBreadcrumbList([
    { name: "Главная", path: "/" },
    { name: "Компаниям", path: "/companies" },
  ]);
  const faqStructuredData = buildFAQPageStructuredData(faqItems);

  return (
    <>
      <StructuredDataScript data={breadcrumbStructuredData} />
      {faqStructuredData ? <StructuredDataScript data={faqStructuredData} /> : null}
      <main>
        <HeroCompanies
          headline="Программы финансовой грамотности для сотрудников компаний"
          lead={hero?.lead ?? undefined}
          primaryCta={
            hero?.primaryCta
              ? { label: hero.primaryCta.label, href: hero.primaryCta.href }
              : undefined
          }
        />
        <ServiceCatalog
          services={serviceBlocks}
          showBadges={false}
          banner={{
            serviceId: "programmy-finansovogo-blagopoluchiya-dlya-sotrudnikov",
            title: "Финансовое благополучие сотрудников",
            ctaLabel: "Скачать презентацию",
            href: "/docs/ncfg-financial-wellbeing.pdf",
          }}
        />
        <LeadForm />
        <FAQ title="Частые вопросы" items={faqItems} />
      </main>
      <Footer data={mapSiteSettingsToFooterData(siteSetting)} />
    </>
  );
}
