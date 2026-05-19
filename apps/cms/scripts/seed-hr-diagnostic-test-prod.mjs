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

function encodeFilterValue(value) {
  return encodeURIComponent(String(value));
}

async function api(method, path, body, { read = false } = {}) {
  const url = `${STRAPI_URL}${path}`;
  const opts = { method, headers: read ? readHeaders : headers };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(url, opts);
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

async function loadPayload() {
  return JSON.parse(await readFile(DATA_URL, "utf8"));
}

async function findBySlug(payload) {
  return api(
    "GET",
    `/api/hr-diagnostic-tests?filters[slug][$eq]=${encodeFilterValue(
      payload.slug
    )}&pagination[pageSize]=10`,
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
