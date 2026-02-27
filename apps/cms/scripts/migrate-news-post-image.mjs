#!/usr/bin/env node

import process from 'node:process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createStrapi } = require('@strapi/strapi');

const NEWS_UID = 'api::news-article.news-article';
const PAGE_SIZE = 100;

function hasMedia(value) {
  return Boolean(value && typeof value === 'object' && typeof value.id === 'number');
}

function makeEntryKey(entry) {
  return `${entry.documentId}:${entry.locale ?? 'default'}`;
}

function getLocaleOptions(entry) {
  return entry.locale ? { locale: entry.locale } : {};
}

async function fetchAllByStatus(documents, status) {
  const entries = [];
  let page = 1;

  while (true) {
    const chunk = await documents.findMany({
      status,
      populate: ['anonsImage', 'postImage'],
      pagination: { page, pageSize: PAGE_SIZE },
      sort: ['updatedAt:desc', 'createdAt:desc'],
    });

    if (!Array.isArray(chunk) || chunk.length === 0) break;

    entries.push(...chunk);

    if (chunk.length < PAGE_SIZE) break;
    page += 1;
  }

  return entries;
}

async function migrateStatusEntries(documents, entries, options) {
  const { publishAfterUpdate, seenKeys, stats } = options;

  for (const entry of entries) {
    if (!entry?.documentId) {
      stats.processed += 1;
      stats.skipped += 1;
      continue;
    }

    const entryKey = makeEntryKey(entry);
    if (seenKeys.has(entryKey)) continue;
    seenKeys.add(entryKey);

    stats.processed += 1;

    if (hasMedia(entry.postImage) || !hasMedia(entry.anonsImage)) {
      stats.skipped += 1;
      continue;
    }

    const localeOptions = getLocaleOptions(entry);

    try {
      await documents.update({
        documentId: entry.documentId,
        data: {
          postImage: entry.anonsImage.id,
        },
        ...localeOptions,
      });
      stats.updated += 1;

      if (publishAfterUpdate) {
        await documents.publish({
          documentId: entry.documentId,
          ...localeOptions,
        });
        stats.published += 1;
      }
    } catch (error) {
      stats.failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `[news-post-image] failed for documentId=${entry.documentId} locale=${entry.locale ?? 'default'}: ${message}`
      );
    }
  }
}

async function main() {
  const app = await createStrapi().load();

  try {
    const documents = app.documents(NEWS_UID);
    const publishedEntries = await fetchAllByStatus(documents, 'published');
    const draftEntries = await fetchAllByStatus(documents, 'draft');

    const stats = {
      processed: 0,
      skipped: 0,
      updated: 0,
      published: 0,
      failed: 0,
    };

    const seenKeys = new Set();

    await migrateStatusEntries(documents, publishedEntries, {
      publishAfterUpdate: true,
      seenKeys,
      stats,
    });

    await migrateStatusEntries(documents, draftEntries, {
      publishAfterUpdate: false,
      seenKeys,
      stats,
    });

    console.log(`[news-post-image] processed=${stats.processed}`);
    console.log(`[news-post-image] skipped=${stats.skipped}`);
    console.log(`[news-post-image] updated=${stats.updated}`);
    console.log(`[news-post-image] published=${stats.published}`);
    console.log(`[news-post-image] failed=${stats.failed}`);

    if (stats.failed > 0) {
      process.exitCode = 1;
    }
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[news-post-image] migration failed: ${message}`);
  process.exit(1);
});
