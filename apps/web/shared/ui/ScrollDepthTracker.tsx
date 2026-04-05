"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { reachGoal, YM_GOALS } from "@/shared/lib/ym";

const THRESHOLDS = [
  { pct: 0.25, goal: YM_GOALS.SCROLL_25 },
  { pct: 0.50, goal: YM_GOALS.SCROLL_50 },
  { pct: 0.75, goal: YM_GOALS.SCROLL_75 },
  { pct: 1.00, goal: YM_GOALS.SCROLL_100 },
] as const;

/**
 * Tracks scroll depth milestones (25/50/75/100%) and fires Yandex Metrika
 * goals. Each milestone fires only once per page navigation.
 *
 * Mounted once at the root layout — resets on route change.
 */
export function ScrollDepthTracker() {
  const pathname = usePathname();
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    firedRef.current = new Set();

    function handleScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) return;

      const ratio = Math.min(scrollTop / docHeight, 1);

      for (const { pct, goal } of THRESHOLDS) {
        if (ratio >= pct && !firedRef.current.has(goal)) {
          firedRef.current.add(goal);
          reachGoal(goal);
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Check initial position (e.g., short pages or anchor navigation)
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return null;
}
