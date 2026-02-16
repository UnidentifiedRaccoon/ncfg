export type LeadSubmission = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
};

export type QuestionSubmission = {
  question: string;
  name: string;
  email: string;
  postTitle?: string;
};

export type ContactSinkContext = {
  requestId: string;
  clientIp: string;
  userAgent?: string;
};

export interface ContactSink {
  submitLead(data: LeadSubmission, ctx: ContactSinkContext): Promise<void>;
  submitQuestion(data: QuestionSubmission, ctx: ContactSinkContext): Promise<void>;
}

const RECIPIENT_EMAIL =
  process.env.LEADS_RECIPIENT_EMAIL || "yura.posledov@yandex.ru";

type GetCourseUserPayload = {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  group_name?: string;
  addfields?: Record<string, string>;
};

type GetCourseApiResponse = {
  success?: boolean | number | string;
  error?: string;
  error_message?: string;
  message?: string;
};

type GetCourseConfig = {
  baseUrl: string;
  apiKey: string;
  leadGroupName?: string;
  questionGroupName?: string;
  sourceValue: string;
  fields: {
    source?: string;
    company?: string;
    message?: string;
    question?: string;
    postTitle?: string;
    requestId?: string;
  };
};

class ConsoleContactSink implements ContactSink {
  async submitLead(data: LeadSubmission, ctx: ContactSinkContext) {
    console.log(`[${ctx.requestId}] === Новая заявка с сайта НЦФГ ===`);
    console.log(`Получатель: ${RECIPIENT_EMAIL}`);
    console.log(`IP: ${ctx.clientIp}`);
    if (ctx.userAgent) console.log(`UA: ${ctx.userAgent}`);
    console.log(`Имя: ${data.name}`);
    console.log(`Email: ${data.email}`);
    console.log(`Телефон: ${data.phone || "не указан"}`);
    console.log(`Компания: ${data.company || "не указана"}`);
    console.log(`Сообщение: ${data.message || "не указано"}`);
    console.log("================================");
  }

  async submitQuestion(data: QuestionSubmission, ctx: ContactSinkContext) {
    console.log(`[${ctx.requestId}] === Новый вопрос с сайта НЦФГ ===`);
    console.log(`Получатель: ${RECIPIENT_EMAIL}`);
    console.log(`IP: ${ctx.clientIp}`);
    if (ctx.userAgent) console.log(`UA: ${ctx.userAgent}`);
    console.log(`Статья: ${data.postTitle || "не указана"}`);
    console.log(`Имя: ${data.name}`);
    console.log(`Email: ${data.email}`);
    console.log(`Вопрос: ${data.question}`);
    console.log("================================");
  }
}

class GetCourseContactSink implements ContactSink {
  constructor(private readonly config: GetCourseConfig) {}

  async submitLead(data: LeadSubmission, ctx: ContactSinkContext) {
    const { firstName, lastName } = splitName(data.name);
    const addfields = this.buildAddFields([
      [this.config.fields.source, this.config.sourceValue],
      [this.config.fields.requestId, ctx.requestId],
      [this.config.fields.company, data.company],
      [this.config.fields.message, data.message],
    ]);

    await this.submitUser(
      {
        email: data.email,
        phone: data.phone,
        first_name: firstName,
        last_name: lastName,
        group_name: this.config.leadGroupName,
        addfields,
      },
      ctx
    );
  }

  async submitQuestion(data: QuestionSubmission, ctx: ContactSinkContext) {
    const { firstName, lastName } = splitName(data.name);
    const addfields = this.buildAddFields([
      [this.config.fields.source, this.config.sourceValue],
      [this.config.fields.requestId, ctx.requestId],
      [this.config.fields.question, data.question],
      [this.config.fields.postTitle, data.postTitle],
    ]);

    await this.submitUser(
      {
        email: data.email,
        first_name: firstName,
        last_name: lastName,
        group_name: this.config.questionGroupName,
        addfields,
      },
      ctx
    );
  }

