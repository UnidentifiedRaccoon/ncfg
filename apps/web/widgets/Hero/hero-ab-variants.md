# Hero A/B Test Variants (archived)

Archived hero variants for future A/B testing. To restore, create the
corresponding widget directory and paste the code below.

---

## 1. HeroSplitAsymmetric

S-curve SVG divider, gradient + white split, image on the right.

### `widgets/HeroSplitAsymmetric/index.ts`

```ts
export { HeroSplitAsymmetric } from "./HeroSplitAsymmetric";
```

### `widgets/HeroSplitAsymmetric/HeroSplitAsymmetric.tsx`

```tsx
import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/shared/ui/Button";
import { HighlightedHeadline } from "@/shared/ui/HighlightedHeadline";

interface HeroMetricItem {
  value: string;
  label: string;
}

interface HeroSplitAsymmetricProps {
  headline: string;
  /** Word in headline to highlight with accent color (exact match) */
  accentWord?: string;
  lead?: string;
  primaryAction: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  eyebrow?: string;
  trustChips?: string[];
  imageSrc: string;
  imageAlt?: string;
  metrics?: HeroMetricItem[];
}

const DEFAULT_EYEBROW = "С 2005 года. Проекты по всей России";
const DEFAULT_TRUST_CHIPS = [
  "Лемана ПРО",
  "Газпромнефть",
  "Сбер",
  "ВТБ Мои Инвестиции",
  "Марс",
];

export function HeroSplitAsymmetric({
  headline,
  accentWord,
  lead,
  primaryAction,
  secondaryAction,
  eyebrow = DEFAULT_EYEBROW,
  trustChips = DEFAULT_TRUST_CHIPS,
  imageSrc,
  imageAlt = "",
  metrics = [],
}: HeroSplitAsymmetricProps) {
  return (
    <section className="relative overflow-hidden -mt-16 md:-mt-20 pt-16 md:pt-20">
      {/* === Backgrounds === */}

      {/* Mobile: plain white (gradient block rendered inline around image) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-white lg:hidden"
      />

      {/* Desktop: gradient fills the whole section */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] lg:block"
      />

      {/* Desktop: white overlay with curved right edge */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
      >
        <path
          d="M0 0 L726 0 C766 160, 686 320, 726 480 C756 600, 696 720, 736 800 L0 800 Z"
          fill="white"
        />
      </svg>

      {/* === Content === */}
      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-4 md:px-6 lg:px-8">
        <div className="py-14 md:py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            {/* Left zone — text (over white) */}
            <div className="relative z-10 lg:pr-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1E3A5F]/10 bg-white px-3 py-1 text-xs font-semibold text-[#1E3A5F]/70 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#58A8E0]" />
                {eyebrow}
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#1E3A5F] leading-[1.05] sm:text-4xl md:text-5xl lg:text-[56px]">
                <HighlightedHeadline
                  text={headline}
                  accentWord={accentWord}
                />
              </h1>

              {lead && (
                <p className="mt-5 max-w-lg text-base text-[#475569] sm:text-lg leading-relaxed">
                  {lead}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button href={primaryAction.href} size="lg">
                  {primaryAction.label}
                </Button>
                {secondaryAction && (
                  <Button
                    href={secondaryAction.href}
                    variant="ghost"
                    size="lg"
                  >
                    {secondaryAction.label}
                    <ArrowRight
                      className="ml-2 h-4 w-4 opacity-80"
                      aria-hidden="true"
                    />
                  </Button>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-[#475569]/70">
                <ShieldCheck
                  className="h-4 w-4 text-[#3B82F6]"
                  aria-hidden="true"
                />
                <span className="font-medium text-[#475569]">
                  Нам доверяют:
                </span>
                {trustChips.slice(0, 5).map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-[#1E3A5F]/8 bg-white px-2.5 py-1 text-[#1E3A5F]/70 shadow-sm"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* Right zone — image (over gradient) */}
            <div className="relative">
              {/* Mobile gradient backdrop */}
              <div
                aria-hidden="true"
                className="absolute -inset-x-4 -inset-y-10 rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] md:-inset-x-6 lg:hidden"
              />

              <div className="relative z-10 mx-auto lg:mx-0 lg:-mr-16">
                {/* Decorative concentric circles */}
                <div
                  aria-hidden="true"
                  className="absolute -right-[33px] -top-[57px] hidden lg:block"
                >
                  <div className="h-40 w-40 rounded-full border border-white/20" />
                  <div className="absolute inset-4 rounded-full border border-white/15" />
                  <div className="absolute inset-8 rounded-full border border-white/10" />
                </div>

                {/* Hero image — large, slight tilt, no card framing */}
                <div className="pointer-events-none relative aspect-[4/3] w-full rotate-2 drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)] lg:scale-125 lg:origin-center">
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 900px, 85vw"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Metrics — unified bar */}
          {metrics.length > 0 && (
            <dl className="relative z-20 mx-auto mt-12 max-w-4xl lg:mt-16">
              <div className="flex flex-col divide-y divide-white/20 rounded-2xl bg-[#5485d5] px-2 py-2 shadow-lg sm:flex-row sm:divide-x sm:divide-y-0">
                {metrics.slice(0, 4).map((metric) => (
                  <div
                    key={metric.label}
                    className="flex-1 px-5 py-4 text-center"
                  >
                    <dd className="text-2xl font-bold text-white">
                      {metric.value}
                    </dd>
                    <dt className="mt-1 text-sm text-white/80">
                      {metric.label}
                    </dt>
                  </div>
                ))}
              </div>
            </dl>
          )}
        </div>
      </div>

      <div data-header-hero-end aria-hidden="true" className="h-px" />
    </section>
  );
}
```

