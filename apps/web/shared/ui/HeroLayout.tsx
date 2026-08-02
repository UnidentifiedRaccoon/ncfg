import { ArrowRight, ShieldCheck } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Container } from "@/shared/ui/Container";
import { Button } from "@/shared/ui/Button";
import { HeroImage } from "@/shared/ui/HeroImage";
import { HighlightedHeadline } from "@/shared/ui/HighlightedHeadline";

interface HeroAction {
  label: string;
  href: string;
}

interface HeroMetricItem {
  value: string;
  label: string;
}

interface HeroLayoutProps {
  headline: string;
  accentWord?: string | string[];
  lead?: string;
  primaryAction: HeroAction;
  secondaryAction?: HeroAction;
  eyebrow?: string;
  trustChips?: string[];
  imageSrc: string;
  imageAlt?: string;
  metrics?: HeroMetricItem[];
  noSentinel?: boolean;
  className?: string;
}

const DEFAULT_EYEBROW = "С 2005 года. Проекты по всей России";
const DEFAULT_TRUST_CHIPS = [
  "Лемана ПРО",
  "Газпромнефть",
  "Сбер",
  "ВТБ Мои Инвестиции",
  "Марс",
];
const HERO_BLUR_DATA_URL =
  "data:image/webp;base64,UklGRrgBAABXRUJQVlA4WAoAAAAQAAAAFwAADwAAQUxQSOwAAAANgCDbliHpJSqzbXus/W/Ftj2FLORv9xYiYgKwkIHz4tZBA/7v4/m9j/kMPJvJtDsqgKPF8+F9PA+sttlV1o1AUuXs3U0AgEFkCq1+MXwxBEYsm7c/BgBYeaOPj9gSADCCYJQAIltsd/JPLtEcMBBmi+tr8t1YwsrV7e63awlLExiQKWtLWDoxpDi4pMRi+cgwzXS79P1DtBShVIw+cju1x5AA0CIm+72/C1Vw/nxwBhDAZojrtPW8+ztPKe0opRwlHU7G/fxk3aJ7cfRpiQkppRRCcIqCIK6URfz9+mNMFEdxEieJJUidTwnGAFZQOCCmAAAAMAQAnQEqGAAQAD7dWqZMqKUjojAIARAbiWwAnTKAJa0Ljijxa5ds4l5YAP6l9QbM+Dibl64dtASG4q2kFpISSKzxkXGa+r1pOKWrYzAkL/k0oGIFU/+d/EPwrpXvDzIW2Ts9n2UPdTSr+vKpDfu9+iy1o3ZD3gn4ZbztGzgNANZqo3nX19zX9VKl+h+pv6ZAYhN3IwAoGtbx+oQ8oXZx/5oYQ4AAAA==";

export function HeroLayout({
  headline,
  accentWord,
  lead,
  primaryAction,
  secondaryAction,
  eyebrow = DEFAULT_EYEBROW,
  trustChips = DEFAULT_TRUST_CHIPS,
  imageSrc,
  imageAlt = "",
  metrics,
  noSentinel,
  className,
}: HeroLayoutProps) {
  const hasMetrics = Boolean(metrics && metrics.length > 0);

  return (
    <section className={cn("relative overflow-hidden -mt-16 md:-mt-20 pt-16 md:pt-20", className)}>
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

      <Container className="relative z-10 lg:max-w-[1320px]">
        <div className="py-14 md:py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            {/* Left — text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#58A8E0]" />
                {eyebrow}
              </div>

              <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-semibold tracking-tight text-white leading-[1.05]">
                <HighlightedHeadline
                  text={headline}
                  accentWord={accentWord}
                  accentClassName="text-[#58A8E0] animate-[textGlow_3s_ease-in-out_infinite]"
                />
              </h1>

              {lead && (
                <p className="mt-5 max-w-xl text-base sm:text-lg md:text-xl text-white/75 leading-relaxed">
                  {lead}
                </p>
              )}

              {/* Inline metrics — glass card with dividers */}
              {hasMetrics && metrics && (
                <dl className="mt-8 flex w-full max-w-xl items-stretch overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md sm:inline-flex sm:w-auto">
                  {metrics.slice(0, 4).map((m, i) => (
                    <div
                      key={m.label}
                      className="flex min-w-0 flex-1 items-center sm:flex-none"
                    >
                      {i > 0 && (
                        <div
                          aria-hidden="true"
                          className="h-10 w-px bg-white/10"
                        />
                      )}
                      <div className="w-full min-w-0 px-3 py-4 text-center sm:w-auto sm:px-8 sm:py-5">
                        <dd className="text-xl font-bold text-white sm:text-2xl">{m.value}</dd>
                        <dt className="mt-1 text-xs leading-tight text-white/60 sm:text-sm">
                          {m.label}
                        </dt>
                      </div>
                    </div>
                  ))}
                </dl>
              )}

              {/* CTA + trust */}
              <div className={cn("flex flex-col gap-8", "mt-8")}>
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    href={primaryAction.href}
                    size="lg"
                    data-ym-goal="cta_click"
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
                      <ArrowRight className="ml-2 h-4 w-4 opacity-80" aria-hidden="true" />
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-white/55">
                  <ShieldCheck className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
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
            </div>

            {/* Right — image */}
            <div className="relative hidden lg:block">
              <div className="relative mx-auto w-full max-w-[560px]">
                <div className="relative aspect-[4/3]">
                  <HeroImage
                    src={imageSrc}
                    alt={imageAlt}
                    sizes="(min-width: 1024px) 840px, 0px"
                    blurDataURL={HERO_BLUR_DATA_URL}
                    className="pointer-events-none object-contain drop-shadow-[0_40px_90px_rgba(0,0,0,0.65)] scale-[1.5]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Sentinel for dock header tone switching (Hero -> surface). */}
      {!noSentinel && <div data-header-hero-end aria-hidden="true" className="h-px" />}
    </section>
  );
}
