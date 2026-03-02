#!/usr/bin/env node

const baseArg = process.argv[2] || process.env.BASE_URL || "https://ncfg.ru";

let baseUrl;

try {
  baseUrl = new URL(baseArg);
} catch {
  console.error(`Invalid base URL: ${baseArg}`);
  process.exit(1);
}

function toUrl(pathname) {
  return new URL(pathname, baseUrl).toString();
}

async function request(pathname, method = "GET") {
  const response = await fetch(toUrl(pathname), {
    method,
    redirect: "manual",
    headers: {
      "user-agent": "ncfg-seo-check/1.0",
      accept: "*/*",
    },
  });

  return response;
}

async function readText(pathname) {
  const response = await request(pathname, "GET");
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

const redirectChecks = [
  { from: "/klienty-partnery", to: "/companies" },
  { from: "/news", to: "/blog" },
  { from: "/privacy-policy", to: "/politika-konfidencialnosti" },
  { from: "/articles/za-dengi", to: "/blog/za-dengi" },
  { from: "/services/financial-diagnostics", to: "/companies/finansovaya-diagnostika" },
  {
    from: "/companies/integrated_program",
    to: "/companies/kompleksnaya-programma",
  },
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

async function run() {
  console.log(`Checking SEO endpoints for ${baseUrl.origin}`);

  await checkRobots();
  await checkSitemap();
  await checkRedirects();
  await checkGone();

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
