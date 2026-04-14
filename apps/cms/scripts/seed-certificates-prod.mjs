#!/usr/bin/env node

import process from 'node:process';
import { createHash } from 'node:crypto';
import { extname } from 'node:path';

const DEFAULT_STRAPI_URL = 'https://admin.ncfg.ru';
const DEFAULT_TIMEOUT_MS = 60_000;

const rawArgs = process.argv.slice(2);
const isDryRun = rawArgs.includes('--dry-run');
const STRAPI_URL = (process.env.STRAPI_URL || DEFAULT_STRAPI_URL).replace(/\/+$/, '');
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

const SOURCE_CERTIFICATES = [
  {
    sourceFileId: '1aTokHQ7zdjvhSCjQGDTiFEYFyWrtKMKp',
    slug: 'sber-marathon-financial-literacy',
    title: 'Благодарность за участие в марафоне финансовой грамотности',
    company: 'Сбер',
    year: 2022,
    fileType: 'PDF',
    order: 10,
  },
  {
    sourceFileId: '1eONURQJpW1II48f_2R0K8qEftSvJpNBO',
    slug: 'yaroslavl-government-financial-education',
    title: 'Благодарность за вклад в просветительские инициативы',
    company: 'Правительство Ярославской области',
    year: 2019,
    fileType: 'PDF',
    order: 20,
  },
  {
    sourceFileId: '1Iy5tw8PxRcUh8TA5SaZlKOwdT5lEX155',
    slug: 'financial-planning-institute-expert-thanks',
    title: 'Благодарность эксперту за развитие образовательных программ',
    company: 'Институт Финансового Планирования',
    year: 2015,
    fileType: 'PDF',
    order: 30,
  },
  {
    sourceFileId: '1kGVmJV2IB8jrXPn3512S4dna7sZCqYcm',
    slug: 'tele2-education-partnership',
    title: 'Благодарственное письмо за партнёрство в образовательном проекте',
    company: 'TELE2',
    year: null,
    fileType: 'PDF',
    order: 40,
  },
  {
    sourceFileId: '1r1BbFFmVFvRtq-xV4FUxydTxWGmJoS25',
    slug: 'legrand-joint-training-program',
    title: 'Благодарственное письмо за совместную программу обучения',
    company: 'Legrand',
    year: null,
    fileType: 'PDF',
    order: 50,
  },
  {
    sourceFileId: '1jBgg7qm1541tchR6dhnYpkqizSnrx0yF',
    slug: 'finance-ministry-diploma-2018',
    title: 'Диплом за вклад в развитие финансовой грамотности',
    company: 'Министерство финансов России',
    year: 2018,
    fileType: 'PDF',
    order: 60,
  },
  {
    sourceFileId: '1G7Vm6373iFIZCthshSHkwm7kYsWNpbbo',
    slug: 'crystal-pyramid-diploma-2020',
    title: 'Диплом премии за проекты корпоративного обучения',
    company: 'Хрустальная пирамида',
    year: 2020,
    fileType: 'PDF',
    order: 70,
  },
  {
    sourceFileId: '1NQSwSMvUt90JOvDRjyMs7YNcET29OJLB',
    slug: 'rosgosstrakh-employee-program-thanks',
    title: 'Благодарность за внедрение программ для сотрудников',
    company: 'Росгосстрах',
    year: 2016,
    fileType: 'PDF',
    order: 80,
  },
  {
    sourceFileId: '1aXOW69s3inQxN9N-o77MPB0eiqUInpZZ',
    slug: 'mts-bank-team-support-thanks',
    title: 'Благодарственное письмо за экспертную поддержку команды',
    company: 'МТС Банк',
    year: 2020,
    fileType: 'PDF',
    order: 90,
  },
  {
    sourceFileId: '1ICajLx0455LHmgwi-PzPAcSsBSzl15Nk',
    slug: 'nordea-bank-client-programs',
    title: 'Благодарственное письмо за развитие клиентских программ',
    company: 'Нордеа Банк',
    year: null,
    fileType: 'PDF',
    order: 100,
  },
  {
    sourceFileId: '1WweJcth223wcnZXrw9ksS_KjJCHBk-Ja',
    slug: 'sberbank-methodical-support',
    title: 'Благодарственное письмо за методическую поддержку',
    company: 'Сбербанк России',
    year: null,
    fileType: 'PDF',
    order: 110,
  },
  {
    sourceFileId: '1QLOWZJwC2X4rOmDAFpfDkcmEFGqRTEeN',
    slug: 'chuvash-cabinet-regional-initiatives',
    title: 'Благодарность за реализацию региональных просветительских инициатив',
    company: 'Кабинет Министров Чувашской Республики',
    year: 2019,
    fileType: 'PDF',
    order: 120,
  },
  {
    sourceFileId: '1fQ656l9hx2atcYfV_pcT9Chj7hhXsr6v',
    slug: 'dream-track-fair-thanks',
    title: 'Благодарственное письмо за участие в ярмарке-форуме «Важные идеи на пути к мечте»',
    company: 'Трек мечты / TUMO Moscow',
    year: 2023,
    fileType: 'JPG',
    order: 130,
  },
  {
    sourceFileId: '1oH5pe0jfYHFH0UxzvjMm0ATKwBW7Ctvr',
    slug: 'stonks-aiesec-project-thanks',
    title: 'Благодарственное письмо за помощь в проведении проекта STONKS',
    company: 'STONKS / AIESEC',
    year: 2022,
    fileType: 'JPG',
    order: 140,
  },
  {
    sourceFileId: '1nSCQpPvSk21OO9ANXA0j1G7jJFQXwZfT',
    slug: 'bashkortostan-family-festival-thanks',
    title: 'Благодарность за помощь в проведении финансового семейного фестиваля',
    company: 'Министерство финансов Республики Башкортостан',
    year: 2019,
    fileType: 'PDF',
    order: 150,
  },
  {
    sourceFileId: '1OA4-SHgF8Ac0uteOx8agQWe4faPN_OHq',
    slug: 'banking-award-special-project-2019',
    title: 'Диплом лауреата Национальной банковской премии',
    company: 'Ассоциация российских банков',
    year: 2019,
    fileType: 'PDF',
    order: 160,
  },
  {
    sourceFileId: '1ABLbn9YbHpbXsp7zLc0Aon7E5lwZIyrt',
    slug: 'hsbc-personal-finance-course-thanks',
    title: 'Благодарственное письмо за курс по личному финансовому планированию',
    company: 'HSBC Bank (RR)',
    year: null,
    fileType: 'PDF',
    order: 170,
  },
  {
    sourceFileId: '1KIgPcCY_KNj9QiDHC27VdP3TQSfht1rJ',
    slug: 'mdm-bank-personal-finance-program',
    title: 'Благодарственное письмо за программу «Управление личными финансами»',
    company: 'МДМ Банк',
    year: null,
    fileType: 'PDF',
    order: 180,
  },
  {
    sourceFileId: '1vD1C8oS-IIZfRnhjuIyzwhmKKXfxSyg0',
    slug: 'iblf-financial-literacy-award-2009',
    title: 'Премия «Вклад в повышение финансовой грамотности в Российской Федерации»',
    company: 'International Business Leaders Forum (IBLF)',
    year: 2009,
    fileType: 'PDF',
    order: 190,
  },
  {
    sourceFileId: '1-k-6GJBz0LL533kTT9X68LqjyN4Ng5rX',
    slug: 'raiffeisen-personal-finance-training',
    title: 'Благодарственное письмо за курс по личному финансовому планированию',
    company: 'Райффайзенбанк',
    year: null,
    fileType: 'PDF',
    order: 200,
  },
  {
    sourceFileId: '1Zev2stZ0iJ60od3L0tdOabIGFBw-d-5J',
    slug: 'stonks-aiesec-project-thanks-duplicate',
    title: 'Благодарственное письмо за помощь в проведении проекта STONKS',
    company: 'STONKS / AIESEC',
    year: 2022,
    fileType: 'JPG',
    order: 210,
  },
];

