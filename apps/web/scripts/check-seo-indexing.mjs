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

mirrorUrls = parseUrlList(mirrorArgs, "SEO_MIRROR_URLS");
blockedUrls = parseUrlList(blockedArgs, "SEO_BLOCKED_URLS");

function toUrl(pathname, origin = baseUrl) {
  return new URL(pathname, origin).toString();
}

async function request(pathname, method = "GET", origin = baseUrl) {
  const response = await fetch(toUrl(pathname, origin), {
    method,
    redirect: "manual",
    headers: {
      "user-agent": "ncfg-seo-check/1.0",
      accept: "*/*",
    },
  });

  return response;
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

function locationOriginAndPathname(locationHeaderValue, origin) {
  if (!locationHeaderValue) return null;

  try {
    const target = new URL(locationHeaderValue, origin);
    return `${target.origin}${trimTrailingSlash(target.pathname)}`;
  } catch {
    return null;
  }
}

const redirectChecks = [{ from: "/news", to: "/blog" }];
const mirrorChecks = [
  { from: "/", to: "/" },
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

  ok("/robots.txt is available and contains sitemap directive");
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
      const response = await request(check.from, "GET", mirrorUrl);
      const location = response.headers.get("location");
      const targetOriginAndPath = locationOriginAndPathname(location, mirrorUrl);
      const expectedOriginAndPath = `${baseUrl.origin}${trimTrailingSlash(check.to)}`;

      if (response.status !== 301) {
        fail(`[mirror ${mirrorUrl.origin}] ${check.from} expected 301, got ${response.status}`);
        continue;
      }

      if (targetOriginAndPath !== expectedOriginAndPath) {
        fail(
          `[mirror ${mirrorUrl.origin}] ${check.from} expected Location -> ${expectedOriginAndPath}, got ${targetOriginAndPath ?? "<missing>"}`
        );
        continue;
      }

      ok(`[mirror ${mirrorUrl.origin}] ${check.from} -> ${expectedOriginAndPath} (301)`);
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
