import fs from 'fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = new Set(process.argv.slice(2));

function normalizeArg(arg) {
  return arg.startsWith('--') ? arg.slice(2) : arg;
}

function normalizeName(name) {
  return name.startsWith('--') ? name.slice(2) : name;
}

function hasArg(name) {
  const target = normalizeName(name);
  return [...args].some((arg) => {
    const normalized = normalizeArg(arg);
    return normalized === target || normalized.startsWith(`${target}=`);
  });
}

function getArg(name, fallback = '') {
  const target = normalizeName(name);
  const match = [...args].find((arg) => normalizeArg(arg).startsWith(`${target}=`));
  if (!match) return fallback;
  const normalized = normalizeArg(match);
  return normalized.slice(name.length + 1);
}

function resolvePath(value) {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  return path.isAbsolute(trimmed) ? trimmed : path.join(__dirname, '..', trimmed);
}

const DEFAULT_SOURCE_PATHS = {
  newsImages: 'apps/cms/src/legacy-dynamic/news/anonsImages',
  peoplePhotos: 'apps/cms/src/legacy-dynamic/people/photos',
};

const CONFIG = {
  strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
  strapiToken: process.env.STRAPI_API_TOKEN,
  scope: getArg('scope', 'all'),
  shouldFix: hasArg('--fix'),
  dryRun: hasArg('--dry-run') || !hasArg('--fix'),
  peoplePhotosPath: resolvePath(
    getArg('people-photos-path', process.env.PEOPLE_PHOTOS_DIR || DEFAULT_SOURCE_PATHS.peoplePhotos)
  ),
  newsImagesPath: resolvePath(
    getArg('news-images-path', process.env.NEWS_IMAGES_PATH || DEFAULT_SOURCE_PATHS.newsImages)
  ),
  bucketName: process.env.AWS_BUCKET || 'unknown-bucket',
  pageSize: 100,
};

// Load .env and then .env.local to support local CMS and script environments.
dotenv.config({ path: path.join(__dirname, '..', 'apps', 'cms', '.env') });
dotenv.config({ path: path.join(__dirname, '..', 'apps', 'cms', '.env.local'), override: true });
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local'), override: true });

CONFIG.strapiUrl = process.env.STRAPI_URL || CONFIG.strapiUrl;
CONFIG.strapiToken = process.env.STRAPI_API_TOKEN || CONFIG.strapiToken;
CONFIG.bucketName = process.env.AWS_BUCKET || CONFIG.bucketName;
if (!hasArg('--people-photos-path') && process.env.PEOPLE_PHOTOS_DIR) {
  CONFIG.peoplePhotosPath = resolvePath(process.env.PEOPLE_PHOTOS_DIR);
}
if (!hasArg('--news-images-path') && process.env.NEWS_IMAGES_PATH) {
  CONFIG.newsImagesPath = resolvePath(process.env.NEWS_IMAGES_PATH);
}

function buildQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  });
  return search.toString();
}

function unwrapRecord(item) {
  return item?.attributes
    ? {
        id: item.id,
        documentId: item.documentId,
        ...item.attributes,
      }
    : item;
}

function extractMedia(item, field) {
  const attrs = unwrapRecord(item);
  if (!attrs) return null;

  const media = attrs[field];
  if (!media) return null;

  const payload = media.data ?? media;
  const mediaEntry = Array.isArray(payload) ? payload[0] : payload;
  if (!mediaEntry) return null;

  const mediaAttrs = mediaEntry.attributes ?? mediaEntry;
  return {
    id: mediaAttrs.id ?? mediaEntry.id,
    documentId: mediaAttrs.documentId ?? mediaEntry.documentId,
    name: mediaAttrs.name ?? mediaEntry.name ?? null,
    url: mediaAttrs.url,
  };
}

