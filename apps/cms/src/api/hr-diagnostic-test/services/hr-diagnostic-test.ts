import { factories } from "@strapi/strapi";

const TEST_UID = "api::hr-diagnostic-test.hr-diagnostic-test";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null ? (value as UnknownRecord) : null;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asOptionalString(value: unknown) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeCompletionScreen(value: unknown) {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  return {
    title: asOptionalString(record.title),
    body: asOptionalString(record.body),
    ctaLabel: asOptionalString(record.ctaLabel),
    ctaHref: asOptionalString(record.ctaHref),
    secondaryText: asOptionalString(record.secondaryText),
  };
}

function normalizeOption(value: unknown) {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const key = asOptionalString(record.key);
  const label = asOptionalString(record.label);
  if (!key || !label) {
    return null;
  }

  return {
    key,
    label,
    exclusive: Boolean(record.exclusive),
  };
}

function normalizeQuestion(value: unknown) {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const key = asOptionalString(record.key);
  const title = asOptionalString(record.title);
  const type = asString(record.type);
  if (!key || !title || !["radio", "checkbox", "likert", "email"].includes(type)) {
    return null;
  }

  const options = Array.isArray(record.options)
    ? record.options
        .map(normalizeOption)
        .filter((option): option is NonNullable<ReturnType<typeof normalizeOption>> =>
          Boolean(option)
        )
    : [];

  return {
    key,
    title,
    description: asOptionalString(record.description),
    type,
    required: Boolean(record.required),
    allowOther: Boolean(record.allowOther),
    maxSelections:
      typeof record.maxSelections === "number" && Number.isFinite(record.maxSelections)
        ? Math.trunc(record.maxSelections)
        : null,
    showWhen: record.showWhen ?? null,
    options,
  };
}

function normalizeGroup(value: unknown) {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const title = asOptionalString(record.title);
  if (!title) {
    return null;
  }

  const questions = Array.isArray(record.questions)
    ? record.questions
        .map(normalizeQuestion)
        .filter((question): question is NonNullable<ReturnType<typeof normalizeQuestion>> =>
          Boolean(question)
        )
    : [];

  return {
    title,
    questions,
  };
}

function normalizeTest(entry: unknown) {
  const record = asRecord(entry);
  if (!record) {
    return null;
  }

  const slug = asOptionalString(record.slug);
  const title = asOptionalString(record.title);
  const projectTitle = asOptionalString(record.projectTitle);
  if (!slug || !title || !projectTitle) {
    return null;
  }

  const groups = Array.isArray(record.groups)
    ? record.groups
        .map(normalizeGroup)
        .filter((group): group is NonNullable<ReturnType<typeof normalizeGroup>> =>
          Boolean(group)
        )
    : [];

  return {
    documentId: asOptionalString(record.documentId),
    slug,
    title,
    projectTitle,
    introLead: asOptionalString(record.introLead),
    introBody: asOptionalString(record.introBody),
    introGiftText: asOptionalString(record.introGiftText),
    anonymousNotice: asOptionalString(record.anonymousNotice),
    groups,
    targetCompletion: normalizeCompletionScreen(record.targetCompletion),
    nonTargetCompletion: normalizeCompletionScreen(record.nonTargetCompletion),
  };
}

export default factories.createCoreService(
  TEST_UID,
  ({ strapi }: { strapi: any }) => ({
    async findBySlug(slug: string) {
      const entry = await strapi.documents(TEST_UID).findFirst({
        status: "published",
        filters: {
          slug: {
            $eq: slug,
          },
        },
        populate: {
          groups: {
            populate: {
              questions: {
                populate: {
                  options: true,
                },
              },
            },
          },
          targetCompletion: true,
          nonTargetCompletion: true,
        },
      });

      return normalizeTest(entry);
    },
  })
);
