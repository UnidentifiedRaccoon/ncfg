import assert from "node:assert/strict";
import test from "node:test";

import {
  VACANCY_APPLICATION_CONSENT_REQUIRED_ERROR,
  normalizeAbsoluteHttpUrl,
  parseVacancyApplicationPayload,
  VACANCY_APPLICATION_INVALID_EMAIL_ERROR,
  VACANCY_APPLICATION_INVALID_RESUME_URL_ERROR,
  VACANCY_APPLICATION_REQUIRED_FIELDS_ERROR,
} from "./vacancy-application";

test("normalizeAbsoluteHttpUrl accepts only absolute http and https links", () => {
  assert.equal(
    normalizeAbsoluteHttpUrl(" https://example.com/resume "),
    "https://example.com/resume"
  );
  assert.equal(
    normalizeAbsoluteHttpUrl("http://example.com/cv.pdf"),
    "http://example.com/cv.pdf"
  );
  assert.equal(normalizeAbsoluteHttpUrl("/relative/path"), undefined);
  assert.equal(normalizeAbsoluteHttpUrl("ftp://example.com/file"), undefined);
});

test("parseVacancyApplicationPayload requires mandatory candidate fields", () => {
  const result = parseVacancyApplicationPayload({
    vacancySlug: "editor-educational-programs",
    consentToProcessing: true,
    name: "  ",
    email: "candidate@example.com",
    phone: "+7 999 000 00 00",
    resumeUrl: "https://example.com/resume",
  });

  assert.deepEqual(result, {
    ok: false,
    error: VACANCY_APPLICATION_REQUIRED_FIELDS_ERROR,
  });
});

test("parseVacancyApplicationPayload validates email and resume url", () => {
  assert.deepEqual(
    parseVacancyApplicationPayload({
      vacancySlug: "editor-educational-programs",
      consentToProcessing: true,
      name: "Иван Петров",
      email: "invalid-email",
      phone: "+7 999 000 00 00",
      resumeUrl: "https://example.com/resume",
    }),
    {
      ok: false,
      error: VACANCY_APPLICATION_INVALID_EMAIL_ERROR,
    }
  );

  assert.deepEqual(
    parseVacancyApplicationPayload({
      vacancySlug: "editor-educational-programs",
      consentToProcessing: true,
      name: "Иван Петров",
      email: "candidate@example.com",
      phone: "+7 999 000 00 00",
      resumeUrl: "resume.pdf",
    }),
    {
      ok: false,
      error: VACANCY_APPLICATION_INVALID_RESUME_URL_ERROR,
    }
  );
});

test("parseVacancyApplicationPayload normalizes supported fields", () => {
  const result = parseVacancyApplicationPayload({
    vacancySlug: " editor-educational-programs ",
    consentToProcessing: true,
    name: " Иван Петров ",
    email: " candidate@example.com ",
    phone: " +7 999 000 00 00 ",
    resumeUrl: " https://example.com/resume ",
    telegram: " @candidate ",
    message: " Готов рассказать подробнее ",
    sourcePageUrl: " https://ncfg.test/vacancies/editor-educational-programs#vacancy-application ",
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.deepEqual(result.data, {
    vacancySlug: "editor-educational-programs",
    consentToProcessing: true,
    name: "Иван Петров",
    email: "candidate@example.com",
    phone: "+7 999 000 00 00",
    resumeUrl: "https://example.com/resume",
    telegram: "@candidate",
    message: "Готов рассказать подробнее",
    sourcePageUrl: "https://ncfg.test/vacancies/editor-educational-programs#vacancy-application",
  });
});

test("parseVacancyApplicationPayload requires consent for personal data processing", () => {
  assert.deepEqual(
    parseVacancyApplicationPayload({
      vacancySlug: "editor-educational-programs",
      consentToProcessing: false,
      name: "Иван Петров",
      email: "candidate@example.com",
      phone: "+7 999 000 00 00",
      resumeUrl: "https://example.com/resume",
    }),
    {
      ok: false,
      error: VACANCY_APPLICATION_CONSENT_REQUIRED_ERROR,
    }
  );
});
