"use client";

import { useEffect } from "react";
import { reachGoal, YM_GOALS } from "@/shared/lib/ym";

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
      if (!(goalElement instanceof HTMLElement)) return;

      const goal = Object.values(YM_GOALS).find((value) => value === goalElement.dataset.ymGoal);
      if (!goal) return;

      // For FAQ: skip firing when user is closing an already-open <details>
      const summary = goalElement.closest("summary");
      if (summary) {
        const details = summary.closest("details");
        if (details?.open) return;
      }

      const programId = goalElement.dataset.leadProgram ?? goalElement.dataset.ymProgramId;
      const location = goalElement.dataset.ymCtaLocation;
      reachGoal(goal, {
        schema_version: 2,
        page_path: window.location.pathname,
        ...(location && ["hero", "footer", "program", "task_navigator"].includes(location)
          ? { cta_location: location } : {}),
        ...(programId && /^[a-z0-9-]{1,120}$/.test(programId) ? { program_id: programId } : {}),
      });
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
