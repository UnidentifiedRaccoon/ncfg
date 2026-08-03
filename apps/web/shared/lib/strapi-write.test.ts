import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { ExternalEffectDisabledError } from "./external-effects";
import { fetchAPI } from "./strapi";
import { postStrapiWriteJSON } from "./strapi-write";

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

afterEach(() => {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL_ENV);
  globalThis.fetch = ORIGINAL_FETCH;
});

test("blocked production write never reads credentials or calls fetch", async () => {
  Reflect.set(process.env, "NODE_ENV", "development");
  process.env.STRAPI_SOURCE = "prod";
  process.env.STRAPI_PROD_URL = "https://admin.example.test";
  delete process.env.STRAPI_PROD_WRITE_API_TOKEN;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return new Response();
  };

  await assert.rejects(
    postStrapiWriteJSON("/items", { value: 1 }),
    ExternalEffectDisabledError
  );
  assert.equal(fetchCalls, 0);
});

test("read client rejects unsafe methods before reading credentials or calling fetch", async () => {
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return new Response();
  };

  await assert.rejects(
    fetchAPI("/items", { method: "DELETE" }),
    /fetchAPI is read-only/
  );
  assert.equal(fetchCalls, 0);
});

test("explicit local write performs one authenticated POST", async () => {
  Reflect.set(process.env, "NODE_ENV", "development");
  process.env.STRAPI_SOURCE = "local";
  process.env.STRAPI_WRITE_MODE = "enabled";
  process.env.STRAPI_LOCAL_URL = "http://127.0.0.1:1337/";
  process.env.STRAPI_LOCAL_WRITE_API_TOKEN = "local-write-token";
  const requests: Array<{ input: string; init?: RequestInit }> = [];
  globalThis.fetch = async (input, init) => {
    requests.push({ input: String(input), init });
    return new Response(JSON.stringify({ data: { id: 1 } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  const result = await postStrapiWriteJSON<{ data: { id: number } }>(
    "/items",
    { value: 1 }
  );

  assert.deepEqual(result, { data: { id: 1 } });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].input, "http://127.0.0.1:1337/api/items");
  assert.equal(requests[0].init?.method, "POST");
  assert.equal(
    (requests[0].init?.headers as Record<string, string>).Authorization,
    "Bearer local-write-token"
  );
});
