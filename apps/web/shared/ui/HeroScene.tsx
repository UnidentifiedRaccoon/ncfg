"use client";

import { m, scroll, useInView, useMotionValue } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { motionTokens, useDesktopScene, useDocumentVisible, useReducedMotion } from "@/shared/lib/motion";

export function HeroScene({ children, enabled = false }: { children: ReactNode; enabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const desktop = useDesktopScene();
  const reduced = useReducedMotion();
  const visible = useDocumentVisible();
  const inView = useInView(ref);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  useEffect(() => {
    const target = ref.current?.closest("section");
    if (!enabled || !desktop || reduced || !visible || !inView || !target) return;
    return scroll((progress: number) => {
      y.set(progress * motionTokens.heroOffset);
      scale.set(1 + progress * (motionTokens.heroScale - 1));
    }, { target, offset: ["start start", "end start"] });
  }, [desktop, enabled, inView, reduced, scale, visible, y]);

  useEffect(() => {
    if (!desktop || reduced || !enabled) { y.set(0); scale.set(1); }
  }, [desktop, enabled, reduced, scale, y]);

  return <m.div ref={ref} data-hero-scene={enabled || undefined} className="relative aspect-[4/3]" style={{ y, scale }}>{children}</m.div>;
}
