export interface SeasonOfferLink {
  label: string;
  href: string;
}

export interface SeasonOfferMetric {
  value: string;
  label: string;
}

export interface SeasonOfferHeroContent {
  eyebrow: string;
  headline: string;
  accentWord: string;
  lead: string;
  primaryAction: SeasonOfferLink;
  imageSrc: string;
  imageAlt: string;
  metrics: SeasonOfferMetric[];
}

export type SeasonOfferTaskIcon =
  | "foundation"
  | "pressure"
  | "market"
  | "hr"
  | "family"
  | "annual";

export interface SeasonOfferTask {
  id: string;
  icon: SeasonOfferTaskIcon;
  title: string;
  description: string;
  program: SeasonOfferLink;
}

export interface SeasonOfferTaskNavigatorContent {
  title: string;
  lead: string;
  tasks: SeasonOfferTask[];
}

export interface SeasonOfferProgram {
  id: string;
  type: string;
  title: string;
  value: string;
  duration: string;
  audienceTitle: string;
  audience: string[];
  outcomesTitle: string;
  outcomes: string[];
  format: string[];
  featured?: boolean;
}

export interface SeasonOfferProgramCatalogContent {
  title: string;
  lead: string;
  ctaLabel: string;
  programs: SeasonOfferProgram[];
}

export interface SeasonOfferStep {
  id: number;
  title: string;
  description: string;
}

export interface SeasonOfferHowWeWorkContent {
  title: string;
  lead: string;
  steps: SeasonOfferStep[];
}

export interface SeasonOfferAssuranceItem {
  title: string;
  description: string;
}

export interface SeasonOfferAssuranceColumn {
  eyebrow: string;
  title: string;
  lead: string;
  items: SeasonOfferAssuranceItem[];
}

export interface SeasonOfferExpertiseContent {
  eyebrow: string;
  title: string;
  description: string;
  action: SeasonOfferLink;
}

export interface SeasonOfferAssuranceContent {
  title: string;
  lead: string;
  reporting: SeasonOfferAssuranceColumn;
  boundaries: SeasonOfferAssuranceColumn;
  expertise: SeasonOfferExpertiseContent;
}

export interface SeasonOfferFaqItem {
  question: string;
  answer: string;
}

export interface SeasonOfferFaqContent {
  title: string;
  lead: string;
  items: SeasonOfferFaqItem[];
}

export interface SeasonOffer2026Content {
  updatedAt: string;
  formHref: string;
  hero: SeasonOfferHeroContent;
  taskNavigator: SeasonOfferTaskNavigatorContent;
  programCatalog: SeasonOfferProgramCatalogContent;
  howWeWork: SeasonOfferHowWeWorkContent;
  assurance: SeasonOfferAssuranceContent;
  faq: SeasonOfferFaqContent;
}
