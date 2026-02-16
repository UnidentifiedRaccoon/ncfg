import { cn } from "@/shared/lib/cn";

export type FooterVariant = "hero" | "navy" | "light";
export type FooterTone = "dark" | "light";

const FOOTER_VARIANTS = ["hero", "navy", "light"] as const;

export function normalizeCopyrightLine(value: string): string {
  return value
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\.$/, "")
    .trim()
    .toLowerCase();
}

function isFooterVariant(value: unknown): value is FooterVariant {
  return (
    typeof value === "string" &&
    (FOOTER_VARIANTS as readonly string[]).includes(value)
  );
}

export function resolveFooterVariant(explicitVariant?: FooterVariant): FooterVariant {
  if (explicitVariant) return explicitVariant;
  const env = process.env.NEXT_PUBLIC_FOOTER_VARIANT;
  if (isFooterVariant(env)) return env;
  return "hero";
}

export function getFooterTheme(variant: FooterVariant) {
  const tone: FooterTone = variant === "light" ? "light" : "dark";

  const rootClassName = cn(
    "relative overflow-hidden",
    variant === "light"
      ? "bg-[#F8FAFC] text-[#0F172A]"
      : variant === "navy"
        ? "bg-[#1E3A5F] text-white"
        : "bg-[#050B16] text-white"
  );

  const panelClassName =
    variant === "light"
      ? "rounded-2xl border border-[#E2E8F0]/70 bg-white/80 shadow-sm backdrop-blur-sm overflow-hidden"
      : variant === "navy"
        ? "rounded-2xl border border-white/12 bg-white/[0.04] shadow-[0_24px_70px_rgba(0,0,0,0.35)] overflow-hidden"
        : "rounded-2xl border border-white/12 bg-[#0B1324] shadow-[0_28px_90px_rgba(0,0,0,0.55)] overflow-hidden";

  const topSheenClassName = cn(
    "pointer-events-none absolute inset-x-0 top-0 h-12",
    tone === "light"
      ? "bg-gradient-to-b from-white/80 to-transparent"
      : "bg-gradient-to-b from-white/[0.06] to-transparent"
  );

  const dividerClassName =
    tone === "light" ? "border-[#E2E8F0]/70" : "border-white/10";

  const sectionTitleClassName =
    tone === "light"
      ? "text-sm font-semibold text-[#1E3A5F]"
      : "text-sm font-semibold text-white";

  const linkClassName =
    tone === "light"
      ? "text-sm text-[#475569] hover:text-[#1E3A5F] transition-colors hover:underline underline-offset-4 decoration-[#3B82F6]/30"
      : "text-sm text-white/65 hover:text-white transition-colors hover:underline underline-offset-4 decoration-white/25";

  const mutedTextClassName =
    tone === "light" ? "text-sm text-[#475569]" : "text-sm text-white/65";

  const iconAccentClassName =
    tone === "light" ? "text-[#3B82F6]" : "text-[#58A8E0]";

  const badgeClassName =
    tone === "light"
      ? "rounded-full border border-[#E2E8F0]/70 bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-semibold text-[#475569]"
      : "rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/60";

  const ctaButtonClassName =
    tone === "light"
      ? "rounded-full"
      : "rounded-full !bg-white/10 !text-white border border-white/20 hover:!bg-white/15 hover:shadow-[0_16px_44px_rgba(88,168,224,0.16)]";

  return {
    variant,
    tone,
    rootClassName,
    panelClassName,
    topSheenClassName,
    dividerClassName,
    sectionTitleClassName,
    linkClassName,
    mutedTextClassName,
    iconAccentClassName,
    badgeClassName,
    ctaButtonClassName,
  } as const;
}

export type FooterTheme = ReturnType<typeof getFooterTheme>;

