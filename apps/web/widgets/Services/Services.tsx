import { Section } from "@/shared/ui/Section";
import { cn } from "@/shared/lib/cn";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Service {
  id?: string;
  title: string;
  description: string;
  href: string;
  image?: string | null;
}

interface ServicesProps {
  title: string;
  services: Service[];
}

type ServiceTileVariant = "featured" | "wide" | "compact";

function ServiceTile({
  service,
  variant,
  className,
}: {
  service: Service;
  variant: ServiceTileVariant;
  className?: string;
}) {
  const isFeatured = variant === "featured";
  const isWide = variant === "wide";

  return (
    <Link
      href={service.href}
      className={cn(
        "group relative isolate overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300",
        "border-[#E2E8F0]/70",
        "hover:-translate-y-1 hover:shadow-lg hover:border-[#3B82F6]/25",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
        isFeatured
          ? "min-h-[360px] md:min-h-[420px] lg:min-h-[520px]"
          : "min-h-[260px]",
        className
      )}
      aria-label={service.title}
    >
      <div aria-hidden="true" className="absolute inset-0">
        {service.image ? (
          <>
            <Image
              src={service.image}
              alt=""
              fill
              sizes={
                isFeatured
                  ? "(min-width: 1024px) 600px, (min-width: 768px) 90vw, 100vw"
                  : isWide
                    ? "(min-width: 1024px) 600px, (min-width: 768px) 90vw, 100vw"
                    : "(min-width: 1024px) 300px, (min-width: 768px) 45vw, 100vw"
              }
              className={cn(
                "object-cover transition-transform duration-700 [will-change:transform]",
                "group-hover:scale-[1.03]",
                isWide && "object-right"
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/0 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6]" />
            <div className="absolute inset-0 opacity-[0.14] bg-[radial-gradient(circle_at_24%_28%,rgba(88,168,224,0.65),transparent_58%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/20 text-6xl font-bold">НЦФГ</span>
            </div>
          </>
        )}
      </div>

      <div
        className={cn(
          "relative z-10 flex h-full flex-col",
          isFeatured ? "p-5 md:p-6 lg:p-7" : "p-5 md:p-6"
        )}
      >
        <div className="mt-auto">
          <div
            className={cn(
              "rounded-2xl border border-white/40 bg-white/90 backdrop-blur-sm",
              "shadow-[0_14px_46px_rgba(15,23,42,0.14)]",
              isFeatured ? "px-5 py-5 md:px-6 md:py-6" : "px-5 py-4"
            )}
          >
            <h3
              className={cn(
                "font-semibold tracking-tight text-[#1E3A5F] leading-snug",
                isFeatured ? "text-xl md:text-2xl lg:text-3xl" : "text-lg"
              )}
            >
              {service.title}
            </h3>
            <p
              className={cn(
                "mt-2 text-[#475569] leading-relaxed line-clamp-3",
                isFeatured ? "text-sm md:text-base" : "text-sm"
              )}
            >
              {service.description}
            </p>

            <div
              className={cn(
                "mt-4 inline-flex items-center gap-2 text-[#3B82F6] transition-opacity",
                "md:opacity-0 md:group-hover:opacity-100"
              )}
            >
              <span className={cn("font-semibold", isFeatured ? "text-base" : "text-sm")}>
                Подробнее
              </span>
              <ArrowRight
                className={cn(isFeatured ? "h-5 w-5" : "h-4 w-4")}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100",
          "bg-[radial-gradient(circle_at_18%_10%,rgba(88,168,224,0.22),transparent_58%)]"
        )}
      />
    </Link>
  );
}

function OtherServicesCard({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative isolate overflow-hidden rounded-xl border shadow-sm transition-all duration-300",
        "min-h-[260px]",
        "border-white/10",
        "bg-gradient-to-br from-[#0B1A33] via-[#1E3A5F] to-[#3B82F6]",
        "hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(59,130,246,0.25)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
      )}
      aria-label="Другие услуги"
    >
      {/* Subtle grid overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.28)_1px,transparent_1px)] bg-[size:44px_44px]"
      />

      {/* Accent glow */}
      <div
        aria-hidden="true"
        className="absolute -top-36 -right-40 h-[560px] w-[560px] rounded-full bg-[#58A8E0]/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-44 -left-28 h-[560px] w-[560px] rounded-full bg-[#3B82F6]/25 blur-3xl"
      />

      {/* Vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/0"
      />

      <div className="relative z-10 flex h-full flex-col p-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-white/75">
          <span className="h-1.5 w-1.5 rounded-full bg-[#58A8E0] shadow-[0_0_0_6px_rgba(88,168,224,0.14)]" />
          Каталог услуг
        </div>

        <div className="mt-auto">
          <div className="text-2xl font-semibold tracking-tight text-white">
            Другие услуги
          </div>
          <div className="mt-2 max-w-[34ch] text-sm text-white/70 leading-relaxed">
            Все направления для компаний, проекты и форматы сотрудничества.
          </div>

          <div className="mt-6 inline-flex items-center gap-2 text-white/90">
            <span className="text-sm font-semibold">Смотреть все</span>
            <ArrowRight
              className="h-4 w-4 opacity-90 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function Services({ title, services }: ServicesProps) {
  const featured = services[0];
  const wide = services[1];
  const compact = services[2];

  return (
    <Section id="services" title={title} background="gray">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
        {featured && (
          <ServiceTile
            service={featured}
            variant="featured"
            className="md:col-span-2 lg:col-span-2 lg:row-span-2"
          />
        )}
        {wide && (
          <ServiceTile
            service={wide}
            variant="wide"
            className="md:col-span-2 lg:col-span-2"
          />
        )}
        {compact && <ServiceTile service={compact} variant="compact" />}
        <OtherServicesCard href="/companies" />
      </div>
    </Section>
  );
}
