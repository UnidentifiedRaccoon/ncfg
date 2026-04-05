"use client";

import { useEffect } from "react";
import { reachGoal, YM_GOALS } from "@/shared/lib/ym";

/** Fires a page_not_found goal once on mount. */
export function NotFoundTracker() {
  useEffect(() => {
    reachGoal(YM_GOALS.PAGE_NOT_FOUND);
  }, []);

  return null;
}
