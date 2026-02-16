import { NextResponse } from "next/server";
import {
  asOptionalTrimmedString,
  asTrimmedString,
  getClientIp,
  getOrCreateRequestId,
  isValidEmail,
  readJsonSafe,
} from "@/shared/lib/api-route-utils";
import { contactSink } from "@/shared/lib/contact-sink";

interface QuestionData {
  question: string;
  name: string;
  email: string;
  postTitle?: string;
}

function parseQuestionPayload(payload: unknown): QuestionData | null {
  if (typeof payload !== "object" || payload === null) return null;
  const record = payload as Record<string, unknown>;

  const question = asTrimmedString(record.question);
  const name = asTrimmedString(record.name);
  const email = asTrimmedString(record.email);

  if (!question || !name || !email) return null;

  return {
    question,
    name,
    email,
    postTitle: asOptionalTrimmedString(record.postTitle),
  };
}

export async function POST(request: Request) {
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

    const data = parseQuestionPayload(rawBody.data);
    if (!data) {
      return NextResponse.json(
        { error: "Вопрос, имя и email обязательны для заполнения" },
        { status: 400, headers: responseHeaders }
      );
    }

    if (data.question.length > 1000) {
      return NextResponse.json(
        { error: "Вопрос не должен превышать 1000 символов" },
        { status: 400, headers: responseHeaders }
      );
    }

    if (!isValidEmail(data.email)) {
      return NextResponse.json(
        { error: "Некорректный формат email" },
        { status: 400, headers: responseHeaders }
      );
    }

    await contactSink.submitQuestion(data, {
      requestId,
      clientIp: getClientIp(request),
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Вопрос успешно отправлен",
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error(`[${requestId}] Error processing question:`, error);
    return NextResponse.json(
      { error: "Произошла ошибка при обработке вопроса" },
      { status: 500, headers: responseHeaders }
    );
  }
}
