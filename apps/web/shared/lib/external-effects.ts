import type { StrapiSource } from "./strapi-config";

type EffectMode = "auto" | "enabled" | "disabled";

export class ExternalEffectDisabledError extends Error {
  constructor(effect: "Strapi write" | "outbound delivery") {
    super(
      `${effect} is disabled for this runtime. ` +
        "Use an explicitly enabled trusted runtime when the effect is intentional."
    );
    this.name = "ExternalEffectDisabledError";
  }
}

function resolveEffectMode(name: "STRAPI_WRITE_MODE" | "OUTBOUND_MODE"): EffectMode {
  const value = process.env[name]?.trim().toLowerCase() || "auto";
  if (value === "auto" || value === "enabled" || value === "disabled") {
    return value;
  }
  throw new Error(`Invalid ${name}="${value}". Use auto, enabled, or disabled.`);
}

function isPreviewRuntime() {
  return (
    process.env.DEPLOY_ENV?.trim().toLowerCase() === "preview" ||
    process.env.VERCEL_ENV?.trim().toLowerCase() === "preview"
  );
}

function isProductionRuntime() {
  return (
    process.env.NODE_ENV === "production" &&
    process.env.DEPLOY_ENV?.trim().toLowerCase() === "production" &&
    !isPreviewRuntime()
  );
}

export function isStrapiWriteAllowed(source: StrapiSource): boolean {
  const mode = resolveEffectMode("STRAPI_WRITE_MODE");
  if (mode === "enabled") return true;
  if (mode === "disabled") return false;
  if (isProductionRuntime()) return true;
  return source === "local";
}

export function assertStrapiWriteAllowed(source: StrapiSource): void {
  if (!isStrapiWriteAllowed(source)) {
    throw new ExternalEffectDisabledError("Strapi write");
  }
}

export function isOutboundAllowed(): boolean {
  const mode = resolveEffectMode("OUTBOUND_MODE");
  if (mode === "enabled") return true;
  if (mode === "disabled") return false;
  return isProductionRuntime();
}

export function assertOutboundAllowed(): void {
  if (!isOutboundAllowed()) {
    throw new ExternalEffectDisabledError("outbound delivery");
  }
}
