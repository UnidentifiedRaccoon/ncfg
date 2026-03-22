import { NextResponse } from "next/server";
import {
  asTrimmedString,
  getOrCreateRequestId,
  readJsonSafe,
} from "@/shared/lib/api-route-utils";
import { getDiagnosticCampaignBySlug } from "@/shared/api/diagnostics";
import {
  evaluateDiagnosticSubmission,
  isDiagnosticCampaignAvailable,
  selectResultBand,
  validateResultBands,
  type DiagnosticAnswerInput,
} from "@/shared/lib/diagnostics";

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
        { error: "Некорректный JSON в теле запроса" },
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

    const { totalScore, maxScore, scorePercent, insights } = evaluatedSubmission;
    const resultBands = campaign.test.resultBands ?? [];
    let band: {
      key: string;
      title: string;
      summary: string;
      ctaLabel?: string;
      ctaHref?: string;
    } | null = null;

    if (resultBands.length > 0) {
      const validation = validateResultBands(resultBands);
      if (validation.valid) {
        const matched = selectResultBand(resultBands, scorePercent);
        if (matched) {
          band = {
            key: matched.key,
            title: matched.title,
            summary: matched.summary,
            ctaLabel: matched.ctaLabel,
            ctaHref: matched.ctaHref,
          };
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          result: { totalScore, maxScore, scorePercent, band, insights },
        },
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error(`[${requestId}] Error processing diagnostic preview:`, error);
    return NextResponse.json(
      { error: "Произошла ошибка при вычислении результатов" },
      { status: 500, headers: responseHeaders }
    );
  }
}
