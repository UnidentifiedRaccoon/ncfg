import nodemailer from "nodemailer";
import type { DiagnosticResult } from "../api/types/diagnostic";
import { buildDiagnosticResultEmail } from "./diagnostic-result-email";

interface DiagnosticResultMailer {
  sendResultCopy(data: DiagnosticResultMailData, ctx: DiagnosticResultMailContext): Promise<void>;
}

interface DiagnosticResultMailData {
  fullName: string;
  email: string;
  campaignTitle: string;
  organizationName: string;
  result: DiagnosticResult;
}

interface DiagnosticResultMailContext {
  requestId: string;
}

interface PostboxConfig {
  host: string;
  port: number;
  secure: boolean;
  apiKeyId: string;
  apiKeySecret: string;
  fromEmail: string;
}

class MissingDiagnosticResultMailer implements DiagnosticResultMailer {
  constructor(private readonly reason: string) {}

  async sendResultCopy() {
    throw new Error(this.reason);
  }
}

class PostboxDiagnosticResultMailer implements DiagnosticResultMailer {
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

  async sendResultCopy(data: DiagnosticResultMailData, ctx: DiagnosticResultMailContext) {
    const email = buildDiagnosticResultEmail({
      fullName: data.fullName,
      campaignTitle: data.campaignTitle,
      organizationName: data.organizationName,
      result: data.result,
    });

    await this.transporter.sendMail({
      from: this.config.fromEmail,
      to: data.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    console.log(`[${ctx.requestId}] Diagnostic result email sent for ${data.email}`);
  }
}

function asOptionalEnv(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length ? trimmed : undefined;
}

function asOptionalPositiveInteger(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined;

  return parsed;
}

function createDiagnosticResultMailer(): DiagnosticResultMailer {
  const postboxApiKeyId = asOptionalEnv(process.env.POSTBOX_API_KEY_ID);
  const postboxApiKeySecret = asOptionalEnv(process.env.POSTBOX_API_KEY_SECRET);
  const postboxFromEmail = asOptionalEnv(process.env.POSTBOX_FROM_EMAIL);

  if (!postboxApiKeyId || !postboxApiKeySecret || !postboxFromEmail) {
    return new MissingDiagnosticResultMailer(
      "Diagnostic result email delivery is not configured: provide Postbox SMTP credentials."
    );
  }

  const postboxHost = asOptionalEnv(process.env.POSTBOX_SMTP_HOST) || "postbox.cloud.yandex.net";
  const postboxPort = asOptionalPositiveInteger(process.env.POSTBOX_SMTP_PORT) ?? 465;

  return new PostboxDiagnosticResultMailer({
    host: postboxHost,
    port: postboxPort,
    secure: postboxPort === 465,
    apiKeyId: postboxApiKeyId,
    apiKeySecret: postboxApiKeySecret,
    fromEmail: postboxFromEmail,
  });
}

export const diagnosticResultMailer: DiagnosticResultMailer = createDiagnosticResultMailer();
