"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const INSTANT_ROUTE_SCROLL_ATTRIBUTE = "data-instant-route-scroll";

function isModifiedEvent(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function getAnchorElement(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const anchor = target.closest("a[href]");
  return anchor instanceof HTMLAnchorElement ? anchor : null;
}

function shouldDisableSmoothScroll(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href");

  if (!href || href.startsWith("#")) {
    return false;
  }

  if (anchor.target && anchor.target !== "_self") {
    return false;
  }

  if (anchor.hasAttribute("download")) {
    return false;
  }

  const url = new URL(anchor.href, window.location.href);

  if (url.origin !== window.location.origin) {
    return false;
  }

  if (url.hash) {
    return false;
  }

  return (
    url.pathname !== window.location.pathname ||
    url.search !== window.location.search
  );
}

export function RouteScrollBehavior() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fallbackTimeoutRef = useRef<number | null>(null);
  const resetFrameRef = useRef<number | null>(null);
  const search = searchParams.toString();

  useEffect(() => {
    const root = document.documentElement;

    const clearInstantRouteScroll = () => {
      root.removeAttribute(INSTANT_ROUTE_SCROLL_ATTRIBUTE);

      if (fallbackTimeoutRef.current !== null) {
        window.clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
    };

    const enableInstantRouteScroll = () => {
      root.setAttribute(INSTANT_ROUTE_SCROLL_ATTRIBUTE, "true");

      if (fallbackTimeoutRef.current !== null) {
        window.clearTimeout(fallbackTimeoutRef.current);
      }

      fallbackTimeoutRef.current = window.setTimeout(() => {
        fallbackTimeoutRef.current = null;
        root.removeAttribute(INSTANT_ROUTE_SCROLL_ATTRIBUTE);
      }, 1500);
    };

    const handleClickCapture = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || isModifiedEvent(event)) {
        return;
      }

      const anchor = getAnchorElement(event.target);

      if (!anchor || !shouldDisableSmoothScroll(anchor)) {
        return;
      }

      enableInstantRouteScroll();
    };

    document.addEventListener("click", handleClickCapture, true);

    return () => {
      document.removeEventListener("click", handleClickCapture, true);

      if (resetFrameRef.current !== null) {
        window.cancelAnimationFrame(resetFrameRef.current);
      }

      clearInstantRouteScroll();
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (!root.hasAttribute(INSTANT_ROUTE_SCROLL_ATTRIBUTE)) {
      return;
    }

    resetFrameRef.current = window.requestAnimationFrame(() => {
      resetFrameRef.current = window.requestAnimationFrame(() => {
        resetFrameRef.current = null;
        root.removeAttribute(INSTANT_ROUTE_SCROLL_ATTRIBUTE);

        if (fallbackTimeoutRef.current !== null) {
          window.clearTimeout(fallbackTimeoutRef.current);
          fallbackTimeoutRef.current = null;
        }
      });
    });

    return () => {
      if (resetFrameRef.current !== null) {
        window.cancelAnimationFrame(resetFrameRef.current);
        resetFrameRef.current = null;
      }
    };
  }, [pathname, search]);

  return null;
}
