export interface ExpertsLabItem {
  id: string;
  fullName: string;
  photoUrl: string | null;
  subtitle: string;
  experienceYears: number | null;
  tags: string[];
}

export interface VariantProps {
  items: ExpertsLabItem[];
  title?: string;
  lead?: string;
}
