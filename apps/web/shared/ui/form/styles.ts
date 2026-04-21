import { cn } from "@/shared/lib/cn";

const FORM_FIELD_BASE = cn(
  "w-full border border-[#E2E8F0] bg-white px-4",
  "text-[#0F172A] placeholder:text-[#94A3B8]",
  "shadow-[0_1px_0_rgba(15,23,42,0.02)]",
  "focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[rgba(59,130,246,0.15)]",
  "transition-all duration-150",
  "disabled:cursor-not-allowed disabled:opacity-60"
);

export type FormInputRounded = "md" | "lg" | "xl";

export function formInputClassName(rounded: FormInputRounded = "md"): string {
  const radius =
    rounded === "md"
      ? "rounded-md py-3"
      : rounded === "lg"
        ? "rounded-lg py-3"
        : "rounded-xl py-3.5";

  return cn(FORM_FIELD_BASE, radius);
}

export function formTextareaClassName(rounded: FormInputRounded = "md"): string {
  return cn(formInputClassName(rounded), "resize-none");
}

export const formLabelClassName = "block text-sm font-medium text-[#1E3A5F]";

export const formErrorAlertClassName = cn(
  "flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
);

export const formConsentBoxClassName =
  "rounded-xl border border-[#E2E8F0]/80 bg-[#F8FAFC] p-4";

export const formConsentRowClassName = "flex items-start gap-3";

export const formConsentCheckboxClassName = cn(
  "mt-0.5 h-5 w-5 shrink-0 rounded border border-[#E2E8F0] bg-white",
  "accent-[#3B82F6]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
);
