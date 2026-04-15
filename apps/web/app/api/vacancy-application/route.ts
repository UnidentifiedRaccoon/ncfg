import { NextResponse } from "next/server";

import { getPublishedVacancySummaryBySlug } from "@/shared/api/vacancies";
import {
  getClientIp,
  getOrCreateRequestId,
  readJsonSafe,
} from "@/shared/lib/api-route-utils";
import { contactSink } from "@/shared/lib/contact-sink";
import { resolveSourcePageUrl } from "@/shared/lib/source-page";
import type {
  VacancyApplicationConfirmationData,
  VacancyApplicationSubmission,
} from "@/shared/lib/vacancy-application";
import {
  parseVacancyApplicationPayload,
  VACANCY_APPLICATION_UNKNOWN_VACANCY_ERROR,
} from "@/shared/lib/vacancy-application";
import { vacancyApplicationMailer } from "@/shared/lib/vacancy-application-mailer";

interface VacancySummary {
  slug: string;
  title: string;
  publishedAt: string | null;
}

interface VacancyApplicationRouteDeps {
  findVacancyBySlug(slug: string): Promise<VacancySummary | null>;
  submitVacancyApplication(
    data: VacancyApplicationSubmission,
    ctx: {
      requestId: string;
      clientIp: string;
      userAgent?: string;
    }
  ): Promise<void>;
  sendConfirmation(
    data: VacancyApplicationConfirmationData,
    ctx: {
      requestId: string;
    }
  ): Promise<void>;
}

const defaultDeps: VacancyApplicationRouteDeps = {
  async findVacancyBySlug(slug) {
    const vacancy = await getPublishedVacancySummaryBySlug(slug);
    if (!vacancy) return null;

    return {
      slug: vacancy.slug,
      title: vacancy.title,
      publishedAt: vacancy.publishedAt,
    };
  },
  submitVacancyApplication(data, ctx) {
    return contactSink.submitVacancyApplication(data, ctx);
  },
  sendConfirmation(data, ctx) {
    return vacancyApplicationMailer.sendConfirmation(data, ctx);
  },
};

export async function handleVacancyApplicationPost(
  request: Request,
  deps: VacancyApplicationRouteDeps = defaultDeps
) {
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

    const payload = parseVacancyApplicationPayload(rawBody.data);
    if (!payload.ok) {
      return NextResponse.json(
        { error: payload.error },
        { status: 400, headers: responseHeaders }
      );
    }

    if (!payload.data.vacancySlug) {
      return NextResponse.json(
        { error: VACANCY_APPLICATION_UNKNOWN_VACANCY_ERROR },
        { status: 400, headers: responseHeaders }
      );
    }

    const vacancy = await deps.findVacancyBySlug(payload.data.vacancySlug);
    if (!vacancy?.publishedAt) {
      return NextResponse.json(
        { error: VACANCY_APPLICATION_UNKNOWN_VACANCY_ERROR },
        { status: 400, headers: responseHeaders }
      );
    }

    const sourcePageUrl = resolveSourcePageUrl(request, payload.data.sourcePageUrl);
    const submission: VacancyApplicationSubmission = {
      ...payload.data,
      vacancySlug: vacancy.slug,
      vacancyTitle: vacancy.title,
      sourcePageUrl,
    };
    const requestContext = {
      requestId,
      clientIp: getClientIp(request),
      userAgent: request.headers.get("user-agent") ?? undefined,
    };

    await deps.submitVacancyApplication(submission, requestContext);

    try {
      await deps.sendConfirmation(
        {
          name: submission.name,
          email: submission.email,
          vacancySlug: submission.vacancySlug,
          vacancyTitle: submission.vacancyTitle,
          sourcePageUrl: submission.sourcePageUrl,
        },
        { requestId }
      );
    } catch (error) {
      console.error(
        `[${requestId}] Failed to send vacancy application confirmation email:`,
        error
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Отклик успешно отправлен",
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error(`[${requestId}] Error processing vacancy application:`, error);
    return NextResponse.json(
      { error: "Произошла ошибка при обработке отклика" },
      { status: 500, headers: responseHeaders }
    );
  }
}

export async function POST(request: Request) {
  return handleVacancyApplicationPost(request);
}
