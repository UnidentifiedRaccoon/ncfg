"use client";

import { useAnimate } from "motion/react";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { motionTokens, preferredScrollBehavior, useCompactMotion, useReducedMotion } from "@/shared/lib/motion";

// Animate the existing subtree, without keying or remounting its form state.
export function ContentTransition({ children, stateKey, className, focusOnChange = false, enter = false, immediate = false, direction, order }: {
  children: ReactNode;
  stateKey: string | number;
  className?: string;
  focusOnChange?: boolean;
  enter?: boolean;
  immediate?: boolean;
  direction?: "forward" | "backward";
  /** Position in a flow. Only the active content moves; navigation stays in place. */
  order?: number;
}) {
  const [ref, animate] = useAnimate<HTMLDivElement>();
  const previous = useRef<string | number | null>(enter ? null : stateKey);
  const previousOrder = useRef(order);
  const reduced = useReducedMotion();
  const compact = useCompactMotion();
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const changed = previous.current !== stateKey;
    const movement = direction ?? (order === undefined ? undefined
      : previous.current === null ? "forward"
      : order === previousOrder.current ? undefined
      : order > (previousOrder.current ?? order) ? "forward" : "backward");
    if (changed && focusOnChange) {
      const heading = node.querySelector<HTMLElement>("[data-step-heading]")
        ?? node.querySelector<HTMLElement>("h2")
        ?? node.querySelector<HTMLElement>("h1")
        ?? node.querySelector<HTMLElement>("h3");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
        const bounds = heading.getBoundingClientRect();
        const inset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        if (bounds.top < inset || bounds.bottom > window.innerHeight) {
          heading.scrollIntoView({ block: "start", behavior: preferredScrollBehavior() });
        }
      }
    }
    let playback: ReturnType<typeof animate>;
    if (changed && !reduced && !immediate) {
      const distance = compact ? motionTokens.compactStepDistance : motionTokens.stepDistance;
      // Explicit keyframes avoid losing a zero-duration preparation to the
      // final animation when both are scheduled in the same rendering frame.
      playback = animate(node, {
        opacity: [0.4, 1],
        x: [movement ? distance * (movement === "forward" ? 1 : -1) : 0, 0],
      }, {
        duration: movement ? motionTokens.step : motionTokens.content,
        ease: motionTokens.ease,
      });
    } else {
      playback = animate(node, { opacity: 1, x: 0 }, { duration: 0 });
      playback.complete();
    }
    previous.current = stateKey;
    previousOrder.current = order;
    return () => playback.stop();
  }, [animate, compact, direction, focusOnChange, immediate, order, reduced, ref, stateKey]);
  return <div ref={ref} data-motion-content className={cn("motion-reduce:!opacity-100 motion-reduce:!transform-none", className)}>{children}</div>;
}