---

## 2. HeroWaveSplit

Triple wave SVG (3 paths, increasing opacity), gradient + white split.

### `widgets/HeroWaveSplit/index.ts`

```ts
export { HeroWaveSplit } from "./HeroWaveSplit";
```

### `widgets/HeroWaveSplit/HeroWaveSplit.tsx`

```tsx
import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/shared/ui/Button";
import { HighlightedHeadline } from "@/shared/ui/HighlightedHeadline";

interface HeroMetricItem {
  value: string;
  label: string;
}

interface HeroWaveSplitProps {
  headline: string;
  accentWord?: string;
  lead?: string;
  primaryAction: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  eyebrow?: string;
  trustChips?: string[];
  imageSrc: string;
  imageAlt?: string;
  metrics?: HeroMetricItem[];
}

const DEFAULT_EYEBROW = "С 2005 года. Проекты по всей России";
const DEFAULT_TRUST_CHIPS = [
  "Лемана ПРО",
  "Газпромнефть",
  "Сбер",
  "ВТБ Мои Инвестиции",
  "Марс",
];

export function HeroWaveSplit({
  headline,
  accentWord,
  lead,
  primaryAction,
  secondaryAction,
  eyebrow = DEFAULT_EYEBROW,
  trustChips = DEFAULT_TRUST_CHIPS,
  imageSrc,
  imageAlt = "",
  metrics = [],
}: HeroWaveSplitProps) {
  return (
    <section className="relative overflow-hidden -mt-16 md:-mt-20 pt-16 md:pt-20">
      {/* === Backgrounds === */}

      {/* Mobile: plain white */}
      <div aria-hidden="true" className="absolute inset-0 bg-white lg:hidden" />

      {/* Desktop: gradient fills the whole section */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] lg:block"
      />

      {/* Desktop: triple wave overlay — three paths with increasing opacity */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
      >
        {/* Wave 1 — furthest right, lightest */}
        <path
          d="M0 0 L870 0 C910 130, 830 260, 870 400 C900 520, 840 660, 880 800 L0 800 Z"
          fill="white"
          opacity="0.3"
        />
        {/* Wave 2 — middle */}
        <path
          d="M0 0 L770 0 C810 150, 730 300, 770 450 C800 570, 740 700, 780 800 L0 800 Z"
          fill="white"
          opacity="0.6"
        />
        {/* Wave 3 — closest to content, fully opaque */}
        <path
          d="M0 0 L690 0 C730 170, 650 340, 690 500 C720 620, 660 740, 700 800 L0 800 Z"
          fill="white"
        />
      </svg>

      {/* === Content === */}
      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-4 md:px-6 lg:px-8">
        <div className="py-14 md:py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left — text */}
            <div className="relative z-10 lg:pr-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1E3A5F]/10 bg-white px-3 py-1 text-xs font-semibold text-[#1E3A5F]/70 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#58A8E0]" />
                {eyebrow}
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#1E3A5F] leading-[1.05] sm:text-4xl md:text-5xl lg:text-[56px]">
                <HighlightedHeadline
                  text={headline}
                  accentWord={accentWord}
                  accentClassName="text-[#3B82F6] animate-[textGlow_3s_ease-in-out_infinite]"
                />
              </h1>

              {lead && (
                <p className="mt-5 max-w-lg text-base text-[#475569] sm:text-lg leading-relaxed">
                  {lead}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button href={primaryAction.href} size="lg">
                  {primaryAction.label}
                </Button>
                {secondaryAction && (
                  <Button
                    href={secondaryAction.href}
                    variant="ghost"
                    size="lg"
                  >
                    {secondaryAction.label}
                    <ArrowRight
                      className="ml-2 h-4 w-4 opacity-80"
                      aria-hidden="true"
                    />
                  </Button>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-[#475569]/70">
                <ShieldCheck
                  className="h-4 w-4 text-[#3B82F6]"
                  aria-hidden="true"
                />
                <span className="font-medium text-[#475569]">
                  Нам доверяют:
                </span>
                {trustChips.slice(0, 5).map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-[#1E3A5F]/8 bg-white px-2.5 py-1 text-[#1E3A5F]/70 shadow-sm"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — image */}
            <div className="relative">
              {/* Mobile gradient backdrop */}
              <div
                aria-hidden="true"
                className="absolute -inset-x-4 -inset-y-10 rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] md:-inset-x-6 lg:hidden"
              />

              <div className="relative z-10 mx-auto lg:mx-0 lg:-mr-12">
                {/* Decorative concentric circles */}
                <div
                  aria-hidden="true"
                  className="absolute -right-[33px] -top-[57px] hidden lg:block"
                >
                  <div className="h-40 w-40 rounded-full border border-white/20" />
                  <div className="absolute inset-4 rounded-full border border-white/15" />
                  <div className="absolute inset-8 rounded-full border border-white/10" />
                </div>

                <div className="pointer-events-none relative aspect-[4/3] w-full -rotate-1 drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)] lg:scale-125 lg:origin-center">
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 900px, 85vw"
                    className="rounded-3xl object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Metrics — unified bar */}
          {metrics.length > 0 && (
            <dl className="relative z-20 mx-auto mt-12 max-w-4xl lg:mt-16">
              <div className="flex flex-col divide-y divide-white/20 rounded-2xl bg-[#5485d5] px-2 py-2 shadow-lg sm:flex-row sm:divide-x sm:divide-y-0">
                {metrics.slice(0, 4).map((metric) => (
                  <div
                    key={metric.label}
                    className="flex-1 px-5 py-4 text-center"
                  >
                    <dd className="text-2xl font-bold text-white">
                      {metric.value}
                    </dd>
                    <dt className="mt-1 text-sm text-white/80">
                      {metric.label}
                    </dt>
                  </div>
                ))}
              </div>
            </dl>
          )}
        </div>
      </div>

      <div data-header-hero-end aria-hidden="true" className="h-px" />
    </section>
  );
}
```
