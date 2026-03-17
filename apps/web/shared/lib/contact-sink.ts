import nodemailer from "nodemailer";

type LeadSubmission = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  sourcePageUrl?: string;
};

type QuestionSubmission = {
  question: string;
  name: string;
  email: string;
  postTitle?: string;
  sourcePageUrl?: string;
};

type ContactSinkContext = {
  requestId: string;
  clientIp: string;
  userAgent?: string;
};

interface ContactSink {
  submitLead(data: LeadSubmission, ctx: ContactSinkContext): Promise<void>;
  submitQuestion(data: QuestionSubmission, ctx: ContactSinkContext): Promise<void>;
}

const DEFAULT_RECIPIENT_EMAILS = [
  "aedengina@ncfg.ru",
  "yura.posledov@yandex.ru",
];

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
    pageUrl?: string;
    requestId?: string;
    formType?: string;
  };
};

type PostboxConfig = {
  host: string;
  port: number;
  secure: boolean;
  apiKeyId: string;
  apiKeySecret: string;
  fromEmail: string;
  recipients: string[];
};

class ConsoleContactSink implements ContactSink {
  constructor(private readonly recipients: string[]) {}

  async submitLead(data: LeadSubmission, ctx: ContactSinkContext) {
    console.log(`[${ctx.requestId}] === Новая заявка с сайта НЦФГ ===`);
    console.log(`Получатели: ${this.recipients.join(", ")}`);
    console.log(`IP: ${ctx.clientIp}`);
    if (ctx.userAgent) console.log(`UA: ${ctx.userAgent}`);
    console.log(`Имя: ${data.name}`);
    console.log(`Email: ${data.email}`);
    console.log(`Телефон: ${data.phone || "не указан"}`);
    console.log(`Компания: ${data.company || "не указана"}`);
    console.log(`Сообщение: ${data.message || "не указано"}`);
    console.log(`Страница: ${data.sourcePageUrl || "не указана"}`);
    console.log("================================");
  }

  async submitQuestion(data: QuestionSubmission, ctx: ContactSinkContext) {
    console.log(`[${ctx.requestId}] === Новый вопрос с сайта НЦФГ ===`);
    console.log(`Получатели: ${this.recipients.join(", ")}`);
    console.log(`IP: ${ctx.clientIp}`);
    if (ctx.userAgent) console.log(`UA: ${ctx.userAgent}`);
    console.log(`Статья: ${data.postTitle || "не указана"}`);
    console.log(`Имя: ${data.name}`);
    console.log(`Email: ${data.email}`);
    console.log(`Вопрос: ${data.question}`);
    console.log(`Страница: ${data.sourcePageUrl || "не указана"}`);
    console.log("================================");
  }
}

