import { HeroLayout } from "@/shared/ui/HeroLayout";

interface HeroMetric {
  value: string;
  label: string;
}

interface HeroProps {
  headline: string;
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
  lead,
  primaryCta,
  metrics,
  imageSrc = "/hero.png",
  imageAlt = "",
}: HeroProps) {
  const sanitizeLabel = (label: string) => label.replace(/\.{2,}$/, "");

  const secondaryAction = primaryCta
    ? { label: sanitizeLabel(primaryCta.label), href: primaryCta.href }
    : undefined;

  return (
    <HeroLayout
      headline={headline}
      lead={lead}
      primaryAction={{ label: "Оставить заявку", href: "#lead-form" }}
      secondaryAction={secondaryAction}
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      metricsCard={
        metrics && metrics.length > 0
          ? {
              title: "Метрики программ",
              subtitle: "Охват и результаты",
              badge: "В цифрах",
              metrics: metrics,
            }
          : undefined
      }
    />
  );
}
