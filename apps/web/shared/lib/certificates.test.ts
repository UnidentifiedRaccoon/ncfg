import assert from "node:assert/strict";
import test from "node:test";
import {
  transformToCertificateData,
  type CertificateData,
} from "../api/certificates";
import type { StrapiCertificate, StrapiMedia } from "../api/types/strapi";

function createMedia(overrides: Partial<StrapiMedia> = {}): StrapiMedia {
  return {
    id: 1,
    documentId: "media-document-id",
    name: "certificate.pdf",
    alternativeText: null,
    caption: null,
    width: null,
    height: null,
    formats: null,
    hash: "media-hash",
    ext: ".pdf",
    mime: "application/pdf",
    size: 613395,
    url: "https://storage.yandexcloud.net/ncfg-test/certificate.pdf",
    previewUrl: null,
    provider: "aws-s3",
    ...overrides,
  };
}

function createCertificate(file: StrapiMedia, overrides: Partial<StrapiCertificate> = {}): StrapiCertificate {
  return {
    id: 1,
    documentId: "certificate-document-id",
    title: "Благодарность за участие",
    slug: "blagodarnost-za-uchastie",
    company: "НЦФГ",
    year: 2024,
    fileType: "pdf",
    file,
    order: 0,
    sourceFileId: null,
    createdAt: "2026-04-14T00:00:00.000Z",
    updatedAt: "2026-04-14T00:00:00.000Z",
    publishedAt: "2026-04-14T00:00:00.000Z",
    ...overrides,
  };
}

function transform(file: StrapiMedia, overrides?: Partial<StrapiCertificate>): CertificateData {
  return transformToCertificateData(createCertificate(file, overrides));
}

test("transformToCertificateData marks plain PDFs for embedded preview", () => {
  const certificate = transform(createMedia());

  assert.equal(certificate.fileMime, "application/pdf");
  assert.equal(certificate.previewImageUrl, null);
  assert.equal(certificate.previewKind, "pdf");
  assert.equal(certificate.fileType, "PDF");
});

test("transformToCertificateData prefers previewUrl when Strapi provides one", () => {
  const certificate = transform(
    createMedia({
      previewUrl: "https://storage.yandexcloud.net/ncfg-test/certificate-preview.png",
    })
  );

  assert.equal(
    certificate.previewImageUrl,
    "https://storage.yandexcloud.net/ncfg-test/certificate-preview.png"
  );
  assert.equal(certificate.previewKind, "image");
});

test("transformToCertificateData falls back for unsupported file types", () => {
  const certificate = transform(
    createMedia({
      name: "certificate.docx",
      ext: ".docx",
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      url: "https://storage.yandexcloud.net/ncfg-test/certificate.docx",
    }),
    { fileType: "" }
  );

  assert.equal(certificate.fileType, "DOCX");
  assert.equal(certificate.previewImageUrl, null);
  assert.equal(certificate.previewKind, "fallback");
});
