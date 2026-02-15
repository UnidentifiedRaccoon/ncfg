import Link from "next/link";
import {
  ClipboardCheck,
  Target,
  PlayCircle,
  Video,
  Users,
  Phone,
  UserCheck,
  ArrowRight,
  Layers,
  Trophy,
  BookOpen,
  FileText,
  PenTool,
  CalendarDays,
  Mic,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { ServiceCatalogVariant } from "./ServiceCatalog";

const iconMap: Record<string, LucideIcon> = {
  "clipboard-check": ClipboardCheck,
  target: Target,
  "play-circle": PlayCircle,
  video: Video,
  users: Users,
  phone: Phone,
  "user-check": UserCheck,
  layers: Layers,
  trophy: Trophy,
  "book-open": BookOpen,
  "file-text": FileText,
  "pen-tool": PenTool,
  "calendar-days": CalendarDays,
  mic: Mic,
};

const cardStylesByVariant = {
  glass: {
    card: cn(
      "group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 ease-out [will-change:transform]",
      "hover:-translate-y-1 hover:shadow-lg hover:border-[#3B82F6]/25 hover:z-10",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] focus-visible:z-10",
      "before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:z-0 before:h-px before:content-['']",
      "before:bg-gradient-to-r before:from-transparent before:via-[#58A8E0]/70 before:to-transparent",
      "before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
      "after:pointer-events-none after:absolute after:inset-0 after:z-0 after:rounded-2xl after:content-['']",
      "after:bg-[radial-gradient(circle_at_18%_12%,rgba(88,168,224,0.16),transparent_60%)]",
      "after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100"
    ),
    cardFeatured: "bg-[#F0F7FF] border-[#E2E8F0] p-6 md:p-8",
    cardDefault: "bg-white border-[#F1F5F9] p-5 md:p-6",
    rail: "pointer-events-none absolute top-6 bottom-6 left-0 w-[2px] rounded-full bg-gradient-to-b from-[#58A8E0] via-[#3B82F6] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100",
    glow: "pointer-events-none absolute -right-24 -top-20 z-0 h-64 w-64 rounded-full bg-gradient-to-br from-[#58A8E0]/22 via-[#3B82F6]/14 to-transparent blur-2xl",
    iconWrapFeatured: "h-12 w-12 rounded-2xl bg-[#3B82F6]/10",
    iconWrapDefault: "h-10 w-10 rounded-xl bg-[#1E3A5F]/10",
    iconFeatured: "h-6 w-6 text-[#3B82F6]",
    iconDefault:
      "h-5 w-5 text-[#1E3A5F] transition-colors group-hover:text-[#3B82F6]",
    titleFeatured:
      "mt-5 text-2xl md:text-3xl font-bold leading-tight tracking-tight text-[#1E3A5F]",
    titleDefault:
      "mt-4 text-lg font-semibold tracking-tight text-[#1E3A5F] transition-colors group-hover:text-[#3B82F6]",
    descFeatured: "mt-3 text-base md:text-lg text-[#475569] leading-relaxed",
    descDefault: "mt-3 text-sm text-[#475569] leading-relaxed line-clamp-3",
    cta: "mt-auto pt-6 flex items-center gap-2 text-[#3B82F6] transition-opacity",
    ctaHidden: "md:opacity-0 md:group-hover:opacity-100",
    ctaTextFeatured: "text-base font-medium",
    ctaTextDefault: "text-sm font-medium",
    arrowFeatured:
      "h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5",
    arrowDefault:
      "h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5",
    iconRingDefault: "",
    iconRingFeatured: "",
  },
  dark: {
    card: cn(
      "group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 ease-out [will-change:transform]",
      "border-white/10",
      "hover:-translate-y-1 hover:border-[#3B82F6]/30 hover:shadow-[0_18px_60px_rgba(15,23,42,0.28)] hover:z-10",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] focus-visible:z-10",
      "before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:z-0 before:h-px before:content-['']",
      "before:bg-gradient-to-r before:from-transparent before:via-[#58A8E0]/55 before:to-transparent",
      "before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
      "after:pointer-events-none after:absolute after:inset-0 after:z-0 after:rounded-2xl after:content-['']",
      "after:bg-[radial-gradient(circle_at_18%_12%,rgba(88,168,224,0.12),transparent_60%)]",
      "after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100"
    ),
    cardFeatured: "bg-[#0F2244] p-6 md:p-8",
    cardDefault: "bg-[#0B1A33] p-5 md:p-6",
    rail: "pointer-events-none absolute top-6 bottom-6 left-0 w-[2px] rounded-full bg-gradient-to-b from-[#58A8E0] via-[#3B82F6] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100",
    glow: "pointer-events-none absolute -right-28 -top-24 z-0 h-72 w-72 rounded-full bg-gradient-to-br from-[#58A8E0]/16 via-[#3B82F6]/10 to-transparent blur-2xl",
    iconWrapFeatured: "h-12 w-12 rounded-2xl bg-white/10",
    iconWrapDefault: "h-10 w-10 rounded-xl bg-white/8",
    iconFeatured: "h-6 w-6 text-white/90",
    iconDefault:
      "h-5 w-5 text-white/80 transition-colors group-hover:text-white",
    titleFeatured:
      "mt-5 text-2xl md:text-3xl font-bold leading-tight tracking-tight text-white",
    titleDefault:
      "mt-4 text-lg font-semibold tracking-tight text-white transition-colors group-hover:text-white",
    descFeatured: "mt-3 text-base md:text-lg text-white/70 leading-relaxed",
    descDefault: "mt-3 text-sm text-white/70 leading-relaxed line-clamp-3",
    cta: "mt-auto pt-6 flex items-center gap-2 text-white/90 transition-opacity",
    ctaHidden: "md:opacity-0 md:group-hover:opacity-100",
    ctaTextFeatured: "text-base font-medium",
    ctaTextDefault: "text-sm font-medium",
    arrowFeatured:
      "h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5",
    arrowDefault:
      "h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5",
    iconRingDefault: "ring-1 ring-inset ring-white/10",
    iconRingFeatured: "ring-1 ring-inset ring-white/14",
  },
  editorial: {
    card: cn(
      "group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-colors duration-200",
      "border-[#E2E8F0]/80 bg-white",
      "hover:border-[#3B82F6]/25 hover:bg-[#F8FAFC]",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
    ),
    cardFeatured: "p-6 md:p-8",
    cardDefault: "p-5 md:p-6",
    rail: "hidden",
    glow: "hidden",
    iconWrapFeatured: "h-12 w-12 rounded-2xl bg-[#1E3A5F]/8",
    iconWrapDefault: "h-10 w-10 rounded-xl bg-[#1E3A5F]/8",
    iconFeatured: "h-6 w-6 text-[#1E3A5F]",
    iconDefault: "h-5 w-5 text-[#1E3A5F]",
    titleFeatured:
      "mt-5 text-2xl md:text-3xl font-semibold leading-tight tracking-tight text-[#1E3A5F]",
    titleDefault: "mt-4 text-lg font-semibold tracking-tight text-[#1E3A5F]",
    descFeatured: "mt-3 text-base md:text-lg text-[#475569] leading-relaxed",
    descDefault: "mt-3 text-sm text-[#475569] leading-relaxed line-clamp-3",
    cta: "mt-auto pt-6 flex items-center gap-2 text-[#1E3A5F] transition-opacity",
    ctaHidden: "",
    ctaTextFeatured: "text-base font-medium",
    ctaTextDefault: "text-sm font-medium",
    arrowFeatured: "h-5 w-5",
    arrowDefault: "h-4 w-4",
    iconRingDefault: "ring-1 ring-inset ring-[#E2E8F0]/80",
    iconRingFeatured: "ring-1 ring-inset ring-[#E2E8F0]/80",
  },
} satisfies Record<
  ServiceCatalogVariant,
  {
    card: string;
    cardFeatured: string;
    cardDefault: string;
    rail: string;
    glow: string;
    iconWrapFeatured: string;
    iconWrapDefault: string;
    iconFeatured: string;
    iconDefault: string;
    titleFeatured: string;
    titleDefault: string;
    descFeatured: string;
    descDefault: string;
    cta: string;
    ctaHidden: string;
    ctaTextFeatured: string;
    ctaTextDefault: string;
    arrowFeatured: string;
    arrowDefault: string;
    iconRingDefault: string;
    iconRingFeatured: string;
  }
