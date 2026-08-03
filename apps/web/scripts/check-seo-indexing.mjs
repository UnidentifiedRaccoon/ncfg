#!/usr/bin/env node

const baseArg = process.argv[2] || process.env.BASE_URL || "https://ncfg.ru";
const mirrorArgs = process.env.SEO_MIRROR_URLS || "";
const blockedArgs = process.env.SEO_BLOCKED_URLS || "";

let baseUrl;
let mirrorUrls = [];
let blockedUrls = [];

try {
  baseUrl = new URL(baseArg);
} catch {
  console.error(`Invalid base URL: ${baseArg}`);
  process.exit(1);
}

function parseUrlList(value, envName) {
  try {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => new URL(entry));
  } catch {
    console.error(`Invalid ${envName} value: ${value}`);
    process.exit(1);
  }
}

function dedupeUrls(urls) {
  const byOrigin = new Map();

  for (const url of urls) {
    byOrigin.set(url.origin, url);
  }

  return Array.from(byOrigin.values());
}

function deriveDefaultMirrorUrls(base) {
  if (base.protocol !== "https:") {
    return [];
  }

  const hostname = base.hostname;
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  ) {
    return [];
  }

  const apexHostname = hostname.startsWith("www.") ? hostname.slice(4) : hostname;
  const candidates = [
    new URL(`http://${apexHostname}`),
    new URL(`https://${apexHostname}`),
    new URL(`http://www.${apexHostname}`),
    new URL(`https://www.${apexHostname}`),
  ];

  return dedupeUrls(candidates.filter((candidate) => candidate.origin !== base.origin));
}

mirrorUrls = dedupeUrls([
  ...deriveDefaultMirrorUrls(baseUrl),
  ...parseUrlList(mirrorArgs, "SEO_MIRROR_URLS"),
]);
blockedUrls = parseUrlList(blockedArgs, "SEO_BLOCKED_URLS");

function toUrl(pathname, origin = baseUrl) {
  return new URL(pathname, origin).toString();
}

async function requestUrl(url, method = "GET") {
  const response = await fetch(url, {
    method,
    redirect: "manual",
    headers: {
      "user-agent": "ncfg-seo-check/1.0",
      accept: "*/*",
    },
  });

  return response;
}

async function request(pathname, method = "GET", origin = baseUrl) {
  return requestUrl(toUrl(pathname, origin), method);
}

async function readText(pathname, origin = baseUrl) {
  const response = await request(pathname, "GET", origin);
  const body = await response.text();
  return { response, body };
}

