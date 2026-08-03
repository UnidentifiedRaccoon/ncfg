import nodemailer from "nodemailer";
import { buildVacancyApplicationInboxEmail } from "./vacancy-application-email";
import type { VacancyApplicationSubmission } from "./vacancy-application";
import { assertOutboundAllowed } from "./external-effects";

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

export type ContactSinkContext = {
  requestId: string;
  clientIp: string;
  userAgent?: string;
};

export interface ContactSink {
  submitLead(data: LeadSubmission, ctx: ContactSinkContext): Promise<void>;
  submitQuestion(data: QuestionSubmission, ctx: ContactSinkContext): Promise<void>;
  submitVacancyApplication(
    data: VacancyApplicationSubmission,
    ctx: ContactSinkContext
  ): Promise<void>;
}

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
    productTitleVacancyApplication: string;
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

export type Bitrix24LeadConfig = {
  webhookUrl: string;
  sourceId: string;
  stageId: string;
  title: string;
  originatorId: string;
  assignedById?: number;
};

type Bitrix24ApiResponse<T> = {
  result?: T;
  error?: string;
  error_description?: string;
};

type Bitrix24LeadAddResult = {
  item?: {
    id?: number;
  };
};

class MissingContactSink implements ContactSink {
  constructor(private readonly reason: string) {}

  async submitLead() {
    throw new Error(this.reason);
  }

  async submitQuestion() {
    throw new Error(this.reason);
  }

  async submitVacancyApplication() {
    throw new Error(this.reason);
  }
}

class GuardedContactSink implements ContactSink {
  constructor(private readonly inner: ContactSink) {}

  submitLead(data: LeadSubmission, ctx: ContactSinkContext) {
    assertOutboundAllowed();
    return this.inner.submitLead(data, ctx);
  }

  submitQuestion(data: QuestionSubmission, ctx: ContactSinkContext) {
    assertOutboundAllowed();
    return this.inner.submitQuestion(data, ctx);
  }

  submitVacancyApplication(
    data: VacancyApplicationSubmission,
    ctx: ContactSinkContext
  ) {
    assertOutboundAllowed();
    return this.inner.submitVacancyApplication(data, ctx);
  }
}

class LeadFanoutContactSink implements ContactSink {
  constructor(
    private readonly primary: ContactSink,
    private readonly bitrix24LeadSink: ContactSink
  ) {}

  async submitLead(data: LeadSubmission, ctx: ContactSinkContext) {
    await this.primary.submitLead(data, ctx);

    try {
      await this.bitrix24LeadSink.submitLead(data, ctx);
    } catch (error) {
      console.error(`[${ctx.requestId}] Bitrix24 lead sync failed:`, error);
    }
  }

  submitQuestion(data: QuestionSubmission, ctx: ContactSinkContext) {
    return this.primary.submitQuestion(data, ctx);
  }

  submitVacancyApplication(
    data: VacancyApplicationSubmission,
    ctx: ContactSinkContext
  ) {
    return this.primary.submitVacancyApplication(data, ctx);
  }
}

class Bitrix24LeadContactSink implements ContactSink {
  constructor(private readonly config: Bitrix24LeadConfig) {}

  async submitLead(data: LeadSubmission, ctx: ContactSinkContext) {
    const payload = buildBitrix24LeadAddPayload(data, ctx, this.config);
    const result = await this.call<Bitrix24LeadAddResult>("crm.item.add", payload);
    const leadId = result.item?.id;

    console.log(
      `[${ctx.requestId}] Bitrix24 lead synced${leadId ? `: ${leadId}` : ""}`
    );
  }

  async submitQuestion() {
    // Bitrix24 is enabled only for the primary website lead form during rollout.
  }

  async submitVacancyApplication() {
    // Vacancy applications keep using the primary delivery channel for now.
  }

  private async call<T>(method: string, payload: unknown): Promise<T> {
    const response = await fetch(`${this.config.webhookUrl}${method}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const rawResponse = await response.text();
    const parsedResponse = parseBitrix24Response<T>(rawResponse);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${extractBitrix24Error(parsedResponse, rawResponse)}`
      );
    }

    const explicitError = extractBitrix24Error(parsedResponse, rawResponse);
    if (explicitError) {
      throw new Error(explicitError);
    }

    if (!parsedResponse?.result) {
      throw new Error(rawResponse.slice(0, 300) || "Bitrix24 returned empty result");
    }

    return parsedResponse.result;
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

