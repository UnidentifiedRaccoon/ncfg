export interface HowWeWorkShowcaseStep {
  id: number;
  title: string;
  description?: string;
}

export interface HowWeWorkVariantProps {
  steps: HowWeWorkShowcaseStep[];
}

export interface HowWeWorkShowcaseProps {
  title: string;
  lead?: string;
  steps: HowWeWorkShowcaseStep[];
}
