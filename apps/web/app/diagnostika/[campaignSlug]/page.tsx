import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiagnosticSurvey } from "@/features/diagnostics";
import { Footer, Header } from "@/widgets";
import { fetchSiteSettings } from "@/shared/api/data-provider";
import { getDiagnosticCampaignBySlug } from "@/shared/api/diagnostics";
import { buildPageMetadata } from "@/shared/lib/metadata";
import { isDiagnosticCampaignAvailable, toPublicDiagnosticQuestions } from "@/shared/lib/diagnostics";

interface PageProps {
  params: Promise<{ campaignSlug: string }>;
}

async function loadDiagnosticCampaign(campaignSlug: string) {
  try {
    return await getDiagnosticCampaignBySlug(campaignSlug);
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    console.error(`[diagnostika/${campaignSlug}] Failed to fetch campaign: ${details}`);
    return null;
  }
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { campaignSlug } = await params;
  const campaign = await loadDiagnosticCampaign(campaignSlug);

  if (!campaign || !campaign.organization || !campaign.test || !isDiagnosticCampaignAvailable(campaign)) {
    return buildPageMetadata({
      path: `/diagnostika/${campaignSlug}`,
      title: "Диагностика недоступна — НЦФГ",
      description: "Страница диагностики недоступна.",
      robots: {
        index: false,
        follow: false,
      },
    });
  }

  return buildPageMetadata({
    path: `/diagnostika/${campaignSlug}`,
    title: `${campaign.title} — диагностика НЦФГ`,
    description: `Диагностика для ${campaign.organization.name}.`,
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default async function DiagnosticCampaignPage({ params }: PageProps) {
  const { campaignSlug } = await params;
  const campaign = await loadDiagnosticCampaign(campaignSlug);

  if (!campaign || !campaign.organization || !campaign.test || !isDiagnosticCampaignAvailable(campaign)) {
    notFound();
  }

  const isNavigationLayoutVisible = !campaign.isNavigationLayoutDisabled;
  const siteSetting = isNavigationLayoutVisible ? await fetchSiteSettings() : null;

  return (
    <>
      {isNavigationLayoutVisible ? <Header /> : null}
      <main>
        <DiagnosticSurvey
          campaignSlug={campaign.slug}
          campaignTitle={campaign.title}
          organizationName={campaign.organization.name}
          testTitle={campaign.test.title}
          questions={toPublicDiagnosticQuestions(campaign.test.questions)}
        />
      </main>
      {isNavigationLayoutVisible && siteSetting ? (
        <Footer data={buildFooterData(siteSetting)} />
      ) : null}
    </>
  );
}
