import { NextResponse } from "next/server";
import {
  asOptionalTrimmedString,
  asTrimmedString,
  getClientIp,
  getOrCreateRequestId,
  isValidEmail,
  readJsonSafe,
} from "@/shared/lib/api-route-utils";
import { getDiagnosticCampaignBySlug } from "@/shared/api/diagnostics";
import type { DiagnosticEmailDeliveryStatus } from "@/shared/api/types/diagnostic";
import {
  buildDiagnosticResult,
  evaluateDiagnosticSubmission,
  isDiagnosticCampaignAvailable,
  normalizeDiagnosticEmail,
  type DiagnosticAnswerInput,
} from "@/shared/lib/diagnostics";
import { diagnosticResultMailer } from "@/shared/lib/diagnostic-result-mailer";
import { resolveSourcePageUrl } from "@/shared/lib/source-page";
import { postStrapiWriteJSON } from "@/shared/lib/strapi-write";

interface SubmitPayload {
  submissionKey: string;
  answers: DiagnosticAnswerInput[];
  sourcePageUrl?: string;
  respondent: {
    fullName: string;
    email: string;
    phone?: string;
    consentAccepted: true;
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

function parseSubmitPayload(payload: unknown): SubmitPayload | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const submissionKey = asTrimmedString(record.submissionKey);
  const answers = parseAnswers(record.answers);
  if (!submissionKey || !answers || answers.length === 0) {
    return null;
  }

  const respondentValue = record.respondent;
  if (typeof respondentValue !== "object" || respondentValue === null) {
    return null;
  }

  const respondentRecord = respondentValue as Record<string, unknown>;
  const fullName = asTrimmedString(respondentRecord.fullName);
  const email = asTrimmedString(respondentRecord.email);
  const consentAccepted = respondentRecord.consentAccepted === true;

  if (!fullName || !email || !consentAccepted) {
    return null;
  }

  return {
    submissionKey,
    answers,
    sourcePageUrl: asOptionalTrimmedString(record.sourcePageUrl),
    respondent: {
      fullName,
      email,
      phone: asOptionalTrimmedString(respondentRecord.phone),
      consentAccepted: true,
    },
  };
}

interface DiagnosticIntakeResponse {
  data?: {
    documentId?: string;
    attemptNumber?: number;
  };
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

    const data = parseSubmitPayload(rawBody.data);
    if (!data) {
      return NextResponse.json(
        { error: "Ответы, имя, email и согласие обязательны" },
        { status: 400, headers: responseHeaders }
      );
    }

    if (!isValidEmail(data.respondent.email)) {
      return NextResponse.json(
        { error: "Некорректный формат email" },
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
      evaluatedSubmission = evaluateDiagnosticSubmission(campaign, data.answers);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Не удалось проверить ответы диагностики",
        },
        { status: 400, headers: responseHeaders }
      );
    }

    const submittedAt = new Date().toISOString();
    const intakePayload = {
      submissionKey: data.submissionKey,
      campaignDocumentId: campaign.documentId,
      organizationDocumentId: campaign.organization.documentId,
      testDocumentId: campaign.test.documentId,
      fullName: data.respondent.fullName,
      email: data.respondent.email,
      emailNormalized: normalizeDiagnosticEmail(data.respondent.email),
      phone: data.respondent.phone,
      consentAcceptedAt: submittedAt,
      submittedAt,
      totalScore: evaluatedSubmission.totalScore,
      sourcePageUrl: resolveSourcePageUrl(request, data.sourcePageUrl),
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
    };

    const intakeResponse = await postStrapiWriteJSON<DiagnosticIntakeResponse>(
      "/diagnostic-submissions/intake",
      intakePayload
    );

    const result = buildDiagnosticResult(campaign, evaluatedSubmission);
    let emailDeliveryStatus: DiagnosticEmailDeliveryStatus = "failed";

    try {
      await diagnosticResultMailer.sendResultCopy(
        {
          fullName: data.respondent.fullName,
          email: data.respondent.email,
          campaignTitle: campaign.title,
          organizationName: campaign.organization.name,
          result,
        },
        {
          requestId,
        }
      );
      emailDeliveryStatus = "sent";
    } catch (error) {
      console.error(`[${requestId}] Error sending diagnostic result email:`, error);
    }

    return NextResponse.json(
      {
        success: true,
        message:
          emailDeliveryStatus === "sent"
            ? "Диагностика успешно сохранена, копия результатов отправлена на почту"
            : "Диагностика успешно сохранена, но отправить копию результатов на почту не удалось",
        data: {
          ...intakeResponse.data,
          result,
          emailDeliveryStatus,
        },
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error(`[${requestId}] Error processing diagnostic submission:`, error);
    return NextResponse.json(
      { error: "Произошла ошибка при сохранении диагностики" },
      { status: 500, headers: responseHeaders }
    );
  }
}
