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
    ctaLabel: "Открыть материалы",
    ctaHref: "/materials/financial-health",
    band: {
      key: "steady",
      title: "Уверенная база",
      summary: "У вас уже есть хорошие привычки, которые можно усилить.",
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
  assert.match(email.html, />\s*1\s*</);
  assert.match(email.text, /Ваш результат: 60 из 100/);
  assert.match(email.text, /1\. Как вы ведете бюджет\?/);
  assert.match(email.text, /Практический шаг: Фиксируйте расходы ежедневно/);
});

test("buildDiagnosticResultEmail uses score tone styles for red yellow and green results", () => {
  const cases = [
    {
      scorePercent: 20,
      borderColor: "rgba\\(226, 150, 156, 0\\.6\\)",
      backgroundColor: "rgba\\(253, 240, 241, 0\\.6\\)",
      numberColor: "#C2555E",
    },
    {
      scorePercent: 60,
      borderColor: "rgba\\(212, 182, 120, 0\\.6\\)",
      backgroundColor: "rgba\\(251, 244, 232, 0\\.6\\)",
      numberColor: "#9A7530",
    },
    {
      scorePercent: 85,
      borderColor: "rgba\\(125, 184, 164, 0\\.6\\)",
      backgroundColor: "rgba\\(237, 246, 242, 0\\.6\\)",
      numberColor: "#3D7D65",
    },
  ];

  for (const testCase of cases) {
    const result = createBaseResult();
    result.scorePercent = testCase.scorePercent;

    const email = buildDiagnosticResultEmail({
      fullName: "Иван Петров",
      campaignTitle: "Финансовое здоровье",
      organizationName: "НЦФГ",
      result,
    });

    assert.match(email.html, new RegExp(`border:4px solid ${testCase.borderColor}`));
    assert.match(email.html, new RegExp(`background:${testCase.backgroundColor}`));
    assert.match(email.html, new RegExp(`color:${testCase.numberColor}`));
  }
});

test("buildDiagnosticResultEmail uses numbered badges and tone styles for recommendation cards", () => {
  const result = createBaseResult();
  result.insights = [
    {
      questionKey: "goals",
      questionTitle: "Есть ли у вас финансовые цели?",
      answerKey: "no",
      answerLabel: "Нет, пока не ставил",
      weight: 2,
      insightTitle: "Начните с одной конкретной цели",
      insightText: "Четкая цель помогает удерживать фокус на регулярных действиях.",
      practiceStep: "Выберите одну цель и запишите срок ее достижения.",
    },
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
    {
      questionKey: "reserve",
      questionTitle: "Есть ли у вас финансовая подушка?",
      answerKey: "yes",
      answerLabel: "Да, уже накопил",
      weight: 8,
      insightTitle: "Поддерживайте резерв в актуальном размере",
      insightText: "Периодически пересматривайте размер резерва под текущие расходы.",
      practiceStep: "Проверьте, хватает ли резерва на 3-6 месяцев жизни.",
    },
  ];

  const email = buildDiagnosticResultEmail({
    fullName: "Иван Петров",
    campaignTitle: "Финансовое здоровье",
    organizationName: "НЦФГ",
    result,
  });

  assert.match(email.html, />\s*1\s*</);
  assert.match(email.html, />\s*2\s*</);
  assert.match(email.html, />\s*3\s*</);
  assert.match(email.html, /border:1px solid rgba\(201, 104, 111, 0\.4\)/);
  assert.match(email.html, /background:#C2555E/);
  assert.match(email.html, /background:rgba\(252, 236, 237, 0\.5\)/);
  assert.match(email.html, /border:1px solid rgba\(191, 154, 78, 0\.4\)/);
  assert.match(email.html, /background:#9A7530/);
  assert.match(email.html, /background:rgba\(250, 242, 229, 0\.5\)/);
  assert.match(email.html, /border:1px solid rgba\(84, 148, 121, 0\.4\)/);
  assert.match(email.html, /background:#3D7D65/);
  assert.match(email.html, /background:rgba\(236, 245, 240, 0\.5\)/);
  assert.doesNotMatch(email.html, />\s*Вопрос\s*</);
});

test("buildDiagnosticResultEmail omits CTA when result band has no link", () => {
  const result = createBaseResult();
  result.ctaLabel = undefined;
  result.ctaHref = undefined;

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

test("buildDiagnosticResultEmail keeps resolved CTA when result band is missing", () => {
  const result = createBaseResult();
  result.band = null;

  const email = buildDiagnosticResultEmail({
    fullName: "Иван Петров",
    campaignTitle: "Финансовое здоровье",
    organizationName: "НЦФГ",
    result,
  });

  assert.match(email.html, /Открыть материалы/);
  assert.match(email.html, /https:\/\/ncfg\.test\/materials\/financial-health/);
  assert.match(email.text, /Открыть материалы: https:\/\/ncfg\.test\/materials\/financial-health/);
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

test("buildDiagnosticResultEmail keeps numbered plain-text recommendations without tone markers", () => {
  const result = createBaseResult();
  result.insights = [
    {
      questionKey: "goals",
      questionTitle: "Есть ли у вас финансовые цели?",
      answerKey: "no",
      answerLabel: "Нет, пока не ставил",
      weight: 2,
      insightTitle: "Начните с одной конкретной цели",
      insightText: "Четкая цель помогает удерживать фокус на регулярных действиях.",
      practiceStep: "Выберите одну цель и запишите срок ее достижения.",
    },
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
  ];

  const email = buildDiagnosticResultEmail({
    fullName: "Иван Петров",
    campaignTitle: "Финансовое здоровье",
    organizationName: "НЦФГ",
    result,
  });

  assert.match(email.text, /1\. Есть ли у вас финансовые цели\?/);
  assert.match(email.text, /2\. Как вы ведете бюджет\?/);
  assert.doesNotMatch(email.text, /\b(?:red|yellow|green)\b/i);
});
