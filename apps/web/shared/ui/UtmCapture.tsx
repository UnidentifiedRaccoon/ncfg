"use client";

import { useEffect } from "react";
import { captureUtmParams } from "@/shared/lib/utm";

/** Captures UTM params from the URL on first mount. */
export function UtmCapture() {
  useEffect(() => {
    captureUtmParams();
  }, []);

  return null;
}