function inspectMediaUrl(url) {
  if (!url) {
    return {
      status: 'missing',
      normalized: '',
      type: 'none',
      fileName: '',
      absoluteFallback: '',
    };
  }

  const normalized = String(url).trim();
  const fileName = path.basename(normalized.split('?')[0]);

  if (normalized.startsWith('/uploads/')) {
    return {
      status: 'local-relative',
      type: 'relative',
      normalized,
      absoluteFallback: `${CONFIG.strapiUrl.replace(/\/$/, '')}${normalized.startsWith('/') ? normalized : `/${normalized}`}`,
      fileName,
    };
  }

  if (normalized.startsWith('/')) {
    return {
      status: 'relative-other',
      type: 'relative',
      normalized,
      absoluteFallback: `${CONFIG.strapiUrl.replace(/\/$/, '')}${normalized.startsWith('/') ? normalized : `/${normalized}`}`,
      fileName,
    };
  }

  if (/^https?:\/\//i.test(normalized)) {
    const expectedPrefix = `https://storage.yandexcloud.net/${CONFIG.bucketName}/`;
    if (normalized.startsWith(expectedPrefix)) {
      return { status: 's3-provider', type: 'absolute', normalized, fileName, absoluteFallback: '' };
    }
    if (normalized.includes('/uploads/')) {
      return { status: 'absolute-uploads', type: 'absolute', normalized, fileName, absoluteFallback: normalized };
    }
    return { status: 'external-absolute', type: 'absolute', normalized, fileName, absoluteFallback: '' };
  }

  return {
    status: 'other',
    type: 'unknown',
    normalized,
    fileName,
    absoluteFallback: '',
  };
}

