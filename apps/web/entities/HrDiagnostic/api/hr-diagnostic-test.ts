import { buildQueryString, fetchAPI, type StrapiResponse } from "@/shared/lib/strapi";

import { HR_DIAGNOSTIC_SLUG } from "../model/survey";
import type {
  HrDiagnosticCompletionScreen,
  HrDiagnosticGroup,
  HrDiagnosticOption,
  HrDiagnosticQuestion,
  HrDiagnosticQuestionType,
  HrDiagnosticTest,
  HrDiagnosticVisibilityCondition,
} from "../model/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapAttributes(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) {
    return null;
  }

  if (isRecord(value.attributes)) {
    return {
      id: value.id,
      documentId: value.documentId,
      ...value.attributes,
    };
  }

  return value;
}

function normalizeOptionalString(value: unknown): string | undefined {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeRequiredString(value: unknown): string | null {
  return normalizeOptionalString(value) ?? null;
}

function normalizeInteger(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.trunc(value)
    : fallback;
}

function compareByOrderThenKey(
  left: { order?: number; key: string },
  right: { order?: number; key: string }
) {
  const leftOrder = left.order ?? 0;
  const rightOrder = right.order ?? 0;
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return left.key.localeCompare(right.key, "ru");
}

function normalizeVisibilityCondition(
  value: unknown
): HrDiagnosticVisibilityCondition | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const questionKey = normalizeRequiredString(value.questionKey);
  const operator = value.operator;
  const optionKeys = Array.isArray(value.optionKeys)
    ? value.optionKeys
        .map((item) => normalizeOptionalString(item))
        .filter((item): item is string => Boolean(item))
    : [];

  if (!questionKey || operator !== "not_in" || optionKeys.length === 0) {
    return undefined;
  }

  return {
    questionKey,
    operator,
    optionKeys,
  };
}

function normalizeCompletionScreen(value: unknown): HrDiagnosticCompletionScreen | undefined {
  const record = unwrapAttributes(value);
  if (!record) {
    return undefined;
  }

  return {
    title: normalizeOptionalString(record.title),
    body: normalizeOptionalString(record.body),
    giftTitle: normalizeOptionalString(record.giftTitle),
    giftBody: normalizeOptionalString(record.giftBody),
    ctaLabel: normalizeOptionalString(record.ctaLabel),
    ctaHref: normalizeOptionalString(record.ctaHref),
    secondaryText: normalizeOptionalString(record.secondaryText),
  };
}

function normalizeOption(value: unknown): HrDiagnosticOption | null {
  const record = unwrapAttributes(value);
  if (!record) {
    return null;
  }

  const key = normalizeRequiredString(record.key);
  const label = normalizeRequiredString(record.label);
  if (!key || !label) {
    return null;
  }

  return {
    key,
    label,
    order: normalizeInteger(record.order),
  };
}

function normalizeQuestion(value: unknown): HrDiagnosticQuestion | null {
  const record = unwrapAttributes(value);
  if (!record) {
    return null;
  }

  const key = normalizeRequiredString(record.key);
  const title = normalizeRequiredString(record.title);
  const type = record.type;
  if (
    !key ||
    !title ||
    (type !== "radio" && type !== "checkbox" && type !== "likert" && type !== "email")
  ) {
    return null;
  }

  const options = Array.isArray(record.options)
    ? record.options
        .map(normalizeOption)
        .filter((option): option is HrDiagnosticOption => Boolean(option))
        .sort(compareByOrderThenKey)
    : [];

  const questionType: HrDiagnosticQuestionType = type;

  return {
    key,
    title,
    description: normalizeOptionalString(record.description),
    type: questionType,
    required: Boolean(record.required),
    order: normalizeInteger(record.order),
    options,
    maxSelections:
      typeof record.maxSelections === "number" && Number.isFinite(record.maxSelections)
        ? Math.trunc(record.maxSelections)
        : undefined,
    allowOther: Boolean(record.allowOther),
    otherLabel: normalizeOptionalString(record.otherLabel),
    showWhen: normalizeVisibilityCondition(record.showWhen),
  };
}

function normalizeGroup(value: unknown): HrDiagnosticGroup | null {
  const record = unwrapAttributes(value);
  if (!record) {
    return null;
  }

  const key = normalizeRequiredString(record.key);
  const title = normalizeRequiredString(record.title);
  if (!key || !title) {
    return null;
  }

  const questions = Array.isArray(record.questions)
    ? record.questions
        .map(normalizeQuestion)
        .filter((question): question is HrDiagnosticQuestion => Boolean(question))
        .sort(compareByOrderThenKey)
    : [];

  return {
    key,
    title,
    order: normalizeInteger(record.order),
    questions,
  };
}

function normalizeTest(value: unknown): HrDiagnosticTest | null {
  const record = unwrapAttributes(value);
  if (!record) {
    return null;
  }

  const slug = normalizeRequiredString(record.slug);
  const title = normalizeRequiredString(record.title);
  const testTitle = normalizeRequiredString(record.testTitle);
  const projectTitle = normalizeRequiredString(record.projectTitle);
  if (!slug || !title || !testTitle || !projectTitle) {
    return null;
  }

  const groups = Array.isArray(record.groups)
    ? record.groups
        .map(normalizeGroup)
        .filter((group): group is HrDiagnosticGroup => Boolean(group))
        .sort(compareByOrderThenKey)
    : [];

  if (groups.length === 0) {
    return null;
  }

  return {
    documentId: normalizeOptionalString(record.documentId),
    slug,
    title,
    testTitle,
    projectTitle,
    contactEmail: normalizeOptionalString(record.contactEmail),
    interviewHref: normalizeOptionalString(record.interviewHref),
    guideHref: normalizeOptionalString(record.guideHref),
    introLead: normalizeOptionalString(record.introLead),
    introBody: normalizeOptionalString(record.introBody),
    introGiftText: normalizeOptionalString(record.introGiftText),
    anonymousNotice: normalizeOptionalString(record.anonymousNotice),
    groups,
    targetCompletion: normalizeCompletionScreen(record.targetCompletion),
    nonTargetCompletion: normalizeCompletionScreen(record.nonTargetCompletion),
  };
}

export async function getHrDiagnosticTest(
  slug = HR_DIAGNOSTIC_SLUG
): Promise<HrDiagnosticTest | null> {
  const query = buildQueryString({
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
    pagination: {
      pageSize: 1,
    },
    sort: "updatedAt:desc",
  });

  const response = await fetchAPI<StrapiResponse<unknown[]>>(
    `/hr-diagnostic-tests${query}`
  );
  const [entry] = Array.isArray(response.data) ? response.data : [];

  return normalizeTest(entry);
}
