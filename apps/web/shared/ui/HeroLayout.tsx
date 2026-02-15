import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Container } from "@/shared/ui/Container";
import { Button } from "@/shared/ui/Button";

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
  trustChips?: string[];
  imageSrc: string;
  imageAlt?: string;
  metricsCard?: HeroMetricsCard;
}

const DEFAULT_EYEBROW = "С 2005 года. Проекты по всей России";
const DEFAULT_TRUST_CHIPS = ["Минфин России", "Сбербанк", "Почта Банк", "Мир"];

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
  return (
    <section className="relative overflow-hidden -mt-16 md:-mt-20 pt-16 md:pt-20">
      <div aria-hidden="true" className="absolute inset-0 bg-[#050B16]" />

      <div
        aria-hidden="true"
        className="absolute -top-48 -left-48 h-[520px] w-[520px] rounded-full bg-[#3B82F6]/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-56 left-1/4 h-[640px] w-[640px] rounded-full bg-[#58A8E0]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -top-56 -right-40 h-[620px] w-[620px] rounded-full bg-[#1E3A5F]/55 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:48px_48px]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/45"
      />

      <Container className="relative z-10">
        <div className="py-14 md:py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#58A8E0]" />
                {eyebrow}
              </div>

              <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-semibold tracking-tight text-white leading-[1.05]">
                {headline}
              </h1>

              {lead && (
                <p className="mt-5 max-w-xl text-base sm:text-lg md:text-xl text-white/75 leading-relaxed">
                  {lead}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  href={primaryAction.href}
                  size="lg"
                  className="shadow-[0_16px_44px_rgba(88,168,224,0.22)]"
                >
                  {primaryAction.label}
                </Button>

                {secondaryAction && (
                  <Button
                    href={secondaryAction.href}
                    variant="secondary"
                    size="lg"
                    className="!bg-transparent !text-white border border-white/25 hover:bg-white/10"
                  >
                    {secondaryAction.label}
                    <ArrowRight
                      className="ml-2 h-4 w-4 opacity-80"
                      aria-hidden="true"
                    />
                  </Button>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-white/55">
                <ShieldCheck
                  className="h-4 w-4 text-white/50"
                  aria-hidden="true"
                />
                <span className="font-medium text-white/70">Нам доверяют:</span>
                {trustChips.slice(0, 8).map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative mx-auto w-full max-w-[560px]">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 560px, 90vw"
                    className="object-contain drop-shadow-[0_40px_90px_rgba(0,0,0,0.65)]"
                  />
                </div>

                {metricsCard && metricsCard.metrics.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:-translate-y-10">
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
                        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70">
                          {metricsCard.badge}
                        </div>
                      )}
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-3">
                      {metricsCard.metrics.slice(0, 4).map((metric) => (
                        <div
                          key={metric.label}
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
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
                )}

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full border border-white/10"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Sentinel for dock header tone switching (Hero -> surface). */}
      <div data-header-hero-end aria-hidden="true" className="h-px" />
    </section>
  );
}