function log(message) {
  console.log(`[certificates] ${message}`);
}

function parseArgs() {
  const unsupported = rawArgs.filter((arg) => arg !== '--dry-run');
  if (unsupported.length > 0) {
    throw new Error(`Unsupported args: ${unsupported.join(', ')}. Supported: --dry-run`);
  }
}

function ensureRuntimeConfig() {
  if (isDryRun) {
    return;
  }

  if (!STRAPI_URL || !STRAPI_TOKEN) {
    throw new Error(
      'Missing STRAPI_URL or STRAPI_TOKEN. Usage: STRAPI_URL=https://admin.ncfg.ru STRAPI_TOKEN=<token> node seed-certificates-prod.mjs'
    );
  }
}

function buildHeaders(extra = {}) {
  const headers = { ...extra };
  if (STRAPI_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
  }
  return headers;
}

function buildJsonHeaders() {
  return buildHeaders({
    'Content-Type': 'application/json',
  });
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function strapiJsonRequest(path, options = {}) {
  const response = await fetchWithTimeout(`${STRAPI_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`Strapi request failed (${response.status}) for ${path}: ${body}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function loadExistingCertificates() {
  if (!STRAPI_TOKEN) {
    return [];
  }

  const query = new URLSearchParams({
    'pagination[pageSize]': '100',
    'sort[0]': 'order:asc',
    'sort[1]': 'id:asc',
    'populate[0]': 'file',
  });

  try {
    const response = await strapiJsonRequest(`/api/certificates?${query.toString()}`, {
      method: 'GET',
      headers: buildHeaders(),
    });
    return Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    const status = typeof error?.status === 'number' ? error.status : null;

    if (isDryRun && (status === 404 || status === 500)) {
      log(
        `Skipping live certificate lookup during dry-run: ${error.message.replace(/\s+/g, ' ')}`
      );
      return [];
    }

    throw error;
  }
}

function normalizeYear(year) {
  return Number.isInteger(year) ? year : null;
}

function normalizeExistingCertificate(certificate) {
  const rawFile =
    certificate?.file && typeof certificate.file === 'object' && 'data' in certificate.file
      ? certificate.file.data
      : certificate?.file;

  return {
    id: typeof certificate?.id === 'number' ? certificate.id : null,
    documentId: typeof certificate?.documentId === 'string' ? certificate.documentId : null,
    slug: typeof certificate?.slug === 'string' ? certificate.slug : null,
    sourceFileId: typeof certificate?.sourceFileId === 'string' ? certificate.sourceFileId : null,
    title: typeof certificate?.title === 'string' ? certificate.title : '',
    company: typeof certificate?.company === 'string' ? certificate.company : '',
    year: normalizeYear(certificate?.year),
    fileType: typeof certificate?.fileType === 'string' ? certificate.fileType : '',
    order: Number.isInteger(certificate?.order) ? certificate.order : 0,
    file: rawFile && typeof rawFile === 'object' ? rawFile : null,
  };
}

function buildExistingLookups(existingCertificates) {
  const bySourceFileId = new Map();
  const bySlug = new Map();

  for (const item of existingCertificates.map(normalizeExistingCertificate)) {
    if (item.sourceFileId) {
      bySourceFileId.set(item.sourceFileId, item);
    }
    if (item.slug) {
      bySlug.set(item.slug, item);
    }
  }

  return { bySourceFileId, bySlug };
}

function createSha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function parseContentDispositionFilename(headerValue) {
  if (!headerValue) {
    return null;
  }

  const utf8Match = headerValue.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = headerValue.match(/filename="([^"]+)"/i) || headerValue.match(/filename=([^;]+)/i);
  if (!basicMatch?.[1]) {
    return null;
  }

  return basicMatch[1].trim();
}

function mimeToExtension(mime) {
  switch (mime) {
    case 'application/pdf':
      return '.pdf';
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    default:
      return '.bin';
  }
}

function filenameToMime(filename) {
  switch (extname(filename).toLowerCase()) {
    case '.pdf':
      return 'application/pdf';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    default:
      return 'application/octet-stream';
  }
}

function ensureFilename(baseName, mime) {
  const extension = extname(baseName);
  if (extension) {
    return baseName;
  }
  return `${baseName}${mimeToExtension(mime)}`;
}

async function downloadDriveFile(source) {
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(
    source.sourceFileId
  )}`;
  const response = await fetchWithTimeout(downloadUrl, {
    headers: {
      'User-Agent': 'ncfg-certificates-import/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Drive download failed (${response.status}) for ${source.sourceFileId}`);
  }

  const filenameFromHeader = parseContentDispositionFilename(response.headers.get('content-disposition'));
  const tentativeMime =
    response.headers.get('content-type')?.split(';')[0]?.trim() || 'application/octet-stream';
  const originalFilename = ensureFilename(
    filenameFromHeader || `${source.slug}${mimeToExtension(tentativeMime)}`,
    tentativeMime
  );
  const mime =
    tentativeMime !== 'application/octet-stream' ? tentativeMime : filenameToMime(originalFilename);
  const filename = `${source.slug}${mimeToExtension(mime)}`;
  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length === 0) {
    throw new Error(`Downloaded file is empty for ${source.sourceFileId}`);
  }

  return {
    buffer,
    hash: createSha256(buffer),
    filename,
    mime,
    size: buffer.length,
  };
}

