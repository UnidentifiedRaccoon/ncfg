"use client";

import { useSyncExternalStore } from "react";

function mediaStore(query: string, serverValue: boolean) {
  return {
    subscribe: (notify: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    snapshot: () => window.matchMedia(query).matches,
    serverSnapshot: () => serverValue,
  };
}

const reducedStore = mediaStore("(prefers-reduced-motion: reduce)", false);
const compactStore = mediaStore("(max-width: 767px)", true);
const desktopStore = mediaStore("(min-width: 1200px)", false);
const subscribeVisibility = (notify: () => void) => {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
};
const visibleSnapshot = () => document.visibilityState === "visible";
const serverVisibleSnapshot = () => false;

// Unlike animation-only configuration, these subscriptions also stop timers,
// imperative animations and scroll effects when the preference changes live.
export function useReducedMotion() {
  return useSyncExternalStore(reducedStore.subscribe, reducedStore.snapshot, reducedStore.serverSnapshot);
}

export function useCompactMotion() {
  return useSyncExternalStore(compactStore.subscribe, compactStore.snapshot, compactStore.serverSnapshot);
}

export function useDesktopScene() {
  return useSyncExternalStore(desktopStore.subscribe, desktopStore.snapshot, desktopStore.serverSnapshot);
}

export function useDocumentVisible() {
  return useSyncExternalStore(subscribeVisibility, visibleSnapshot, serverVisibleSnapshot);
}

export function preferredScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
}
