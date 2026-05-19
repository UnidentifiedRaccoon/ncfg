#!/usr/bin/env node

/**
 * HTTP seed script for the CMS-driven HR diagnostic test.
 *
 * Usage:
 *   STRAPI_URL=https://admin.ncfg.ru STRAPI_TOKEN=<token> node apps/cms/scripts/seed-hr-diagnostic-test-prod.mjs
 *
 * Required token permissions:
 *   STRAPI_TOKEN: hr-diagnostic-test create, update
 *   STRAPI_READ_TOKEN (optional): hr-diagnostic-test find
 */

import { readFile } from "node:fs/promises";
import process from "node:process";

const STRAPI_URL = process.env.STRAPI_URL?.replace(/\/+$/, "");
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const STRAPI_READ_TOKEN = process.env.STRAPI_READ_TOKEN;
const DATA_URL = new URL("./data/hr-diagnostic.json", import.meta.url);

if (!STRAPI_URL || !STRAPI_TOKEN) {
  console.error(
    "Missing env vars. Usage:\n  STRAPI_URL=https://admin.ncfg.ru STRAPI_TOKEN=<token> node apps/cms/scripts/seed-hr-diagnostic-test-prod.mjs"
  );
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${STRAPI_TOKEN.replace(/^Bearer\s+/i, "")}`,
};

const readHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${(STRAPI_READ_TOKEN || STRAPI_TOKEN).replace(/^Bearer\s+/i, "")}`,
};

const RETRY_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function api(method, path, body, { read = false, retries = 3 } = {}) {
  const url = `${STRAPI_URL}${path}`;
  const opts = { method, headers: read ? readHeaders : headers };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const res = await fetch(url, opts);
    const text = await res.text();

    if (res.ok) {
      return text ? JSON.parse(text) : null;
    }

    if (attempt < retries && RETRY_STATUSES.has(res.status)) {
      const delayMs = 1000 * (attempt + 1);
      console.warn(
        `[seed-hr] ${method} ${path} returned ${res.status}; retrying in ${delayMs}ms`
      );
      await sleep(delayMs);
      continue;
    }

    throw new Error(`${method} ${path} -> ${res.status}: ${text}`);
  }

  return null;
}

async function loadPayload() {
  return JSON.parse(await readFile(DATA_URL, "utf8"));
}

async function findBySlug(payload) {
  const query = buildQuery({
    "filters[slug][$eq]": payload.slug,
    "pagination[pageSize]": 10,
  });

  return api(
    "GET",
    `/api/hr-diagnostic-tests${query}`,
    undefined,
    { read: true }
  );
}

async function upsertTest(payload) {
  const { data } = await findBySlug(payload);
  const existing = Array.isArray(data) ? data : [];

  if (existing.length > 1) {
    console.warn(
      `[seed-hr] Found ${existing.length} records for slug=${payload.slug}; updating the first one.`
    );
  }

  if (existing[0]?.documentId) {
    const docId = existing[0].documentId;
    await api("PUT", `/api/hr-diagnostic-tests/${docId}?status=published`, {
      data: payload,
    });
    return { action: "updated", documentId: docId };
  }

  const created = await api("POST", "/api/hr-diagnostic-tests?status=published", {
    data: payload,
  });
  const docId = created?.data?.documentId;
  return { action: "created", documentId: docId };
}

async function main() {
  const payload = await loadPayload();
  const result = await upsertTest(payload);

  console.log(`[seed-hr] test ${result.action}: ${result.documentId}`);
}

main().catch((error) => {
  console.error("[seed-hr] failed", error);
  process.exit(1);
});
