import type { DiagnosticResult } from "../api/types/diagnostic";
import { getSiteUrl } from "./metadata";
import { getDiagnosticResultPresentation } from "./diagnostic-result-presentation";

interface BuildDiagnosticResultEmailInput {
  fullName: string;
  campaignTitle: string;
  organizationName: string;
  result: DiagnosticResult;
}

export interface DiagnosticResultEmailContent {
  subject: string;
  html: string;
  text: string;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeText(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

function formatTextAsHtml(value: string) {
  return escapeHtml(escapeText(value)).replace(/\n/g, "<br />");
}

function normalizePath(value: string) {
  return value.startsWith("/") ? value : `/${value}`;
}

function resolveAbsoluteUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  try {
    const url = /^https?:\/\//i.test(trimmed)
      ? new URL(trimmed)
      : new URL(normalizePath(trimmed), `${getSiteUrl()}/`);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}

function renderInsightHtml(result: DiagnosticResult) {
  if (result.insights.length === 0) {
    return "";
  }

  const items = result.insights
    .map((insight, index) => {
      return `
        <div style="margin-top:${index === 0 ? "0" : "16px"};border:1px solid #E2E8F0;border-radius:16px;padding:20px;background:#FFFFFF;">
          <p style="margin:0;font-size:12px;line-height:18px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#64748B;">
            Вопрос
          </p>
          <p style="margin:6px 0 0;font-size:16px;line-height:24px;font-weight:600;color:#1E3A5F;">
            ${escapeHtml(insight.questionTitle)}
          </p>
          <p style="margin:10px 0 0;font-size:14px;line-height:22px;color:#475569;">
            <strong style="color:#1E3A5F;">Ваш ответ:</strong> ${escapeHtml(insight.answerLabel)}
          </p>
          <p style="margin:16px 0 0;font-size:18px;line-height:26px;font-weight:600;color:#1E3A5F;">
            ${escapeHtml(insight.insightTitle)}
          </p>
          <p style="margin:10px 0 0;font-size:15px;line-height:24px;color:#475569;">
            ${formatTextAsHtml(insight.insightText)}
          </p>
          <div style="margin-top:16px;border-radius:14px;background:#EFF6FF;padding:16px;">
            <p style="margin:0;font-size:12px;line-height:18px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#2563EB;">
              Практический шаг
            </p>
            <p style="margin:8px 0 0;font-size:15px;line-height:24px;color:#1E3A5F;">
              ${formatTextAsHtml(insight.practiceStep)}
            </p>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div style="margin-top:32px;">
      <h2 style="margin:0;font-size:24px;line-height:32px;font-weight:700;color:#1E3A5F;">
        Персональные рекомендации
      </h2>
      <p style="margin:8px 0 0;font-size:14px;line-height:22px;color:#475569;">
        На основе ваших ответов
      </p>
      <div style="margin-top:20px;">
        ${items}
      </div>
    </div>
  `;
}

function renderInsightText(result: DiagnosticResult) {
  if (result.insights.length === 0) {
    return "";
  }

  const items = result.insights
    .map((insight, index) =>
      [
        `${index + 1}. ${escapeText(insight.questionTitle)}`,
        `Ваш ответ: ${escapeText(insight.answerLabel)}`,
        `Рекомендация: ${escapeText(insight.insightTitle)}`,
        `Пояснение: ${escapeText(insight.insightText)}`,
        `Практический шаг: ${escapeText(insight.practiceStep)}`,
      ].join("\n")
    )
    .join("\n\n");

  return `\n\nПерсональные рекомендации\n${items}`;
}

export function buildDiagnosticResultEmail({
  fullName,
  campaignTitle,
  organizationName,
  result,
}: BuildDiagnosticResultEmailInput): DiagnosticResultEmailContent {
  const presentation = getDiagnosticResultPresentation(result);
  const ctaHref = resolveAbsoluteUrl(presentation.ctaHref);
  const subject = `Результаты диагностики «${campaignTitle}»`;
  const greetingName = escapeText(fullName);
  const safeCampaignTitle = escapeText(campaignTitle);
  const safeOrganizationName = escapeText(organizationName);
  const html = `
<!doctype html>
<html lang="ru">
  <body style="margin:0;padding:0;background:#F8FAFC;color:#0F172A;font-family:Arial,Helvetica,sans-serif;">
    <div style="margin:0 auto;max-width:720px;padding:32px 16px;">
      <div style="border:1px solid #E2E8F0;border-radius:24px;background:#FFFFFF;padding:32px 24px;">
        <p style="margin:0;font-size:16px;line-height:24px;color:#0F172A;">
          Здравствуйте, ${escapeHtml(greetingName)}!
        </p>
        <p style="margin:12px 0 0;font-size:16px;line-height:24px;color:#475569;">
          Отправляем копию результатов диагностики «${escapeHtml(safeCampaignTitle)}».
        </p>
        <p style="margin:8px 0 0;font-size:14px;line-height:22px;color:#64748B;">
          ${escapeHtml(safeOrganizationName)}
        </p>

        <div style="margin-top:28px;border-radius:20px;background:#F8FAFC;padding:24px;text-align:center;">
          <div style="display:inline-block;min-width:128px;border:4px solid #BFDBFE;border-radius:999px;padding:20px 16px;background:#EFF6FF;">
            <div style="font-size:36px;line-height:40px;font-weight:700;color:#1D4ED8;">
              ${result.scorePercent}
            </div>
            <div style="margin-top:4px;font-size:14px;line-height:20px;color:#64748B;">
              из 100
            </div>
          </div>
          <h1 style="margin:24px 0 0;font-size:30px;line-height:36px;font-weight:700;color:#1E3A5F;">
            ${escapeHtml(presentation.title)}
          </h1>
          <p style="margin:16px 0 0;font-size:16px;line-height:26px;color:#475569;">
            ${formatTextAsHtml(presentation.summary)}
          </p>
          ${
            ctaHref && presentation.ctaLabel
              ? `
                <div style="margin-top:24px;">
                  <a
                    href="${escapeHtml(ctaHref)}"
                    style="display:inline-block;border-radius:12px;background:#5485D5;padding:14px 24px;font-size:15px;line-height:22px;font-weight:700;color:#FFFFFF;text-decoration:none;"
                  >
                    ${escapeHtml(presentation.ctaLabel)}
                  </a>
                </div>
              `
              : ""
          }
        </div>

        ${renderInsightHtml(result)}

        <p style="margin:32px 0 0;font-size:14px;line-height:22px;color:#64748B;">
          Это письмо сформировано автоматически на основе ваших ответов в диагностике.
        </p>
      </div>
    </div>
  </body>
</html>
  `.trim();

  const text = [
    `Здравствуйте, ${greetingName}!`,
    "",
    `Отправляем копию результатов диагностики «${safeCampaignTitle}».`,
    safeOrganizationName,
    "",
    `Ваш результат: ${result.scorePercent} из 100`,
    presentation.title,
    presentation.summary,
    ...(ctaHref && presentation.ctaLabel ? ["", `${presentation.ctaLabel}: ${ctaHref}`] : []),
    renderInsightText(result),
    "",
    "Это письмо сформировано автоматически на основе ваших ответов в диагностике.",
  ]
    .join("\n")
    .trim();

  return {
    subject,
    html,
    text,
  };
}
