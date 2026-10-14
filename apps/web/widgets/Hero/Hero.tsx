// A/B test variants archived in ./hero-ab-variants.md
import { HeroLayout } from "@/shared/ui/HeroLayout";
import { HeroCenteredSpotlight } from "@/widgets/HeroCenteredSpotlight/HeroCenteredSpotlight";

interface HeroProps {
  headline: string;
  accentWord?: string | string[];
  lead?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  imageSrc?: string;
  imageAlt?: string;
  noSentinel?: boolean;
  scrollScene?: boolean;
}

export function Hero({
  headline,
  accentWord,
  lead,
  primaryCta,
  imageSrc = "/heroV2.webp",
  imageAlt = "",
  noSentinel = false,
  scrollScene = false,
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
        scrollScene={scrollScene}
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
      />

      {/* Standalone sentinel — always visible for header tone switching */}
      {!noSentinel && <div data-header-hero-end aria-hidden="true" className="h-px" />}
    </>
  );
}
