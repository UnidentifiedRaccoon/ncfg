"use client";

import { animate, useInView, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useRef } from "react";
import { motionTokens, useDocumentVisible, useReducedMotion } from "@/shared/lib/motion";

export function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const count = useMotionValue(value);
  const inView = useInView(ref);
  const visible = useDocumentVisible();
  const reduced = useReducedMotion();
  const completed = useRef<number | null>(null);
  useMotionValueEvent(count, "change", (latest) => {
    if (ref.current) ref.current.textContent = String(Math.round(latest));
  });
  useEffect(() => {
    if (reduced || !visible || !inView || completed.current === value) {
      count.set(value);
      return;
    }
    count.set(0);
    completed.current = value;
    const animation = animate(count, value, { duration: motionTokens.count, ease: motionTokens.ease });
    return () => { animation.stop(); count.set(value); };
  }, [count, inView, reduced, value, visible]);
  return <><span ref={ref} aria-hidden="true">{value}</span><span className="sr-only">{value}</span></>;
}
