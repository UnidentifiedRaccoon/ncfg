import type { DiagnosticResult } from "../api/types/diagnostic";

export const FALLBACK_DIAGNOSTIC_RESULT_TITLE = "Результаты готовы";
export const FALLBACK_DIAGNOSTIC_RESULT_SUMMARY =
  "Подробный анализ будет доступен после настройки диагностики. При необходимости специалисты НЦФГ свяжутся с вами по указанным контактам.";

export interface DiagnosticResultPresentation {
  title: string;
  summary: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function getDiagnosticResultPresentation(
  result: DiagnosticResult
): DiagnosticResultPresentation {
  if (result.band) {
    return {
      title: result.band.title,
      summary: result.band.summary,
      ctaLabel: result.ctaLabel,
      ctaHref: result.ctaHref,
    };
  }

  return {
    title: FALLBACK_DIAGNOSTIC_RESULT_TITLE,
    summary: FALLBACK_DIAGNOSTIC_RESULT_SUMMARY,
    ctaLabel: result.ctaLabel,
    ctaHref: result.ctaHref,
  };
}
