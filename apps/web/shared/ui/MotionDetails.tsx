"use client";

import { animate } from "motion/react";
import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { motionTokens, useReducedMotion } from "@/shared/lib/motion";

// Native details/summary remains fully usable before hydration and without JS.
export function MotionDetails(props: ComponentPropsWithoutRef<"details">) {
  const ref = useRef<HTMLDetailsElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const details = ref.current;
    const summary = details?.querySelector(":scope > summary");
    const content = details?.lastElementChild;
    if (!details || !(summary instanceof HTMLElement) || !(content instanceof HTMLElement) || content === summary) return;
    let expanded = details.open;
    let animation: ReturnType<typeof animate> | undefined;
    let revision = 0;
    const syncAccessibility = () => {
      content.inert = !expanded;
      content.setAttribute("aria-hidden", String(!expanded));
      summary.setAttribute("aria-expanded", String(expanded));
    };
    const finish = () => {
      animation = undefined;
      details.open = expanded;
      content.style.removeProperty("height");
      content.style.removeProperty("overflow");
    };
    const toggle = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("a, button, input")) return;
      event.preventDefault();
      const currentRevision = ++revision;
      const from = details.open ? content.getBoundingClientRect().height : 0;
      animation?.stop();
      expanded = !expanded;
      if (!expanded && content.contains(document.activeElement)) summary.focus({ preventScroll: true });
      syncAccessibility();
      details.open = true;
      content.style.height = "auto";
      const to = expanded ? content.getBoundingClientRect().height : 0;
      if (reduced) { finish(); return; }
      content.style.overflow = "hidden";
      animation = animate(content, { height: [from, to] }, {
        duration: expanded ? motionTokens.disclosure : motionTokens.exit,
        ease: motionTokens.ease,
        onComplete: () => { if (currentRevision === revision) finish(); },
      });
    };
    // Browser find, hash navigation and the native open property can also toggle
    // details. Adopt that state once our visual transition no longer owns it.
    const onNativeToggle = () => {
      if (animation && details.open) return;
      revision++;
      animation?.stop();
      expanded = details.open;
      syncAccessibility();
      finish();
    };
    syncAccessibility();
    summary.addEventListener("click", toggle);
    details.addEventListener("toggle", onNativeToggle);
    return () => {
      revision++;
      animation?.stop();
      details.removeEventListener("toggle", onNativeToggle);
      finish();
      content.inert = false;
      content.removeAttribute("aria-hidden");
      summary.removeAttribute("aria-expanded");
      summary.removeEventListener("click", toggle);
    };
  }, [reduced]);
  return <details {...props} ref={ref} />;
}
