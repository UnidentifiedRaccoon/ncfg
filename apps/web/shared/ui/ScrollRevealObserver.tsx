"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const REVEAL_SELECTOR = "[data-scroll-reveal]";
const REVEAL_STATE_ATTRIBUTE = "data-scroll-reveal-state";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type RevealState = "hidden" | "visible";

function setRevealState(element: HTMLElement, state: RevealState) {
  element.setAttribute(REVEAL_STATE_ATTRIBUTE, state);
}

function isInitiallyVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const viewportHeight =
    window.innerHeight || document.documentElement.clientHeight;

  return rect.top < viewportHeight * 0.92 && rect.bottom > 0;
}

export function ScrollRevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)
    );

    if (elements.length === 0) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      elements.forEach((element) => setRevealState(element, "visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          const target = entry.target as HTMLElement;
          setRevealState(target, "visible");
          observer.unobserve(target);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.15,
      }
    );

    for (const element of elements) {
      if (isInitiallyVisible(element)) {
        setRevealState(element, "visible");
        continue;
      }

      setRevealState(element, "hidden");
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
