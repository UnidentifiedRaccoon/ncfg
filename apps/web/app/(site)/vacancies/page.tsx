import type { Metadata } from "next";

import { CareerVacancies, Footer } from "@/widgets";
import {
  fetchCareerPageData,
  fetchSiteSettings,
  fetchVacancies,
} from "@/shared/api/data-provider";
import { buildPageMetadata } from "@/shared/lib/metadata";
import { buildBreadcrumbList } from "@/shared/lib/structured-data";
import { StructuredDataScript } from "@/shared/ui/StructuredDataScript";

export const metadata: Metadata = buildPageMetadata({
  path: "/vacancies",
  title: "Вакансии",
  description:
    "Открытые роли в НЦФГ для тех, кто хочет делать сильные образовательные и социальные проекты в области финансовой грамотности и культуры.",
});

export const revalidate = 60;

export default async function VacanciesPage() {
  const [siteSetting, careerPage, vacancies] = await Promise.all([
    fetchSiteSettings(),
    fetchCareerPageData(),
    fetchVacancies(),
  ]);

  const breadcrumbStructuredData = buildBreadcrumbList([
    { name: "Главная", path: "/" },
    { name: "Вакансии", path: "/vacancies" },
  ]);

  return (
    <>
      <StructuredDataScript data={breadcrumbStructuredData} />
      <main>
        <CareerVacancies
          title={careerPage.title}
          lead={careerPage.lead}
          vacancies={vacancies}
          emptyTitle={careerPage.emptyTitle}
          emptyDescription={careerPage.emptyDescription}
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
          social: siteSetting.socialLinks.map((link) => ({
            label: link.label,
            href: link.href,
          })),
          legalLinks: siteSetting.legalLinks.map((link) => ({
            label: link.label,
            href: link.href,
          })),
          legalDocuments: {
            title: siteSetting.legalDocumentsTitle ?? "Юридические документы",
            items: siteSetting.legalDocuments.map((document) => ({
              label: document.label,
              href: document.href,
              type: document.type,
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
