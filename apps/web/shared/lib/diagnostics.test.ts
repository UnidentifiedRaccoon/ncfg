import assert from "node:assert/strict";
import test from "node:test";
import type { DiagnosticCampaign, DiagnosticResultBand, DiagnosticTest } from "../api/types/diagnostic";
import { buildDiagnosticResult } from "./diagnostics";

function createDiagnosticTest(resultBands: DiagnosticResultBand[]): DiagnosticTest {
  return {
    documentId: "test-document-id",
    code: "financial-wellbeing",
    version: 1,
    title: "Финансовое благополучие",
    questions: [],
    resultBands,
  };
}

function createCampaign({
  resultBands = [],
  isCtaDisabled = false,
  overwriteCtaLabel,
  overwriteCtaHref,
}: {
  resultBands?: DiagnosticResultBand[];
  isCtaDisabled?: boolean;
  overwriteCtaLabel?: string;
  overwriteCtaHref?: string;
} = {}): DiagnosticCampaign {
  return {
    documentId: "campaign-document-id",
    title: "Кампания диагностики",
    slug: "diagnostic-campaign",
    isActive: true,
    startsAt: null,
    endsAt: null,
    isNavigationLayoutDisabled: false,
    isCtaDisabled,
    overwriteCtaLabel,
    overwriteCtaHref,
    organization: {
      documentId: "organization-document-id",
      name: "НЦФГ",
    },
    test: createDiagnosticTest(resultBands),
  };
}

function createResultBand(overrides: Partial<DiagnosticResultBand> = {}): DiagnosticResultBand {
  return {
    key: "steady",
    title: "Уверенная база",
    minPercent: 0,
    maxPercent: 100,
    summary: "У вас уже есть хорошие привычки, которые можно усилить.",
    ctaLabel: "Открыть материалы",
    ctaHref: "/materials/financial-health",
    order: 0,
    ...overrides,
  };
}

function createEvaluatedSubmission(scorePercent = 60) {
  return {
    totalScore: 12,
    maxScore: 20,
    scorePercent,
    insights: [],
  };
}

test("buildDiagnosticResult uses band CTA when campaign override is absent", () => {
  const campaign = createCampaign({ resultBands: [createResultBand()] });

  const result = buildDiagnosticResult(campaign, createEvaluatedSubmission());

  assert.equal(result.ctaLabel, "Открыть материалы");
  assert.equal(result.ctaHref, "/materials/financial-health");
  assert.deepEqual(result.band, {
    key: "steady",
    title: "Уверенная база",
    summary: "У вас уже есть хорошие привычки, которые можно усилить.",
  });
});

test("buildDiagnosticResult fully overrides band CTA from campaign", () => {
  const campaign = createCampaign({
    resultBands: [createResultBand()],
    overwriteCtaLabel: "Записаться на консультацию",
    overwriteCtaHref: "/consultation",
  });

  const result = buildDiagnosticResult(campaign, createEvaluatedSubmission());

  assert.equal(result.ctaLabel, "Записаться на консультацию");
  assert.equal(result.ctaHref, "/consultation");
});

test("buildDiagnosticResult partially merges CTA override with band CTA", () => {
  const campaign = createCampaign({
    resultBands: [createResultBand()],
    overwriteCtaLabel: "Записаться на консультацию",
  });

  const result = buildDiagnosticResult(campaign, createEvaluatedSubmission());

  assert.equal(result.ctaLabel, "Записаться на консультацию");
  assert.equal(result.ctaHref, "/materials/financial-health");
});

test("buildDiagnosticResult removes CTA when campaign disables it", () => {
  const campaign = createCampaign({
    resultBands: [createResultBand()],
    isCtaDisabled: true,
    overwriteCtaLabel: "Записаться на консультацию",
    overwriteCtaHref: "/consultation",
  });

  const result = buildDiagnosticResult(campaign, createEvaluatedSubmission());

  assert.equal(result.ctaLabel, undefined);
  assert.equal(result.ctaHref, undefined);
});

test("buildDiagnosticResult keeps campaign CTA even without result bands", () => {
  const campaign = createCampaign({
    resultBands: [],
    overwriteCtaLabel: "Записаться на консультацию",
    overwriteCtaHref: "/consultation",
  });

  const result = buildDiagnosticResult(campaign, createEvaluatedSubmission());

  assert.equal(result.band, null);
  assert.equal(result.ctaLabel, "Записаться на консультацию");
  assert.equal(result.ctaHref, "/consultation");
});
