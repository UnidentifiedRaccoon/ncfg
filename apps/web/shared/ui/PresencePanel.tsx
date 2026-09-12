"use client";

import { m, useIsPresent, type HTMLMotionProps } from "motion/react";
import { motionTokens, useReducedMotion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/cn";

// Presence keeps only the visual exit alive; interaction ends immediately.
export function PresencePanel({ children, collapse = false, className, ...props }: HTMLMotionProps<"div"> & { collapse?: boolean }) {
  const present = useIsPresent();
  const reduced = useReducedMotion();
  return (
    <m.div
      {...props}
      className={cn(collapse && "overflow-hidden", className)}
      inert={!present}
      aria-hidden={!present || undefined}
      initial={reduced ? false : { opacity: 0, ...(collapse ? { height: 0 } : { y: -8 }) }}
      animate={{ opacity: 1, ...(collapse ? { height: "auto" } : { y: 0 }) }}
      exit={{ opacity: 0, ...(collapse ? { height: 0 } : { y: reduced ? 0 : -8 }) }}
      transition={{ duration: reduced ? 0 : present ? motionTokens.disclosure : motionTokens.exit, ease: motionTokens.ease }}
    >{children}</m.div>
  );
}
