import { HeroLayout } from "@/shared/ui/HeroLayout";

interface ServiceHeroProps {
  title: string;
  shortDescription: string;
  ctaLabel?: string;
}

export function ServiceHero({
  title,
  shortDescription,
  ctaLabel = "Оставить заявку",
}: ServiceHeroProps) {
  return (
    <HeroLayout
      headline={title}
      lead={shortDescription}
      primaryAction={{ label: ctaLabel, href: "#lead-form" }}
      imageSrc="/ChatGPT Image Mar 17, 2026, 06_20_21 PM.png"
      imageAlt=""
    />
  );
}
