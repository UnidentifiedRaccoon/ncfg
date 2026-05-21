import { factories } from "@strapi/strapi";

const SUBMISSION_UID = "api::hr-diagnostic-submission.hr-diagnostic-submission";
const HR_TEST_UID = "api::hr-diagnostic-test.hr-diagnostic-test";
const HR_DIAGNOSTIC_SLUG = "hr";
const OTHER_OPTION_KEY = "other";

interface HrIntakeAnswerPayload {
  questionKey: string;
  questionTitle: string;
  answerLabel: string;
  selectedOptionKeys: string[];
  otherText?: string;
  text?: string;
}

interface HrIntakePayload {
  submissionKey: string;
  targetSegment: "target" | "non_target";
  email?: string;
  emailNormalized?: string;
  sourcePageUrl?: string;
  submittedAt: string;
  answers: HrIntakeAnswerPayload[];
  meta?: {
    requestId?: string;
    clientIp?: string;
    userAgent?: string;
  };
}

interface ExportHrCsvInput {
  from?: string;
  to?: string;
}

interface HrExportQuestionColumn {
  key: string;
  title: string;
}

function asTrimmedString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asOptionalTrimmedString(value: unknown) {
  return asTrimmedString(value) ?? undefined;
}

function parseSelectedOptionKeys(value: unknown): string[] | null {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    return null;
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function parseAnswers(value: unknown): HrIntakeAnswerPayload[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const answers: HrIntakeAnswerPayload[] = [];

  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      return null;
    }

    const record = item as Record<string, unknown>;
    const questionKey = asTrimmedString(record.questionKey);
    const questionTitle = asTrimmedString(record.questionTitle);
    const answerLabel = asTrimmedString(record.answerLabel);
    const selectedOptionKeys = parseSelectedOptionKeys(record.selectedOptionKeys);

    if (!questionKey || !questionTitle || !answerLabel || !selectedOptionKeys) {
      return null;
    }

    answers.push({
      questionKey,
      questionTitle,
      answerLabel,
      selectedOptionKeys,
      otherText: asOptionalTrimmedString(record.otherText),
      text: asOptionalTrimmedString(record.text),
    });
  }

  return answers;
}

function parseTargetSegment(value: unknown): HrIntakePayload["targetSegment"] | null {
  return value === "target" || value === "non_target" ? value : null;
}

function normalizeEmail(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized ? normalized : undefined;
}

function findAnswerText(answers: HrIntakeAnswerPayload[], questionKey: string) {
  const answer = answers.find((item) => item.questionKey === questionKey);
  return answer?.text ?? answer?.answerLabel;
}

function parseIntakePayload(payload: unknown): HrIntakePayload | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const submissionKey = asTrimmedString(record.submissionKey);
  const targetSegment = parseTargetSegment(record.targetSegment);
  const submittedAt = asTrimmedString(record.submittedAt);
  const answers = parseAnswers(record.answers);

  if (!submissionKey || !targetSegment || !submittedAt || !answers) {
    return null;
  }

  const email = asOptionalTrimmedString(record.email) ?? findAnswerText(answers, "email");
  const emailNormalized = asOptionalTrimmedString(record.emailNormalized) ?? normalizeEmail(email);

  const metaValue = record.meta;
  const meta =
    typeof metaValue === "object" && metaValue !== null
      ? {
          requestId: asOptionalTrimmedString((metaValue as Record<string, unknown>).requestId),
          clientIp: asOptionalTrimmedString((metaValue as Record<string, unknown>).clientIp),
          userAgent: asOptionalTrimmedString((metaValue as Record<string, unknown>).userAgent),
        }
      : undefined;

  return {
    submissionKey,
    targetSegment,
    email,
    emailNormalized,
    sourcePageUrl: asOptionalTrimmedString(record.sourcePageUrl),
    submittedAt,
    answers,
    meta,
  };
}

