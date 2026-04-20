import nodemailer from 'nodemailer';
import type { VacancyApplicationConfirmationData } from './vacancy-application';
import { buildVacancyApplicationConfirmationEmail } from './vacancy-application-email';

export interface VacancyApplicationMailer {
  sendConfirmation(
    data: VacancyApplicationConfirmationData,
    ctx: VacancyApplicationMailerContext
  ): Promise<void>;
}

interface VacancyApplicationMailerContext {
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

class MissingVacancyApplicationMailer implements VacancyApplicationMailer {
  constructor(private readonly reason: string) {}

  async sendConfirmation() {
    throw new Error(this.reason);
  }
}

class PostboxVacancyApplicationMailer implements VacancyApplicationMailer {
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

  async sendConfirmation(
    data: VacancyApplicationConfirmationData,
    ctx: VacancyApplicationMailerContext
  ) {
    const email = buildVacancyApplicationConfirmationEmail(data);

    await this.transporter.sendMail({
      from: this.config.fromEmail,
      to: data.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    console.log(`[${ctx.requestId}] Vacancy application confirmation email sent for ${data.email}`);
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

function createVacancyApplicationMailer(): VacancyApplicationMailer {
  const postboxApiKeyId = asOptionalEnv(process.env.POSTBOX_API_KEY_ID);
  const postboxApiKeySecret = asOptionalEnv(process.env.POSTBOX_API_KEY_SECRET);
  const postboxFromEmail = asOptionalEnv(process.env.POSTBOX_FROM_EMAIL);

  if (!postboxApiKeyId || !postboxApiKeySecret || !postboxFromEmail) {
    return new MissingVacancyApplicationMailer(
      'Vacancy application confirmation email delivery is not configured: provide Postbox SMTP credentials.'
    );
  }

  const postboxHost = asOptionalEnv(process.env.POSTBOX_SMTP_HOST) || 'postbox.cloud.yandex.net';
  const postboxPort = asOptionalPositiveInteger(process.env.POSTBOX_SMTP_PORT) ?? 465;

  return new PostboxVacancyApplicationMailer({
    host: postboxHost,
    port: postboxPort,
    secure: postboxPort === 465,
    apiKeyId: postboxApiKeyId,
    apiKeySecret: postboxApiKeySecret,
    fromEmail: postboxFromEmail,
  });
}

export const vacancyApplicationMailer: VacancyApplicationMailer =
  createVacancyApplicationMailer();
