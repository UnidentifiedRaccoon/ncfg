// A/B test variants archived in ./hero-ab-variants.md
import { HeroLayout } from "@/shared/ui/HeroLayout";
import { HeroCenteredSpotlight } from "@/widgets/HeroCenteredSpotlight/HeroCenteredSpotlight";

interface HeroMetric {
  value: string;
  label: string;
}

interface HeroProps {
  headline: string;
  accentWord?: string | string[];
  lead?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  metrics?: HeroMetric[];
  imageSrc?: string;
  imageAlt?: string;
}

export function Hero({
  headline,
  accentWord,
  lead,
  primaryCta,
  metrics,
  imageSrc = "/heroV2.minified.png",
  imageAlt = "",
}: HeroProps) {
  const sanitizeLabel = (label: string) => label.replace(/\.{2,}$/, "");

  const primaryAction = { label: "Оставить заявку", href: "#lead-form" };
  const secondaryAction = primaryCta
    ? { label: sanitizeLabel(primaryCta.label), href: primaryCta.href }
    : undefined;

  return (
    <>
      {/* Desktop: two-column layout with image */}
      <HeroLayout
        className="hidden min-[1200px]:block"
        noSentinel
        headline={headline}
        accentWord={accentWord}
        lead={lead}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        metrics={metrics}
      />

      {/* Mobile / tablet: centered spotlight, no image */}
      <HeroCenteredSpotlight
        className="min-[1200px]:hidden"
        noSentinel
        headline={headline}
        accentWord={accentWord}
        lead={lead}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        metrics={metrics}
      />

      {/* Standalone sentinel — always visible for header tone switching */}
      <div data-header-hero-end aria-hidden="true" className="h-px" />
    </>
  );
}