async function existsFile(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function normalizeFileBase(value) {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function buildFileCandidates(fileName, field) {
  const ext = path.extname(fileName);
  const extName = ext.toLowerCase().replace(/^\./, '');
  const base = path.basename(fileName, ext);
  const decodedBase = decodeURIComponent(base || '');
  const seeds = [
    base,
    decodedBase,
    fileName,
    decodeURIComponent(fileName),
    path.basename(fileName),
    path.basename(decodeURIComponent(fileName)),
  ];

  const candidateBases = new Set();
  for (const seed of seeds) {
    const seedBase = path.basename(seed, path.extname(seed) || ext);
    candidateBases.add(seedBase);
    candidateBases.add(seedBase.replace(/_[0-9a-fA-F]{8,}$/u, ''));
    candidateBases.add(seedBase.replace(/-/g, '_'));
    candidateBases.add(seedBase.replace(/_/g, '-'));
  }

  const candidates = new Set();
  for (const candidateBase of candidateBases) {
    if (!candidateBase) continue;
    const normalized = normalizeFileBase(candidateBase);
    if (!normalized) continue;
    candidates.add(normalized);
    if (extName) {
      candidates.add(`${normalized}_${extName}`);
    }
  }

  if (field === 'photo') {
    const normalizedBase = normalizeFileBase(decodedBase);
    for (const token of normalizedBase.split('_')) {
      if (token.length >= 3) {
        candidates.add(token);
      }
    }
  }

  return Array.from(candidates);
}

function hasCandidateMatch(sourceName, candidates) {
  const sourceBase = normalizeFileBase(path.basename(sourceName, path.extname(sourceName)));
  if (!sourceBase) return false;

  if (candidates.includes(sourceBase)) return true;

  const sourceTokens = sourceBase.split('_').filter(Boolean);
  return sourceTokens.some((token) => {
    if (token.length < 3) return false;
    return candidates.some((candidate) => {
      if (!candidate || candidate.length < 3) return false;
      return candidate.includes(token) || token.includes(candidate);
    });
  });
}

function hasCandidateMatchLoose(sourceName, fileName) {
  const sourceBase = normalizeFileBase(path.basename(sourceName, path.extname(sourceName)));
  const target = normalizeFileBase(path.basename(fileName, path.extname(fileName)));
  if (!sourceBase || !target) return false;

  if (sourceBase.includes(target) || target.includes(sourceBase)) return true;

  const sourceTokens = sourceBase.split('_').filter(Boolean);
  const targetTokens = target.split('_').filter(Boolean);
  return sourceTokens.some((token) => token.length >= 4 && targetTokens.includes(token));
}

async function findLocalSource(field, fileName) {
  const candidateDirs = (field === 'photo' ? [CONFIG.peoplePhotosPath] : [CONFIG.newsImagesPath]).filter(Boolean);
  if (candidateDirs.length === 0) return null;
  const candidates = buildFileCandidates(fileName, field);

  const directoryCache = new Map();

  for (const dir of candidateDirs) {
    let files = directoryCache.get(dir);
    if (!files) {
      files = await fs.readdir(dir).catch(() => []);
      directoryCache.set(dir, files);
    }

    for (const file of files) {
      if (hasCandidateMatch(file, candidates)) {
        return path.join(dir, file);
      }

      if (hasCandidateMatchLoose(file, fileName)) {
        return path.join(dir, file);
      }

      for (const candidate of candidates) {
        const candidatePath = path.join(dir, candidate);
        if (await existsFile(candidatePath)) {
          return candidatePath;
        }
      }
    }
  }

  return null;
}

async function downloadFromOldUrl(url) {
  if (!url) return null;

  const response = await fetch(url);
  if (!response.ok) return null;

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length) return null;

  const ext = path.extname(new URL(url).pathname) || '.bin';
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ncfg-media-fix-'));
  const filePath = path.join(tempDir, `recovery-${Date.now()}${ext}`);
  await fs.writeFile(filePath, buffer);
  return { filePath, cleanup: () => fs.rm(tempDir, { recursive: true, force: true }) };
}

async function uploadFile(filePath, preferredName) {
  const fileBuffer = await fs.readFile(filePath);
  const formData = new FormData();
  formData.append('files', fileBuffer, { filename: preferredName || path.basename(filePath) });

  const headers = {
    ...formData.getHeaders(),
  };
  if (CONFIG.strapiToken) {
    headers.Authorization = `Bearer ${CONFIG.strapiToken}`;
  }

  const response = await fetch(`${CONFIG.strapiUrl}/api/upload`, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  if (Array.isArray(result)) {
    return result[0] || null;
  }
  if (Array.isArray(result?.data)) {
    return result.data[0] || null;
  }
  return result?.data || result || null;
}

async function strapiRequest(endpoint, method = 'GET', data = null) {
  const url = `${CONFIG.strapiUrl}/api${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (CONFIG.strapiToken) {
    headers.Authorization = `Bearer ${CONFIG.strapiToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (data) {
    options.body = JSON.stringify({ data });
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Strapi API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

function buildMediaPayload(fileId) {
  if (typeof fileId === 'object' && fileId !== null && 'id' in fileId) {
    return fileId;
  }
  return { id: fileId };
}

async function loadCollection(collection, fieldName) {
  const out = [];
  let page = 1;

  while (true) {
    const query = buildQuery({
      'pagination[page]': String(page),
      'pagination[pageSize]': String(CONFIG.pageSize),
      [`populate[${fieldName}]`]: 'true',
      'fields[0]': 'id',
    });

    const response = await strapiRequest(`/${collection}?${query}`);
    if (!response?.data || response.data.length === 0) break;

    out.push(...response.data);
    const pageCount = response?.meta?.pagination?.pageCount || 1;
    if (page >= pageCount) break;
    page += 1;
  }

  return out;
}

async function updateRelation(collection, identifiers, fieldName, fileId) {
  const uniqueIdentifiers = [...new Set(identifiers.filter(Boolean).map(String))];
  if (uniqueIdentifiers.length === 0) {
    throw new Error(`Missing ${collection} identifier for relation update.`);
  }

  const payloadVariants = [
    { [fieldName]: fileId },
    { [fieldName]: buildMediaPayload(fileId) },
  ];

  let lastError = null;
  for (const identifier of uniqueIdentifiers) {
    for (const payload of payloadVariants) {
      try {
        await strapiRequest(`/${collection}/${identifier}`, 'PUT', payload);
        return;
      } catch (error) {
        if (!error.message.includes('Strapi API error')) {
          throw error;
        }
        lastError = error;
      }
    }
  }

  throw lastError || new Error(`Failed to update ${collection} relation for ${uniqueIdentifiers.join(', ')}`);
}

async function processCollection({ collection, fieldName, label }) {
  const items = await loadCollection(collection, fieldName);
  const report = {
    collection,
    total: items.length,
    good: 0,
    localRelative: 0,
    absoluteUploads: 0,
    external: 0,
    missing: 0,
    fixed: 0,
    skipped: 0,
    failed: 0,
  };

  for (const item of items) {
    const attrs = unwrapRecord(item);
    const media = extractMedia(item, fieldName);
    const inspection = media?.url ? inspectMediaUrl(media.url) : inspectMediaUrl(null);
    const itemLabel = attrs?.id || attrs?.documentId || 'n/a';

    if (inspection.status === 'missing' || !media) {
      report.missing += 1;
      continue;
    }

    if (inspection.status === 's3-provider') {
      report.good += 1;
      continue;
    }

    const needsFix =
      inspection.status === 'local-relative' ||
      inspection.status === 'relative-other' ||
      inspection.status === 'absolute-uploads';

    if (!needsFix) {
      report.external += 1;
      continue;
    }

    if (inspection.status === 'local-relative' || inspection.status === 'relative-other') {
      report.localRelative += 1;
    }
    if (inspection.status === 'absolute-uploads') {
      report.absoluteUploads += 1;
      report.localRelative += 1;
    }

    if (!CONFIG.shouldFix) {
      report.skipped += 1;
      continue;
    }

    const sourceInfo = await findLocalSource(fieldName, inspection.fileName);

    const hasLocalSource = Boolean(sourceInfo);
    const remoteInfo = hasLocalSource ? null : await downloadFromOldUrl(inspection.absoluteFallback);

    if (!hasLocalSource && (!remoteInfo || !remoteInfo.filePath)) {
      report.failed += 1;
      console.log(`   ⚠️  ${label} ${itemLabel}: no source file for ${inspection.fileName}`);
      continue;
    }

    if (CONFIG.dryRun) {
      report.skipped += 1;
      console.log(`   ◻️  ${label} ${itemLabel}: would replace media with ${inspection.fileName}`);
      if (remoteInfo) {
        await remoteInfo.cleanup().catch(() => {});
      }
      continue;
    }

    try {
      const sourceFile = sourceInfo || remoteInfo.filePath;
      const uploaded = await uploadFile(sourceFile, media.name || inspection.fileName);
      const uploadId = uploaded?.id || uploaded?.documentId;
      if (!uploadId) throw new Error('Upload response missing file id');

      await updateRelation(collection, [attrs?.documentId, attrs?.id], fieldName, uploadId);
      report.fixed += 1;
      if (remoteInfo) {
        await remoteInfo.cleanup().catch(() => {});
      }
    } catch (error) {
      report.failed += 1;
      if (remoteInfo) {
        await remoteInfo.cleanup().catch(() => {});
      }
      console.log(`   ❌ ${label} ${itemLabel}: ${error.message}`);
    }
  }

  return report;
}

function printHelp() {
  console.log(`
Usage:
  node scripts/check-and-repair-media.mjs [options]

Options:
  --scope=all|news|people          What to scan (default: all)
  --fix                             Re-upload and replace media references
  --dry-run                         Print actions without writing (works with --fix)
  --news-images-path=<path>         Override news source dir (default: apps/cms/src/legacy-dynamic/news/anonsImages)
  --people-photos-path=<path>       Override people source dir (default: apps/cms/src/legacy-dynamic/people/photos)
  --help                            Show this message

Examples:
  node scripts/check-and-repair-media.mjs
  node scripts/check-and-repair-media.mjs --scope=news --fix --dry-run
  node scripts/check-and-repair-media.mjs --scope=people --fix

If --fix is not set, the script performs read-only audit.
`);
}

async function run() {
  if (args.has('--help')) {
    printHelp();
    return;
  }

  if (!CONFIG.strapiUrl) {
    throw new Error('STRAPI_URL is required');
  }

  if (!CONFIG.bucketName || CONFIG.bucketName === 'unknown-bucket') {
    throw new Error('AWS_BUCKET is required for strict S3 URL validation.');
  }

  if (CONFIG.shouldFix && !CONFIG.strapiToken) {
    throw new Error('STRAPI_API_TOKEN is required for --fix');
  }

  const jobs = [];
  if (CONFIG.scope === 'all' || CONFIG.scope === 'news') {
    jobs.push(processCollection({ collection: 'news-articles', fieldName: 'anonsImage', label: 'News' }));
  }
  if (CONFIG.scope === 'all' || CONFIG.scope === 'people') {
    jobs.push(processCollection({ collection: 'people', fieldName: 'photo', label: 'Person' }));
  }

  if (jobs.length === 0) {
    throw new Error(`Unknown scope: ${CONFIG.scope}. Use all, news or people.`);
  }

  const results = await Promise.all(jobs);

  console.log('\nMedia audit summary:');
  for (const result of results) {
    console.log(`${result.collection}`);
    console.log(`  total: ${result.total}`);
    console.log(`  good(s3 yandex bucket): ${result.good}`);
    console.log(`  local-relative: ${result.localRelative}`);
    console.log(`  absolute-uploads: ${result.absoluteUploads}`);
    console.log(`  external (non-s3): ${result.external}`);
    console.log(`  missing: ${result.missing}`);
    console.log(`  skipped: ${result.skipped}`);
    console.log(`  fixed: ${result.fixed}`);
    console.log(`  failed: ${result.failed}`);
  }

  const anyFixable = results.some((result) => result.localRelative + result.absoluteUploads > 0);
  if (CONFIG.shouldFix && CONFIG.dryRun && anyFixable) {
    console.log('\nDry run mode. Re-run without --dry-run (keep --fix) to apply changes.');
  } else if (!CONFIG.shouldFix && anyFixable) {
    console.log('\nFound media URLs that are likely broken in S3 context. Re-run with --fix to attempt repair.');
  }
}

run().catch((error) => {
  console.error(`\n❌ ${error.message}`);
  process.exit(1);
});
