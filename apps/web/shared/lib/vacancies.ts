import { normalizeInlineText } from './seo-utils';
import type {
  VacancyEmploymentType,
  VacancyWorkFormat,
} from '@/shared/api/types/vacancy';

const EMPLOYMENT_TYPE_LABELS = {
  'full-time': 'Полная занятость',
  'part-time': 'Частичная занятость',
  project: 'Проектная работа',
  internship: 'Стажировка',
} satisfies Record<VacancyEmploymentType, string>;

const WORK_FORMAT_LABELS = {
  remote: 'Удалённо',
  hybrid: 'Гибрид',
  office: 'Офис',
} satisfies Record<VacancyWorkFormat, string>;

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = normalizeInlineText(value);
  return normalized.length > 0 ? normalized : null;
}

export function getVacancyEmploymentTypeLabel(
  value: VacancyEmploymentType | null | undefined
): string | null {
  return value ? EMPLOYMENT_TYPE_LABELS[value] : null;
}

export function getVacancyWorkFormatLabel(
  value: VacancyWorkFormat | null | undefined
): string | null {
  return value ? WORK_FORMAT_LABELS[value] : null;
}

export function resolveVacancyPublishedDate(input: {
  publishedDate?: string | null;
  createdAt: string;
}): string {
  return normalizeOptionalText(input.publishedDate) ?? input.createdAt;
}
