import type { Metadata } from "next";
import { HrDiagnosticSurvey } from "@/features/hr-diagnostic";
import { Footer, Header } from "@/widgets";
import { fetchSiteSettings } from "@/shared/api/data-provider";
import {
  HR_DIAGNOSTIC_SLUG,
  HR_DIAGNOSTIC_TEST_TITLE,
  HR_DIAGNOSTIC_TITLE,
} from "@/entities/HrDiagnostic";
import { buildPageMetadata } from "@/shared/lib/metadata";

export const revalidate = 0;

export const metadata: Metadata = buildPageMetadata({
  path: `/diagnostika/${HR_DIAGNOSTIC_SLUG}`,
  title: HR_DIAGNOSTIC_TITLE,
  description:
    "Анкета-скрининг НЦФГ для HR-специалистов о финансовом благополучии сотрудников.",
  robots: {
    index: false,
    follow: false,
  },
});

function buildFooterData(siteSetting: Awaited<ReturnType<typeof fetchSiteSettings>>) {
  return {
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
  };
}

export default async function HrDiagnosticPage() {
  const siteSetting = await fetchSiteSettings();

  return (
    <>
      <Header />
      <main aria-label={HR_DIAGNOSTIC_TEST_TITLE}>
        <HrDiagnosticSurvey />
      </main>
      <Footer data={buildFooterData(siteSetting)} />
    </>
  );
}
