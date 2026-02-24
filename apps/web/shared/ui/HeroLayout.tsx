"use client";

import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/shared/lib/cn";
import { Container } from "@/shared/ui/Container";
import { Button } from "@/shared/ui/Button";
import { DEFAULT_TRUST_CHIPS } from "@/shared/config/constants";

interface HeroAction {
  label: string;
  href: string;
}

interface HeroMetricItem {
  value: string;
  label: string;
}

interface HeroMetricsCard {
  title: string;
  subtitle?: string;
  badge?: string;
  metrics: HeroMetricItem[];
}

interface HeroLayoutProps {
  headline: string;
  lead?: string;
  primaryAction: HeroAction;
  secondaryAction?: HeroAction;
  eyebrow?: string;
  trustChips?: readonly string[];
  imageSrc: string;
  imageAlt?: string;
  metricsCard?: HeroMetricsCard;
}

const DEFAULT_EYEBROW = "С 2005 года. Проекты по всей России";

interface HeroActionsAndTrustProps {
  primaryAction: HeroAction;
  secondaryAction?: HeroAction;
  trustChips: readonly string[];
  className?: string;
}

function HeroActionsAndTrust({
  primaryAction,
  secondaryAction,
  trustChips,
  className,
}: HeroActionsAndTrustProps) {
  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <div className="flex flex-wrap items-center gap-4">
        <Button
          href={primaryAction.href}
          size="lg"
          className="!bg-white !text-[#0B1B36] border border-white hover:!bg-white/90 shadow-[0_16px_40px_rgba(2,12,32,0.38)]"
        >
          {primaryAction.label}
        </Button>

        {secondaryAction && (
          <Button
            href={secondaryAction.href}
            variant="secondary"
            size="lg"
            className="!bg-transparent !text-white border border-white/25 hover:!bg-white/12"
          >
            {secondaryAction.label}
            <ArrowRight className="ml-2 h-4 w-4 opacity-80" aria-hidden="true" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
        <ShieldCheck className="h-4 w-4 text-[#8FC5FF]" aria-hidden="true" />
        <span className="font-medium text-white/72">Нам доверяют:</span>
        {trustChips.slice(0, 8).map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-white/16 bg-white/8 px-2.5 py-1"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

export function HeroLayout({
  headline,
  lead,
  primaryAction,
  secondaryAction,
  eyebrow = DEFAULT_EYEBROW,
  trustChips = DEFAULT_TRUST_CHIPS,
  imageSrc,
  imageAlt = "",
  metricsCard,
}: HeroLayoutProps) {
  const hasMetricsCard = Boolean(metricsCard && metricsCard.metrics.length > 0);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden -mt-[84px] pt-[84px] md:-mt-[106px] md:pt-[106px]">
      <Container className="relative z-10 lg:max-w-[1320px]">
        <div className="py-14 md:py-20 lg:py-24">
          <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#08162D_0%,#10274D_52%,#143360_100%)] p-6 md:p-8 lg:p-10">
            <div
              className={cn(
                "grid gap-12 lg:grid-cols-[1.2fr_0.8fr]",
                hasMetricsCard ? "lg:items-start" : "lg:items-center"
              )}
            >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#30D7FF]" />
                {eyebrow}
              </div>

              <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-extrabold tracking-tight text-white leading-[1.03]">
                {headline}
              </h1>

              {lead && (
                <p className="mt-6 max-w-xl text-base sm:text-lg md:text-xl text-white/74 leading-relaxed">
                  {lead}
                </p>
              )}

              {hasMetricsCard ? (
                <div className="hidden lg:block">
                  <HeroActionsAndTrust
                    primaryAction={primaryAction}
                    secondaryAction={secondaryAction}
                    trustChips={trustChips}
                    className="mt-8"
                  />
                </div>
              ) : (
                <HeroActionsAndTrust
                  primaryAction={primaryAction}
                  secondaryAction={secondaryAction}
                  trustChips={trustChips}
                  className="mt-8"
                />
              )}
            </div>

            <div className={cn("relative", !hasMetricsCard && "hidden lg:block")}>
              <div className="relative mx-auto hidden w-full max-w-[560px] lg:block">
                <motion.div
                  className="relative aspect-[4/3]"
                  animate={prefersReducedMotion ? undefined : { scale: [1, 1.04, 1] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 560px, 90vw"
                    className={cn(
                      "pointer-events-none object-contain drop-shadow-[0_46px_100px_rgba(0,0,0,0.68)]",
                      !hasMetricsCard && "scale-[1.5]"
                    )}
                  />
                </motion.div>
              </div>

              {hasMetricsCard && metricsCard && (
                <div className="relative mx-auto w-full max-w-[560px]">
                  <div className="relative z-10 mt-6 rounded-2xl bg-[linear-gradient(160deg,#08162D_0%,#10274D_52%,#143360_100%)] p-5 backdrop-blur-xl lg:-mt-4 lg:-translate-y-10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {metricsCard.title}
                        </div>
                        {metricsCard.subtitle && (
                          <div className="mt-1 text-xs text-white/60">
                            {metricsCard.subtitle}
                          </div>
                        )}
                      </div>
                      {metricsCard.badge && (
                        <div className="rounded-full border border-white/20 bg-white/8 px-3 py-1 text-[11px] font-semibold text-white/78">
                          {metricsCard.badge}
                        </div>
                      )}
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-3">
                      {metricsCard.metrics.slice(0, 4).map((metric) => (
                        <div
                          key={metric.label}
                          className="rounded-xl border border-white/14 bg-white/8 px-4 py-3"
                        >
                          <dt className="text-[11px] leading-snug text-white/60">
                            {metric.label}
                          </dt>
                          <dd className="mt-1 text-xl font-semibold text-white">
                            {metric.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}
            </div>

            {hasMetricsCard && (
              <div className="lg:hidden">
                <HeroActionsAndTrust
                  primaryAction={primaryAction}
                  secondaryAction={secondaryAction}
                  trustChips={trustChips}
                />
              </div>
            )}
            </div>
          </div>
        </div>
      </Container>

      {/* Sentinel for dock header tone switching (Hero -> surface). */}
      <div data-header-hero-end aria-hidden="true" className="h-0" />
    </section>
  );
}
