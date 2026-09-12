"use client";

import { animate, useMotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { createAutoplayTimer } from "./autoplay";

export function useAutoplay({ enabled, cycle, duration, onAdvance }: {
  enabled: boolean;
  cycle: number;
  duration: number;
  onAdvance: () => void;
}) {
  const progress = useMotionValue(0);
  const advance = useRef(onAdvance);
  useEffect(() => { advance.current = onAdvance; }, [onAdvance]);
  const timer = useRef<ReturnType<typeof createAutoplayTimer> | null>(null);
  useEffect(() => {
    const clock = createAutoplayTimer(duration, () => advance.current());
    timer.current = clock;
    progress.set(0);
    return () => { clock.pause(); timer.current = null; };
  }, [cycle, duration, progress]);
  useEffect(() => {
    const clock = timer.current;
    if (!enabled || !clock) return;
    progress.set(1 - clock.remaining() / duration);
    const animation = animate(progress, 1, { duration: clock.remaining() / 1000, ease: "linear" });
    clock.resume();
    return () => { clock.pause(); animation.stop(); };
  }, [cycle, duration, enabled, progress]);
  return progress;
}
