export interface ServiceCTA {
  label: string;
  type: "form" | "link";
}

export interface ServiceExample {
  id: number | string;
  title: string;
  type?: "link" | "fact" | "presentation";
  link?: string;
  description?: string;
  notes?: string;
}

export interface Service {
  id: string;
  order: number;
  status: "published" | "draft";
  title: string;
  shortDescription: string;
  fullDescription: string;
  benefits?: string[];
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
