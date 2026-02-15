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
      imageSrc="/hero.png"
      imageAlt=""
    />
  );
}
