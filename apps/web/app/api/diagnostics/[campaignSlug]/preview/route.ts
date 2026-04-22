import { NextResponse } from "next/server";
import {
  getClientIp,
  asTrimmedString,
  getOrCreateRequestId,
  readJsonSafe,
} from "@/shared/lib/api-route-utils";
import { getDiagnosticCampaignBySlug } from "@/shared/api/diagnostics";
import {
  buildDiagnosticResult,
  evaluateDiagnosticSubmission,
  isDiagnosticCampaignAvailable,
  type DiagnosticAnswerInput,
} from "@/shared/lib/diagnostics";
import { resolveSourcePageUrl } from "@/shared/lib/source-page";
import { postStrapiWriteJSON } from "@/shared/lib/strapi-write";

interface DiagnosticIntakeResponse {
  data?: {
    documentId?: string;
    attemptNumber?: number;
  };
}

function parseAnswers(value: unknown): DiagnosticAnswerInput[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const answers: DiagnosticAnswerInput[] = [];

  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      return null;
    }

    const record = item as Record<string, unknown>;
    const questionKey = asTrimmedString(record.questionKey);
    const answerKey = asTrimmedString(record.answerKey);
    if (!questionKey || !answerKey) {
      return null;
    }

    answers.push({ questionKey, answerKey });
  }

  return answers;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ campaignSlug: string }> }
) {
  const { campaignSlug } = await params;
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

    const body = rawBody.data as Record<string, unknown> | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Ответы обязательны" },
        { status: 400, headers: responseHeaders }
      );
    }

    const submissionKey = asTrimmedString(body.submissionKey);
    if (!submissionKey) {
      return NextResponse.json(
        { error: "Идентификатор диагностики обязателен" },
        { status: 400, headers: responseHeaders }
      );
    }

    const answers = parseAnswers(body.answers);
    if (!answers || answers.length === 0) {
      return NextResponse.json(
        { error: "Ответы обязательны" },
        { status: 400, headers: responseHeaders }
      );
    }

    const campaign = await getDiagnosticCampaignBySlug(campaignSlug);
    if (
      !campaign ||
      !campaign.organization ||
      !campaign.test ||
      !isDiagnosticCampaignAvailable(campaign)
    ) {
      return NextResponse.json(
        { error: "Диагностика недоступна" },
        { status: 404, headers: responseHeaders }
      );
    }

    let evaluatedSubmission;
    try {
      evaluatedSubmission = evaluateDiagnosticSubmission(campaign, answers);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Не удалось проверить ответы диагностики",
        },
        { status: 400, headers: responseHeaders }
      );
    }

    const intakeResponse = await postStrapiWriteJSON<DiagnosticIntakeResponse>(
      "/diagnostic-submissions/intake",
      {
        submissionKey,
        campaignDocumentId: campaign.documentId,
        organizationDocumentId: campaign.organization.documentId,
        testDocumentId: campaign.test.documentId,
        submittedAt: new Date().toISOString(),
        totalScore: evaluatedSubmission.totalScore,
        sourcePageUrl: resolveSourcePageUrl(request, body.sourcePageUrl),
        campaignSlugSnapshot: campaign.slug,
        organizationNameSnapshot: campaign.organization.name,
        testCodeSnapshot: campaign.test.code,
        testVersionSnapshot: campaign.test.version,
        answers: evaluatedSubmission.answersSnapshot,
        meta: {
          requestId,
          clientIp: getClientIp(request),
          userAgent: request.headers.get("user-agent") ?? undefined,
        },
      }
    );

    const result = buildDiagnosticResult(campaign, evaluatedSubmission);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...intakeResponse.data,
          result,
        },
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error(`[${requestId}] Error processing diagnostic preview:`, error);
    return NextResponse.json(
      { error: "Произошла ошибка при сохранении результата диагностики" },
      { status: 500, headers: responseHeaders }
    );
  }
}
