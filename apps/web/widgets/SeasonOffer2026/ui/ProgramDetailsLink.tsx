"use client";

import type { ReactNode } from "react";
import { Button } from "@/shared/ui/Button";

export function ProgramDetailsLink({ href, label, className, children }: {
  href: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Button
      href={href}
      variant="ghost"
      className={className}
      aria-label={label}
      data-ym-goal="service_click"
      data-ym-cta-location="task_navigator"
      data-ym-program-id={href.slice(1)}
      onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const details = document.getElementById(href.slice(1));
        if (!(details instanceof HTMLDetailsElement)) return;
        details.open = true;
        const summary = details.querySelector("summary");
        if (summary instanceof HTMLElement) summary.focus({ preventScroll: true });
      }}
    >
      {children}
    </Button>
  );
}
