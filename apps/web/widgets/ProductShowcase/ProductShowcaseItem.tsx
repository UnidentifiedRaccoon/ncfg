import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  GraduationCap,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { ReactNode } from "react";

type IconType = "graduation-cap" | "trending-up" | "zap";

const iconMap: Record<IconType, LucideIcon> = {
  "graduation-cap": GraduationCap,
  "trending-up": TrendingUp,
  zap: Zap,
};

function ProductShowcaseLink({
  href,
  className,
  ariaLabel,
  children,
}: {
  href: string;
  className: string;
  ariaLabel: string;
  children: ReactNode;
}) {
  const isExternal = href.startsWith("http");

  if (isExternal || href.startsWith("#")) {
    return (
      <a
        href={href}
        className={className}
        aria-label={ariaLabel}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

interface ProductShowcaseItemProps {
  title: string;
  description: string;
  href: string;
  image?: string;
  icon?: IconType;
  audience?: string;
  reversed?: boolean;
}

function MediaCover({
  image,
  icon,
  audience,
}: {
  image?: string;
  icon?: IconType;
  audience?: string;
}) {
  const Icon = icon ? iconMap[icon] : null;

  return (
    <div
      className={cn(
        "relative aspect-[4/3] overflow-hidden rounded-2xl border",
        "border-[#E2E8F0]/60 bg-[#F8FAFC]"
      )}
    >
      <div aria-hidden="true" className="absolute inset-0">
        {image ? (
          <>
            <Image
              src={image}
              alt=""
              fill
              className="object-cover transition-transform duration-700 [will-change:transform] group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
            <div
              className={cn(
                "absolute inset-0",
                "bg-gradient-to-b from-white/18 via-white/0 to-transparent"
              )}
            />
            <div
              className={cn(
                "absolute inset-0",
                "bg-gradient-to-t from-black/20 via-black/0 to-transparent"
              )}
            />
          </>
        ) : (
          <>
            <div
              className={cn(
                "absolute inset-0",
                "bg-gradient-to-br from-[#0B1A33] via-[#1E3A5F] to-[#3B82F6]"
              )}
            />
            <div
              className={cn(
                "absolute inset-0 opacity-[0.14]",
                "bg-[radial-gradient(circle_at_24%_28%,rgba(88,168,224,0.65),transparent_58%)]"
              )}
            />
            <div
              className={cn(
                "absolute inset-0 opacity-[0.10]",
                "bg-[linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:56px_56px]"
              )}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {Icon ? (
                <Icon className="h-20 w-20 text-white/30" />
              ) : (
                <span className="text-4xl font-bold tracking-wider text-white/20">
                  НЦФГ
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {(Icon || audience) && (
        <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
          {Icon && (
            <span
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm",
                "border-white/40 bg-white/80 backdrop-blur-sm"
              )}
              aria-hidden="true"
            >
              <Icon className="h-5 w-5 text-[#3B82F6]" />
            </span>
          )}
          {audience && (
            <span
              className={cn(
                "inline-flex h-9 min-w-9 items-center rounded-full border px-3 text-sm font-semibold backdrop-blur",
                "border-white/40 bg-white/80 text-[#1E3A5F]"
              )}
            >
              {audience}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function ProductShowcaseItem({
  title,
  description,
  href,
  image,
  icon,
  audience,
  reversed = false,
}: ProductShowcaseItemProps) {
  return (
    <ProductShowcaseLink
      href={href}
      ariaLabel={title}
      className={cn(
        "group relative isolate block overflow-hidden rounded-3xl border transition-all duration-300 ease-out [will-change:transform]",
        "border-[#E2E8F0]/70 bg-white/75 shadow-sm backdrop-blur-sm",
        "hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 hover:border-[#3B82F6]/25",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] focus-visible:z-10",
        "before:pointer-events-none before:absolute before:inset-x-10 before:top-0 before:z-0 before:h-px before:content-['']",
        "before:bg-gradient-to-r before:from-transparent before:via-[#58A8E0]/70 before:to-transparent",
        "before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100",
        "after:pointer-events-none after:absolute after:inset-0 after:z-0 after:rounded-3xl after:content-['']",
        "after:bg-[radial-gradient(circle_at_18%_12%,rgba(88,168,224,0.18),transparent_60%)]",
        "after:opacity-0 after:transition-opacity after:duration-300 group-hover:after:opacity-100"
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-24 z-0 h-72 w-72 rounded-full bg-gradient-to-br from-[#58A8E0]/24 via-[#3B82F6]/14 to-transparent blur-2xl"
      />

      <div className="relative z-10 grid items-center gap-6 p-5 md:grid-cols-12 md:gap-8 md:p-6 lg:gap-10 lg:p-7">
        <div className={cn("md:col-span-5", reversed && "md:order-2")}>
          <MediaCover image={image} icon={icon} audience={audience} />
        </div>

        <div className={cn("md:col-span-7", reversed && "md:order-1")}>
          <h3 className="mt-4 text-xl font-semibold leading-tight tracking-tight text-[#1E3A5F] md:text-2xl lg:text-3xl">
            {title}
          </h3>
          <p className="mt-3 text-base leading-relaxed text-[#475569] md:text-lg">
            {description}
          </p>

          <div
            className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-[#3B82F6]"
          >
            <span>Открыть</span>
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </div>
    </ProductShowcaseLink>
  );
}
