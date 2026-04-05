// DO NOT DELETE — hero variant for future A/B testing (see /hero-preview)
import { ArrowRight, ShieldCheck } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";
import { HighlightedHeadline } from "@/shared/ui/HighlightedHeadline";

interface HeroMetricItem {
  value: string;
  label: string;
}

interface HeroCenteredSpotlightProps {
  headline: string;
  accentWord?: string | string[];
  lead?: string;
  primaryAction: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  eyebrow?: string;
  trustChips?: string[];
  metrics?: HeroMetricItem[];
  noSentinel?: boolean;
  className?: string;
}

const DEFAULT_EYEBROW = "С 2005 года. Проекты по всей России";
const DEFAULT_TRUST_CHIPS = [
  "Лемана ПРО",
  "Газпромнефть",
  "Сбер",
  "ВТБ Мои Инвестиции",
  "Марс",
];

export function HeroCenteredSpotlight({
  headline,
  accentWord,
  lead,
  primaryAction,
  secondaryAction,
  eyebrow = DEFAULT_EYEBROW,
  trustChips = DEFAULT_TRUST_CHIPS,
  metrics = [],
  noSentinel,
  className,
}: HeroCenteredSpotlightProps) {
  return (
    <section className={cn("relative overflow-hidden -mt-16 md:-mt-20 pt-16 md:pt-20 bg-[#050B16]", className)}>
      {/* Radial spotlight */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(59,130,246,0.20) 0%, transparent 70%)",
        }}
      />

      {/* Dot grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* === Content === */}
      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center py-14 text-center md:py-20 lg:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[#58A8E0]" />
            {eyebrow}
          </div>

          <h1 className="mt-6 max-w-4xl text-3xl font-bold tracking-tight text-white leading-[1.05] sm:text-4xl md:text-5xl lg:text-[72px]">
            <HighlightedHeadline
              text={headline}
              accentWord={accentWord}
              accentClassName="bg-clip-text text-transparent bg-gradient-to-r from-[#58A8E0] to-[#3B82F6] animate-[textGlow_3s_ease-in-out_infinite]"
            />
          </h1>

          {lead && (
            <p className="mt-5 max-w-2xl text-base text-white/60 sm:text-lg leading-relaxed">
              {lead}
            </p>
          )}

          {/* Metrics — 2×2 grid on mobile, inline row with dividers from md */}
          {metrics.length > 0 && (
            <>
              {/* Mobile: 2×2 grid */}
              <dl className="relative z-20 mt-8 grid w-full max-w-sm grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md md:hidden">
                {metrics.slice(0, 4).map((metric) => (
                  <div key={metric.label} className="bg-white/[0.03] px-4 py-5 text-center">
                    <dd className="text-2xl font-bold text-white">
                      {metric.value}
                    </dd>
                    <dt className="mt-1 text-sm text-white/50">
                      {metric.label}
                    </dt>
                  </div>
                ))}
              </dl>

              {/* md+: inline row with dividers */}
              <dl className="relative z-20 mt-8 hidden items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md md:inline-flex">
                {metrics.slice(0, 4).map((metric, i) => (
                  <div key={metric.label} className="flex items-center">
                    {i > 0 && (
                      <div
                        aria-hidden="true"
                        className="h-10 w-px bg-white/10"
                      />
                    )}
                    <div className="px-8 py-5 text-center">
                      <dd className="text-2xl font-bold text-white">
                        {metric.value}
                      </dd>
                      <dt className="mt-1 text-sm text-white/50">
                        {metric.label}
                      </dt>
                    </div>
                  </div>
                ))}
              </dl>
            </>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button href={primaryAction.href} size="lg" data-ym-goal="cta_click">
              {primaryAction.label}
            </Button>
            {secondaryAction && (
              <Button
                href={secondaryAction.href}
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10"
              >
                {secondaryAction.label}
                <ArrowRight
                  className="ml-2 h-4 w-4 opacity-80"
                  aria-hidden="true"
                />
              </Button>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-white/40">
            <ShieldCheck
              className="h-4 w-4 text-[#58A8E0]"
              aria-hidden="true"
            />
            <span className="font-medium text-white/60">Нам доверяют:</span>
            {trustChips.slice(0, 5).map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/60"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      {!noSentinel && <div data-header-hero-end aria-hidden="true" className="h-px" />}
    </section>
  );
}
