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

interface LeadData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
}

function parseLeadPayload(payload: unknown): LeadData | null {
  if (typeof payload !== "object" || payload === null) return null;
  const record = payload as Record<string, unknown>;

  const name = asTrimmedString(record.name);
  const email = asTrimmedString(record.email);
  if (!name || !email) return null;

  return {
    name,
    email,
    phone: asOptionalTrimmedString(record.phone),
    company: asOptionalTrimmedString(record.company),
    message: asOptionalTrimmedString(record.message),
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

    const data = parseLeadPayload(rawBody.data);

    if (!data) {
      return NextResponse.json(
        { error: "Имя и email обязательны для заполнения" },
        { status: 400, headers: responseHeaders }
      );
    }

    if (!isValidEmail(data.email)) {
      return NextResponse.json(
        { error: "Некорректный формат email" },
        { status: 400, headers: responseHeaders }
      );
    }

    await contactSink.submitLead(data, {
      requestId,
      clientIp: getClientIp(request),
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Заявка успешно отправлена",
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error(`[${requestId}] Error processing lead:`, error);
    return NextResponse.json(
      { error: "Произошла ошибка при обработке заявки" },
      { status: 500, headers: responseHeaders }
    );
  }
}
