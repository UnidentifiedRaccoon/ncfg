export type VacancyEmploymentType =
  | 'full-time'
  | 'part-time'
  | 'project'
  | 'internship';

export type VacancyWorkFormat = 'remote' | 'hybrid' | 'office';

export interface VacancyDepartmentData {
  id: string;
  slug: string;
  title: string;
  order: number;
  description: string | null;
}

export interface VacancyData {
  id: string;
  title: string;
  slug: string;
  lead: string | null;
  body: string;
  department: VacancyDepartmentData | null;
  employmentType: VacancyEmploymentType | null;
  employmentTypeLabel: string | null;
  workFormat: VacancyWorkFormat | null;
  workFormatLabel: string | null;
  location: string | null;
  salaryText: string | null;
  coverImage: string | null;
  publishedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareerPageData {
  title: string;
  lead: string | null;
  emptyTitle: string;
  emptyDescription: string;
  updatedAt: string;
}
