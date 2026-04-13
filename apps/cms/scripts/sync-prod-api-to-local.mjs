#!/usr/bin/env node

import process from 'node:process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createStrapi } = require('@strapi/strapi');

const PROD_URL = (process.env.PROD_STRAPI_URL || 'https://admin.ncfg.ru').replace(/\/+$/, '');
const PROD_API_TOKEN = process.env.STRAPI_PROD_API_TOKEN;
const PAGE_SIZE = 100;

if (!PROD_API_TOKEN) {
  console.error('[sync-prod-api-to-local] Missing STRAPI_PROD_API_TOKEN');
  process.exit(1);
}

function withApiPath(path) {
  return `${PROD_URL}/api/${path.replace(/^\/+/, '')}`;
}

function appendArrayParams(params, key, values) {
  values.forEach((value, index) => {
    params.append(`${key}[${index}]`, String(value));
  });
}

async function fetchJSON(url) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${PROD_API_TOKEN}`,
    },
  });

  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON from ${url}: ${text.slice(0, 200)}`);
  }

  if (!response.ok || payload?.error) {
    const message = payload?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Remote API error at ${url}: ${message}`);
  }

  return payload;
}

async function fetchCollection(endpoint, options = {}) {
  const {
    fields = [],
    populate = [],
    sort = [],
  } = options;

  const all = [];
  let page = 1;

  while (true) {
    const params = new URLSearchParams();
    params.set('pagination[page]', String(page));
    params.set('pagination[pageSize]', String(PAGE_SIZE));
    appendArrayParams(params, 'fields', fields);
    appendArrayParams(params, 'populate', populate);
    appendArrayParams(params, 'sort', sort);

    const url = `${withApiPath(endpoint)}?${params.toString()}`;
    const payload = await fetchJSON(url);
    const items = Array.isArray(payload?.data) ? payload.data : [];

    all.push(...items);

    const pageCount = Number(payload?.meta?.pagination?.pageCount || 1);
    if (page >= pageCount || items.length < PAGE_SIZE) break;
    page += 1;
  }

  return all;
}

async function fetchSingle(endpoint, options = {}) {
  const { populate = [] } = options;
  const params = new URLSearchParams();
  appendArrayParams(params, 'populate', populate);
  const qs = params.toString();
  const url = qs ? `${withApiPath(endpoint)}?${qs}` : withApiPath(endpoint);
  const payload = await fetchJSON(url);
  return payload?.data ?? null;
}

function buildMediaResolver(localFiles) {
  const byHash = new Map();
  const byName = new Map();

  for (const file of localFiles) {
    if (file?.hash) byHash.set(file.hash, Number(file.id));
    if (file?.name) byName.set(file.name, Number(file.id));
  }

  const missing = new Set();

  const resolve = (media) => {
    if (!media || typeof media !== 'object') return null;

    if (typeof media.hash === 'string' && byHash.has(media.hash)) {
      return byHash.get(media.hash) ?? null;
    }

    if (typeof media.name === 'string' && byName.has(media.name)) {
      return byName.get(media.name) ?? null;
    }

    const key = `${media.hash ?? ''}|${media.name ?? ''}`;
    if (key !== '|') missing.add(key);

    return null;
  };

  return { resolve, missing };
}

async function upsertBySlug(documents, item, data, options = {}) {
  const { publish = true } = options;
  const existing = await documents.findFirst({
    fields: ['documentId', 'slug'],
    filters: {
      slug: {
        $eq: item.slug,
      },
    },
  });

  if (existing?.documentId) {
    await documents.update({
      documentId: existing.documentId,
      data,
    });

    if (publish) {
      await documents.publish({
        documentId: existing.documentId,
      });
    }

    return { action: 'updated', documentId: existing.documentId };
  }

  const created = await documents.create({ data });

  if (publish) {
    await documents.publish({
      documentId: created.documentId,
    });
  }

  return { action: 'created', documentId: created.documentId };
}

async function upsertSingle(documents, data) {
  const existing = await documents.findFirst({
    fields: ['documentId'],
  });

  if (existing?.documentId) {
    await documents.update({
      documentId: existing.documentId,
      data,
    });
    return existing.documentId;
  }

  const created = await documents.create({ data });
  return created.documentId;
}

async function pruneBySlug(documents, remoteSlugs) {
  const local = await documents.findMany({
    fields: ['documentId', 'slug'],
    pagination: { page: 1, pageSize: 1000 },
  });

  let removed = 0;
  const allowed = new Set(remoteSlugs);

  for (const item of local) {
    if (!item?.documentId || !item?.slug) continue;
    if (allowed.has(item.slug)) continue;
    await documents.delete({
      documentId: item.documentId,
    });
    removed += 1;
  }

  return removed;
}

async function prunePeople(documents, remoteKeys) {
  const local = await documents.findMany({
    fields: ['documentId', 'fullName', 'position', 'order'],
    pagination: { page: 1, pageSize: 1000 },
  });

  let removed = 0;

  for (const item of local) {
    if (!item?.documentId) continue;
    const key = `${item.fullName ?? ''}|${item.position ?? ''}|${String(item.order ?? 0)}`;
    if (remoteKeys.has(key)) continue;
    await documents.delete({
      documentId: item.documentId,
    });
    removed += 1;
  }

  return removed;
}

function mapTextItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({ text: item?.text ? String(item.text) : '' }))
    .filter((item) => item.text.length > 0);
}

function mapExamples(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      exampleId: item?.exampleId ? String(item.exampleId) : null,
      title: item?.title ? String(item.title) : '',
      type: item?.type ?? null,
      link: item?.link ? String(item.link) : null,
      description: item?.description ? String(item.description) : null,
      notes: item?.notes ? String(item.notes) : null,
      durationMinutes: item?.durationMinutes ? String(item.durationMinutes) : null,
    }))
    .filter((item) => item.title.length > 0);
}

function mapWebinars(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      title: item?.title ? String(item.title) : '',
      items: mapTextItems(item?.items),
    }))
    .filter((item) => item.title.length > 0 || item.items.length > 0);
}

function mapCta(cta) {
  if (!cta || typeof cta !== 'object') return null;
  if (!cta.label) return null;
  return {
    label: String(cta.label),
    type: cta.type ?? 'form',
  };
}

async function main() {
  const app = await createStrapi().load();

  try {
    const localFiles = await app.db.connection('files').select('id', 'hash', 'name');
    const media = buildMediaResolver(localFiles);

    const [
      remoteBlogCategories,
      remoteServiceCategories,
      remoteNews,
      remoteServices,
      remotePeople,
      remoteRecommendations,
      remoteTeamConfig,
      remoteExpertConfig,
    ] = await Promise.all([
      fetchCollection('blog-categories', { sort: ['order:asc', 'title:asc'] }),
      fetchCollection('service-categories', { sort: ['order:asc', 'title:asc'] }),
      fetchCollection('news-articles', {
        populate: ['anonsImage', 'category'],
        sort: ['publishedDate:desc', 'createdAt:desc'],
      }),
      fetchCollection('services', {
        populate: ['benefits', 'howWeWork', 'webinars', 'examples', 'cta', 'category'],
        sort: ['order:asc', 'title:asc'],
      }),
      fetchCollection('people', {
        populate: ['photo'],
        sort: ['order:asc', 'fullName:asc'],
      }),
      fetchCollection('recommendations', {
        sort: ['order:asc', 'company:asc'],
      }),
      fetchSingle('team-config', { populate: ['members'] }),
      fetchSingle('expert-config', { populate: ['experts'] }),
    ]);

    const blogCategoryDocs = app.documents('api::blog-category.blog-category');
    const serviceCategoryDocs = app.documents('api::service-category.service-category');
    const newsDocs = app.documents('api::news-article.news-article');
    const serviceDocs = app.documents('api::service.service');
    const peopleDocs = app.documents('api::person.person');
    const recommendationDocs = app.documents('api::recommendation.recommendation');
    const teamConfigDocs = app.documents('api::team-config.team-config');
    const expertConfigDocs = app.documents('api::expert-config.expert-config');

    const categoryBySlug = new Map();
    for (const category of remoteBlogCategories) {
      if (!category?.slug) continue;
      const result = await upsertBySlug(
        blogCategoryDocs,
        category,
        {
          title: category.title,
          slug: category.slug,
          order: Number(category.order ?? 0),
          description: category.description ?? null,
        },
        { publish: false }
      );
      categoryBySlug.set(category.slug, result.documentId);
    }

    const serviceCategoryBySlug = new Map();
    for (const category of remoteServiceCategories) {
      if (!category?.slug) continue;
      const result = await upsertBySlug(
        serviceCategoryDocs,
        category,
        {
          title: category.title,
          slug: category.slug,
          description: category.description ?? null,
          order: Number(category.order ?? 0),
        },
        { publish: true }
      );
      serviceCategoryBySlug.set(category.slug, result.documentId);
    }

    const teamDocumentId = await upsertSingle(teamConfigDocs, {
      title: remoteTeamConfig?.title ?? 'Наша команда',
    });
    const expertDocumentId = await upsertSingle(expertConfigDocs, {
      title: remoteExpertConfig?.title ?? 'Наши эксперты',
    });

    const teamMemberSet = new Set(
      Array.isArray(remoteTeamConfig?.members)
        ? remoteTeamConfig.members.map((item) => item.documentId).filter(Boolean)
        : []
    );
    const expertMemberSet = new Set(
      Array.isArray(remoteExpertConfig?.experts)
        ? remoteExpertConfig.experts.map((item) => item.documentId).filter(Boolean)
        : []
    );

    for (const person of remotePeople) {
      const photoId = media.resolve(person.photo);
      const keyFilters = {
        fullName: { $eq: person.fullName ?? '' },
        position: { $eq: person.position ?? null },
        order: { $eq: Number(person.order ?? 0) },
      };

      const existing = await peopleDocs.findFirst({
        fields: ['documentId'],
        filters: keyFilters,
      });

      const data = {
        fullName: person.fullName ?? '',
        photo: photoId,
        position: person.position ?? null,
        headline: person.headline ?? null,
        experienceYears:
          typeof person.experienceYears === 'number' ? person.experienceYears : null,
        order: Number(person.order ?? 0),
        teamGroup: teamMemberSet.has(person.documentId) ? { documentId: teamDocumentId } : null,
        expertGroup: expertMemberSet.has(person.documentId) ? { documentId: expertDocumentId } : null,
      };

      if (existing?.documentId) {
        await peopleDocs.update({
          documentId: existing.documentId,
          data,
        });
        await peopleDocs.publish({
          documentId: existing.documentId,
        });
      } else {
        const created = await peopleDocs.create({ data });
        await peopleDocs.publish({
          documentId: created.documentId,
        });
      }
    }

    for (const service of remoteServices) {
      if (!service?.slug) continue;
      const categorySlug = service.category?.slug ?? null;
      const categoryDocumentId = categorySlug ? serviceCategoryBySlug.get(categorySlug) ?? null : null;

      await upsertBySlug(
        serviceDocs,
        service,
        {
          title: service.title,
          slug: service.slug,
          order: Number(service.order ?? 0),
          shortDescription: service.shortDescription ?? null,
          fullDescriptionTitle: service.fullDescriptionTitle ?? null,
          fullDescription: service.fullDescription ?? null,
          benefitsTitle: service.benefitsTitle ?? null,
          benefits: mapTextItems(service.benefits),
          htmlSectionBefore: service.htmlSectionBefore ?? null,
          usefulInformation: service.usefulInformation ?? null,
          howWeWorkTitle: service.howWeWorkTitle ?? null,
          howWeWork: mapTextItems(service.howWeWork),
          webinarsTitle: service.webinarsTitle ?? null,
          webinars: mapWebinars(service.webinars),
          htmlSectionAfter: service.htmlSectionAfter ?? null,
          examplesTitle: service.examplesTitle ?? null,
          examples: mapExamples(service.examples),
          cta: mapCta(service.cta),
          category: categoryDocumentId ? { documentId: categoryDocumentId } : null,
        },
        { publish: true }
      );
    }

    for (const item of remoteNews) {
      if (!item?.slug) continue;
      const categorySlug = item.category?.slug ?? null;
      const categoryDocumentId = categorySlug ? categoryBySlug.get(categorySlug) ?? null : null;
      const anonsId = media.resolve(item.anonsImage);

      await upsertBySlug(
        newsDocs,
        item,
        {
          title: item.title,
          slug: item.slug,
          body: item.body ?? null,
          anonsImage: anonsId,
          postImage: anonsId,
          category: categoryDocumentId ? { documentId: categoryDocumentId } : null,
          publishedDate: item.publishedDate ?? null,
        },
        { publish: true }
      );
    }

    for (const item of remoteRecommendations) {
      if (!item?.slug) continue;
      await upsertBySlug(
        recommendationDocs,
        item,
        {
          company: item.company,
          slug: item.slug,
          quote: item.quote,
          fullQuote: item.fullQuote ?? null,
          logoImg: item.logoImg ?? null,
          sourceLink: item.sourceLink ?? null,
          order: Number(item.order ?? 0),
        },
        { publish: true }
      );
    }

    const remoteBlogSlugs = remoteBlogCategories.map((item) => item.slug).filter(Boolean);
    const remoteServiceCategorySlugs = remoteServiceCategories.map((item) => item.slug).filter(Boolean);
    const remoteServiceSlugs = remoteServices.map((item) => item.slug).filter(Boolean);
    const remoteNewsSlugs = remoteNews.map((item) => item.slug).filter(Boolean);
    const remoteRecommendationSlugs = remoteRecommendations.map((item) => item.slug).filter(Boolean);
    const remotePeopleKeys = new Set(
      remotePeople.map((item) => `${item.fullName ?? ''}|${item.position ?? ''}|${String(item.order ?? 0)}`)
    );

    const [removedBlogCategories, removedServiceCategories, removedServices, removedNews, removedRecommendations, removedPeople] =
      await Promise.all([
        pruneBySlug(blogCategoryDocs, remoteBlogSlugs),
        pruneBySlug(serviceCategoryDocs, remoteServiceCategorySlugs),
        pruneBySlug(serviceDocs, remoteServiceSlugs),
        pruneBySlug(newsDocs, remoteNewsSlugs),
        pruneBySlug(recommendationDocs, remoteRecommendationSlugs),
        prunePeople(peopleDocs, remotePeopleKeys),
      ]);

    console.log(`[sync-prod-api-to-local] blog-categories: ${remoteBlogCategories.length}`);
    console.log(`[sync-prod-api-to-local] service-categories: ${remoteServiceCategories.length}`);
    console.log(`[sync-prod-api-to-local] services: ${remoteServices.length}`);
    console.log(`[sync-prod-api-to-local] news-articles: ${remoteNews.length}`);
    console.log(`[sync-prod-api-to-local] people: ${remotePeople.length}`);
    console.log(`[sync-prod-api-to-local] recommendations: ${remoteRecommendations.length}`);
    console.log(
      `[sync-prod-api-to-local] removed stale: blog=${removedBlogCategories}, service-categories=${removedServiceCategories}, services=${removedServices}, news=${removedNews}, people=${removedPeople}, recommendations=${removedRecommendations}`
    );
    console.log(`[sync-prod-api-to-local] missing media mappings: ${media.missing.size}`);
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[sync-prod-api-to-local] failed: ${message}`);
  process.exit(1);
});
