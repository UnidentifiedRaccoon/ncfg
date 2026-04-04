import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBlogPostDescription,
  buildServiceDescription,
  formatPageTitle,
} from "./metadata";

test("formatPageTitle applies the site suffix once", () => {
  assert.equal(formatPageTitle("Блог"), "Блог | НЦФГ");
  assert.equal(formatPageTitle("Блог | НЦФГ"), "Блог | НЦФГ");
  assert.equal(formatPageTitle("Блог — НЦФГ"), "Блог | НЦФГ");
  assert.equal(formatPageTitle("Блог | НЦФГ | НЦФГ"), "Блог | НЦФГ");
  assert.equal(formatPageTitle("НЦФГ"), "НЦФГ");
});

test("buildBlogPostDescription prefers an excerpt from article body", () => {
  assert.equal(
    buildBlogPostDescription({
      title: "Как говорить о деньгах в компании",
      body:
        "<p>Финансовая устойчивость сотрудников влияет на вовлеченность команды.</p><p>Разбираем, как работодателю говорить о деньгах спокойно и предметно.</p>",
      category: { title: "Для компаний" },
    }),
    "Финансовая устойчивость сотрудников влияет на вовлеченность команды. Разбираем, как работодателю говорить о деньгах спокойно и предметно."
  );
});

test("buildBlogPostDescription falls back to category-aware copy when body is empty", () => {
  assert.equal(
    buildBlogPostDescription({
      title: "Как говорить о деньгах в компании",
      category: { title: "Для компаний" },
    }),
    "Материал НЦФГ «Как говорить о деньгах в компании» в рубрике «Для компаний» с практическими выводами и рекомендациями."
  );
});

test("buildBlogPostDescription omits the category when it is missing", () => {
  assert.equal(
    buildBlogPostDescription({
      title: "Как составить семейный бюджет",
      category: null,
    }),
    "Материал НЦФГ «Как составить семейный бюджет» с практическими выводами и рекомендациями."
  );
});

test("buildServiceDescription uses a normalized authored sentence", () => {
  assert.equal(
    buildServiceDescription({
      title: "Финансовое благополучие сотрудников",
      shortDescription: "  Помогаем компаниям выстроить системную поддержку сотрудников в вопросах личных финансов.  ",
    }),
    "Помогаем компаниям выстроить системную поддержку сотрудников в вопросах личных финансов."
  );
});

test("buildServiceDescription falls back when the short description is not a full sentence", () => {
  assert.equal(
    buildServiceDescription({
      title: "Финансовое благополучие сотрудников",
      shortDescription: "Поддержка сотрудников в вопросах личных финансов",
    }),
    "Услуга НЦФГ «Финансовое благополучие сотрудников» для компаний, которым нужна программа финансовой грамотности и финансового благополучия сотрудников."
  );
});
