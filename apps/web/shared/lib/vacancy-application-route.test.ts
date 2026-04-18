import assert from "node:assert/strict";
import test from "node:test";

import { handleVacancyApplicationPost } from "@/app/api/vacancy-application/route";
import {
  VACANCY_APPLICATION_INVALID_EMAIL_ERROR,
  VACANCY_APPLICATION_INVALID_RESUME_URL_ERROR,
  VACANCY_APPLICATION_REQUIRED_FIELDS_ERROR,
  VACANCY_APPLICATION_UNKNOWN_VACANCY_ERROR,
} from "./vacancy-application";

function createRequest(body: unknown) {
  return new Request("https://ncfg.test/api/vacancy-application", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.10",
      "x-request-id": "req-123",
      "user-agent": "Unit Test Agent",
      referer: "https://ncfg.test/vacancies/editor-educational-programs#details",
    },
    body: JSON.stringify(body),
  });
}

test("handleVacancyApplicationPost submits published vacancy applications", async () => {
  const submissions: unknown[] = [];
  const confirmations: unknown[] = [];

  const response = await handleVacancyApplicationPost(createRequest({
    vacancySlug: "editor-educational-programs",
    name: "Иван Петров",
    email: "candidate@example.com",
    phone: "+7 999 000 00 00",
    resumeUrl: "https://example.com/resume",
    telegram: "@candidate",
    message: "Готов обсудить роль",
    sourcePageUrl: "https://ncfg.test/vacancies/editor-educational-programs#vacancy-application",
  }), {
    async findVacancyBySlug(slug) {
      assert.equal(slug, "editor-educational-programs");
      return {
        slug,
        title: "Редактор образовательных программ",
        publishedAt: "2026-04-10T10:00:00.000Z",
      };
    },
    async submitVacancyApplication(data, ctx) {
      submissions.push({ data, ctx });
    },
    async sendConfirmation(data, ctx) {
      confirmations.push({ data, ctx });
    },
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-request-id"), "req-123");
  assert.deepEqual(await response.json(), {
    success: true,
    message: "Отклик успешно отправлен",
  });
  assert.deepEqual(submissions, [
    {
      data: {
        vacancySlug: "editor-educational-programs",
        vacancyTitle: "Редактор образовательных программ",
        name: "Иван Петров",
        email: "candidate@example.com",
        phone: "+7 999 000 00 00",
        resumeUrl: "https://example.com/resume",
        telegram: "@candidate",
        message: "Готов обсудить роль",
        sourcePageUrl: "https://ncfg.test/vacancies/editor-educational-programs",
      },
      ctx: {
        requestId: "req-123",
        clientIp: "203.0.113.10",
        userAgent: "Unit Test Agent",
      },
    },
  ]);
  assert.deepEqual(confirmations, [
    {
      data: {
        name: "Иван Петров",
        email: "candidate@example.com",
        vacancySlug: "editor-educational-programs",
        vacancyTitle: "Редактор образовательных программ",
        sourcePageUrl: "https://ncfg.test/vacancies/editor-educational-programs",
      },
      ctx: {
        requestId: "req-123",
      },
    },
  ]);
});

test("handleVacancyApplicationPost returns 400 for missing required fields", async () => {
  const response = await handleVacancyApplicationPost(createRequest({
    vacancySlug: "editor-educational-programs",
    name: "Иван Петров",
    email: "candidate@example.com",
    phone: "",
    resumeUrl: "https://example.com/resume",
  }), {
    async findVacancyBySlug() {
      throw new Error("should not be called");
    },
    async submitVacancyApplication() {
      throw new Error("should not be called");
    },
    async sendConfirmation() {
      throw new Error("should not be called");
    },
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: VACANCY_APPLICATION_REQUIRED_FIELDS_ERROR,
  });
});

test("handleVacancyApplicationPost returns 400 for invalid email", async () => {
  const response = await handleVacancyApplicationPost(createRequest({
    vacancySlug: "editor-educational-programs",
    name: "Иван Петров",
    email: "invalid-email",
    phone: "+7 999 000 00 00",
    resumeUrl: "https://example.com/resume",
  }), {
    async findVacancyBySlug() {
      throw new Error("should not be called");
    },
    async submitVacancyApplication() {
      throw new Error("should not be called");
    },
    async sendConfirmation() {
      throw new Error("should not be called");
    },
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: VACANCY_APPLICATION_INVALID_EMAIL_ERROR,
  });
});

test("handleVacancyApplicationPost returns 400 for invalid resume url", async () => {
  const response = await handleVacancyApplicationPost(createRequest({
    vacancySlug: "editor-educational-programs",
    name: "Иван Петров",
    email: "candidate@example.com",
    phone: "+7 999 000 00 00",
    resumeUrl: "/resume.pdf",
  }), {
    async findVacancyBySlug() {
      throw new Error("should not be called");
    },
    async submitVacancyApplication() {
      throw new Error("should not be called");
    },
    async sendConfirmation() {
      throw new Error("should not be called");
    },
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: VACANCY_APPLICATION_INVALID_RESUME_URL_ERROR,
  });
});

test("handleVacancyApplicationPost returns 400 for unknown vacancy slug", async () => {
  const response = await handleVacancyApplicationPost(createRequest({
    vacancySlug: "missing-vacancy",
    name: "Иван Петров",
    email: "candidate@example.com",
    phone: "+7 999 000 00 00",
    resumeUrl: "https://example.com/resume",
  }), {
    async findVacancyBySlug() {
      return null;
    },
    async submitVacancyApplication() {
      throw new Error("should not be called");
    },
    async sendConfirmation() {
      throw new Error("should not be called");
    },
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: VACANCY_APPLICATION_UNKNOWN_VACANCY_ERROR,
  });
});

test("handleVacancyApplicationPost returns 400 for unpublished vacancy", async () => {
  const response = await handleVacancyApplicationPost(createRequest({
    vacancySlug: "draft-vacancy",
    name: "Иван Петров",
    email: "candidate@example.com",
    phone: "+7 999 000 00 00",
    resumeUrl: "https://example.com/resume",
  }), {
    async findVacancyBySlug() {
      return {
        slug: "draft-vacancy",
        title: "Черновик вакансии",
        publishedAt: null,
      };
    },
    async submitVacancyApplication() {
      throw new Error("should not be called");
    },
    async sendConfirmation() {
      throw new Error("should not be called");
    },
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: VACANCY_APPLICATION_UNKNOWN_VACANCY_ERROR,
  });
});

test("handleVacancyApplicationPost keeps success response when confirmation email fails", async (t) => {
  const consoleError = t.mock.method(console, "error", () => {});
  let submitCalled = false;

  const response = await handleVacancyApplicationPost(createRequest({
    vacancySlug: "editor-educational-programs",
    name: "Иван Петров",
    email: "candidate@example.com",
    phone: "+7 999 000 00 00",
    resumeUrl: "https://example.com/resume",
  }), {
    async findVacancyBySlug(slug) {
      return {
        slug,
        title: "Редактор образовательных программ",
        publishedAt: "2026-04-10T10:00:00.000Z",
      };
    },
    async submitVacancyApplication() {
      submitCalled = true;
    },
    async sendConfirmation() {
      throw new Error("SMTP unavailable");
    },
  });

  assert.equal(submitCalled, true);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true,
    message: "Отклик успешно отправлен",
  });
  assert.equal(consoleError.mock.calls.length, 1);
  assert.match(String(consoleError.mock.calls[0]?.arguments[0]), /req-123/);
});
