import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCanonicalRedirectUrl,
  getSeoRedirectPathname,
  isSeoGonePath,
  isStaticAssetPathname,
} from "./seo-redirects";

test("getSeoRedirectPathname rewrites only supported legacy paths", () => {
  assert.equal(getSeoRedirectPathname("/news"), "/blog");
  assert.equal(getSeoRedirectPathname("/companies"), "/companies");
});

test("isSeoGonePath matches bot and feed leftovers", () => {
  assert.equal(isSeoGonePath("/wp-login.php"), true);
  assert.equal(isSeoGonePath("/xmlrpc.php"), true);
  assert.equal(isSeoGonePath("/feed"), true);
  assert.equal(isSeoGonePath("/news"), false);
});

test("isStaticAssetPathname matches public assets but keeps SEO routes dynamic", () => {
  assert.equal(isStaticAssetPathname("/heroV2.minified.png"), true);
  assert.equal(isStaticAssetPathname("/docs/ustav-ncfg.pdf"), true);
  assert.equal(isStaticAssetPathname("/manifest.webmanifest"), true);
  assert.equal(isStaticAssetPathname("/companies"), false);
  assert.equal(isStaticAssetPathname("/robots.txt"), false);
  assert.equal(isStaticAssetPathname("/sitemap.xml"), false);
  assert.equal(isStaticAssetPathname("/wp-login.php"), false);
});

test("buildCanonicalRedirectUrl keeps canonical requests untouched", () => {
  const target = buildCanonicalRedirectUrl(
    "https://ncfg.ru/companies?tab=all",
    "https://ncfg.ru"
  );

  assert.equal(target, null);
});

test("buildCanonicalRedirectUrl normalizes /news on canonical host in one hop", () => {
  const target = buildCanonicalRedirectUrl("https://ncfg.ru/news?utm=1", "https://ncfg.ru");

  assert.equal(target?.toString(), "https://ncfg.ru/blog?utm=1");
});

test("buildCanonicalRedirectUrl ignores internal port on canonical host", () => {
  const target = buildCanonicalRedirectUrl("https://ncfg.ru:8080/companies?tab=all", "https://ncfg.ru");

  assert.equal(target, null);
});

test("buildCanonicalRedirectUrl removes internal port when rewriting canonical paths", () => {
  const target = buildCanonicalRedirectUrl("https://ncfg.ru:8080/news?utm=1", "https://ncfg.ru");

  assert.equal(target?.toString(), "https://ncfg.ru/blog?utm=1");
});

test("buildCanonicalRedirectUrl trusts forwarded canonical host and protocol", () => {
  const target = buildCanonicalRedirectUrl("http://127.0.0.1:8080/companies?tab=all", "https://ncfg.ru", {
    host: "ncfg.ru",
    protocol: "https",
  });

  assert.equal(target, null);
});

test("buildCanonicalRedirectUrl strips port from forwarded canonical host", () => {
  const target = buildCanonicalRedirectUrl("http://127.0.0.1:8080/companies?tab=all", "https://ncfg.ru", {
    host: "ncfg.ru:443",
    protocol: "https",
  });

  assert.equal(target, null);
});

test("buildCanonicalRedirectUrl rewrites forwarded mirror host to canonical", () => {
  const target = buildCanonicalRedirectUrl("http://127.0.0.1:8080/path/to/page?ref=mirror", "https://ncfg.ru", {
    host: "www.ncfg.ru",
    protocol: "https",
  });

  assert.equal(target?.toString(), "https://ncfg.ru/path/to/page?ref=mirror");
});

test("buildCanonicalRedirectUrl rewrites forwarded canonical host legacy paths without leaking runtime origin", () => {
  const target = buildCanonicalRedirectUrl("http://127.0.0.1:8080/news?utm=1", "https://ncfg.ru", {
    host: "ncfg.ru",
    protocol: "https",
  });

  assert.equal(target?.toString(), "https://ncfg.ru/blog?utm=1");
});

test("buildCanonicalRedirectUrl canonicalizes mirror hosts and preserves query", () => {
  const target = buildCanonicalRedirectUrl(
    "https://www.ncfg.ru/path/to/page?ref=mirror",
    "https://ncfg.ru"
  );

  assert.equal(target?.toString(), "https://ncfg.ru/path/to/page?ref=mirror");
});

test("buildCanonicalRedirectUrl canonicalizes gateway hosts and folds /news into /blog", () => {
  const target = buildCanonicalRedirectUrl(
    "https://d5d1a3velg9e6hkj777c.i99u1wfk.apigw.yandexcloud.net/news?utm=legacy",
    "https://ncfg.ru"
  );

  assert.equal(target?.toString(), "https://ncfg.ru/blog?utm=legacy");
});

test("buildCanonicalRedirectUrl canonicalizes gone paths on mirror without dropping the path", () => {
  const target = buildCanonicalRedirectUrl(
    "https://d5d1a3velg9e6hkj777c.i99u1wfk.apigw.yandexcloud.net/wp-login.php",
    "https://ncfg.ru"
  );

  assert.equal(target?.toString(), "https://ncfg.ru/wp-login.php");
});
