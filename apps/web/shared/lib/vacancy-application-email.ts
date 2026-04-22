import type {
  VacancyApplicationConfirmationData,
  VacancyApplicationSubmission,
} from './vacancy-application';
import type { ContactSinkContext } from './contact-sink';
import { getSiteUrl } from './metadata';
import { normalizeSourcePageUrl } from './source-page';

interface VacancyApplicationEmailContent {
  subject: string;
  text: string;
  html: string;
}

interface VacancyApplicationInboxEmail {
  subject: string;
  text: string;
  replyTo: string;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeText(value: string) {
  return value.replace(/\r\n/g, '\n').trim();
}

function resolveVacancyPageUrl(
  sourcePageUrl: string | undefined,
  vacancySlug: string
): string | undefined {
  return (
    normalizeSourcePageUrl(sourcePageUrl) ??
    new URL(`/vacancies/${vacancySlug}`, `${getSiteUrl()}/`).toString()
  );
}

export function buildVacancyApplicationInboxEmail(
  data: VacancyApplicationSubmission,
  ctx: ContactSinkContext
): VacancyApplicationInboxEmail {
  return {
    subject: `[NCFG][Vacancy] Новый отклик (${ctx.requestId})`,
    replyTo: data.email,
    text: [
      'Форма: Отклик на вакансию',
      '',
      `Вакансия: ${data.vacancyTitle} (${data.vacancySlug})`,
      `Имя: ${data.name}`,
      `Email: ${data.email}`,
      `Телефон: ${data.phone}`,
      `Telegram: ${data.telegram || 'не указан'}`,
      `Резюме: ${data.resumeUrl}`,
      `Сопроводительное сообщение: ${data.message || 'не указано'}`,
      `Страница: ${data.sourcePageUrl || 'не указана'}`,
      '',
      `Request ID: ${ctx.requestId}`,
      `IP: ${ctx.clientIp}`,
      `User-Agent: ${ctx.userAgent || 'не указан'}`,
    ].join('\n'),
  };
}

export function buildVacancyApplicationConfirmationEmail(
  data: VacancyApplicationConfirmationData
): VacancyApplicationEmailContent {
  const vacancyPageUrl = resolveVacancyPageUrl(data.sourcePageUrl, data.vacancySlug);
  const subject = `Мы получили ваш отклик на вакансию «${data.vacancyTitle}»`;
  const greetingName = escapeText(data.name);
  const vacancyTitle = escapeText(data.vacancyTitle);
  const vacancyLink = vacancyPageUrl ? escapeHtml(vacancyPageUrl) : null;

  const html = `
<!doctype html>
<html lang="ru">
  <body style="margin:0;padding:0;background:#F8FAFC;color:#0F172A;font-family:Arial,Helvetica,sans-serif;">
    <div style="margin:0 auto;max-width:640px;padding:32px 16px;">
      <div style="border:1px solid #E2E8F0;border-radius:24px;background:#FFFFFF;padding:32px 24px;">
        <p style="margin:0;font-size:16px;line-height:24px;color:#0F172A;">
          Здравствуйте, ${escapeHtml(greetingName)}!
        </p>
        <p style="margin:16px 0 0;font-size:16px;line-height:24px;color:#475569;">
          Спасибо за отклик на вакансию «${escapeHtml(vacancyTitle)}». Мы получили вашу заявку и вернёмся к вам, если понадобится уточнить детали.
        </p>
        ${
          vacancyLink
            ? `
              <div style="margin-top:24px;">
                <a
                  href="${vacancyLink}"
                  style="display:inline-block;border-radius:12px;background:#5485D5;padding:14px 24px;font-size:15px;line-height:22px;font-weight:700;color:#FFFFFF;text-decoration:none;"
                >
                  Открыть вакансию
                </a>
              </div>
            `
            : ''
        }
        <p style="margin:24px 0 0;font-size:14px;line-height:22px;color:#64748B;">
          Это автоматическое письмо-подтверждение от НЦФГ.
        </p>
      </div>
    </div>
  </body>
</html>
  `.trim();

  const text = [
    `Здравствуйте, ${greetingName}!`,
    '',
    `Спасибо за отклик на вакансию «${vacancyTitle}».`,
    'Мы получили вашу заявку и вернёмся к вам, если понадобится уточнить детали.',
    ...(vacancyPageUrl ? ['', `Открыть вакансию: ${vacancyPageUrl}`] : []),
    '',
    'Это автоматическое письмо-подтверждение от НЦФГ.',
  ]
    .join('\n')
    .trim();

  return {
    subject,
    html,
    text,
  };
}
