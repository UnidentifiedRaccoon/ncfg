import { ArrowRight, Mail, Phone } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";
import type { FooterTheme } from "./footer-theme";

interface FooterCtaProps {
  ctaHref: string;
  phone: string;
  phoneSanitized: string;
  email: string;
  theme: FooterTheme;
}

export function FooterCta({
  ctaHref,
  phone,
  phoneSanitized,
  email,
  theme,
}: FooterCtaProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8 md:py-7",
        "border-b",
        theme.dividerClassName
      )}
    >
      <div className="min-w-0">
        <div
          className={cn(
            "text-xs font-semibold",
            theme.tone === "light" ? "text-[#475569]" : "text-white/60"
          )}
        >
          Консультация бесплатно
        </div>
        <div
          className={cn(
            "mt-1 text-lg md:text-xl font-semibold tracking-tight",
            theme.tone === "light" ? "text-[#1E3A5F]" : "text-white"
          )}
        >
          Поможем выбрать формат программы
        </div>
        <div
          className={cn(
            "mt-1 text-sm",
            theme.tone === "light" ? "text-[#475569]" : "text-white/65"
          )}
        >
          Ответим в течение 1 дня
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          href={ctaHref}
          variant="secondary"
          size="md"
          className={theme.ctaButtonClassName}
        >
          Оставить заявку
          <ArrowRight className="ml-2 h-4 w-4 opacity-80" aria-hidden="true" />
        </Button>

        <a
          href={`tel:${phoneSanitized}`}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-full border px-6 text-base font-semibold transition-colors",
            theme.tone === "light"
              ? "border-[#E2E8F0]/70 bg-white/70 text-[#1E3A5F] hover:bg-white"
              : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
          )}
        >
          <Phone size={14} className={theme.iconAccentClassName} />
          {phone}
        </a>

        <a
          href={`mailto:${email}`}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-full border px-6 text-base font-semibold transition-colors",
            theme.tone === "light"
              ? "border-[#E2E8F0]/70 bg-white/70 text-[#1E3A5F] hover:bg-white"
              : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
          )}
        >
          <Mail size={14} className={theme.iconAccentClassName} />
          {email}
        </a>
      </div>
    </div>
  );
}

