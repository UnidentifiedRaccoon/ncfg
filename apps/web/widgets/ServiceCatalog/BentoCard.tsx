import { ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { CmsAwareLink } from "@/shared/ui/CmsAwareLink";

interface BentoCardProps {
  title: string;
  description: string;
  href: string;
  featured?: boolean;
  className?: string;
}

export function BentoCard({
  title,
  description,
  href,
  featured = false,
  className,
}: BentoCardProps) {
  return (
    <CmsAwareLink
      href={href}
      data-ym-goal="service_click"
      className={cn(
        "group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 ease-out [will-change:transform]",
        "hover:-translate-y-1 hover:shadow-lg hover:border-[#3B82F6]/25 hover:z-10",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] focus-visible:z-10",
        "before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:z-0 before:h-px before:content-['']",
        "before:bg-gradient-to-r before:from-transparent before:via-[#58A8E0]/70 before:to-transparent",
        "before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
        "after:pointer-events-none after:absolute after:inset-0 after:z-0 after:rounded-2xl after:content-['']",
        "after:bg-[radial-gradient(circle_at_18%_12%,rgba(88,168,224,0.16),transparent_60%)]",
        "after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100",
        featured
          ? "bg-[#F0F7FF] border-[#E2E8F0] p-6 md:p-8"
          : "bg-white border-[#F1F5F9] p-5 md:p-6",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-20 z-0 h-64 w-64 rounded-full bg-gradient-to-br from-[#58A8E0]/22 via-[#3B82F6]/14 to-transparent blur-2xl"
      />

      <div className="relative z-10 flex h-full flex-col">
        <h4
          className={cn(
            featured
              ? "text-2xl md:text-3xl font-bold leading-tight tracking-tight text-[#1E3A5F]"
              : "text-lg font-semibold tracking-tight text-[#1E3A5F] transition-colors group-hover:text-[#3B82F6]",
          )}
        >
          {title}
        </h4>

        <p
          className={cn(
            featured
              ? "mt-3 text-base md:text-lg text-[#475569] leading-relaxed"
              : "mt-3 text-sm text-[#475569] leading-relaxed line-clamp-3"
          )}
        >
          {description}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-6 text-[#3B82F6] transition-opacity">
          <span className={featured ? "text-base font-medium" : "text-sm font-medium"}>
            Подробнее
          </span>
          <ArrowRight
            className={cn(
              featured ? "h-5 w-5" : "h-4 w-4",
              "transition-transform duration-300 group-hover:translate-x-0.5"
            )}
            aria-hidden="true"
          />
        </div>
      </div>
    </CmsAwareLink>
  );
}
