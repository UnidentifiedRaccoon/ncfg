import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";

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
    <Link
      href={href}
      className={cn(
        "group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 ease-out [will-change:transform]",
        "hover:-translate-y-1.5 hover:shadow-[0_26px_48px_rgba(36,80,154,0.2)] hover:border-[#3B82F6]/45 hover:z-10",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] focus-visible:z-10",
        "after:pointer-events-none after:absolute after:inset-0 after:z-0 after:rounded-2xl after:content-['']",
        "after:bg-[radial-gradient(circle_at_18%_12%,rgba(48,215,255,0.22),transparent_60%)]",
        "after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100",
        featured
          ? "bg-[linear-gradient(145deg,#F2F8FF,#ECF4FF)] border-[#DCE8F8] p-6 md:p-8"
          : "bg-white/92 border-[#E4ECF7] p-5 md:p-6",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-20 z-0 h-64 w-64 rounded-full bg-gradient-to-br from-[#4FC3F7]/25 via-[#3B82F6]/16 to-transparent blur-2xl"
      />

      <div className="relative z-10 flex h-full flex-col">
        <h4
          className={cn(
            featured
              ? "text-2xl md:text-3xl font-bold leading-tight tracking-tight text-[#132B4A]"
              : "text-lg font-semibold tracking-tight text-[#132B4A] transition-colors group-hover:text-[#2F65C7]",
          )}
        >
          {title}
        </h4>

        <p
          className={cn(
            featured
              ? "mt-3 text-base md:text-lg text-[#425A77] leading-relaxed"
              : "mt-3 text-sm text-[#425A77] leading-relaxed line-clamp-3"
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
    </Link>
  );
}
