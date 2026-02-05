import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = new Set(process.argv.slice(2));

const CONFIG = {
  strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
  strapiToken: process.env.STRAPI_API_TOKEN,
  manifestPath: path.join(
    __dirname,
    '..',
    'apps',
    'web',
    'public',
    'content',
    'experts_photos',
    'manifest.json'
  ),
  photosDir: path.join(__dirname, '..', 'apps', 'web', 'public', 'content', 'experts_photos'),
  dryRun: args.has('--dry-run'),
  force: args.has('--force'),
};

function buildQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  });
  return search.toString();
}

function getEntityId(item) {
  if (!item) return null;
  return item.documentId || item.id || item.attributes?.documentId || item.attributes?.id || null;
}

function getAttributes(item) {
  return item?.attributes || item;
}

function extractPhotoInfo(item) {
  const attrs = getAttributes(item);
  const photo = attrs?.photo;
  if (!photo) return null;

  if (photo.data) {
    const data = photo.data;
    const photoAttrs = data.attributes || data;
    return {
      id: data.documentId || data.id || photoAttrs?.documentId || photoAttrs?.id || null,
      name: photoAttrs?.name || null,
    };
  }

  if (photo.id || photo.documentId || photo.name) {
    return {
      id: photo.documentId || photo.id || null,
      name: photo.name || null,
    };
  }

  return null;
}

async function strapiRequest(endpoint, method = 'GET', data = null) {
  const url = `${CONFIG.strapiUrl}/api${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (CONFIG.strapiToken) {
    options.headers.Authorization = `Bearer ${CONFIG.strapiToken}`;
  }

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

async function uploadFile(filePath) {
  const formData = new FormData();
  const fileBuffer = await fs.readFile(filePath);
  const fileName = path.basename(filePath);

  formData.append('files', fileBuffer, { filename: fileName });

  const options = {
    method: 'POST',
    body: formData,
    headers: {
      ...formData.getHeaders(),
    },
  };

  if (CONFIG.strapiToken) {
    options.headers.Authorization = `Bearer ${CONFIG.strapiToken}`;
  }

  const response = await fetch(`${CONFIG.strapiUrl}/api/upload`, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  if (Array.isArray(result)) return result[0];
  if (Array.isArray(result?.data)) return result.data[0];
  return result?.data || result;
}

async function findPeopleByName(name, mode) {
  const params = {
    [`filters[fullName][$${mode}]`]: name,
    'populate[photo]': 'true',
    'pagination[pageSize]': '10',
  };
  const query = buildQuery(params);
  const result = await strapiRequest(`/people?${query}`);
  return result?.data || [];
}

async function ensureFileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('Upload person photos to Strapi');
  console.log(`Strapi URL: ${CONFIG.strapiUrl}`);
  console.log(`Dry run: ${CONFIG.dryRun ? 'yes' : 'no'}`);
  console.log(`Force replace: ${CONFIG.force ? 'yes' : 'no'}`);

  if (!CONFIG.strapiToken) {
    console.error('Missing STRAPI_API_TOKEN environment variable.');
    process.exit(1);
  }

  console.log('Testing Strapi connection...');
  await fetch(`${CONFIG.strapiUrl}/api`);
  console.log('Connected.');

  const manifestRaw = await fs.readFile(CONFIG.manifestPath, 'utf-8');
  const manifest = JSON.parse(manifestRaw);

  let matched = 0;
  let updated = 0;
  let skipped = 0;
  let missing = 0;
  let errors = 0;

  for (const entry of manifest) {
    const name = String(entry.name || '').trim();
    const filename = String(entry.filename || '').trim();

    if (!name || !filename) {
      console.log(`Skip manifest entry with missing name/filename: ${JSON.stringify(entry)}`);
      skipped += 1;
      continue;
    }

    const filePath = path.join(CONFIG.photosDir, filename);
    const fileExists = await ensureFileExists(filePath);
    if (!fileExists) {
      console.log(`Missing file for "${name}": ${filePath}`);
      missing += 1;
      continue;
    }

    let people = await findPeopleByName(name, 'eq');
    if (people.length === 0) {
      people = await findPeopleByName(name, 'containsi');
    }

    if (people.length === 0) {
      console.log(`No person found for "${name}"`);
      missing += 1;
      continue;
    }

    if (people.length > 1) {
      console.log(`Multiple people found for "${name}", skipping to avoid mismatch.`);
      skipped += 1;
      continue;
    }

    const person = people[0];
    const personId = getEntityId(person);
    if (!personId) {
      console.log(`Cannot resolve ID for "${name}", skipping.`);
      skipped += 1;
      continue;
    }

    matched += 1;

    const existingPhoto = extractPhotoInfo(person);
    if (existingPhoto && !CONFIG.force) {
      const existingName = existingPhoto.name?.toLowerCase();
      const targetName = filename.toLowerCase();
      if (existingName && existingName === targetName) {
        console.log(`Already set: "${name}" -> ${filename}`);
      } else {
        console.log(`Has different photo for "${name}", use --force to replace.`);
      }
      skipped += 1;
      continue;
    }

    if (CONFIG.dryRun) {
      console.log(`[Dry run] Would upload: "${name}" -> ${filename}`);
      continue;
    }

    try {
      const uploadedFile = await uploadFile(filePath);
      const uploadedId = uploadedFile?.id || uploadedFile?.documentId;
      if (!uploadedId) {
        throw new Error('Upload response missing file id');
      }

      await strapiRequest(`/people/${personId}`, 'PUT', { photo: uploadedId });
      console.log(`Updated: "${name}" -> ${filename}`);
      updated += 1;
    } catch (error) {
      console.log(`Error updating "${name}": ${error.message}`);
      errors += 1;
    }
  }

  console.log('Done.');
  console.log(
    `Matched: ${matched}, Updated: ${updated}, Skipped: ${skipped}, Missing: ${missing}, Errors: ${errors}`
  );
}

main().catch((error) => {
  if (error?.code === 'ECONNREFUSED') {
    console.error('Cannot connect to Strapi. Ensure it is running and STRAPI_URL is correct.');
  } else {
    console.error(`Fatal error: ${error.message}`);
  }
  process.exit(1);
});
