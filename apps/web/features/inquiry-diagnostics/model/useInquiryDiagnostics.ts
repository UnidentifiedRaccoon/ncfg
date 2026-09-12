"use client";

import { useCallback, useRef, useState } from "react";
import { reachGoal } from "@/shared/lib/ym";
import { createInquiryDiagnostics } from "./diagnostics";
import type { InquiryContext } from "./types";

export function useInquiryDiagnostics(context: InquiryContext) {
  const [diagnostics] = useState(() => createInquiryDiagnostics(
    reachGoal,
    () => window.location.pathname,
    () => window.crypto.randomUUID()
  ));
  const stopObserving = useRef<(() => void) | null>(null);
  const { formType, programId, companyProvided } = context;

  const observeForm = useCallback((form: HTMLFormElement | null) => {
    stopObserving.current?.();
    stopObserving.current = null;
    if (!form || typeof IntersectionObserver === "undefined") return;
    const marker = form.querySelector("[data-inquiry-view]");
    if (!marker) return;

    const currentObserver = new IntersectionObserver((entries) => {
      if (document.visibilityState !== "visible") return;
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) {
        diagnostics.view({ formType, programId, companyProvided });
        currentObserver.disconnect();
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    }, { threshold: 0.5 });
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      currentObserver.unobserve(marker);
      currentObserver.observe(marker);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    stopObserving.current = () => {
      currentObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    currentObserver.observe(marker);
  }, [diagnostics, formType, programId, companyProvided]);

  return { diagnostics, observeForm };
}
