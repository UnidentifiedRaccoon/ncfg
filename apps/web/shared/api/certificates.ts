import {
  buildQueryString,
  fetchAPI,
  getStrapiMediaUrl,
  type StrapiResponse,
} from '../lib/strapi';
import type { StrapiCertificate, StrapiMedia } from './types/strapi';

export type CertificatePreviewKind = 'image' | 'pdf' | 'fallback';

export interface CertificateData {
  id: string;
  title: string;
  company: string;
  year: string | null;
  fileType: string;
  fileMime: string;
  fileUrl: string;
  previewImageUrl: string | null;
  previewKind: CertificatePreviewKind;
  order: number;
}

function resolvePreviewImageUrl(file: StrapiMedia): string | null {
  const previewUrl = getStrapiMediaUrl(file.previewUrl);
  if (previewUrl) {
    return previewUrl;
  }

  if (!file.mime.startsWith('image/')) return null;

  const candidates = [
    file.formats?.medium?.url,
    file.formats?.small?.url,
    file.formats?.thumbnail?.url,
    file.url,
  ];

  for (const candidate of candidates) {
    const resolved = getStrapiMediaUrl(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

function resolvePreviewKind(
  file: StrapiMedia,
  previewImageUrl: string | null
): CertificatePreviewKind {
  if (previewImageUrl) {
    return 'image';
  }

  if (file.mime === 'application/pdf') {
    return 'pdf';
  }

  return 'fallback';
}

function normalizeFileType(fileType: string | null | undefined, file: StrapiMedia): string {
  const fromField = fileType?.trim();
  if (fromField) {
    return fromField.toUpperCase();
  }

  const fromExt = file.ext?.replace(/^\./, '').trim();
  if (fromExt) {
    return fromExt.toUpperCase();
  }

  if (file.mime === 'application/pdf') {
    return 'PDF';
  }

  if (file.mime.startsWith('image/')) {
    return file.mime.replace('image/', '').toUpperCase();
  }

  return 'FILE';
}

export async function getCertificates(limit?: number): Promise<StrapiCertificate[]> {
  const query = buildQueryString({
    fields: ['title', 'slug', 'company', 'year', 'fileType', 'order', 'sourceFileId'],
    populate: ['file'],
    sort: ['order:asc', 'id:asc'],
    ...(typeof limit === 'number' ? { pagination: { limit } } : {}),
  });

  const response = await fetchAPI<StrapiResponse<StrapiCertificate[]>>(`/certificates${query}`);

  return response.data;
}

export function transformToCertificateData(certificate: StrapiCertificate): CertificateData {
  if (!certificate.file) {
    throw new Error(`Certificate "${certificate.slug}" is missing file relation.`);
  }

  const file = certificate.file;
  const fileUrl = getStrapiMediaUrl(file.url);

  if (!fileUrl) {
    throw new Error(`Certificate "${certificate.slug}" is missing file.url.`);
  }

  const previewImageUrl = resolvePreviewImageUrl(file);

  return {
    id: certificate.documentId,
    title: certificate.title,
    company: certificate.company,
    year: certificate.year ? String(certificate.year) : null,
    fileType: normalizeFileType(certificate.fileType, file),
    fileMime: file.mime,
    fileUrl,
    previewImageUrl,
    previewKind: resolvePreviewKind(file, previewImageUrl),
    order: certificate.order,
  };
}
