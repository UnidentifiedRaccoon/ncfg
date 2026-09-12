"use client";

import { useAnimate } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { motionTokens, useCompactMotion, useReducedMotion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/cn";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "subtle" | "card";
  from?: "bottom" | "left" | "right";
  viewport?: "edge" | "inset";
}

// Visible server HTML. Only an offscreen, unfocused element can be prepared.
// Hash navigation, focus and preference changes always reveal it.
export function Reveal({ children, className, delay = 0, variant = "subtle", from = "bottom", viewport = variant === "card" ? "inset" : "edge" }: RevealProps) {
  const [ref, animate] = useAnimate<HTMLDivElement>();
  const shown = useRef(false);
  const reduced = useReducedMotion();
  const compact = useCompactMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let observer: IntersectionObserver | null = null;
    let playback: ReturnType<typeof animate> | undefined;
    const stopObserving = () => {
      observer?.disconnect();
      window.removeEventListener("resize", observe);
    };
    const show = () => {
      shown.current = true;
      stopObserving();
      playback?.stop();
      playback = animate(node, { opacity: 1, x: 0, y: 0, scale: 1 }, { duration: 0 });
      playback.complete();
    };
    const hasTarget = () => {
      let hash: string;
      try { hash = decodeURIComponent(location.hash.slice(1)); } catch { return false; }
      const target = document.getElementById(hash);
      return target && (node.contains(target) || target.contains(node));
    };
    if (shown.current || reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches || node.getBoundingClientRect().top < window.innerHeight || node.contains(document.activeElement) || hasTarget() || !window.IntersectionObserver) {
      show();
      return;
    }
    function observe() {
      if (!node || shown.current) return;
      observer?.disconnect();
      // IO percentage margins use width. Pixels keep the trigger tied to height,
      // including short landscape windows and changes in the browser chrome.
      const inset = viewport === "inset"
        ? Math.round(window.innerHeight * (compact ? motionTokens.compactRevealInset : motionTokens.revealInset))
        : 24;
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        shown.current = true;
        stopObserving();
        playback?.stop();
        playback = animate(node, { opacity: 1, x: 0, y: 0, scale: 1 }, {
          duration: variant === "card" && !compact ? motionTokens.cardReveal : motionTokens.reveal,
          ease: motionTokens.ease,
          delay: compact ? 0 : Math.max(0, Math.min(delay, motionTokens.maxStagger)),
        });
      }, { threshold: 0, rootMargin: `0px 0px -${inset}px 0px` });
      observer.observe(node);
    }
    const distance = variant === "card"
      ? compact ? motionTokens.compactCardDistance : motionTokens.cardDistance
      : compact ? motionTokens.compactDistance : motionTokens.distance;
    const sideways = !compact && from !== "bottom";
    // Target the mounted DOM directly. Preparation must not depend on a later
    // render subscribing legacy animation controls during streamed hydration.
    playback = animate(node, {
      opacity: variant === "card" ? 0.35 : 0,
      x: sideways ? (from === "left" ? -distance : distance) : 0,
      y: sideways ? 0 : distance,
      scale: variant === "card" && !compact ? motionTokens.cardScale : 1,
    }, { duration: 0 });
    playback.complete();
    observe();
    window.addEventListener("resize", observe);
    node.addEventListener("focusin", show);
    const onHash = () => { if (hasTarget()) show(); };
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", show);
    return () => {
      stopObserving();
      node.removeEventListener("focusin", show);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", show);
      playback?.stop();
    };
  }, [animate, compact, delay, from, reduced, ref, variant, viewport]);

  return <div data-motion-reveal={variant} ref={ref} className={cn("motion-reduce:!opacity-100 motion-reduce:!transform-none", className)}>{children}</div>;
}
