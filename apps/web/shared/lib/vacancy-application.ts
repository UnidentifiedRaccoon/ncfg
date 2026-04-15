import {
  asOptionalTrimmedString,
  asTrimmedString,
  isValidEmail,
} from './api-route-utils';

const MAX_URL_LENGTH = 2048;

export const VACANCY_APPLICATION_REQUIRED_FIELDS_ERROR =
  'Имя, email, телефон и ссылка на резюме обязательны для заполнения';
export const VACANCY_APPLICATION_INVALID_EMAIL_ERROR = 'Некорректный формат email';
export const VACANCY_APPLICATION_INVALID_RESUME_URL_ERROR =
  'Укажите корректную абсолютную ссылку на резюме';
export const VACANCY_APPLICATION_UNKNOWN_VACANCY_ERROR =
  'Вакансия не найдена или больше не опубликована';

export interface VacancyApplicationPayload {
  vacancySlug?: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  telegram?: string;
  message?: string;
  sourcePageUrl?: string;
}

export interface VacancyApplicationSubmission extends VacancyApplicationPayload {
  vacancySlug: string;
  vacancyTitle: string;
}

export interface VacancyApplicationConfirmationData {
  name: string;
  email: string;
  vacancySlug: string;
  vacancyTitle: string;
  sourcePageUrl?: string;
}

type VacancyApplicationParseResult =
  | {
      ok: true;
      data: VacancyApplicationPayload;
    }
  | {
      ok: false;
      error: string;
    };

function isAllowedProtocol(protocol: string) {
  return protocol === 'http:' || protocol === 'https:';
}

export function normalizeAbsoluteHttpUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) {
    return undefined;
  }

  try {
    const url = new URL(trimmed);
    if (!isAllowedProtocol(url.protocol)) {
      return undefined;
    }

    const normalized = url.toString();
    return normalized.length <= MAX_URL_LENGTH ? normalized : undefined;
  } catch {
    return undefined;
  }
}

export function parseVacancyApplicationPayload(
  payload: unknown
): VacancyApplicationParseResult {
  if (typeof payload !== 'object' || payload === null) {
    return {
      ok: false,
      error: VACANCY_APPLICATION_REQUIRED_FIELDS_ERROR,
    };
  }

  const record = payload as Record<string, unknown>;
  const name = asTrimmedString(record.name);
  const email = asTrimmedString(record.email);
  const phone = asTrimmedString(record.phone);
  const resumeUrlRaw = asTrimmedString(record.resumeUrl);

  if (!name || !email || !phone || !resumeUrlRaw) {
    return {
      ok: false,
      error: VACANCY_APPLICATION_REQUIRED_FIELDS_ERROR,
    };
  }

  if (!isValidEmail(email)) {
    return {
      ok: false,
      error: VACANCY_APPLICATION_INVALID_EMAIL_ERROR,
    };
  }

  const resumeUrl = normalizeAbsoluteHttpUrl(resumeUrlRaw);
  if (!resumeUrl) {
    return {
      ok: false,
      error: VACANCY_APPLICATION_INVALID_RESUME_URL_ERROR,
    };
  }

  return {
    ok: true,
    data: {
      vacancySlug: asOptionalTrimmedString(record.vacancySlug),
      name,
      email,
      phone,
      resumeUrl,
      telegram: asOptionalTrimmedString(record.telegram),
      message: asOptionalTrimmedString(record.message),
      sourcePageUrl: asOptionalTrimmedString(record.sourcePageUrl),
    },
  };
}
