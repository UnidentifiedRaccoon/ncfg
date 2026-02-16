"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export interface YandexMetrikaRouteTrackerProps {
  counterId: number;
}

type YmFunction = (counterId: number, action: string, ...args: unknown[]) => void;

function getYm(): YmFunction | null {
  const maybeYm = (window as unknown as { ym?: unknown }).ym;
  return typeof maybeYm === "function" ? (maybeYm as YmFunction) : null;
}

export function YandexMetrikaRouteTracker({
  counterId,
}: YandexMetrikaRouteTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasMountedRef = useRef(false);
  const search = searchParams.toString();

  useEffect(() => {
    // `init` already reports the first page view; avoid double-counting.
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const ym = getYm();
    if (!ym) return;

    ym(counterId, "hit", window.location.href);
  }, [counterId, pathname, search]);

  return null;
}

