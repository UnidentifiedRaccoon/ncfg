import { HeroLayout } from "@/shared/ui/HeroLayout";

interface HeroCompaniesProps {
  headline: string;
  lead?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
}

export function HeroCompanies({ headline, lead, primaryCta }: HeroCompaniesProps) {
  const primaryAction = primaryCta
    ? { label: primaryCta.label, href: primaryCta.href }
    : { label: "Оставить заявку", href: "#lead-form" };

  return (
    <HeroLayout
      headline={headline}
      lead={lead}
      primaryAction={primaryAction}
      secondaryAction={{ label: "Подробнее", href: "#services" }}
      imageSrc="/hero.png"
      imageAlt=""
    />
  );
}