async function uploadFileToStrapi(downloadedFile) {
  const formData = new FormData();
  const blob = new Blob([downloadedFile.buffer], { type: downloadedFile.mime });
  formData.append('files', blob, downloadedFile.filename);

  const response = await fetchWithTimeout(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: buildHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Upload failed (${response.status}): ${body}`);
  }

  const payload = await response.json();
  const file = Array.isArray(payload)
    ? payload[0]
    : Array.isArray(payload?.data)
      ? payload.data[0]
      : payload?.data || payload;

  if (!file || typeof file !== 'object') {
    throw new Error(`Unexpected upload response: ${JSON.stringify(payload)}`);
  }

  return file;
}

function buildCertificatePayload(source, uploadedFile = null) {
  const payload = {
    title: source.title,
    slug: source.slug,
    company: source.company,
    year: normalizeYear(source.year),
    fileType: source.fileType,
    order: source.order,
    sourceFileId: source.sourceFileId,
  };

  if (!uploadedFile) {
    return [payload];
  }

  const mediaVariants = [];

  if (typeof uploadedFile?.id === 'number') {
    mediaVariants.push({ ...payload, file: uploadedFile.id });
    mediaVariants.push({ ...payload, file: { id: uploadedFile.id } });
  }

  if (typeof uploadedFile?.documentId === 'string') {
    mediaVariants.push({ ...payload, file: uploadedFile.documentId });
  }

  return mediaVariants.length > 0 ? mediaVariants : [payload];
}

async function createOrUpdateCertificate({ source, existing, uploadedFile }) {
  const payloadVariants = buildCertificatePayload(source, uploadedFile);
  const paths = [];

  if (existing?.documentId) {
    paths.push({
      label: `PUT ${existing.documentId}`,
      path: `/api/certificates/${existing.documentId}?status=published`,
      method: 'PUT',
    });
  }

  if (typeof existing?.id === 'number') {
    paths.push({
      label: `PUT ${existing.id}`,
      path: `/api/certificates/${existing.id}?status=published`,
      method: 'PUT',
    });
  }

  if (!existing) {
    paths.push({
      label: 'POST',
      path: '/api/certificates?status=published',
      method: 'POST',
    });
  }

  let lastError = null;
  for (const target of paths) {
    for (const payload of payloadVariants) {
      try {
        const response = await strapiJsonRequest(target.path, {
          method: target.method,
          headers: buildJsonHeaders(),
          body: JSON.stringify({ data: payload }),
        });

        const result = response?.data ?? response;
        return {
          action: existing ? 'updated' : 'created',
          record: result,
        };
      } catch (error) {
        lastError = error;
      }
    }
  }

  throw lastError || new Error(`Failed to persist certificate ${source.slug}`);
}

function hasExistingFile(existing) {
  return Boolean(existing?.file && typeof existing.file === 'object');
}

function buildDuplicateLabel(firstSourceId, duplicateSourceId) {
  return `${duplicateSourceId} -> ${firstSourceId}`;
}

async function main() {
  parseArgs();
  ensureRuntimeConfig();

  log(
    isDryRun
      ? `Dry run started. source files=${SOURCE_CERTIFICATES.length}`
      : `Import started. target=${STRAPI_URL}`
  );

  const existingCertificates = await loadExistingCertificates();
  const existingLookups = buildExistingLookups(existingCertificates);
  const stats = {
    sourceFiles: SOURCE_CERTIFICATES.length,
    uniqueHashes: 0,
    created: 0,
    updated: 0,
    skippedDuplicate: 0,
    skippedExistingFile: 0,
  };
  const duplicatePairs = [];
  const seenHashes = new Map();

  for (const source of SOURCE_CERTIFICATES) {
    const downloadedFile = await downloadDriveFile(source);
    const firstSourceId = seenHashes.get(downloadedFile.hash);

    if (firstSourceId) {
      stats.skippedDuplicate += 1;
      duplicatePairs.push(buildDuplicateLabel(firstSourceId, source.sourceFileId));
      log(
        `skip duplicate sourceFileId=${source.sourceFileId} matches sourceFileId=${firstSourceId}`
      );
      continue;
    }

    seenHashes.set(downloadedFile.hash, source.sourceFileId);

    const existing =
      existingLookups.bySourceFileId.get(source.sourceFileId) ||
      existingLookups.bySlug.get(source.slug) ||
      null;

    if (isDryRun) {
      if (hasExistingFile(existing)) {
        stats.skippedExistingFile += 1;
      }

      log(
        `plan ${existing ? 'update' : 'create'} slug=${source.slug} sourceFileId=${source.sourceFileId} file=${downloadedFile.filename} hash=${downloadedFile.hash.slice(0, 12)}`
      );
      continue;
    }

    let uploadedFile = null;
    if (hasExistingFile(existing)) {
      stats.skippedExistingFile += 1;
      log(`reuse existing file for slug=${source.slug}`);
    } else {
      uploadedFile = await uploadFileToStrapi(downloadedFile);
      log(`uploaded file for slug=${source.slug} uploadId=${uploadedFile.id ?? 'n/a'}`);
    }

    const result = await createOrUpdateCertificate({
      source,
      existing,
      uploadedFile,
    });

    if (result.action === 'created') {
      stats.created += 1;
    } else {
      stats.updated += 1;
    }

    const normalizedResult = normalizeExistingCertificate(result.record);
    if (normalizedResult.sourceFileId) {
      existingLookups.bySourceFileId.set(normalizedResult.sourceFileId, normalizedResult);
    }
    if (normalizedResult.slug) {
      existingLookups.bySlug.set(normalizedResult.slug, normalizedResult);
    }

    log(`${result.action} slug=${source.slug}`);
  }

  stats.uniqueHashes = seenHashes.size;

  log(
    `Done. sourceFiles=${stats.sourceFiles}, uniqueHashes=${stats.uniqueHashes}, created=${stats.created}, updated=${stats.updated}, skippedDuplicate=${stats.skippedDuplicate}, skippedExistingFile=${stats.skippedExistingFile}`
  );

  if (duplicatePairs.length > 0) {
    log(`Duplicate pairs: ${duplicatePairs.join('; ')}`);
  }

  if (isDryRun) {
    log(`Dry run finished. Expected published certificates after dedupe: ${stats.uniqueHashes}`);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[certificates] Import failed: ${message}`);
  process.exit(1);
});
