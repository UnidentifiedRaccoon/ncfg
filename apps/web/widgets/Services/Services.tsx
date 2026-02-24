"use client";

import { useEffect, useMemo, useState } from "react";
import { Section } from "@/shared/ui/Section";
import { cn } from "@/shared/lib/cn";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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

const SERVICES_AUTOPLAY_DELAY_MS = 6500;

const SERVICE_PRESETS: Record<string, { image: string }> = {
  employee_wellbeing: {
    image: "/services/well-being.png",
  },
  educational_materials: {
    image: "/services/materials-development.png",
  },
  events_and_talks: {
    image: "/services/events.png",
  },
};

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
        "group relative isolate overflow-hidden rounded-3xl shadow-sm transition-all duration-300",
        "min-h-[260px]",
        "bg-[linear-gradient(155deg,#F7FBFF,#EDF3FF)]",
        "hover:-translate-y-1.5 hover:shadow-[0_22px_66px_rgba(61,124,255,0.2)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
        className
      )}
      aria-label="Другие услуги"
    >
      <div className="relative z-10 flex h-full flex-col p-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#475569]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#58A8E0]" />
          Каталог услуг
        </div>

        <div className="mt-auto">
          <div className="text-2xl font-semibold tracking-tight text-[#1E3A5F]">
            Другие услуги
          </div>
          <div className="mt-2 max-w-[34ch] text-sm text-[#475569] leading-relaxed">
            Все направления для компаний, проекты и форматы сотрудничества.
          </div>

          <div className="mt-6 inline-flex items-center gap-2 text-[#3B82F6]">
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
  className,
}: {
  service: Service;
  featured?: boolean;
  className?: string;
}) {
  const image = resolveServiceImage(service);

  return (
    <Link
      href={service.href}
      className={cn(
        "group relative isolate flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 ease-out [will-change:transform]",
        "hover:-translate-y-1.5 hover:shadow-[0_26px_48px_rgba(36,80,154,0.2)] hover:z-10",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] focus-visible:z-10",
        featured
          ? "bg-[linear-gradient(155deg,#F7FBFF,#EDF3FF)] p-6 md:p-8"
          : "bg-[linear-gradient(155deg,#FFFFFF,#F4F8FF)] p-5 md:p-6",
        "after:pointer-events-none after:absolute after:inset-0 after:z-0 after:rounded-2xl after:content-['']",
        "after:bg-[radial-gradient(circle_at_18%_12%,rgba(48,215,255,0.2),transparent_60%)]",
        "after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100",
        className
      )}
      aria-label={service.title}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-20 z-0 h-64 w-64 rounded-full bg-gradient-to-br from-[#30D7FF]/28 via-[#5B8DFF]/18 to-transparent blur-2xl"
        aria-hidden="true"
      />

      {image && (
        <div className="relative z-10 flex justify-end">
          <div
            className={cn(
              "relative overflow-hidden rounded-xl bg-white/40",
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
        </div>
      )}

      <h3
        className={cn(
          "relative z-10 mt-4 leading-tight tracking-tight text-[#122848]",
          featured ? "text-2xl md:text-3xl font-extrabold" : "text-lg font-bold"
        )}
      >
        {service.title}
      </h3>

      <p
        className={cn(
          "relative z-10 mt-3 text-[#39557B] leading-relaxed",
          featured ? "text-base md:text-lg" : "text-sm line-clamp-3"
        )}
      >
        {service.description}
      </p>

      <div
        className={cn(
          "relative z-10 mt-auto pt-6 flex items-center gap-2 text-[#3B82F6]"
        )}
      >
        <span className="text-sm font-medium">Подробнее</span>
        <ArrowRight className={cn(featured ? "h-5 w-5" : "h-4 w-4")} aria-hidden="true" />
      </div>
    </Link>
  );
}

export function Services({ title, services }: ServicesProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion ?? false;
  const [activeIndex, setActiveIndex] = useState(0);
  const featured = services[0];

  const slides = useMemo(
    () => [
      ...services.map((service) => ({
        key: `service-${service.id ?? service.title}`,
        title: service.title,
        body: <ServiceTile service={service} featured />,
      })),
      {
        key: "service-other",
        title: "Другие услуги",
        body: <OtherServicesCard href="/companies" />,
      },
    ],
    [services]
  );
  const safeActiveIndex = Math.min(activeIndex, Math.max(slides.length - 1, 0));
  const activeSlide = slides[safeActiveIndex];

  useEffect(() => {
    if (slides.length <= 1 || shouldReduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, SERVICES_AUTOPLAY_DELAY_MS);
    return () => window.clearInterval(timer);
  }, [slides.length, shouldReduceMotion]);

  if (!featured || !activeSlide) return null;

  return (
    <Section
      id="services"
      title={title}
      background="gray"
      className={cn(
        "relative isolate -mt-px overflow-hidden"
      )}
    >
      <div className="relative md:p-0">

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.key}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 36, scale: 0.98 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -36, scale: 0.98 }}
            transition={{ duration: 0.38, ease: "easeOut" }}
          >
            {activeSlide.body}
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={`services-dot-${slide.key}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                index === safeActiveIndex
                  ? "bg-[#3B82F6]/10 text-[#1E3A5F]"
                  : "bg-white/85 text-[#5A7297] hover:bg-[#EAF2FF]"
              )}
              aria-label={`Перейти к слайду: ${slide.title}`}
              aria-current={index === safeActiveIndex ? "true" : undefined}
            >
              {slide.title}
            </button>
          ))}
        </div>
      </div>
    </Section>
  );
}
