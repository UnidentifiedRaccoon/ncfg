import { Section } from "@/shared/ui/Section";
import { cn } from "@/shared/lib/cn";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  HeartPulse,
  Mic,
  type LucideIcon,
} from "lucide-react";

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

const SERVICE_PRESETS: Record<string, { image: string; icon: LucideIcon }> = {
  employee_wellbeing: {
    image: "/services/well-being.png",
    icon: HeartPulse,
  },
  educational_materials: {
    image: "/services/materials-development.png",
    icon: BookOpen,
  },
  events_and_talks: {
    image: "/services/events.png",
    icon: Mic,
  },
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function getPreset(service: Service) {
  if (!service.id) return null;
  return SERVICE_PRESETS[service.id] ?? null;
}

function resolveServiceImage(service: Service) {
  if (typeof service.image === "string" && service.image.length > 0) return service.image;
  const preset = getPreset(service);
  return preset?.image ?? null;
}

function OtherServicesCard({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative isolate overflow-hidden rounded-xl border shadow-sm transition-all duration-300",
        "min-h-[260px]",
        "border-white/10",
        "bg-gradient-to-br from-[#0B1A33] via-[#1E3A5F] to-[#3B82F6]",
        "hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(59,130,246,0.25)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
        className
      )}
      aria-label="Другие услуги"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.28)_1px,transparent_1px)] bg-[size:44px_44px]"
      />

      <div
        aria-hidden="true"
        className="absolute -top-36 -right-40 h-[560px] w-[560px] rounded-full bg-[#58A8E0]/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-44 -left-28 h-[560px] w-[560px] rounded-full bg-[#3B82F6]/25 blur-3xl"
      />

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

function ServiceTile({
  service,
  featured = false,
  index,
  className,
}: {
  service: Service;
  featured?: boolean;
  index: number;
  className?: string;
}) {
  const number = pad2(index + 1);
  const preset = getPreset(service);
  const Icon = preset?.icon ?? Mic;
  const image = resolveServiceImage(service);

  return (
    <Link
      href={service.href}
      className={cn(
        "group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 ease-out [will-change:transform]",
        "hover:-translate-y-1 hover:shadow-lg hover:border-[#3B82F6]/25 hover:z-10",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] focus-visible:z-10",
        featured
          ? "bg-[#F0F7FF] border-[#E2E8F0] p-6 md:p-8"
          : "bg-white border-[#F1F5F9] p-5 md:p-6",
        "before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:z-0 before:h-px before:content-['']",
        "before:bg-gradient-to-r before:from-transparent before:via-[#58A8E0]/70 before:to-transparent",
        "before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
        "after:pointer-events-none after:absolute after:inset-0 after:z-0 after:rounded-2xl after:content-['']",
        "after:bg-[radial-gradient(circle_at_18%_12%,rgba(88,168,224,0.16),transparent_60%)]",
        "after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100",
        className
      )}
      aria-label={service.title}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-20 z-0 h-64 w-64 rounded-full bg-gradient-to-br from-[#58A8E0]/26 via-[#3B82F6]/16 to-transparent blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center justify-center",
              featured
                ? "h-12 w-12 rounded-2xl bg-[#3B82F6]/10"
                : "h-10 w-10 rounded-xl bg-[#1E3A5F]/10"
            )}
            aria-hidden="true"
          >
            <Icon
              className={cn(
                featured ? "h-6 w-6 text-[#3B82F6]" : "h-5 w-5 text-[#1E3A5F]"
              )}
              aria-hidden="true"
            />
          </span>

          <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-3 py-1 text-xs font-semibold text-[#1E3A5F]">
            {number}
          </span>
        </div>

        {image && (
          <div
            className={cn(
              "relative overflow-hidden rounded-xl border border-black/5 bg-white/40",
              featured ? "h-20 w-28 md:h-24 md:w-36" : "h-16 w-24"
            )}
            aria-hidden="true"
          >
            <Image
              src={image}
              alt=""
              fill
              sizes={featured ? "(min-width: 1024px) 144px, 112px" : "96px"}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#58A8E0]/14 via-transparent to-[#3B82F6]/12" />
          </div>
        )}
      </div>

      <h3
        className={cn(
          "relative z-10 mt-5 leading-tight tracking-tight text-[#1E3A5F]",
          featured ? "text-2xl md:text-3xl font-bold" : "text-lg font-semibold"
        )}
      >
        {service.title}
      </h3>

      <p
        className={cn(
          "relative z-10 mt-3 text-[#475569] leading-relaxed",
          featured ? "text-base md:text-lg" : "text-sm line-clamp-3"
        )}
      >
        {service.description}
      </p>

      <div
        className={cn(
          "relative z-10 mt-auto pt-6 flex items-center gap-2 text-[#3B82F6] transition-opacity",
          featured ? "" : "md:opacity-0 md:group-hover:opacity-100"
        )}
      >
        <span className={cn("font-medium", featured ? "text-base" : "text-sm")}>
          Подробнее
        </span>
        <ArrowRight className={cn(featured ? "h-5 w-5" : "h-4 w-4")} aria-hidden="true" />
      </div>
    </Link>
  );
}

export function Services({ title, services }: ServicesProps) {
  const featured = services[0];
  const wide = services[1];
  const compact = services[2];

  if (!featured) return null;

  return (
    <Section
      id="services"
      title={title}
      background="gray"
      className={cn(
        "relative isolate overflow-hidden",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[380px] before:content-['']",
        "before:[background-image:radial-gradient(640px_circle_at_12%_20%,rgba(88,168,224,0.18),transparent_55%),radial-gradient(560px_circle_at_88%_12%,rgba(59,130,246,0.14),transparent_60%),radial-gradient(760px_circle_at_50%_-10%,rgba(30,58,95,0.10),transparent_65%)]",
        "before:[mask-image:linear-gradient(to_bottom,black,transparent_92%)] before:-z-10",
        "after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:opacity-[0.18] after:content-['']",
        "after:[background-image:linear-gradient(to_right,rgba(226,232,240,0.55)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.55)_1px,transparent_1px)] after:[background-size:32px_32px]"
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
        <ServiceTile
          service={featured}
          featured
          index={0}
          className="md:col-span-2 lg:col-span-2 lg:row-span-2"
        />
        {wide && (
          <ServiceTile
            service={wide}
            index={1}
            className="md:col-span-2 lg:col-span-2"
          />
        )}
        {compact && <ServiceTile service={compact} index={2} />}
        <OtherServicesCard href="/companies" />
      </div>
    </Section>
  );
}

