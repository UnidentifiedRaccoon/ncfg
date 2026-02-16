import { cn } from "@/shared/lib/cn";

export const TRUST_CHIPS = ["Минфин России", "Сбербанк", "Почта Банк", "Мир"] as const;

export const leadBadgeClassName =
  "inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/70 px-3 py-1 text-xs font-semibold text-[#1E3A5F] backdrop-blur";

export const inputBaseClassName = cn(
  "w-full rounded-md border border-[#E2E8F0] bg-white px-4 py-3",
  "text-[#0F172A] placeholder:text-[#94A3B8]",
  "shadow-[0_1px_0_rgba(15,23,42,0.02)]",
  "focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[rgba(59,130,246,0.15)]",
  "transition-all duration-150"
);