>;

interface BentoCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  variant?: ServiceCatalogVariant;
  featured?: boolean;
  className?: string;
}

export function BentoCard({
  title,
  description,
  href,
  icon,
  variant = "glass",
  featured = false,
  className,
}: BentoCardProps) {
  const Icon = iconMap[icon] || Target;
  const styles = cardStylesByVariant[variant];

  return (
    <Link
      href={href}
      className={cn(
        styles.card,
        featured ? styles.cardFeatured : styles.cardDefault,
        className
      )}
    >
      <span
        aria-hidden="true"
        className={styles.rail}
      />

      <div aria-hidden="true" className={styles.glow} />

      <div className="relative z-10 flex h-full flex-col">
        <div
          className={cn(
            "flex items-center justify-center",
            featured ? styles.iconWrapFeatured : styles.iconWrapDefault,
            featured ? styles.iconRingFeatured : styles.iconRingDefault
          )}
          aria-hidden="true"
        >
          <Icon className={featured ? styles.iconFeatured : styles.iconDefault} />
        </div>

        <h4 className={featured ? styles.titleFeatured : styles.titleDefault}>
          {title}
        </h4>

        <p className={featured ? styles.descFeatured : styles.descDefault}>
          {description}
        </p>

        <div
          className={cn(
            styles.cta,
            featured ? "" : styles.ctaHidden
          )}
        >
          <span className={featured ? styles.ctaTextFeatured : styles.ctaTextDefault}>
            Подробнее
          </span>
          <ArrowRight
            className={featured ? styles.arrowFeatured : styles.arrowDefault}
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  );
}
