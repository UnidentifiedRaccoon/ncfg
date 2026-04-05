"use client";

import { useEffect } from "react";
import { reachGoal, type YmGoal } from "@/shared/lib/ym";

/**
 * Delegated click listener that fires Yandex Metrika goals for elements
 * with `data-ym-goal` attributes. Mounted once at the root layout.
 *
 * For FAQ `<summary>` elements inside `<details>`, only fires when the
 * accordion is being opened (not closed).
 */
export function YandexMetrikaGoalTracker() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const goalElement = target.closest("[data-ym-goal]");
      if (!goalElement) return;

      const goal = (goalElement as HTMLElement).dataset.ymGoal;
      if (!goal) return;

      // For FAQ: skip firing when user is closing an already-open <details>
      const summary = goalElement.closest("summary");
      if (summary) {
        const details = summary.closest("details");
        if (details?.open) return;
      }

      reachGoal(goal as YmGoal);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
