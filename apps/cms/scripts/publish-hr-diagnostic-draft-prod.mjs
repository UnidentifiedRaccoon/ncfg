#!/usr/bin/env node

/**
 * Publishes the existing production Strapi draft for the HR diagnostic test.
 *
 * Usage:
 *   STRAPI_URL=https://admin.ncfg.ru STRAPI_TOKEN=<token> node apps/cms/scripts/publish-hr-diagnostic-draft-prod.mjs
 *
 * Required token permissions:
 *   STRAPI_TOKEN: hr-diagnostic-test update
 *   STRAPI_READ_TOKEN (optional): hr-diagnostic-test find
 */

import process from "node:process";
import { isDeepStrictEqual } from "node:util";

const STRAPI_URL = process.env.STRAPI_URL?.replace(/\/+$/, "");
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const STRAPI_READ_TOKEN = process.env.STRAPI_READ_TOKEN;
const SLUG = process.env.HR_DIAGNOSTIC_SLUG || "hr";

if (!STRAPI_URL || !STRAPI_TOKEN) {
  console.error(
    "Missing env vars. Usage:\n  STRAPI_URL=https://admin.ncfg.ru STRAPI_TOKEN=<token> node apps/cms/scripts/publish-hr-diagnostic-draft-prod.mjs"
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
const POPULATE_PARAMS = {
  "populate[groups][populate][questions][populate][options]": true,
  "populate[targetCompletion]": true,
  "populate[nonTargetCompletion]": true,
};

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
        `[publish-hr] ${method} ${path} returned ${res.status}; retrying in ${delayMs}ms`
      );
      await sleep(delayMs);
      continue;
    }

    throw new Error(`${method} ${path} -> ${res.status}: ${text}`);
  }

  return null;
}

function compact(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
  );
}

function normalizeOption(option) {
  return compact({
    key: option.key,
    label: option.label,
    exclusive: option.exclusive,
  });
}

function normalizeQuestion(question) {
  return compact({
    key: question.key,
    title: question.title,
    subTitle: question.subTitle,
    description: question.description,
    type: question.type,
    required: question.required,
    allowOther: question.allowOther,
    maxSelections: question.maxSelections,
    showWhen: question.showWhen,
    options: Array.isArray(question.options)
      ? question.options.map(normalizeOption)
      : [],
  });
}

function normalizeGroup(group) {
  return compact({
    title: group.title,
    questions: Array.isArray(group.questions)
      ? group.questions.map(normalizeQuestion)
      : [],
  });
}

function normalizeCompletionScreen(screen) {
  if (!screen) {
    return null;
  }

  return compact({
    title: screen.title,
    body: screen.body,
    ctaLabel: screen.ctaLabel,
    ctaHref: screen.ctaHref,
    secondaryText: screen.secondaryText,
  });
}

function normalizeTest(test) {
  return compact({
    slug: test.slug,
    title: test.title,
    projectTitle: test.projectTitle,
    introLead: test.introLead,
    introBody: test.introBody,
    introGiftText: test.introGiftText,
    anonymousNotice: test.anonymousNotice,
    groups: Array.isArray(test.groups) ? test.groups.map(normalizeGroup) : [],
    targetCompletion: normalizeCompletionScreen(test.targetCompletion),
    nonTargetCompletion: normalizeCompletionScreen(test.nonTargetCompletion),
  });
}

async function findByStatus(status) {
  const query = buildQuery({
    "filters[slug][$eq]": SLUG,
    status,
    "pagination[pageSize]": 10,
    ...POPULATE_PARAMS,
  });

  const response = await api(
    "GET",
    `/api/hr-diagnostic-tests${query}`,
    undefined,
    { read: true }
  );
  const data = Array.isArray(response?.data) ? response.data : [];

  if (data.length > 1) {
    console.warn(
      `[publish-hr] Found ${data.length} ${status} records for slug=${SLUG}; using the first one.`
    );
  }

  return data[0] || null;
}

function getQuestionCount(payload) {
  return payload.groups.reduce((count, group) => {
    return count + group.questions.length;
  }, 0);
}

async function publishDraft() {
  const draft = await findByStatus("draft");
  if (!draft?.documentId) {
    throw new Error(`Draft HR diagnostic test not found for slug=${SLUG}`);
  }

  if (draft.publishedAt !== null) {
    console.warn(
      `[publish-hr] Draft lookup for slug=${SLUG} returned a document with publishedAt=${draft.publishedAt}. Continuing with status=draft payload.`
    );
  }

  const payload = normalizeTest(draft);
  if (payload.slug !== SLUG || payload.groups.length === 0) {
    throw new Error(`Invalid draft HR diagnostic payload for slug=${SLUG}`);
  }

  const published = await findByStatus("published");
  const documentId = published?.documentId || draft.documentId;

  await api("PUT", `/api/hr-diagnostic-tests/${documentId}?status=published`, {
    data: payload,
  });

  const updated = await findByStatus("published");
  if (!updated?.documentId) {
    throw new Error(`Published HR diagnostic test not found after update for slug=${SLUG}`);
  }

  const publishedPayload = normalizeTest(updated);
  if (!isDeepStrictEqual(publishedPayload, payload)) {
    throw new Error("Published HR diagnostic test does not match the draft after update");
  }

  return {
    documentId: updated.documentId,
    groupCount: payload.groups.length,
    questionCount: getQuestionCount(payload),
    title: payload.title,
  };
}

async function main() {
  const result = await publishDraft();
  console.log(
    `[publish-hr] published draft: ${result.documentId}; title="${result.title}"; groups=${result.groupCount}; questions=${result.questionCount}`
  );
}

main().catch((error) => {
  console.error("[publish-hr] failed", error);
  process.exit(1);
});
