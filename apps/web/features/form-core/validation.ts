import { FORM_VALIDATION_MESSAGES } from "./messages";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function validateLeadBasics(input: {
  name: string;
  email: string;
  consent: boolean;
}): string | null {
  const name = input.name.trim();
  const email = input.email.trim();
  if (!name || !email) {
    return FORM_VALIDATION_MESSAGES.nameEmailRequired;
  }
  if (!isValidEmail(email)) {
    return FORM_VALIDATION_MESSAGES.emailInvalid;
  }
  if (!input.consent) {
    return FORM_VALIDATION_MESSAGES.consentRequired;
  }
  return null;
}

export function validateDiagnosticContact(input: {
  fullName: string;
  email: string;
  consent: boolean;
}): string | null {
  const fullName = input.fullName.trim();
  const email = input.email.trim();
  if (!fullName || !email) {
    return FORM_VALIDATION_MESSAGES.nameEmailRequired;
  }
  if (!isValidEmail(email)) {
    return FORM_VALIDATION_MESSAGES.emailInvalidDiagnostic;
  }
  if (!input.consent) {
    return FORM_VALIDATION_MESSAGES.consentRequired;
  }
  return null;
}

export function validateBlogQuestion(input: {
  question: string;
  name: string;
  email: string;
}): string | null {
  const question = input.question.trim();
  const name = input.name.trim();
  const email = input.email.trim();
  if (!question || !name || !email) {
    return FORM_VALIDATION_MESSAGES.questionNameEmailRequired;
  }
  if (!isValidEmail(email)) {
    return FORM_VALIDATION_MESSAGES.emailInvalid;
  }
  return null;
}