function trimTrailingSlash(pathname) {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function locationPathname(locationHeaderValue) {
  if (!locationHeaderValue) return null;

  try {
    return trimTrailingSlash(new URL(locationHeaderValue, baseUrl).pathname);
  } catch {
    return null;
  }
}

function locationUrl(locationHeaderValue, origin) {
  if (!locationHeaderValue) return null;

  try {
    return new URL(locationHeaderValue, origin);
  } catch {
    return null;
  }
}

function normalizedOriginPathAndSearch(url) {
  return `${url.origin}${trimTrailingSlash(url.pathname)}${url.search}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasSitemapEntryWithLastmod(body, url) {
  const escapedUrl = escapeRegExp(url);
  return new RegExp(
    `<url>\\s*<loc>${escapedUrl}</loc>[\\s\\S]*?<lastmod>[^<]+</lastmod>[\\s\\S]*?</url>`,
    "i"
  ).test(body);
}

const redirectChecks = [{ from: "/news", to: "/blog" }];
const mirrorChecks = [
  { from: "/", to: "/" },
  { from: "/companies", to: "/companies" },
  { from: "/news", to: "/blog" },
  { from: "/robots.txt", to: "/robots.txt" },
  { from: "/sitemap.xml", to: "/sitemap.xml" },
];

const goneChecks = ["/wp-login.php", "/xmlrpc.php", "/feed"];

const failures = [];
let passed = 0;

function ok(message) {
  console.log(`PASS ${message}`);
  passed += 1;
}

function fail(message) {
  console.error(`FAIL ${message}`);
  failures.push(message);
}

async function checkRobots() {
  const { response, body } = await readText("/robots.txt");

  if (response.status !== 200) {
    fail(`/robots.txt status expected 200, got ${response.status}`);
    return;
  }

  const hasSitemap = body.toLowerCase().includes("sitemap:");
  if (!hasSitemap) {
    fail("/robots.txt does not contain Sitemap directive");
    return;
  }

  if (/^\s*host:/im.test(body)) {
    fail("/robots.txt should not contain Host directive");
    return;
  }

  ok("/robots.txt is available, contains sitemap directive, and omits Host directive");
}

async function checkSitemap() {
  const { response, body } = await readText("/sitemap.xml");

  if (response.status !== 200) {
    fail(`/sitemap.xml status expected 200, got ${response.status}`);
    return;
  }

  const lowerBody = body.toLowerCase();
  const isXml =
    lowerBody.includes("<?xml") &&
    (lowerBody.includes("<urlset") || lowerBody.includes("<sitemapindex"));

  if (!isXml) {
    fail("/sitemap.xml response does not look like XML sitemap");
    return;
  }

  ok("/sitemap.xml is available and valid-looking");

  for (const pathname of ["/", "/companies", "/individuals", "/about", "/blog"]) {
    const url = toUrl(pathname);

    if (!hasSitemapEntryWithLastmod(body, url)) {
      fail(`/sitemap.xml is missing <lastmod> for ${url}`);
      continue;
    }

    ok(`/sitemap.xml includes <lastmod> for ${url}`);
  }
}

async function checkRedirects() {
  for (const check of redirectChecks) {
    const response = await request(check.from, "GET");
    const location = response.headers.get("location");
    const targetPath = locationPathname(location);
    const expectedPath = trimTrailingSlash(check.to);

    if (response.status !== 301) {
      fail(`${check.from} expected 301, got ${response.status}`);
      continue;
    }

    if (targetPath !== expectedPath) {
      fail(
        `${check.from} expected Location -> ${expectedPath}, got ${targetPath ?? "<missing>"}`
      );
      continue;
    }

    ok(`${check.from} -> ${expectedPath} (301)`);
  }
}

async function checkGone() {
  for (const pathname of goneChecks) {
    const response = await request(pathname, "GET");

    if (response.status !== 410) {
      fail(`${pathname} expected 410, got ${response.status}`);
      continue;
    }

    ok(`${pathname} returns 410`);
  }
}

async function checkMirrors() {
  for (const mirrorUrl of mirrorUrls) {
    for (const check of mirrorChecks) {
      const sourceUrl = new URL(check.from, mirrorUrl);
      const expectedUrl = new URL(check.to, baseUrl);
      const expectedTarget = normalizedOriginPathAndSearch(expectedUrl);
      const response = await requestUrl(sourceUrl);
      const firstTargetUrl = locationUrl(response.headers.get("location"), sourceUrl);
      const firstTarget = firstTargetUrl
        ? normalizedOriginPathAndSearch(firstTargetUrl)
        : null;

      if (response.status !== 301) {
        fail(`[mirror ${mirrorUrl.origin}] ${check.from} expected 301, got ${response.status}`);
        continue;
      }

      if (firstTarget === expectedTarget) {
        ok(`[mirror ${mirrorUrl.origin}] ${check.from} -> ${expectedTarget} (301)`);
        continue;
      }

      // Yandex API Gateway upgrades custom-domain HTTP requests before they
      // reach the application. Permit only that exact transport hop, then
      // require the application redirect to reach the canonical URL.
      if (sourceUrl.protocol !== "http:") {
        fail(
          `[mirror ${mirrorUrl.origin}] ${check.from} expected Location -> ${expectedTarget}, got ${firstTarget ?? "<missing>"}`
        );
        continue;
      }

      const expectedHttpsUpgradeUrl = new URL(sourceUrl);
      expectedHttpsUpgradeUrl.protocol = "https:";
      expectedHttpsUpgradeUrl.port = "";
      const expectedHttpsUpgrade = normalizedOriginPathAndSearch(expectedHttpsUpgradeUrl);

      if (!firstTargetUrl || firstTarget !== expectedHttpsUpgrade) {
        fail(
          `[mirror ${mirrorUrl.origin}] ${check.from} expected Location -> ${expectedTarget} or gateway HTTPS upgrade -> ${expectedHttpsUpgrade}, got ${firstTarget ?? "<missing>"}`
        );
        continue;
      }

      const canonicalResponse = await requestUrl(firstTargetUrl);
      const canonicalTargetUrl = locationUrl(
        canonicalResponse.headers.get("location"),
        firstTargetUrl
      );
      const canonicalTarget = canonicalTargetUrl
        ? normalizedOriginPathAndSearch(canonicalTargetUrl)
        : null;

      if (canonicalResponse.status !== 301) {
        fail(
          `[mirror ${mirrorUrl.origin}] ${check.from} gateway HTTPS upgrade reached ${firstTarget}, expected canonical 301, got ${canonicalResponse.status}`
        );
        continue;
      }

      if (canonicalTarget !== expectedTarget) {
        fail(
          `[mirror ${mirrorUrl.origin}] ${check.from} gateway HTTPS upgrade expected canonical Location -> ${expectedTarget}, got ${canonicalTarget ?? "<missing>"}`
        );
        continue;
      }

      ok(
        `[mirror ${mirrorUrl.origin}] ${check.from} -> ${firstTarget} -> ${expectedTarget} (2x301)`
      );
    }
  }
}

async function checkBlockedUrls() {
  for (const blockedUrl of blockedUrls) {
    const response = await request("/", "GET", blockedUrl);

    if (response.status !== 401 && response.status !== 403) {
      fail(`[blocked ${blockedUrl.origin}] / expected 401 or 403, got ${response.status}`);
      continue;
    }

    ok(`[blocked ${blockedUrl.origin}] / returns ${response.status}`);
  }
}

async function run() {
  console.log(`Checking SEO endpoints for ${baseUrl.origin}`);

  await checkRobots();
  await checkSitemap();
  await checkRedirects();
  await checkGone();
  await checkMirrors();
  await checkBlockedUrls();

  if (failures.length > 0) {
    console.error(`\nResult: ${passed} passed, ${failures.length} failed`);
    process.exit(1);
  }

  console.log(`\nResult: all ${passed} checks passed`);
}

run().catch((error) => {
  console.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
