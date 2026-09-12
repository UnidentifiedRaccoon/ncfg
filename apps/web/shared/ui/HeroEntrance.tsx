"use client";

import { useAnimate } from "motion/react";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { motionTokens, useReducedMotion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/cn";
import styles from "./hero-motion.module.css";

/** A readable, one-time introduction for compact heroes and editorial pages. */
export function HeroEntrance({ children, className, compactOnly = false }: {
  children: ReactNode;
  className?: string;
  compactOnly?: boolean;
}) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const played = useRef(false);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const node = scope.current;
    if (!node || played.current || reduced) return;
    // Check the actual media here as well as the subscription: hydration starts
    // with the server snapshot, which must never override Reduce Motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (compactOnly && window.matchMedia("(min-width: 1200px)").matches) return;
    if (window.scrollY > 48 || window.location.hash || node.contains(document.activeElement)) return;
    const visibleTargets = (selector: string) => Array.from(
      node.querySelectorAll<HTMLElement>(selector),
    ).filter((target) => target.getClientRects().length > 0);
    const copy = visibleTargets("[data-hero-copy]");
    const targets = compactOnly
      ? (copy.length ? copy : visibleTargets("h1"))
      : [node];
    const controls = targets.map((target) => animate(target, {
      y: [motionTokens.compactDistance * 2, 0],
    }, { duration: motionTokens.cardReveal, ease: motionTokens.ease }));
    void Promise.all(controls).then(() => { played.current = true; });
    const finish = () => controls.forEach((control) => control.complete());
    node.addEventListener("focusin", finish);
    node.addEventListener("pointerdown", finish);
    return () => {
      finish();
      node.removeEventListener("focusin", finish);
      node.removeEventListener("pointerdown", finish);
    };
  }, [animate, compactOnly, reduced, scope]);

  return <div ref={scope} data-hero-entrance className={cn(styles.entrance, className)}>{children}</div>;
}
