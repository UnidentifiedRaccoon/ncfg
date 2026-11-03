import assert from "node:assert/strict";
import test from "node:test";
import * as client from "./cloudru-secrets.mjs";

const settings = { projectId: "project-fixture", path: "ncfg/development", version: 1,
  credentials: { keyId: "key-fixture", secret: "private-key-fixture" } };
const fixture = { secret: { id: "secret-fixture", path: "ncfg/development", projectId: "project-fixture" },
  version: { id: 1, state: "ENABLED", createdAt: "2026-11-03T00:00:00Z" },
  payload: "eyJTVFJBUElfUFJPRF9BUElfVE9LRU4iOiJyZWFkLXRva2VuIn0=" };

function transport(payload = fixture) {
  return async (url, options) => {
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    if (String(url) === "https://iam.api.cloud.ru/api/v1/auth/token") {
      assert.equal(options.method, "POST");
      assert.deepEqual(JSON.parse(options.body), settings.credentials);
      return Response.json({ access_token: "temporary-access", expires_in: 3600, token_type: "Bearer" });
    }
    assert.equal(String(url), "https://secretmanager.api.cloud.ru/v2/version/ncfg/development?projectId=project-fixture&version=1");
    assert.equal(options.headers.Authorization, "Bearer temporary-access");
    return Response.json(payload);
  };
}

test("reads the pinned development payload from the documented API", async () => {
  assert.equal(typeof client.readCloudruSecret, "function");
  const result = await client.readCloudruSecret(settings, { fetchImpl: transport() });
  assert.deepEqual(result, { STRAPI_PROD_API_TOKEN: "read-token" });
});

test("rejects a payload from another secret, project, version or disabled version", async () => {
  for (const change of [
    { secret: { ...fixture.secret, projectId: "other-project" } },
    { secret: { ...fixture.secret, path: "ncfg/production-web" } },
    { version: { ...fixture.version, id: 2 } },
    { version: { ...fixture.version, state: "DISABLED" } },
  ]) {
    await assert.rejects(() => client.readCloudruSecret(settings, { fetchImpl: transport({ ...fixture, ...change }) }), /Cloud.ru/);
  }
});

test("does not expose API bodies or request exceptions in errors", async () => {
  for (const fetchImpl of [
    async () => new Response("private-key-fixture read-token", { status: 403 }),
    async () => { throw new Error("private-key-fixture read-token"); },
    async () => new Response('{"access_token":"read-token" garbage'),
  ]) {
    await assert.rejects(() => client.readCloudruSecret(settings, { fetchImpl }), error => {
      assert.match(error.message, /Cloud.ru/);
      assert.doesNotMatch(error.stack, /private-key-fixture|read-token/);
      assert.equal(error.cause, undefined);
      return true;
    });
  }
});

test("rejects missing credentials and invalid path/version before network access", async () => {
  let calls = 0;
  const fetchImpl = async () => { calls++; throw new Error("unexpected request"); };
  for (const change of [{ version: 0 }, { version: "latest" }, { path: "../production" },
    { projectId: "" }, { credentials: { keyId: "key", secret: "" } }]) {
    await assert.rejects(() => client.readCloudruSecret({ ...settings, ...change }, { fetchImpl }), /Cloud.ru/);
  }
  assert.equal(calls, 0);
});

test("rejects malformed base64, non-JSON and non-object secret payloads", async () => {
  for (const payload of ["%%%", "e30=garbage", "bm90LWpzb24=", "W10=", "bnVsbA=="]) {
    await assert.rejects(() => client.readCloudruSecret(settings, { fetchImpl: transport({ ...fixture, payload }) }), /Cloud.ru/);
  }
});

