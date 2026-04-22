"use client";

import { useEffect } from "react";
import { isCmsDrivenPath } from "@/shared/lib/cms-routes";

export function CmsFreshnessGuard() {
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      if (!isCmsDrivenPath(window.location.pathname)) return;

      window.location.reload();
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return null;
}
