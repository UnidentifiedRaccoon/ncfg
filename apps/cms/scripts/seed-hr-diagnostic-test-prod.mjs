#!/usr/bin/env node

/**
 * HTTP seed script for the CMS-driven HR diagnostic test.
 *
 * Usage:
 *   STRAPI_URL=https://admin.ncfg.ru STRAPI_TOKEN=<token> node apps/cms/scripts/seed-hr-diagnostic-test-prod.mjs
 *
 * Required token permissions:
 *   hr-diagnostic-test: find, findOne, create, update
 */

import { readFile } from "node:fs/promises";
import process from "node:process";

const STRAPI_URL = process.env.STRAPI_URL?.replace(/\/+$/, "");
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const DATA_URL = new URL("./data/hr-diagnostic-v1.json", import.meta.url);

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

function encodeFilterValue(value) {
  return encodeURIComponent(String(value));
}

async function api(method, path, body) {
  const url = `${STRAPI_URL}${path}`;
  const opts = { method, headers };
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

async function findBySlugAndVersion(payload) {
  return api(
    "GET",
    `/api/hr-diagnostic-tests?filters[slug][$eq]=${encodeFilterValue(
      payload.slug
    )}&filters[version][$eq]=${encodeFilterValue(payload.version)}&pagination[pageSize]=10`
  );
}

async function deactivateOtherActiveTests(payload, activeDocumentId) {
  if (!payload.isActive) {
    return [];
  }

  const { data } = await api(
    "GET",
    `/api/hr-diagnostic-tests?filters[slug][$eq]=${encodeFilterValue(
      payload.slug
    )}&filters[isActive][$eq]=true&pagination[pageSize]=100`
  );
  const items = Array.isArray(data) ? data : [];
  const changed = [];

  for (const item of items) {
    if (!item?.documentId || item.documentId === activeDocumentId) {
      continue;
    }

    await api("PUT", `/api/hr-diagnostic-tests/${item.documentId}?status=published`, {
      data: {
        isActive: false,
      },
    });
    changed.push(item.documentId);
  }

  return changed;
}

async function upsertTest(payload) {
  const { data } = await findBySlugAndVersion(payload);
  const existing = Array.isArray(data) ? data : [];

  if (existing.length > 1) {
    console.warn(
      `[seed-hr] Found ${existing.length} records for slug=${payload.slug} version=${payload.version}; updating the first one.`
    );
  }

  if (existing[0]?.documentId) {
    const docId = existing[0].documentId;
    await api("PUT", `/api/hr-diagnostic-tests/${docId}?status=published`, {
      data: payload,
    });
    const deactivated = await deactivateOtherActiveTests(payload, docId);
    return { action: "updated", documentId: docId, deactivated };
  }

  const created = await api("POST", "/api/hr-diagnostic-tests?status=published", {
    data: payload,
  });
  const docId = created?.data?.documentId;
  const deactivated = docId ? await deactivateOtherActiveTests(payload, docId) : [];
  return { action: "created", documentId: docId, deactivated };
}

async function main() {
  const payload = await loadPayload();
  const result = await upsertTest(payload);

  console.log(`[seed-hr] test ${result.action}: ${result.documentId}`);
  if (result.deactivated.length > 0) {
    console.log(`[seed-hr] deactivated older active tests: ${result.deactivated.join(", ")}`);
  }
}

main().catch((error) => {
  console.error("[seed-hr] failed", error);
  process.exit(1);
});
