import { factories } from "@strapi/strapi";

const SUBMISSION_UID = "api::diagnostic-submission.diagnostic-submission";
const CAMPAIGN_UID = "api::diagnostic-campaign.diagnostic-campaign";

interface IntakeAnswerPayload {
  questionKey: string;
  questionTitle: string;
  answerKey: string;
  answerLabel: string;
  weight: number;
  insightTitle?: string;
  insightText?: string;
  practiceStep?: string;
}

interface IntakePayload {
  submissionKey: string;
  campaignDocumentId: string;
  organizationDocumentId: string;
  testDocumentId: string;
  fullName?: string;
  email?: string;
  emailNormalized?: string;
  phone?: string;
  sourcePageUrl?: string;
  consentAcceptedAt?: string;
  submittedAt: string;
  totalScore: number;
  campaignSlugSnapshot: string;
  organizationNameSnapshot: string;
  testCodeSnapshot: string;
  testVersionSnapshot: number;
  answers: IntakeAnswerPayload[];
  meta?: {
    requestId?: string;
    clientIp?: string;
    userAgent?: string;
  };
}

interface CampaignOption {
  documentId: string;
  title: string;
  slug: string;
  isActive: boolean;
  organizationName: string;
  testLabel: string;
}

interface ExportCampaignCsvInput {
  campaignDocumentId: string;
  from?: string;
  to?: string;
}

function asTrimmedString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asOptionalTrimmedString(value: unknown) {
  return asTrimmedString(value) ?? undefined;
}

function asFiniteInteger(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.trunc(value);
}

function parseAnswers(value: unknown): IntakeAnswerPayload[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const answers: IntakeAnswerPayload[] = [];

  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      return null;
    }

    const record = item as Record<string, unknown>;
    const questionKey = asTrimmedString(record.questionKey);
    const questionTitle = asTrimmedString(record.questionTitle);
    const answerKey = asTrimmedString(record.answerKey);
    const answerLabel = asTrimmedString(record.answerLabel);
    const weight = asFiniteInteger(record.weight);

    if (!questionKey || !questionTitle || !answerKey || !answerLabel || weight === null) {
      return null;
    }

    answers.push({
      questionKey,
      questionTitle,
      answerKey,
      answerLabel,
      weight,
      insightTitle: asOptionalTrimmedString(record.insightTitle),
      insightText: asOptionalTrimmedString(record.insightText),
      practiceStep: asOptionalTrimmedString(record.practiceStep),
    });
  }

  return answers;
}

function parseIntakePayload(payload: unknown): IntakePayload | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const submissionKey = asTrimmedString(record.submissionKey);
  const campaignDocumentId = asTrimmedString(record.campaignDocumentId);
  const organizationDocumentId = asTrimmedString(record.organizationDocumentId);
  const testDocumentId = asTrimmedString(record.testDocumentId);
  const fullName = asTrimmedString(record.fullName);
  const email = asTrimmedString(record.email);
  const emailNormalized = asTrimmedString(record.emailNormalized);
  const consentAcceptedAt = asTrimmedString(record.consentAcceptedAt);
  const submittedAt = asTrimmedString(record.submittedAt);
  const totalScore = asFiniteInteger(record.totalScore);
  const campaignSlugSnapshot = asTrimmedString(record.campaignSlugSnapshot);
  const organizationNameSnapshot = asTrimmedString(record.organizationNameSnapshot);
  const testCodeSnapshot = asTrimmedString(record.testCodeSnapshot);
  const testVersionSnapshot = asFiniteInteger(record.testVersionSnapshot);
  const answers = parseAnswers(record.answers);
  const hasRespondentData = Boolean(
    fullName || email || emailNormalized || asOptionalTrimmedString(record.phone) || consentAcceptedAt
  );

  if (
    !submissionKey ||
    !campaignDocumentId ||
    !organizationDocumentId ||
    !testDocumentId ||
    !submittedAt ||
    totalScore === null ||
    !campaignSlugSnapshot ||
    !organizationNameSnapshot ||
    !testCodeSnapshot ||
    testVersionSnapshot === null ||
    !answers
  ) {
    return null;
  }

  if (hasRespondentData && (!fullName || !email || !emailNormalized || !consentAcceptedAt)) {
    return null;
  }

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
    campaignDocumentId,
    organizationDocumentId,
    testDocumentId,
    fullName: fullName ?? undefined,
    email: email ?? undefined,
    emailNormalized: emailNormalized ?? undefined,
    phone: asOptionalTrimmedString(record.phone),
    sourcePageUrl: asOptionalTrimmedString(record.sourcePageUrl),
    consentAcceptedAt: consentAcceptedAt ?? undefined,
    submittedAt,
    totalScore,
    campaignSlugSnapshot,
    organizationNameSnapshot,
    testCodeSnapshot,
    testVersionSnapshot,
    answers,
    meta,
  };
}

