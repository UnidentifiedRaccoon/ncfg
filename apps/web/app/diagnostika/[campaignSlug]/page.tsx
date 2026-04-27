import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiagnosticSurvey } from "@/features/diagnostics";
import { Footer, Header, mapSiteSettingsToFooterData } from "@/widgets";
import { fetchSiteSettings } from "@/shared/api/data-provider";
import { getDiagnosticCampaignBySlug } from "@/shared/api/diagnostics";
import { buildPageMetadata } from "@/shared/lib/metadata";
import { isDiagnosticCampaignAvailable, toPublicDiagnosticQuestions } from "@/shared/lib/diagnostics";

interface PageProps {
  params: Promise<{ campaignSlug: string }>;
}

export const revalidate = 0;

async function loadDiagnosticCampaign(campaignSlug: string) {
  try {
    return await getDiagnosticCampaignBySlug(campaignSlug);
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    console.error(`[diagnostika/${campaignSlug}] Failed to fetch campaign: ${details}`);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { campaignSlug } = await params;
  const campaign = await loadDiagnosticCampaign(campaignSlug);

  if (!campaign || !campaign.organization || !campaign.test || !isDiagnosticCampaignAvailable(campaign)) {
    return buildPageMetadata({
      path: `/diagnostika/${campaignSlug}`,
      title: "Диагностика недоступна",
      description: "Страница диагностики недоступна.",
      robots: {
        index: false,
        follow: false,
      },
    });
  }

  return buildPageMetadata({
    path: `/diagnostika/${campaignSlug}`,
    title: campaign.title,
    description: `Диагностика НЦФГ для сотрудников организации ${campaign.organization.name}.`,
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
          fillViewport={!isNavigationLayoutVisible}
        />
      </main>
      {isNavigationLayoutVisible && siteSetting ? (
        <Footer data={mapSiteSettingsToFooterData(siteSetting)} />
      ) : null}
    </>
  );
}
