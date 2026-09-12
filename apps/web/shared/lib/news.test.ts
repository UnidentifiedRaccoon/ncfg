import assert from "node:assert/strict";
import test from "node:test";
import { fetchNewsArticle } from "@/shared/api/data-provider";

test("article lookup distinguishes an absent publication from a CMS failure", async (t) => {
  const previous = {
    source: process.env.STRAPI_SOURCE,
    url: process.env.STRAPI_LOCAL_URL,
    token: process.env.STRAPI_LOCAL_API_TOKEN,
  };
  process.env.STRAPI_SOURCE = "local";
  process.env.STRAPI_LOCAL_URL = "https://cms.example.test";
  process.env.STRAPI_LOCAL_API_TOKEN = "test-fixture-only";
  t.after(() => {
    for (const [name, value] of Object.entries({
      STRAPI_SOURCE: previous.source,
      STRAPI_LOCAL_URL: previous.url,
      STRAPI_LOCAL_API_TOKEN: previous.token,
    })) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    Response.json({ data: [], meta: {} }));
  assert.equal(await fetchNewsArticle("missing-article"), null);

  fetchMock.mock.mockImplementation(async () => new Response("Service unavailable", { status: 503 }));
  await assert.rejects(fetchNewsArticle("existing-article"), /Strapi API error \(503\)/);

  fetchMock.mock.mockImplementation(async () => { throw new TypeError("fetch failed"); });
  await assert.rejects(fetchNewsArticle("existing-article"), /Strapi fetch failed/);

  fetchMock.mock.mockImplementation(async () => Response.json({ data: [{
    id: 1, slug: "existing-article", title: "Материал", body: "<p>Текст</p>",
    createdAt: "2026-09-11", updatedAt: "2026-09-11",
  }], meta: {} }));
  assert.equal((await fetchNewsArticle("existing-article"))?.title, "Материал");
});
