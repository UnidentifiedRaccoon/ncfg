import type { Metadata } from "next";

import { FinancialGamesLanding, FINANCIAL_GAMES_PATH } from "@/widgets/FinancialGames";
import { Footer } from "@/widgets/Footer";
import { LeadForm } from "@/widgets/LeadForm";
import { fetchSiteSettings } from "@/shared/api/data-provider";
import { buildPageMetadata } from "@/shared/lib/metadata";
import { buildBreadcrumbList } from "@/shared/lib/structured-data";
import { StructuredDataScript } from "@/shared/ui/StructuredDataScript";

export const revalidate = 0;

export const metadata: Metadata = buildPageMetadata({
  path: FINANCIAL_GAMES_PATH,
  title: "Финансовые игры для сотрудников и их детей",
  description:
    "Настольные финансовые игры с ведущими НЦФГ для сотрудников компаний и их детей. Форматы проведения, игровые задачи и интерактивный эпизод про общий бюджет.",
  imagePath: "/services/financial-games/game-company.webp",
});

export default async function FinancialGamesPage() {
  const siteSetting = await fetchSiteSettings();
  const breadcrumbs = buildBreadcrumbList([
    { name: "Главная", path: "/" },
    { name: "Компаниям", path: "/companies" },
    { name: "Финансовые игры", path: FINANCIAL_GAMES_PATH },
  ]);

  return (
    <>
      <StructuredDataScript data={breadcrumbs} />
      <main>
        <FinancialGamesLanding />
        <LeadForm audience="corporate" program={{ id: "financial-games", title: "Финансовые игры" }} />
      </main>
      <Footer
        ctaHref="#lead-form"
        data={{
          organization: {
            fullName: siteSetting.organizationFullName,
            shortName: siteSetting.organizationShortName,
          },
          contacts: {
            phone: siteSetting.contactsPhone,
            email: siteSetting.contactsEmail,
          },
          social: siteSetting.socialLinks.map((link) => ({ label: link.label, href: link.href })),
          legalLinks: siteSetting.legalLinks.map((link) => ({ label: link.label, href: link.href })),
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
