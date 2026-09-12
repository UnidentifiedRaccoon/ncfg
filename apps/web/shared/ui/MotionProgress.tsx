"use client";

import { m } from "motion/react";
import { contentTransition, useReducedMotion } from "@/shared/lib/motion";

export function MotionProgress({ value, className }: { value: number; className?: string }) {
  const reduced = useReducedMotion();
  return <m.div aria-hidden="true" className={className} initial={false} animate={{ scaleX: Math.max(0, Math.min(1, value)) }} style={{ transformOrigin: "left" }} transition={contentTransition(reduced)} />;
}
