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
    ? { label: primaryCta.href === "#lead-form" ? "Подобрать программу" : primaryCta.label, href: primaryCta.href }
    : { label: "Подобрать программу", href: "#lead-form" };

  return (
    <HeroLayout
      noSentinel
      headline={headline}
      lead={lead}
      primaryAction={primaryAction}
      secondaryAction={{ label: "Посмотреть услуги", href: "#services" }}
      imageSrc="/heroV2.webp"
      imageAlt=""
    />
  );
}
