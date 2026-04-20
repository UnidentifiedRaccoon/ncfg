import assert from "node:assert/strict";
import test from "node:test";

import {
  buildVacancyApplicationConfirmationEmail,
  buildVacancyApplicationInboxEmail,
} from "./vacancy-application-email";

process.env.NEXT_PUBLIC_SITE_URL = "https://ncfg.test";

test("buildVacancyApplicationInboxEmail includes vacancy, candidate and request metadata", () => {
  const email = buildVacancyApplicationInboxEmail(
    {
      vacancySlug: "editor-educational-programs",
      vacancyTitle: "Редактор образовательных программ",
      consentToProcessing: true,
      name: "Иван Петров",
      email: "candidate@example.com",
      phone: "+7 999 000 00 00",
      resumeUrl: "https://example.com/resume",
      telegram: "@candidate",
      message: "Готов рассказать о релевантном опыте",
      sourcePageUrl: "https://ncfg.test/vacancies/editor-educational-programs",
    },
    {
      requestId: "req-123",
      clientIp: "203.0.113.10",
      userAgent: "Unit Test Agent",
    }
  );

  assert.equal(email.subject, "[NCFG][Vacancy] Новый отклик (req-123)");
  assert.equal(email.replyTo, "candidate@example.com");
  assert.match(email.text, /Вакансия: Редактор образовательных программ \(editor-educational-programs\)/);
  assert.match(email.text, /Telegram: @candidate/);
  assert.match(email.text, /Резюме: https:\/\/example\.com\/resume/);
  assert.match(email.text, /Request ID: req-123/);
  assert.match(email.text, /IP: 203\.0\.113\.10/);
  assert.match(email.text, /User-Agent: Unit Test Agent/);
});

test("buildVacancyApplicationConfirmationEmail renders short confirmation with vacancy link", () => {
  const email = buildVacancyApplicationConfirmationEmail({
    name: "Иван Петров",
    email: "candidate@example.com",
    vacancySlug: "editor-educational-programs",
    vacancyTitle: "Редактор образовательных программ",
    sourcePageUrl: "https://ncfg.test/vacancies/editor-educational-programs#vacancy-application",
  });

  assert.equal(
    email.subject,
    "Мы получили ваш отклик на вакансию «Редактор образовательных программ»"
  );
  assert.match(email.html, /Иван Петров/);
  assert.match(email.html, /Редактор образовательных программ/);
  assert.match(
    email.html,
    /https:\/\/ncfg\.test\/vacancies\/editor-educational-programs/
  );
  assert.match(
    email.text,
    /Открыть вакансию: https:\/\/ncfg\.test\/vacancies\/editor-educational-programs/
  );
});

test("buildVacancyApplicationConfirmationEmail falls back to canonical vacancy page url", () => {
  const email = buildVacancyApplicationConfirmationEmail({
    name: "Иван Петров",
    email: "candidate@example.com",
    vacancySlug: "editor-educational-programs",
    vacancyTitle: "Редактор образовательных программ",
  });

  assert.match(
    email.text,
    /Открыть вакансию: https:\/\/ncfg\.test\/vacancies\/editor-educational-programs/
  );
});
