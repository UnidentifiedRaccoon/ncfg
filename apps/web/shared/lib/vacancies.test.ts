import assert from "node:assert/strict";
import test from "node:test";

import { fetchCareerPageData } from "@/shared/api/data-provider";
import { transformToVacancyData } from "@/shared/api/vacancies";
import { buildVacancyPageDescription } from "./metadata";
import {
  getVacancyEmploymentTypeLabel,
  getVacancyWorkFormatLabel,
  resolveVacancyPublishedDate,
} from "./vacancies";

test("vacancy label helpers return stable russian labels", () => {
  assert.equal(getVacancyEmploymentTypeLabel("full-time"), "Полная занятость");
  assert.equal(getVacancyEmploymentTypeLabel("internship"), "Стажировка");
  assert.equal(getVacancyEmploymentTypeLabel(null), null);

  assert.equal(getVacancyWorkFormatLabel("remote"), "Удалённо");
  assert.equal(getVacancyWorkFormatLabel("office"), "Офис");
  assert.equal(getVacancyWorkFormatLabel(undefined), null);
});

test("resolveVacancyPublishedDate falls back to createdAt", () => {
  assert.equal(
    resolveVacancyPublishedDate({
      publishedDate: "2026-04-15",
      createdAt: "2026-04-01T09:00:00.000Z",
    }),
    "2026-04-15"
  );

  assert.equal(
    resolveVacancyPublishedDate({
      publishedDate: " ",
      createdAt: "2026-04-01T09:00:00.000Z",
    }),
    "2026-04-01T09:00:00.000Z"
  );
});

test("transformToVacancyData normalizes labels and published date", () => {
  const vacancy = transformToVacancyData({
    id: 7,
    documentId: "vacancy-doc",
    title: "Редактор спецпроектов",
    slug: "special-projects-editor",
    lead: "  Сильная редакторская роль для длинных материалов. ",
    body: "<p>Body</p>",
    department: {
      id: 3,
      documentId: "dept-doc",
      slug: "content-editorial",
      title: "Контент и редакция",
      order: 10,
      description: "Редакторы и методисты",
      createdAt: "2026-04-01T10:00:00.000Z",
      updatedAt: "2026-04-01T10:00:00.000Z",
    },
    employmentType: "part-time",
    workFormat: "remote",
    location: "Россия",
    salaryText: "80 000 ₽",
    publishedDate: null,
    coverImage: {
      id: 15,
      documentId: "file-doc",
      name: "cover.jpg",
      alternativeText: null,
      caption: null,
      width: 1200,
      height: 675,
      formats: null,
      hash: "cover",
      ext: ".jpg",
      mime: "image/jpeg",
      size: 123,
      url: "https://cdn.example.com/cover.jpg",
      previewUrl: null,
      provider: "aws-s3",
    },
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-11T11:30:00.000Z",
    publishedAt: "2026-04-11T11:30:00.000Z",
  });

  assert.equal(vacancy.employmentTypeLabel, "Частичная занятость");
  assert.equal(vacancy.workFormatLabel, "Удалённо");
  assert.equal(vacancy.publishedDate, "2026-04-01T09:00:00.000Z");
  assert.equal(vacancy.coverImage, "https://cdn.example.com/cover.jpg");
});

test("buildVacancyPageDescription prefers authored lead", () => {
  assert.equal(
    buildVacancyPageDescription({
      title: "Аналитик исследований",
      lead: "Ищем аналитика, который поможет лучше понимать аудиторию НЦФГ.",
      department: { title: "Продукт и аналитика" },
      location: "Россия",
      employmentTypeLabel: "Проектная работа",
      workFormatLabel: "Удалённо",
    }),
    "Ищем аналитика, который поможет лучше понимать аудиторию НЦФГ."
  );
});

test("buildVacancyPageDescription synthesizes fallback metadata copy", () => {
  assert.equal(
    buildVacancyPageDescription({
      title: "Редактор программ",
      department: { title: "Контент и редакция" },
      location: "Москва",
      employmentTypeLabel: "Полная занятость",
      workFormatLabel: "Гибрид",
    }),
    "Вакансия НЦФГ «Редактор программ»: Контент и редакция, Полная занятость, Гибрид, Москва."
  );
});

test("fetchCareerPageData reads local career json", async () => {
  const page = await fetchCareerPageData();

  assert.equal(page.title, "Карьера");
  assert.match(page.lead ?? "", /НЦФГ/u);
  assert.equal(page.emptyTitle, "Сейчас открытых вакансий нет.");
});
