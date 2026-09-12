import assert from "node:assert/strict";
import test from "node:test";
import { compareCss, inspectAsset } from "./check-webvisor-assets.mjs";

test("a 200 HTML error page is not accepted as valid CSS", async () => {
  const result = await inspectAsset("https://example.test/style.css", async () =>
    new Response("<html>not found</html>", { headers: { "content-type": "text/html" } }));
  assert.equal(result.status, 200);
  assert.equal(result.isCssResponse, false);
});

test("a network failure remains unknown, not an HTTP failure attributed to the site", async () => {
  const result = await inspectAsset("https://example.test/style.css", async () => { throw new Error(); });
  assert.equal(result.status, null);
  assert.equal(result.error, "request_failed_or_timed_out");
});

test("direct CSS and a failed replay proxy are reported separately", async () => {
  const result = await compareCss("https://ncfg.ru", "/_next/static/chunks/old.css", async (url) =>
    String(url).startsWith("https://ncfg.ru/")
      ? new Response("body{color:red}", { headers: { "content-type": "text/css; charset=UTF-8" } })
      : Response.json({ message: "protocol exception" }, { status: 400 }));
  assert.equal(result.direct.isCssResponse, true);
  assert.equal(result.replayProxy.status, 400);
  assert.equal(result.sameCss, false);
});

test("comparison detects changed CSS bytes and rejects non-asset paths", async () => {
  const result = await compareCss("https://ncfg.ru", "/_next/static/chunks/old.css", async (url) =>
    new Response(String(url).startsWith("https://ncfg.ru/") ? "old" : "new", {
      headers: { "content-type": "text/css" },
    }));
  assert.equal(result.sameCss, false);
  await assert.rejects(compareCss("https://ncfg.ru", "/api/lead"));
  await assert.rejects(compareCss("https://ncfg.ru", "/_next/static/../file.css"));
  await assert.rejects(compareCss("https://user:password@ncfg.ru", "/_next/static/file.css"));
});
