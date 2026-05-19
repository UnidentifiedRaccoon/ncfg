import { cache } from "react";
import type { Metadata } from "next";
import { HrDiagnosticSurvey } from "@/features/hr-diagnostic";
import { Footer, Header } from "@/widgets";
import { fetchSiteSettings } from "@/shared/api/data-provider";
import {
  getActiveHrDiagnosticTest,
  HR_DIAGNOSTIC_SLUG,
  LEGACY_HR_DIAGNOSTIC_TEST,
} from "@/entities/HrDiagnostic";
import { buildPageMetadata } from "@/shared/lib/metadata";
import type { HrDiagnosticTest } from "@/entities/HrDiagnostic";

export const revalidate = 0;

const getHrDiagnosticTestForPage = cache(async (): Promise<HrDiagnosticTest> => {
  try {
    return (
      (await getActiveHrDiagnosticTest(HR_DIAGNOSTIC_SLUG)) ??
      LEGACY_HR_DIAGNOSTIC_TEST
    );
  } catch (error) {
    console.warn("[hr-diagnostic] Falling back to legacy HR diagnostic test", error);
    return LEGACY_HR_DIAGNOSTIC_TEST;
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const test = await getHrDiagnosticTestForPage();

  return buildPageMetadata({
    path: `/diagnostika/${HR_DIAGNOSTIC_SLUG}`,
    title: test.title,
    description:
      test.introLead ??
      "Анкета-скрининг НЦФГ для HR-специалистов о финансовом благополучии сотрудников.",
    robots: {
      index: false,
      follow: false,
    },
  });
}

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
  const [siteSetting, test] = await Promise.all([
    fetchSiteSettings(),
    getHrDiagnosticTestForPage(),
  ]);

  return (
    <>
      <Header />
      <main aria-label={test.testTitle}>
        <HrDiagnosticSurvey test={test} />
      </main>
      <Footer data={buildFooterData(siteSetting)} />
    </>
  );
}