  private async submitUser(user: GetCourseUserPayload, ctx: ContactSinkContext) {
    const payload = {
      user,
      system: {
        refresh_if_exists: 1 as const,
      },
    };

    const body = new URLSearchParams({
      action: "add",
      key: this.config.apiKey,
      params: Buffer.from(JSON.stringify(payload), "utf8").toString("base64"),
    });

    const response = await fetch(`${this.config.baseUrl}/pl/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: body.toString(),
      cache: "no-store",
    });

    const rawResponse = await response.text();
    const parsedResponse = parseGetCourseResponse(rawResponse);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${extractGetCourseError(parsedResponse, rawResponse)}`
      );
    }

    const explicitError = extractGetCourseError(parsedResponse, rawResponse);
    if (explicitError) {
      throw new Error(explicitError);
    }

    if (parsedResponse?.success !== undefined && !isTruthy(parsedResponse.success)) {
      throw new Error(parsedResponse.message || "GetCourse returned unsuccessful status");
    }

    console.log(`[${ctx.requestId}] GetCourse contact synced for ${user.email}`);
  }

  private buildAddFields(entries: Array<[string | undefined, string | undefined]>) {
    const addfields: Record<string, string> = {};

    for (const [fieldName, fieldValue] of entries) {
      if (!fieldName || !fieldValue) continue;
      addfields[fieldName] = fieldValue;
    }

    return Object.keys(addfields).length ? addfields : undefined;
  }
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts.shift() || fullName;
  const lastName = parts.join(" ").trim();

  return {
    firstName,
    lastName: lastName || undefined,
  };
}

function parseGetCourseResponse(rawResponse: string): GetCourseApiResponse | null {
  try {
    const parsed = JSON.parse(rawResponse) as GetCourseApiResponse;
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed;
  } catch {
    return null;
  }
}

function extractGetCourseError(
  payload: GetCourseApiResponse | null,
  rawResponse: string
) {
  if (!payload) return rawResponse.slice(0, 300) || null;
  return payload.error_message || payload.error || null;
}

function isTruthy(value: boolean | number | string) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "ok";
}

function asOptionalEnv(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length ? trimmed : undefined;
}

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function hostFromUrl(value: string) {
  try {
    return new URL(value).host;
  } catch {
    return value;
  }
}

function createContactSink(): ContactSink {
  const getCourseApiKey = asOptionalEnv(process.env.GETCOURSE_API_KEY);
  const getCourseBaseUrl = asOptionalEnv(process.env.GETCOURSE_BASE_URL);

  if (!getCourseApiKey || !getCourseBaseUrl) {
    return new ConsoleContactSink();
  }

  const normalizedBaseUrl = normalizeBaseUrl(getCourseBaseUrl);
  const sourceValue =
    asOptionalEnv(process.env.GETCOURSE_SOURCE_VALUE) ||
    hostFromUrl(normalizedBaseUrl);

  return new GetCourseContactSink({
    baseUrl: normalizedBaseUrl,
    apiKey: getCourseApiKey,
    leadGroupName: asOptionalEnv(process.env.GETCOURSE_LEAD_GROUP_NAME),
    questionGroupName: asOptionalEnv(process.env.GETCOURSE_QUESTION_GROUP_NAME),
    sourceValue,
    fields: {
      source: asOptionalEnv(process.env.GETCOURSE_FIELD_SOURCE),
      company: asOptionalEnv(process.env.GETCOURSE_FIELD_COMPANY),
      message: asOptionalEnv(process.env.GETCOURSE_FIELD_MESSAGE),
      question: asOptionalEnv(process.env.GETCOURSE_FIELD_QUESTION),
      postTitle: asOptionalEnv(process.env.GETCOURSE_FIELD_POST_TITLE),
      requestId: asOptionalEnv(process.env.GETCOURSE_FIELD_REQUEST_ID),
    },
  });
}

export const contactSink: ContactSink = createContactSink();
