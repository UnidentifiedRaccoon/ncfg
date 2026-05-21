import { NextResponse } from "next/server";
import {
  asOptionalTrimmedString,
  asTrimmedString,
  getClientIp,
  getOrCreateRequestId,
  readJsonSafe,
} from "@/shared/lib/api-route-utils";
import { resolveSourcePageUrl } from "@/shared/lib/source-page";
import { postStrapiWriteJSON } from "@/shared/lib/strapi-write";
import {
  getHrDiagnosticTest,
  HR_DIAGNOSTIC_SLUG,
  validateHrDiagnosticSubmission,
  type HrDiagnosticAnswerInput,
  type HrDiagnosticNormalizedAnswer,
} from "@/entities/HrDiagnostic";

interface SubmitPayload {
  submissionKey: string;
  answers: HrDiagnosticAnswerInput[];
  sourcePageUrl?: string;
  consentAccepted: true;
}

interface HrDiagnosticIntakeResponse {
  data?: {
    documentId?: string;
    attemptNumber?: number;
    submittedAt?: string;
  };
}

function parseSelectedOptionKeys(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function parseAnswers(value: unknown): HrDiagnosticAnswerInput[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const answers: HrDiagnosticAnswerInput[] = [];

  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      return null;
    }

    const record = item as Record<string, unknown>;
    const questionKey = asTrimmedString(record.questionKey);
    if (!questionKey) {
      return null;
    }

    answers.push({
      questionKey,
      selectedOptionKeys: parseSelectedOptionKeys(record.selectedOptionKeys),
      otherText: asOptionalTrimmedString(record.otherText),
      text: asOptionalTrimmedString(record.text),
    });
  }

  return answers;
}

function parseSubmitPayload(payload: unknown): SubmitPayload | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const submissionKey = asTrimmedString(record.submissionKey);
  const answers = parseAnswers(record.answers);
  const consentAccepted = record.consentAccepted === true;

  if (!submissionKey || !answers || !consentAccepted) {
    return null;
  }

  return {
    submissionKey,
    answers,
    sourcePageUrl: asOptionalTrimmedString(record.sourcePageUrl),
    consentAccepted: true,
  };
}

function normalizeEmail(value: string | undefined): string | undefined {
  const trimmed = value?.trim().toLowerCase();
  return trimmed ? trimmed : undefined;
}

function findNormalizedAnswerText(
  answers: HrDiagnosticNormalizedAnswer[],
  questionKey: string
) {
  const answer = answers.find((item) => item.questionKey === questionKey);
  return answer?.text ?? answer?.answerLabel;
}

async function resolveHrDiagnosticTest(requestId: string) {
  try {
    return await getHrDiagnosticTest(HR_DIAGNOSTIC_SLUG);
  } catch (error) {
    console.error(`[${requestId}] Failed to load HR diagnostic test from Strapi`, error);
    return null;
  }
}

export async function POST(request: Request) {
  const requestId = getOrCreateRequestId(request);
  const responseHeaders = { "x-request-id": requestId };

  try {
    const rawBody = await readJsonSafe(request);
    if (!rawBody.ok) {
      return NextResponse.json(
        { error: "Некорректный JSON в теле запроса" },
        { status: 400, headers: responseHeaders }
      );
    }

    const data = parseSubmitPayload(rawBody.data);
    if (!data) {
      return NextResponse.json(
        { error: "Ответы и согласие обязательны" },
        { status: 400, headers: responseHeaders }
      );
    }

    const test = await resolveHrDiagnosticTest(requestId);
    if (!test) {
      return NextResponse.json(
        { error: "HR-опрос временно недоступен: методика не настроена в CMS" },
        { status: 503, headers: responseHeaders }
      );
    }

    const validation = validateHrDiagnosticSubmission(test, data.answers);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors[0] ?? "Проверьте ответы перед отправкой" },
        { status: 400, headers: responseHeaders }
      );
    }

    const submittedAt = new Date().toISOString();
    const sourcePageUrl = resolveSourcePageUrl(request, data.sourcePageUrl);
    const respondentEmail = findNormalizedAnswerText(validation.normalizedAnswers, "email");

    const intakeResponse = await postStrapiWriteJSON<HrDiagnosticIntakeResponse>(
      "/hr-diagnostic-submissions/intake",
      {
        submissionKey: data.submissionKey,
        targetSegment: validation.targetSegment,
        email: respondentEmail,
        emailNormalized: normalizeEmail(respondentEmail),
        sourcePageUrl,
        submittedAt,
        answers: validation.normalizedAnswers,
        meta: {
          requestId,
          clientIp: getClientIp(request),
          userAgent: request.headers.get("user-agent") ?? undefined,
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Анкета успешно отправлена",
        data: {
          documentId: intakeResponse.data?.documentId,
          attemptNumber: intakeResponse.data?.attemptNumber,
          targetSegment: validation.targetSegment,
          submittedAt: intakeResponse.data?.submittedAt ?? submittedAt,
        },
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error(`[${requestId}] Error processing HR diagnostic submission:`, error);
    return NextResponse.json(
      { error: "Произошла ошибка при отправке анкеты" },
      { status: 500, headers: responseHeaders }
    );
  }
}