function normalizeDateBoundary(value: string, boundary: "start" | "end") {
  const date = new Date(
    `${value}${boundary === "start" ? "T00:00:00.000Z" : "T23:59:59.999Z"}`
  );

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function buildSubmittedAtFilters(from?: string, to?: string) {
  const filters: Record<string, string> = {};

  if (from) {
    const normalizedFrom = normalizeDateBoundary(from, "start");
    if (normalizedFrom) {
      filters.$gte = normalizedFrom;
    }
  }

  if (to) {
    const normalizedTo = normalizeDateBoundary(to, "end");
    if (normalizedTo) {
      filters.$lte = normalizedTo;
    }
  }

  return Object.keys(filters).length > 0 ? filters : undefined;
}

function csvEscape(value: unknown, delimiter = ";") {
  const stringValue = String(value ?? "");
  const shouldQuote =
    stringValue.includes(delimiter) ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r");

  if (!shouldQuote) {
    return stringValue;
  }

  return `"${stringValue.replace(/"/g, '""')}"`;
}

function buildCsv(rows: string[][], delimiter = ";") {
  const body = rows
    .map((row) => row.map((cell) => csvEscape(cell, delimiter)).join(delimiter))
    .join("\n");

  return `\uFEFF${body}`;
}

function mapAnswersForStorage(answers: HrIntakeAnswerPayload[]) {
  return answers.map((answer) => ({
    questionKey: answer.questionKey,
    questionTitle: answer.questionTitle,
    answerLabel: answer.answerLabel,
    selectedOptionKeys: answer.selectedOptionKeys,
    otherText: answer.otherText ?? null,
    text: answer.text ?? null,
  }));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function buildQuestionColumnsFromTest(test: any): HrExportQuestionColumn[] {
  if (!Array.isArray(test?.groups)) {
    return [];
  }

  const columns: HrExportQuestionColumn[] = [];

  for (const group of test.groups) {
    const questions = Array.isArray(group?.questions) ? group.questions : [];

    for (const question of questions) {
      const key = asTrimmedString(question?.key);
      const title = asTrimmedString(question?.title);
      if (!key || !title) {
        continue;
      }

      columns.push({ key, title });
    }
  }

  return columns;
}

async function loadQuestionColumns(strapi: any): Promise<HrExportQuestionColumn[]> {
  const test = await strapi
    .service(HR_TEST_UID)
    .findBySlug(HR_DIAGNOSTIC_SLUG);

  return buildQuestionColumnsFromTest(test);
}

function formatSegment(value: unknown) {
  if (value === "target") return "Целевой";
  if (value === "non_target") return "Нецелевой";
  return String(value ?? "");
}

function formatAnswerLabel(answer: unknown) {
  const record = asRecord(answer);
  if (!record) {
    return "";
  }

  const answerLabel = asTrimmedString(record.answerLabel);
  const text = asTrimmedString(record.text);
  const otherText = asTrimmedString(record.otherText);
  const selectedOptionKeys = parseSelectedOptionKeys(record.selectedOptionKeys) ?? [];

  if (answerLabel) {
    if (
      otherText &&
      selectedOptionKeys.includes(OTHER_OPTION_KEY) &&
      !answerLabel.includes(otherText)
    ) {
      return answerLabel.includes("Другое")
        ? answerLabel.replace("Другое", `Другое: ${otherText}`)
        : `${answerLabel}, Другое: ${otherText}`;
    }

    return answerLabel;
  }

  if (text) {
    return text;
  }

  return selectedOptionKeys
    .map((optionKey) =>
      optionKey === OTHER_OPTION_KEY && otherText ? `Другое: ${otherText}` : optionKey
    )
    .join(", ");
}

function buildAnswersByQuestionKey(answers: unknown) {
  const answersByQuestionKey = new Map<string, unknown>();

  if (!Array.isArray(answers)) {
    return answersByQuestionKey;
  }

  for (const answer of answers) {
    const questionKey = asTrimmedString(asRecord(answer)?.questionKey);
    if (!questionKey || answersByQuestionKey.has(questionKey)) {
      continue;
    }

    answersByQuestionKey.set(questionKey, answer);
  }

  return answersByQuestionKey;
}

function appendMissingQuestionColumns(
  columns: HrExportQuestionColumn[],
  submissions: any[]
): HrExportQuestionColumn[] {
  const result = [...columns];
  const seenKeys = new Set(result.map((column) => column.key));

  for (const submission of submissions) {
    if (!Array.isArray(submission.answers)) {
      continue;
    }

    for (const answer of submission.answers) {
      const record = asRecord(answer);
      const questionKey = asTrimmedString(record?.questionKey);
      if (!questionKey || seenKeys.has(questionKey)) {
        continue;
      }

      seenKeys.add(questionKey);
      result.push({
        key: questionKey,
        title: asTrimmedString(record?.questionTitle) ?? questionKey,
      });
    }
  }

  return result;
}

export default factories.createCoreService(
  SUBMISSION_UID,
  ({ strapi }: { strapi: any }) => ({
    async createFromIntake(payload: unknown) {
      const parsedPayload = parseIntakePayload(payload);
      if (!parsedPayload) {
        throw new Error("Некорректный payload HR-опроса");
      }

      const existingSubmission = await strapi.documents(SUBMISSION_UID).findFirst({
        fields: [
          "documentId",
          "attemptNumber",
          "submittedAt",
          "sourcePageUrl",
          "email",
          "emailNormalized",
        ],
        filters: {
          submissionKey: {
            $eq: parsedPayload.submissionKey,
          },
        },
      });

      let attemptNumber =
        typeof existingSubmission?.attemptNumber === "number" &&
        Number.isFinite(existingSubmission.attemptNumber)
          ? Math.trunc(existingSubmission.attemptNumber)
          : 1;

      const emailNormalized =
        parsedPayload.emailNormalized ??
        normalizeEmail(parsedPayload.email ?? existingSubmission?.email);

      if (emailNormalized) {
        const existingAttempts = await strapi.documents(SUBMISSION_UID).findMany({
          fields: ["documentId"],
          filters: {
            emailNormalized: {
              $eq: emailNormalized,
            },
            ...(existingSubmission?.documentId
              ? {
                  documentId: {
                    $ne: existingSubmission.documentId,
                  },
                }
              : {}),
          },
          pagination: {
            page: 1,
            pageSize: 1000,
          },
        });

        attemptNumber = Array.isArray(existingAttempts) ? existingAttempts.length + 1 : 1;
      }

      const data = {
        submissionKey: parsedPayload.submissionKey,
        targetSegment: parsedPayload.targetSegment,
        email: parsedPayload.email ?? existingSubmission?.email ?? null,
        emailNormalized: emailNormalized ?? existingSubmission?.emailNormalized ?? null,
        sourcePageUrl:
          parsedPayload.sourcePageUrl ?? existingSubmission?.sourcePageUrl ?? null,
        submittedAt: existingSubmission?.submittedAt ?? parsedPayload.submittedAt,
        attemptNumber,
        answers: mapAnswersForStorage(parsedPayload.answers),
      };

      if (existingSubmission?.documentId) {
        const updated = await strapi.documents(SUBMISSION_UID).update({
          documentId: existingSubmission.documentId,
          data,
        });

        if (parsedPayload.meta?.requestId) {
          strapi.log.info(
            `[hr-diagnostics] submission upserted requestId=${parsedPayload.meta.requestId} documentId=${updated.documentId} attempt=${attemptNumber}`
          );
        }

        return {
          documentId: updated.documentId,
          attemptNumber,
          submittedAt: data.submittedAt,
        };
      }

      const created = await strapi.documents(SUBMISSION_UID).create({
        data,
      });

      if (parsedPayload.meta?.requestId) {
        strapi.log.info(
          `[hr-diagnostics] submission upserted requestId=${parsedPayload.meta.requestId} documentId=${created.documentId} attempt=${attemptNumber}`
        );
      }

      return {
        documentId: created.documentId,
        attemptNumber,
        submittedAt: data.submittedAt,
      };
    },

    async exportHrCsv({ from, to }: ExportHrCsvInput = {}) {
      const submissions: any[] = [];
      const submittedAtFilters = buildSubmittedAtFilters(from, to);
      let page = 1;

      while (true) {
        const batch = await strapi.documents(SUBMISSION_UID).findMany({
          filters: submittedAtFilters
            ? {
                submittedAt: submittedAtFilters,
              }
            : {},
          sort: ["submittedAt:desc"],
          pagination: {
            page,
            pageSize: 100,
          },
        });

        if (!Array.isArray(batch) || batch.length === 0) {
          break;
        }

        submissions.push(...batch);

        if (batch.length < 100) {
          break;
        }

        page += 1;
      }

      const questionColumns = appendMissingQuestionColumns(
        await loadQuestionColumns(strapi),
        submissions
      );

      const headerRow = [
        "Дата прохождения",
        "Попытка",
        "Email",
        "Сегмент",
        "Страница",
        ...questionColumns.map((question) => question.title),
      ];

      const rows = submissions.map((submission: any) => {
        const answersByQuestionKey = buildAnswersByQuestionKey(submission.answers);
        const attemptNumber =
          typeof submission.attemptNumber === "number" && Number.isFinite(submission.attemptNumber)
            ? Math.trunc(submission.attemptNumber)
            : 1;

        return [
          String(submission.submittedAt ?? ""),
          String(attemptNumber),
          String(submission.email ?? submission.emailNormalized ?? ""),
          formatSegment(submission.targetSegment),
          String(submission.sourcePageUrl ?? ""),
          ...questionColumns.map((question) =>
            formatAnswerLabel(answersByQuestionKey.get(question.key))
          ),
        ];
      });

      return {
        fileName: "hr-diagnostic-submissions.csv",
        csv: buildCsv([headerRow, ...rows]),
      };
    },
  })
);