  async submitVacancyApplication(
    data: VacancyApplicationSubmission,
    ctx: ContactSinkContext
  ) {
    const email = buildVacancyApplicationInboxEmail(data, ctx);

    await this.sendEmail(email);

    console.log(`[${ctx.requestId}] Postbox vacancy application email sent for ${data.email}`);
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

export function buildBitrix24LeadAddPayload(
  data: LeadSubmission,
  ctx: ContactSinkContext,
  config: Bitrix24LeadConfig
) {
  return {
    entityTypeId: 1,
    fields: {
      title: config.title,
      name: data.name,
      companyTitle: data.company,
      sourceId: config.sourceId,
      stageId: config.stageId,
      opened: "Y",
      comments: buildBitrix24LeadComment(data, ctx),
      originatorId: config.originatorId,
      originId: ctx.requestId,
      assignedById: config.assignedById,
      ufCrmFormname: "lead",
      ufCrmTranid: ctx.requestId,
      fm: [
        { typeId: "EMAIL", valueType: "WORK", value: data.email },
        data.phone
          ? { typeId: "PHONE", valueType: "WORK", value: data.phone }
          : undefined,
      ].filter(Boolean),
    },
  };
}

function buildBitrix24LeadComment(data: LeadSubmission, ctx: ContactSinkContext) {
  return [
    "Форма: Заявка с сайта",
    `Имя: ${data.name}`,
    `Email: ${data.email}`,
    `Телефон: ${data.phone || "не указан"}`,
    `Компания: ${data.company || "не указана"}`,
    `Сообщение: ${data.message || "не указано"}`,
    `Страница: ${data.sourcePageUrl || "не указана"}`,
    `Request ID: ${ctx.requestId}`,
    `IP: ${ctx.clientIp}`,
    `User-Agent: ${ctx.userAgent || "не указан"}`,
  ].join("\n");
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

  async submitVacancyApplication(
    data: VacancyApplicationSubmission,
    ctx: ContactSinkContext
  ) {
    const addfields = this.buildAddFields([
      [this.config.fields.source, this.config.sourceValue],
      [this.config.fields.requestId, ctx.requestId],
      [this.config.fields.formType, "vacancy-application"],
      [this.config.fields.message, data.message],
      [this.config.fields.pageUrl, data.sourcePageUrl],
    ]);
    const inboxEmail = buildVacancyApplicationInboxEmail(data, ctx);

    await this.submitDeal(
      {
        email: data.email,
        name: data.name,
        phone: data.phone,
      },
      {
        deal_number: ctx.requestId,
        deal_status: this.config.deal.status,
        product_title: this.config.deal.productTitleVacancyApplication,
        cost: this.config.deal.cost,
        deal_comment: inboxEmail.text,
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

function parseBitrix24Response<T>(rawResponse: string): Bitrix24ApiResponse<T> | null {
  try {
    const parsed = JSON.parse(rawResponse) as Bitrix24ApiResponse<T>;
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

function extractBitrix24Error<T>(
  payload: Bitrix24ApiResponse<T> | null,
  rawResponse: string
) {
  if (!payload) return rawResponse.slice(0, 300) || null;
  return payload.error_description || payload.error || null;
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

function normalizeWebhookUrl(value: string) {
  return `${normalizeBaseUrl(value)}/`;
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

  return [];
}

function isExplicitlyDisabled(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  return (
    normalized === "0" ||
    normalized === "false" ||
    normalized === "no" ||
    normalized === "off"
  );
}

function createBitrix24LeadSink(): ContactSink | null {
  const webhookUrl = asOptionalEnv(process.env.BITRIX24_WEBHOOK_URL);
  if (!webhookUrl || isExplicitlyDisabled(process.env.BITRIX24_LEAD_ENABLED)) {
    return null;
  }

  return new Bitrix24LeadContactSink({
    webhookUrl: normalizeWebhookUrl(webhookUrl),
    sourceId: asOptionalEnv(process.env.BITRIX24_LEAD_SOURCE_ID) || "WEB",
    stageId: asOptionalEnv(process.env.BITRIX24_LEAD_STAGE_ID) || "10",
    title: asOptionalEnv(process.env.BITRIX24_LEAD_TITLE) || "Заявка с сайта NCFG",
    originatorId:
      asOptionalEnv(process.env.BITRIX24_LEAD_ORIGINATOR_ID) || "ncfg-website",
    assignedById: asOptionalPositiveInteger(
      process.env.BITRIX24_LEAD_ASSIGNED_BY_ID
    ),
  });
}

function withOptionalBitrix24LeadSink(primary: ContactSink) {
  const bitrix24LeadSink = createBitrix24LeadSink();
  if (!bitrix24LeadSink) return primary;

  return new LeadFanoutContactSink(primary, bitrix24LeadSink);
}

function createPrimaryContactSink(): ContactSink {
  const recipientEmails = resolveRecipientEmails();
  const postboxApiKeyId = asOptionalEnv(process.env.POSTBOX_API_KEY_ID);
  const postboxApiKeySecret = asOptionalEnv(process.env.POSTBOX_API_KEY_SECRET);
  const postboxFromEmail = asOptionalEnv(process.env.POSTBOX_FROM_EMAIL);

  if (postboxApiKeyId && postboxApiKeySecret && postboxFromEmail) {
    if (recipientEmails.length === 0) {
      return new MissingContactSink(
        "Lead delivery is not configured: set LEADS_RECIPIENT_EMAILS or LEADS_RECIPIENT_EMAIL for Postbox."
      );
    }

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
    return new MissingContactSink(
      "Lead delivery is not configured: provide Postbox SMTP credentials or GetCourse API credentials."
    );
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
      productTitleVacancyApplication:
        asOptionalEnv(process.env.GETCOURSE_DEAL_PRODUCT_TITLE_VACANCY_APPLICATION) ||
        "Website Vacancy Application",
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

function createContactSink(): ContactSink {
  return new GuardedContactSink(
    withOptionalBitrix24LeadSink(createPrimaryContactSink())
  );
}

export const contactSink: ContactSink = createContactSink();
