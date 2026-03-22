import { buildQueryString, fetchAPI, StrapiResponse } from "@/shared/lib/strapi";
import { sortDiagnosticQuestions } from "@/shared/lib/diagnostics";
import type {
  DiagnosticCampaign,
  DiagnosticOption,
  DiagnosticOrganization,
  DiagnosticQuestion,
  DiagnosticResultBand,
  DiagnosticTest,
} from "@/shared/api/types/diagnostic";

interface StrapiDiagnosticOption {
  id: number;
  key: string;
  label: string;
  weight: number;
  order: number;
  insightTitle: string | null;
  insightText: string | null;
  practiceStep: string | null;
}

interface StrapiDiagnosticQuestion {
  id: number;
  key: string;
  title: string;
  description: string | null;
  order: number;
  options: StrapiDiagnosticOption[] | null;
}

interface StrapiDiagnosticResultBand {
  id: number;
  key: string;
  title: string;
  minPercent: number;
  maxPercent: number;
  summary: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  order: number;
}

interface StrapiDiagnosticTest {
  id: number;
  documentId: string;
  code: string;
  version: number;
  title: string;
  questions: StrapiDiagnosticQuestion[] | null;
  resultBands: StrapiDiagnosticResultBand[] | null;
}

interface StrapiDiagnosticOrganization {
  id: number;
  documentId: string;
  name: string;
}

interface StrapiDiagnosticCampaign {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  organization: StrapiDiagnosticOrganization | null;
  test: StrapiDiagnosticTest | null;
}

function transformOption(option: StrapiDiagnosticOption): DiagnosticOption {
  return {
    key: option.key,
    label: option.label,
    weight: Number(option.weight ?? 0),
    order: Number(option.order ?? 0),
    insightTitle: option.insightTitle ?? undefined,
    insightText: option.insightText ?? undefined,
    practiceStep: option.practiceStep ?? undefined,
  };
}

function transformQuestion(question: StrapiDiagnosticQuestion): DiagnosticQuestion {
  return {
    key: question.key,
    title: question.title,
    description: question.description ?? null,
    order: Number(question.order ?? 0),
    options: Array.isArray(question.options) ? question.options.map(transformOption) : [],
  };
}

function transformResultBand(band: StrapiDiagnosticResultBand): DiagnosticResultBand {
  return {
    key: band.key,
    title: band.title,
    minPercent: Number(band.minPercent ?? 0),
    maxPercent: Number(band.maxPercent ?? 100),
    summary: band.summary,
    ctaLabel: band.ctaLabel ?? undefined,
    ctaHref: band.ctaHref ?? undefined,
    order: Number(band.order ?? 0),
  };
}

function transformTest(test: StrapiDiagnosticTest): DiagnosticTest {
  const resultBands = Array.isArray(test.resultBands)
    ? test.resultBands.map(transformResultBand).sort((a, b) => a.order - b.order)
    : [];

  return {
    documentId: test.documentId,
    code: test.code,
    version: Number(test.version ?? 1),
    title: test.title,
    questions: sortDiagnosticQuestions(
      Array.isArray(test.questions) ? test.questions.map(transformQuestion) : []
    ),
    resultBands,
  };
}

function transformOrganization(
  organization: StrapiDiagnosticOrganization | null
): DiagnosticOrganization | null {
  if (!organization) {
    return null;
  }

  return {
    documentId: organization.documentId,
    name: organization.name,
  };
}

function transformCampaign(entry: StrapiDiagnosticCampaign): DiagnosticCampaign {
  return {
    documentId: entry.documentId,
    title: entry.title,
    slug: entry.slug,
    isActive: Boolean(entry.isActive),
    startsAt: entry.startsAt ?? null,
    endsAt: entry.endsAt ?? null,
    organization: transformOrganization(entry.organization),
    test: entry.test ? transformTest(entry.test) : null,
  };
}

export async function getDiagnosticCampaignBySlug(
  slug: string
): Promise<DiagnosticCampaign | null> {
  const query = buildQueryString({
    filters: {
      slug: { $eq: slug },
    },
    populate: {
      organization: true,
      test: {
        populate: {
          questions: {
            populate: {
              options: true,
            },
          },
          resultBands: true,
        },
      },
    },
    publicationState: "live",
  });

  const response = await fetchAPI<StrapiResponse<StrapiDiagnosticCampaign[]>>(
    `/diagnostic-campaigns${query}`,
    { tags: ["diagnostics", `diagnostic-campaign-${slug}`] }
  );

  const campaign = response.data[0];
  return campaign ? transformCampaign(campaign) : null;
}
