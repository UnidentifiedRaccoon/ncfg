import { createResourceReporter, diagnosticsAllowed, type ResourceKind } from "@/shared/lib/resource-diagnostics";

const counterId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID);
const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ncfg.ru";
const allowed = () => diagnosticsAllowed(location.href, siteOrigin, window.top === window);

if (process.env.NODE_ENV === "production" && Number.isFinite(counterId) && counterId > 0 && allowed()) {
  const reporter = createResourceReporter(process.env.NEXT_PUBLIC_RELEASE_ID, (failure) => {
    const ym = (window as Window & { ym?: (id: number, method: string, params: unknown) => void }).ym;
    if (!allowed() || typeof ym !== "function") return false;
    ym(counterId, "params", { site_resource_error: failure });
    return true;
  });

  const kindOf = (element: Element): ResourceKind | null => {
    if (element instanceof HTMLImageElement) return "image";
    if (element instanceof HTMLScriptElement && element.src) return "script";
    if (element instanceof HTMLLinkElement) {
      if (element.relList.contains("stylesheet")) return "css";
      if (element.relList.contains("preload") && element.as === "font") return "font";
    }
    return null;
  };

  window.addEventListener("error", (event) => {
    if (!allowed() || !(event.target instanceof Element)) return;
    const kind = kindOf(event.target);
    if (kind) reporter.record(kind);
  }, true);
  document.fonts?.addEventListener("loadingerror", () => {
    if (allowed()) reporter.record("font");
  });

  // Initial CSS/image errors can precede client instrumentation. Inspect only
  // after load, when pending stylesheets and eager images have settled.
  const inspectInitialResources = () => {
    if (!allowed()) return;
    for (const link of document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')) {
      if (link.media && !window.matchMedia(link.media).matches) continue;
      if (link.href && !link.disabled && !link.sheet) reporter.record("css");
    }
    for (const image of document.images) {
      if ((image.currentSrc || image.getAttribute("src")) && image.complete && image.naturalWidth === 0) {
        reporter.record("image");
      }
    }
    reporter.flush();
  };
  if (document.readyState === "complete") inspectInitialResources();
  else window.addEventListener("load", inspectInitialResources, { once: true });

  // The normal counter queues init before notifying us; diagnostics can then
  // join that queue even when the external Metrika script is still loading.
  window.addEventListener("ncfg:metrika-ready", reporter.flush);
  void document.fonts?.ready.then(() => {
    if (!allowed()) return;
    for (const font of document.fonts) {
      if (font.status === "error") reporter.record("font");
    }
  }).catch(() => {});
}
