import { HeroLayout } from "@/shared/ui/HeroLayout";

interface HeroIndividualsProps {
  headline: string;
  lead?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
}

export function HeroIndividuals({ headline, lead, primaryCta }: HeroIndividualsProps) {
  const primaryAction = primaryCta
    ? { label: primaryCta.label, href: primaryCta.href }
    : { label: "Оставить заявку", href: "#lead-form" };

  return (
    <HeroLayout
      headline={headline}
      lead={lead}
      primaryAction={primaryAction}
      secondaryAction={{ label: "Подробнее", href: "#products" }}
      imageSrc="/hero.png"
      imageAlt=""
    />
  );
}