class PostboxEmailContactSink implements ContactSink {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: PostboxConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.apiKeyId,
        pass: config.apiKeySecret,
      },
    });
  }

  async submitLead(data: LeadSubmission, ctx: ContactSinkContext) {
    await this.sendEmail({
      subject: `[NCFG][Lead] Новая заявка (${ctx.requestId})`,
      replyTo: data.email,
      text: [
        "Форма: Заявка с сайта",
        "",
        `Имя: ${data.name}`,
        `Email: ${data.email}`,
        `Телефон: ${data.phone || "не указан"}`,
        `Компания: ${data.company || "не указана"}`,
        `Сообщение: ${data.message || "не указано"}`,
        `Страница: ${data.sourcePageUrl || "не указана"}`,
        "",
        `Request ID: ${ctx.requestId}`,
        `IP: ${ctx.clientIp}`,
        `User-Agent: ${ctx.userAgent || "не указан"}`,
      ].join("\n"),
    });

    console.log(`[${ctx.requestId}] Postbox lead email sent for ${data.email}`);
  }

  async submitQuestion(data: QuestionSubmission, ctx: ContactSinkContext) {
    await this.sendEmail({
      subject: `[NCFG][Question] Новый вопрос (${ctx.requestId})`,
      replyTo: data.email,
      text: [
        "Форма: Вопрос по статье",
        "",
        `Статья: ${data.postTitle || "не указана"}`,
        `Имя: ${data.name}`,
        `Email: ${data.email}`,
        `Вопрос: ${data.question}`,
        `Страница: ${data.sourcePageUrl || "не указана"}`,
        "",
        `Request ID: ${ctx.requestId}`,
        `IP: ${ctx.clientIp}`,
        `User-Agent: ${ctx.userAgent || "не указан"}`,
      ].join("\n"),
    });

    console.log(`[${ctx.requestId}] Postbox question email sent for ${data.email}`);
  }

  private async sendEmail({
    subject,
    replyTo,
    text,
  }: {
    subject: string;
    replyTo: string;
    text: string;
  }) {
    await this.transporter.sendMail({
      from: this.config.fromEmail,
      to: this.config.recipients,
      subject,
      text,
      replyTo,
    });
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
      [this.config.fields.pageUrl, data.sourcePageUrl],
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
      [this.config.fields.pageUrl, data.sourcePageUrl],
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
      `Страница: ${data.sourcePageUrl || "не указана"}`,
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
      `Страница: ${data.sourcePageUrl || "не указана"}`,
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

function asOptionalPositiveInteger(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined;

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

function parseRecipientEmails(value: string | undefined) {
  if (!value) return [];

  const dedupMap = new Map<string, string>();
  for (const rawEmail of value.split(",")) {
    const normalized = rawEmail.trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (!dedupMap.has(key)) dedupMap.set(key, normalized);
  }

  return Array.from(dedupMap.values());
}

function resolveRecipientEmails() {
  const recipientsFromList = parseRecipientEmails(
    asOptionalEnv(process.env.LEADS_RECIPIENT_EMAILS)
  );
  if (recipientsFromList.length > 0) {
    return recipientsFromList;
  }

  const fallbackRecipient = asOptionalEnv(process.env.LEADS_RECIPIENT_EMAIL);
  if (fallbackRecipient) {
    return [fallbackRecipient];
  }

  return DEFAULT_RECIPIENT_EMAILS;
}

function createContactSink(): ContactSink {
  const recipientEmails = resolveRecipientEmails();
  const postboxApiKeyId = asOptionalEnv(process.env.POSTBOX_API_KEY_ID);
  const postboxApiKeySecret = asOptionalEnv(process.env.POSTBOX_API_KEY_SECRET);
  const postboxFromEmail = asOptionalEnv(process.env.POSTBOX_FROM_EMAIL);

  if (postboxApiKeyId && postboxApiKeySecret && postboxFromEmail) {
    const postboxHost =
      asOptionalEnv(process.env.POSTBOX_SMTP_HOST) || "postbox.cloud.yandex.net";
    const postboxPort = asOptionalPositiveInteger(process.env.POSTBOX_SMTP_PORT) ?? 465;

    return new PostboxEmailContactSink({
      host: postboxHost,
      port: postboxPort,
      secure: postboxPort === 465,
      apiKeyId: postboxApiKeyId,
      apiKeySecret: postboxApiKeySecret,
      fromEmail: postboxFromEmail,
      recipients: recipientEmails,
    });
  }

  const getCourseApiKey = asOptionalEnv(process.env.GETCOURSE_API_KEY);
  const getCourseBaseUrl = asOptionalEnv(process.env.GETCOURSE_BASE_URL);

  if (!getCourseApiKey || !getCourseBaseUrl) {
    return new ConsoleContactSink(recipientEmails);
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
      pageUrl: asOptionalEnv(process.env.GETCOURSE_DEAL_FIELD_PAGE_URL),
      requestId: asOptionalEnv(process.env.GETCOURSE_DEAL_FIELD_REQUEST_ID),
      formType: asOptionalEnv(process.env.GETCOURSE_DEAL_FIELD_FORM_TYPE),
    },
  });
}

export const contactSink: ContactSink = createContactSink();
