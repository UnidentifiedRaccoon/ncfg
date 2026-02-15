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

interface BentoCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  featured?: boolean;
  className?: string;
}

export function BentoCard({
  title,
  description,
  href,
  icon,
  featured = false,
  className,
}: BentoCardProps) {
  const Icon = iconMap[icon] || Target;

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-[#E2E8F0]/70",
        "bg-white/85 shadow-sm backdrop-blur-sm",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-[#3B82F6]/25 hover:shadow-lg hover:shadow-blue-500/10",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
        featured ? "bg-white/90 p-6 md:p-8" : "p-5 md:p-6",
        className
      )}
    >
      {/* Hairline highlight + accent rail (decorative) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-60"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-6 bottom-6 left-0 w-[2px] rounded-full bg-gradient-to-b from-[#58A8E0] via-[#3B82F6] to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />

      {/* Hover atmosphere (decorative) */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
          "bg-[radial-gradient(circle_at_18%_12%,rgba(88,168,224,0.18),transparent_60%)]"
        )}
      />

      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl",
          "bg-[#1E3A5F]/[0.08] ring-1 ring-inset ring-[#1E3A5F]/10",
          "transition-colors group-hover:bg-[#3B82F6]/10 group-hover:ring-[#3B82F6]/20",
          featured ? "h-14 w-14 rounded-2xl mb-6" : "h-11 w-11 mb-4"
        )}
      >
        <Icon
          className={cn(
            "text-[#1E3A5F] transition-colors group-hover:text-[#3B82F6]",
            featured ? "h-7 w-7" : "h-5 w-5"
          )}
        />
      </div>

      <h4
        className={cn(
          "font-semibold tracking-tight text-[#1E3A5F] transition-colors group-hover:text-[#3B82F6]",
          featured ? "text-xl md:text-2xl mb-3" : "text-lg mb-2"
        )}
      >
        {title}
      </h4>

      <p
        className={cn(
          "text-[#475569] leading-relaxed flex-grow",
          featured ? "text-base md:text-lg line-clamp-3" : "text-sm line-clamp-3"
        )}
      >
        {description}
      </p>

      <div
        className={cn(
          "flex items-center gap-2 text-[#3B82F6] transition-opacity mt-4",
          "md:opacity-0 md:group-hover:opacity-100"
        )}
      >
        <span className={cn("font-medium", featured ? "text-base" : "text-sm")}>
          Подробнее
        </span>
        <ArrowRight className={cn(featured ? "w-5 h-5" : "w-4 h-4")} />
      </div>
    </Link>
  );
}
