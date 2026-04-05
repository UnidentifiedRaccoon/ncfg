/**
 * Yandex Metrika goal tracking helpers.
 *
 * Usage in client components:
 *   import { reachGoal, YM_GOALS } from "@/shared/lib/ym";
 *   reachGoal(YM_GOALS.LEAD_FORM_SUBMIT);
 *
 * Usage in server components (via data attributes + YandexMetrikaGoalTracker):
 *   <a href="tel:..." data-ym-goal="phone_click">
 */

export const YM_GOALS = {
  // Macro-conversions
  LEAD_FORM_SUBMIT: "lead_form_submit",
  PHONE_CLICK: "phone_click",
  EMAIL_CLICK: "email_click",
  PDF_DOWNLOAD: "pdf_download",
  DIAGNOSTIC_COMPLETE: "diagnostic_complete",

  // CTA & navigation
  CTA_CLICK: "cta_click",
  SERVICE_CLICK: "service_click",
  PRODUCT_CLICK: "product_click",
  WEBINAR_CLICK: "webinar_click",

  // Blog engagement
  QUESTION_FORM_SUBMIT: "question_form_submit",
  QUESTION_FORM_EXPAND: "question_form_expand",
  BLOG_CATEGORY_CLICK: "blog_category_click",
  RELATED_ARTICLE_CLICK: "related_article_click",

  // Content engagement
  FAQ_OPEN: "faq_open",
  PROJECT_CLICK: "project_click",
  SOCIAL_CLICK: "social_click",
  PARTNER_CLICK: "partner_click",
  MAP_CLICK: "map_click",
  DOCUMENT_DOWNLOAD: "document_download",
  TESTIMONIAL_NAV: "testimonial_nav",
  RECOMMENDATIONS_CLICK: "recommendations_click",

  // Form funnel
  LEAD_FORM_START: "lead_form_start",

  // Scroll depth
  SCROLL_25: "scroll_25",
  SCROLL_50: "scroll_50",
  SCROLL_75: "scroll_75",
  SCROLL_100: "scroll_100",

  // Diagnostic funnel
  DIAGNOSTIC_STEP: "diagnostic_step",

  // Errors
  PAGE_NOT_FOUND: "page_not_found",
} as const;

export type YmGoal = (typeof YM_GOALS)[keyof typeof YM_GOALS];

type YmFunction = (counterId: number, action: string, ...args: unknown[]) => void;

function getYm(): YmFunction | null {
  if (typeof window === "undefined") return null;
  const maybeYm = (window as unknown as { ym?: unknown }).ym;
  return typeof maybeYm === "function" ? (maybeYm as YmFunction) : null;
}

function getCounterId(): number | null {
  const raw = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function reachGoal(goal: YmGoal, params?: Record<string, unknown>): void {
  const ym = getYm();
  if (!ym) return;

  const counterId = getCounterId();
  if (!counterId) return;

  if (params) {
    ym(counterId, "reachGoal", goal, params);
  } else {
    ym(counterId, "reachGoal", goal);
  }
}
