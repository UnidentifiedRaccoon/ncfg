export interface ServiceCTA {
  label: string;
  type: "form" | "link";
}

export interface ServiceExample {
  id: number | string;
  title: string;
  type?: "link" | "fact" | "presentation" | "material";
  link?: string;
  description?: string;
  notes?: string;
}

export interface ServiceWebinar {
  title: string;
  items: string[];
}

export interface Service {
  id: string;
  order: number;
  title: string;
  shortDescription: string;
  fullDescriptionTitle?: string;
  fullDescription?: string;
  benefitsTitle?: string;
  benefits?: string[];
  htmlSectionBefore?: string;
  usefulInformation?: string;
  htmlSectionAfter?: string;
  howWeWorkTitle?: string;
  webinarsTitle?: string;
  webinars?: ServiceWebinar[];
  examplesTitle?: string;
  examples?: ServiceExample[];
  howWeWork?: string[];
  cta: ServiceCTA;
}

export interface ServiceCategory {
  id: string;
  order: number;
  title: string;
  description: string;
  services: Service[];
}

export interface ServicesData {
  meta: {
    contentType: string;
    organization: string;
    experienceYears: number;
    locale: string;
    updatedAt: string;
  };
  serviceCategories: ServiceCategory[];
}
