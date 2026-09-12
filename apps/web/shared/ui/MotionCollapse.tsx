"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { motionTokens, useReducedMotion } from "@/shared/lib/motion";

export function MotionCollapse({ open, children, id, className }: { open: boolean; children: ReactNode; id?: string; className?: string }) {
  const reduced = useReducedMotion();
  return <m.div id={id} initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} inert={!open} aria-hidden={!open} className={cn("overflow-hidden", className)} transition={{ duration: reduced ? 0 : open ? motionTokens.disclosure : motionTokens.exit, ease: motionTokens.ease }}>{children}</m.div>;
}