test("requires the development payload to contain only a nonempty read token", () => {
  assert.equal(typeof client.developmentReadToken, "function");
  assert.equal(client.developmentReadToken({ STRAPI_PROD_API_TOKEN: "read-token" }), "read-token");
  for (const payload of [{}, { STRAPI_PROD_API_TOKEN: " " }, { STRAPI_PROD_API_TOKEN: 123 },
    { STRAPI_PROD_API_TOKEN: "read-token", STRAPI_WRITE_API_TOKEN: "write-token" }]) {
    assert.throws(() => client.developmentReadToken(payload), /Cloud.ru/);
  }
});


test("uses explicit credentials without invoking the operating system store", async () => {
  assert.equal(typeof client.developmentCredentials, "function");
  const result = await client.developmentCredentials({
    environment: { NCFG_CLOUDRU_KEY_ID: "key-fixture", NCFG_CLOUDRU_KEY_SECRET: "private-key-fixture" },
    platform: "darwin", runCapture: async () => { throw new Error("must not run"); },
  });
  assert.deepEqual(result, settings.credentials);
});

test("loads only the dedicated development credential from macOS Keychain", async () => {
  const result = await client.developmentCredentials({ environment: {}, platform: "darwin",
    runCapture: async (command, args) => {
      assert.equal(command, "security");
      assert.deepEqual(args, ["find-generic-password", "-s", "ncfg-cloudru-dev-reader", "-w"]);
      return { stdout: JSON.stringify(settings.credentials) };
    },
  });
  assert.deepEqual(result, settings.credentials);
});

test("does not fall back on incomplete explicit credentials or expose Keychain errors", async () => {
  let calls = 0;
  await assert.rejects(() => client.developmentCredentials({
    environment: { NCFG_CLOUDRU_KEY_ID: "key-fixture" }, platform: "darwin",
    runCapture: async () => { calls++; return { stdout: JSON.stringify(settings.credentials) }; },
  }), /Cloud.ru/);
  assert.equal(calls, 0);
  for (const runCapture of [async () => { throw new Error("private-key-fixture"); },
    async () => ({ stdout: "private-key-fixture" })]) {
    await assert.rejects(() => client.developmentCredentials({ environment: {}, platform: "darwin", runCapture }), e => {
      assert.match(e.message, /Cloud.ru/); assert.doesNotMatch(e.stack, /private-key-fixture/); return true;
    });
  }
});


test("development consumer obtains a read token through Cloud.ru without yc", async () => {
  assert.equal(typeof client.loadDevelopmentReadToken, "function");
  const result = await client.loadDevelopmentReadToken({
    environment: { NCFG_CLOUDRU_KEY_ID: "key-fixture", NCFG_CLOUDRU_KEY_SECRET: "private-key-fixture",
      NCFG_CLOUDRU_PROJECT_ID: "project-fixture", NCFG_CLOUDRU_DEV_SECRET: "ncfg/development", NCFG_CLOUDRU_DEV_VERSION: "1" },
    platform: "linux", runCapture: async () => { throw new Error("unexpected subprocess"); }, fetchImpl: transport(),
  });
  assert.equal(result, "read-token");
});

test("explicit production read-token remains supported without fetching broader credentials", async () => {
  const token = await client.loadDevelopmentReadToken({ environment: { STRAPI_PROD_API_TOKEN: " explicit-read " },
    platform: "linux", runCapture: async () => { throw new Error("unexpected subprocess"); },
    fetchImpl: async () => { throw new Error("unexpected network"); } });
  assert.equal(token, "explicit-read");
});


test("accepts real API snake_case project identity and rejects conflicting aliases", async () => {
  const snake = { ...fixture, secret: { id: "secret-fixture", path: settings.path, project_id: settings.projectId } };
  assert.deepEqual(await client.readCloudruSecret(settings, { fetchImpl: transport(snake) }), { STRAPI_PROD_API_TOKEN: "read-token" });
  for (const secret of [{...snake.secret, projectId:"other"}, {...snake.secret,project_id:"other"}]) {
    await assert.rejects(() => client.readCloudruSecret(settings, {fetchImpl:transport({...snake,secret})}), /Cloud.ru/);
  }
});