function compareByOrderThenKey(
  left: { order?: number | null; key?: string | null },
  right: { order?: number | null; key?: string | null }
) {
  const leftOrder = Number(left.order ?? 0);
  const rightOrder = Number(right.order ?? 0);
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return String(left.key ?? "").localeCompare(String(right.key ?? ""), "ru");
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

function sanitizeFileSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "diagnostics";
}

function mapAnswersForStorage(answers: IntakeAnswerPayload[]) {
  return answers.map((answer) => ({
    questionKey: answer.questionKey,
    questionTitle: answer.questionTitle,
    answerKey: answer.answerKey,
    answerLabel: answer.answerLabel,
    weight: answer.weight,
    insightTitle: answer.insightTitle ?? null,
    insightText: answer.insightText ?? null,
    practiceStep: answer.practiceStep ?? null,
  }));
}

function buildSubmissionRelations(payload: IntakePayload) {
  return {
    organization: payload.organizationDocumentId,
    campaign: payload.campaignDocumentId,
    test: payload.testDocumentId,
  };
}

export default factories.createCoreService(
  SUBMISSION_UID,
  ({ strapi }: { strapi: any }) => ({
    async createFromIntake(payload: unknown) {
      const parsedPayload = parseIntakePayload(payload);
      if (!parsedPayload) {
        throw new Error("Некорректный payload диагностики");
      }

      const existingSubmission = await strapi.documents(SUBMISSION_UID).findFirst({
        fields: [
          "documentId",
          "attemptNumber",
          "submittedAt",
          "sourcePageUrl",
          "fullName",
          "email",
          "emailNormalized",
          "phone",
          "consentAcceptedAt",
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

      if (parsedPayload.emailNormalized) {
        const existingAttempts = await strapi.documents(SUBMISSION_UID).findMany({
          fields: ["documentId"],
          filters: {
            campaign: {
              documentId: {
                $eq: parsedPayload.campaignDocumentId,
              },
            },
            emailNormalized: {
              $eq: parsedPayload.emailNormalized,
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

      const scalarData = {
        submissionKey: parsedPayload.submissionKey,
        sourcePageUrl:
          parsedPayload.sourcePageUrl ?? existingSubmission?.sourcePageUrl ?? null,
        totalScore: parsedPayload.totalScore,
        attemptNumber,
        submittedAt: existingSubmission?.submittedAt ?? parsedPayload.submittedAt,
        campaignSlugSnapshot: parsedPayload.campaignSlugSnapshot,
        organizationNameSnapshot: parsedPayload.organizationNameSnapshot,
        testCodeSnapshot: parsedPayload.testCodeSnapshot,
        testVersionSnapshot: parsedPayload.testVersionSnapshot,
        answers: mapAnswersForStorage(parsedPayload.answers),
      };

      const respondentData =
        parsedPayload.fullName &&
        parsedPayload.email &&
        parsedPayload.emailNormalized &&
        parsedPayload.consentAcceptedAt
          ? {
              fullName: parsedPayload.fullName,
              email: parsedPayload.email,
              emailNormalized: parsedPayload.emailNormalized,
              phone: parsedPayload.phone ?? null,
              consentAcceptedAt: parsedPayload.consentAcceptedAt,
            }
          : null;

      if (existingSubmission?.documentId) {
        // Do NOT send relation fields in update — plain documentId strings
        // can clear manyToOne relations in Strapi 5 Document Service.
        // Relations are already set correctly during the initial create.
        const updated = await strapi.documents(SUBMISSION_UID).update({
          documentId: existingSubmission.documentId,
          data: respondentData ? { ...scalarData, ...respondentData } : scalarData,
        });

        if (parsedPayload.meta?.requestId) {
          strapi.log.info(
            `[diagnostics] submission upserted requestId=${parsedPayload.meta.requestId} campaign=${parsedPayload.campaignSlugSnapshot} documentId=${updated.documentId} attempt=${attemptNumber}`
          );
        }

        return {
          documentId: updated.documentId,
          attemptNumber,
        };
      }

      const created = await strapi.documents(SUBMISSION_UID).create({
        data: {
          ...buildSubmissionRelations(parsedPayload),
          ...scalarData,
          fullName: respondentData?.fullName ?? null,
          email: respondentData?.email ?? null,
          emailNormalized: respondentData?.emailNormalized ?? null,
          phone: respondentData?.phone ?? null,
          consentAcceptedAt: respondentData?.consentAcceptedAt ?? null,
        },
      });

      if (parsedPayload.meta?.requestId) {
        strapi.log.info(
          `[diagnostics] submission upserted requestId=${parsedPayload.meta.requestId} campaign=${parsedPayload.campaignSlugSnapshot} documentId=${created.documentId} attempt=${attemptNumber}`
        );
      }

      return {
        documentId: created.documentId,
        attemptNumber,
      };
    },

    async listCampaignOptions(): Promise<CampaignOption[]> {
      const campaigns = await strapi.documents(CAMPAIGN_UID).findMany({
        status: "draft",
        populate: {
          organization: true,
          test: true,
        },
        pagination: {
          page: 1,
          pageSize: 200,
        },
        sort: ["updatedAt:desc", "title:asc"],
      });

      return (Array.isArray(campaigns) ? campaigns : []).map((campaign: any) => ({
        documentId: String(campaign.documentId),
        title: String(campaign.title ?? "Без названия"),
        slug: String(campaign.slug ?? ""),
        isActive: Boolean(campaign.isActive),
        organizationName: String(campaign.organization?.name ?? "Организация не указана"),
        testLabel: campaign.test
          ? `${campaign.test.title ?? "Тест"} · v${String(campaign.test.version ?? 1)}`
          : "Тест не привязан",
      }));
    },

    async exportCampaignCsv({
      campaignDocumentId,
      from,
      to,
    }: ExportCampaignCsvInput) {
      const campaign = await strapi.documents(CAMPAIGN_UID).findFirst({
        status: "draft",
        filters: {
          documentId: {
            $eq: campaignDocumentId,
          },
        },
        populate: {
          organization: true,
          test: {
            populate: {
              questions: {
                populate: {
                  options: true,
                },
              },
            },
          },
        },
      });

      if (!campaign) {
        return null;
      }

      const submissions: any[] = [];
      const submittedAtFilters = buildSubmittedAtFilters(from, to);
      let page = 1;

      while (true) {
        const batch = await strapi.documents(SUBMISSION_UID).findMany({
          populate: {
            answers: true,
          },
          filters: {
            campaign: {
              documentId: {
                $eq: campaignDocumentId,
              },
            },
            ...(submittedAtFilters
              ? {
                  submittedAt: submittedAtFilters,
                }
              : {}),
          },
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

      const orderedQuestions = Array.isArray(campaign.test?.questions)
        ? [...campaign.test.questions].sort(compareByOrderThenKey)
        : [];

      const questionColumns = orderedQuestions.map((question: any) => ({
        key: String(question.key ?? ""),
        title: String(question.title ?? ""),
      }));

      const headerRow = [
        "Дата прохождения",
        "Попытка",
        "ФИО",
        "Email",
        "Телефон",
        "Страница отправки",
        "Организация",
        "Кампания",
        "Slug кампании",
        "Тест",
        "Версия теста",
        "Итоговый балл",
        ...questionColumns.map((column) => column.title),
      ];

      const rows = submissions.map((submission: any) => {
        const scoresByQuestionKey = new Map<string, string>();

        if (Array.isArray(submission.answers)) {
          for (const answer of submission.answers) {
            const questionKey = String(answer?.questionKey ?? "");
            if (!questionKey) continue;
            scoresByQuestionKey.set(questionKey, String(answer?.weight ?? ""));
          }
        }

        return [
          String(submission.submittedAt ?? ""),
          String(submission.attemptNumber ?? ""),
          String(submission.fullName ?? ""),
          String(submission.email ?? ""),
          String(submission.phone ?? ""),
          String(submission.sourcePageUrl ?? ""),
          String(submission.organizationNameSnapshot ?? ""),
          String(campaign.title ?? ""),
          String(submission.campaignSlugSnapshot ?? campaign.slug ?? ""),
          String(submission.testCodeSnapshot ?? ""),
          String(submission.testVersionSnapshot ?? ""),
          String(submission.totalScore ?? ""),
          ...questionColumns.map((column) => scoresByQuestionKey.get(column.key) ?? ""),
        ];
      });

      return {
        fileName: `diagnostic-submissions-${sanitizeFileSegment(
          String(campaign.slug ?? campaignDocumentId)
        )}.csv`,
        csv: buildCsv([headerRow, ...rows]),
      };
    },
  })
);
