"use client";

import { useEffect } from "react";

export function SmoothAnchor() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href?.startsWith("#")) return;

      const id = href.slice(1);
      const element = document.getElementById(id);

      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", href);
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
