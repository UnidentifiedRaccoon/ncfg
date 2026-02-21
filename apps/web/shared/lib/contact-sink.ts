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
  name: string;
  phone?: string;
};

type GetCourseDealPayload = {
  deal_number: string;
  deal_status: string;
  product_title: string;
  cost: number;
  deal_comment?: string;
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
  sourceValue: string;
  deal: {
    productTitleLead: string;
    productTitleQuestion: string;
    cost: number;
    status: string;
  };
  fields: {
    source?: string;
    company?: string;
    message?: string;
    question?: string;
    postTitle?: string;
    requestId?: string;
    formType?: string;
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
    const addfields = this.buildAddFields([
      [this.config.fields.source, this.config.sourceValue],
      [this.config.fields.requestId, ctx.requestId],
      [this.config.fields.formType, "lead"],
      [this.config.fields.company, data.company],
      [this.config.fields.message, data.message],
    ]);

    await this.submitDeal(
      {
        email: data.email,
        name: data.name,
        phone: data.phone,
      },
      {
        deal_number: ctx.requestId,
        deal_status: this.config.deal.status,
        product_title: this.config.deal.productTitleLead,
        cost: this.config.deal.cost,
        deal_comment: this.buildLeadComment(data, ctx),
        addfields,
      },
      ctx
    );
  }

  async submitQuestion(data: QuestionSubmission, ctx: ContactSinkContext) {
    const addfields = this.buildAddFields([
      [this.config.fields.source, this.config.sourceValue],
      [this.config.fields.requestId, ctx.requestId],
      [this.config.fields.formType, "question"],
      [this.config.fields.question, data.question],
      [this.config.fields.postTitle, data.postTitle],
    ]);

    await this.submitDeal(
      {
        email: data.email,
        name: data.name,
      },
      {
        deal_number: ctx.requestId,
        deal_status: this.config.deal.status,
        product_title: this.config.deal.productTitleQuestion,
        cost: this.config.deal.cost,
        deal_comment: this.buildQuestionComment(data, ctx),
        addfields,
      },
      ctx
    );
  }

  private async submitDeal(
    user: GetCourseUserPayload,
    deal: GetCourseDealPayload,
    ctx: ContactSinkContext
  ) {
    const payload = {
      user,
      deal,
    };

    const body = new URLSearchParams({
      action: "add",
      key: this.config.apiKey,
      params: Buffer.from(JSON.stringify(payload), "utf8").toString("base64"),
    });

    const response = await fetch(`${this.config.baseUrl}/pl/api/deals`, {
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

    console.log(`[${ctx.requestId}] GetCourse deal synced for ${user.email}`);
  }

  private buildAddFields(entries: Array<[string | undefined, string | undefined]>) {
    const addfields: Record<string, string> = {};

    for (const [fieldName, fieldValue] of entries) {
      if (!fieldName || !fieldValue) continue;
      addfields[fieldName] = fieldValue;
    }

    return Object.keys(addfields).length ? addfields : undefined;
  }

  private buildLeadComment(data: LeadSubmission, ctx: ContactSinkContext) {
    return [
      "Форма: Заявка с сайта",
      `Имя: ${data.name}`,
      `Email: ${data.email}`,
      `Телефон: ${data.phone || "не указан"}`,
      `Компания: ${data.company || "не указана"}`,
      `Сообщение: ${data.message || "не указано"}`,
      `Источник: ${this.config.sourceValue}`,
      `Request ID: ${ctx.requestId}`,
    ].join("\n");
  }

  private buildQuestionComment(data: QuestionSubmission, ctx: ContactSinkContext) {
    return [
      "Форма: Вопрос по статье",
      `Статья: ${data.postTitle || "не указана"}`,
      `Имя: ${data.name}`,
      `Email: ${data.email}`,
      `Вопрос: ${data.question}`,
      `Источник: ${this.config.sourceValue}`,
      `Request ID: ${ctx.requestId}`,
    ].join("\n");
  }
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

function asOptionalNonNegativeNumber(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;

  return parsed;
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
  const dealCost = asOptionalNonNegativeNumber(process.env.GETCOURSE_DEAL_COST) ?? 0;

  return new GetCourseContactSink({
    baseUrl: normalizedBaseUrl,
    apiKey: getCourseApiKey,
    sourceValue,
    deal: {
      productTitleLead:
        asOptionalEnv(process.env.GETCOURSE_DEAL_PRODUCT_TITLE_LEAD) || "Website Lead",
      productTitleQuestion:
        asOptionalEnv(process.env.GETCOURSE_DEAL_PRODUCT_TITLE_QUESTION) ||
        "Website Question",
      cost: dealCost,
      status: asOptionalEnv(process.env.GETCOURSE_DEAL_STATUS) || "new",
    },
    fields: {
      source: asOptionalEnv(process.env.GETCOURSE_DEAL_FIELD_SOURCE),
      company: asOptionalEnv(process.env.GETCOURSE_DEAL_FIELD_COMPANY),
      message: asOptionalEnv(process.env.GETCOURSE_DEAL_FIELD_MESSAGE),
      question: asOptionalEnv(process.env.GETCOURSE_DEAL_FIELD_QUESTION),
      postTitle: asOptionalEnv(process.env.GETCOURSE_DEAL_FIELD_POST_TITLE),
      requestId: asOptionalEnv(process.env.GETCOURSE_DEAL_FIELD_REQUEST_ID),
      formType: asOptionalEnv(process.env.GETCOURSE_DEAL_FIELD_FORM_TYPE),
    },
  });
}

export const contactSink: ContactSink = createContactSink();
