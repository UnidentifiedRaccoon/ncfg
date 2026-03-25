import assert from "node:assert/strict";
import test from "node:test";
import type { DiagnosticResult } from "../api/types/diagnostic";
import {
  buildDiagnosticResultEmail,
} from "./diagnostic-result-email";
import {
  FALLBACK_DIAGNOSTIC_RESULT_SUMMARY,
  FALLBACK_DIAGNOSTIC_RESULT_TITLE,
} from "./diagnostic-result-presentation";

process.env.NEXT_PUBLIC_SITE_URL = "https://ncfg.test";

function createBaseResult(): DiagnosticResult {
  return {
    totalScore: 12,
    maxScore: 20,
    scorePercent: 60,
    band: {
      key: "steady",
      title: "Уверенная база",
      summary: "У вас уже есть хорошие привычки, которые можно усилить.",
      ctaLabel: "Открыть материалы",
      ctaHref: "/materials/financial-health",
    },
    insights: [
      {
        questionKey: "budget",
        questionTitle: "Как вы ведете бюджет?",
        answerKey: "sometimes",
        answerLabel: "Иногда фиксирую траты",
        weight: 5,
        insightTitle: "Сделайте учет расходов регулярным",
        insightText: "Так вы быстрее заметите повторяющиеся лишние траты.",
        practiceStep: "Фиксируйте расходы ежедневно хотя бы в течение двух недель.",
      },
    ],
  };
}

test("buildDiagnosticResultEmail renders HTML and text with CTA and recommendations", () => {
  const email = buildDiagnosticResultEmail({
    fullName: "Иван Петров",
    campaignTitle: "Финансовое здоровье",
    organizationName: "НЦФГ",
    result: createBaseResult(),
  });

  assert.equal(email.subject, "Результаты диагностики «Финансовое здоровье»");
  assert.match(email.html, /Иван Петров/);
  assert.match(email.html, /Уверенная база/);
  assert.match(email.html, /Открыть материалы/);
  assert.match(email.html, /https:\/\/ncfg\.test\/materials\/financial-health/);
  assert.match(email.html, /Персональные рекомендации/);
  assert.match(email.text, /Ваш результат: 60 из 100/);
  assert.match(email.text, /Практический шаг: Фиксируйте расходы ежедневно/);
});

test("buildDiagnosticResultEmail omits CTA when result band has no link", () => {
  const result = createBaseResult();
  result.band = {
    ...result.band!,
    ctaLabel: undefined,
    ctaHref: undefined,
  };

  const email = buildDiagnosticResultEmail({
    fullName: "Иван Петров",
    campaignTitle: "Финансовое здоровье",
    organizationName: "НЦФГ",
    result,
  });

  assert.doesNotMatch(email.html, /Открыть материалы/);
  assert.doesNotMatch(email.text, /Открыть материалы:/);
});

test("buildDiagnosticResultEmail uses fallback copy when result band is missing", () => {
  const result = createBaseResult();
  result.band = null;

  const email = buildDiagnosticResultEmail({
    fullName: "Иван Петров",
    campaignTitle: "Финансовое здоровье",
    organizationName: "НЦФГ",
    result,
  });

  assert.match(email.html, new RegExp(FALLBACK_DIAGNOSTIC_RESULT_TITLE));
  assert.match(email.html, /Подробный анализ будет доступен после настройки диагностики/);
  assert.match(email.text, new RegExp(FALLBACK_DIAGNOSTIC_RESULT_TITLE));
  assert.match(email.text, new RegExp(FALLBACK_DIAGNOSTIC_RESULT_SUMMARY));
});

test("buildDiagnosticResultEmail omits recommendations block when there are no insights", () => {
  const result = createBaseResult();
  result.insights = [];

  const email = buildDiagnosticResultEmail({
    fullName: "Иван Петров",
    campaignTitle: "Финансовое здоровье",
    organizationName: "НЦФГ",
    result,
  });

  assert.doesNotMatch(email.html, /Персональные рекомендации/);
  assert.doesNotMatch(email.text, /Персональные рекомендации/);
});
