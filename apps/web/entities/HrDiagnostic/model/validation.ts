import { HR_TARGET_ROLE_KEYS } from "./survey";
import type {
  HrDiagnosticAnswerInput,
  HrDiagnosticNormalizedAnswer,
  HrDiagnosticQuestion,
  HrDiagnosticSegment,
  HrDiagnosticTest,
  HrDiagnosticValidationResult,
} from "./types";

const OTHER_OPTION_KEY = "other";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function answerMapFromInputs(answers: HrDiagnosticAnswerInput[]) {
  const answerByQuestionKey = new Map<string, HrDiagnosticAnswerInput>();

  for (const answer of answers) {
    const questionKey = answer.questionKey.trim();
    if (!questionKey || answerByQuestionKey.has(questionKey)) {
      continue;
    }

    answerByQuestionKey.set(questionKey, {
      questionKey,
      selectedOptionKeys: Array.isArray(answer.selectedOptionKeys)
        ? answer.selectedOptionKeys.map((key) => key.trim()).filter(Boolean)
        : undefined,
      otherText: trimOptional(answer.otherText),
      text: trimOptional(answer.text),
    });
  }

  return answerByQuestionKey;
}

function getSelectedOptionKeys(answer: HrDiagnosticAnswerInput | undefined): string[] {
  return answer?.selectedOptionKeys ?? [];
}

function flattenQuestions(test: HrDiagnosticTest): HrDiagnosticQuestion[] {
  return test.groups.flatMap((group) => group.questions);
}

export function getHrDiagnosticVisibleQuestions(
  test: HrDiagnosticTest,
  answers: HrDiagnosticAnswerInput[]
): HrDiagnosticQuestion[] {
  const answerByQuestionKey = answerMapFromInputs(answers);

  return flattenQuestions(test).filter((question) => {
    if (!question.showWhen) {
      return true;
    }

    const selectedOptionKeys = getSelectedOptionKeys(
      answerByQuestionKey.get(question.showWhen.questionKey)
    );

    if (question.showWhen.operator === "not_in") {
      return !selectedOptionKeys.some((key) =>
        question.showWhen?.optionKeys.includes(key)
      );
    }

    return true;
  });
}

function optionLabelForKey(question: HrDiagnosticQuestion, optionKey: string): string | null {
  if (optionKey === OTHER_OPTION_KEY && question.allowOther) {
    return "Другое";
  }

  return question.options?.find((option) => option.key === optionKey)?.label ?? null;
}

function hasExclusiveCheckboxConflict(
  question: HrDiagnosticQuestion,
  selectedOptionKeys: string[]
) {
  if (question.type !== "checkbox" || selectedOptionKeys.length < 2) {
    return false;
  }

  const exclusiveOptionKeys = new Set(
    question.options
      ?.filter((option) => option.exclusive)
      .map((option) => option.key) ?? []
  );

  return (
    selectedOptionKeys.some((optionKey) => exclusiveOptionKeys.has(optionKey)) &&
    selectedOptionKeys.some((optionKey) => !exclusiveOptionKeys.has(optionKey))
  );
}

function normalizeAnswer(
  question: HrDiagnosticQuestion,
  answer: HrDiagnosticAnswerInput | undefined
): HrDiagnosticNormalizedAnswer | null {
  if (question.type === "email") {
    const text = trimOptional(answer?.text);
    if (!text) {
      return null;
    }

    return {
      questionKey: question.key,
      questionTitle: question.title,
      answerLabel: text,
      selectedOptionKeys: [],
      text,
    };
  }

  const selectedOptionKeys = getSelectedOptionKeys(answer);
  if (selectedOptionKeys.length === 0) {
    return null;
  }

  const labels = selectedOptionKeys
    .map((optionKey) => optionLabelForKey(question, optionKey))
    .filter((label): label is string => Boolean(label));

  if (labels.length !== selectedOptionKeys.length) {
    return null;
  }

  const otherText = trimOptional(answer?.otherText);
  const answerLabel = selectedOptionKeys.includes(OTHER_OPTION_KEY) && otherText
    ? `${labels.join(", ")}: ${otherText}`
    : labels.join(", ");

  return {
    questionKey: question.key,
    questionTitle: question.title,
    answerLabel,
    selectedOptionKeys,
    otherText,
  };
}

export function validateHrDiagnosticQuestionAnswer(
  question: HrDiagnosticQuestion,
  answer: HrDiagnosticAnswerInput | undefined
): string | null {
  if (question.type === "email") {
    const email = trimOptional(answer?.text);
    if (question.required && !email) {
      return "Укажите email";
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      return "Укажите корректный email";
    }
    return null;
  }

  const selectedOptionKeys = getSelectedOptionKeys(answer);
  const selectedCount = selectedOptionKeys.length;

  if (question.required && selectedCount === 0) {
    return "Выберите вариант ответа";
  }

  if (selectedCount === 0) {
    return null;
  }

  if ((question.type === "radio" || question.type === "likert") && selectedCount !== 1) {
    return "Выберите один вариант ответа";
  }

  if (question.maxSelections && selectedCount > question.maxSelections) {
    return `Выберите не больше ${question.maxSelections} вариантов`;
  }

  for (const optionKey of selectedOptionKeys) {
    if (!optionLabelForKey(question, optionKey)) {
      return "Обнаружен недопустимый вариант ответа";
    }
  }

  if (hasExclusiveCheckboxConflict(question, selectedOptionKeys)) {
    return "Этот вариант нельзя выбрать вместе с другими";
  }

  if (selectedOptionKeys.includes(OTHER_OPTION_KEY) && !trimOptional(answer?.otherText)) {
    return "Заполните поле «Другое»";
  }

  return null;
}

function resolveSegment(answerByQuestionKey: Map<string, HrDiagnosticAnswerInput>): HrDiagnosticSegment {
  const roleKey = getSelectedOptionKeys(answerByQuestionKey.get("role"))[0];
  const companySizeKey = getSelectedOptionKeys(answerByQuestionKey.get("company_size"))[0];

  if (companySizeKey === "under_100") {
    return "non_target";
  }

  return roleKey && HR_TARGET_ROLE_KEYS.has(roleKey) ? "target" : "non_target";
}

export function validateHrDiagnosticSubmission(
  test: HrDiagnosticTest,
  answers: HrDiagnosticAnswerInput[]
): HrDiagnosticValidationResult {
  const answerByQuestionKey = answerMapFromInputs(answers);
  const allQuestionKeys = new Set(flattenQuestions(test).map((question) => question.key));
  const visibleQuestions = getHrDiagnosticVisibleQuestions(test, answers);
  const visibleQuestionKeys = new Set(visibleQuestions.map((question) => question.key));
  const errors: string[] = [];
  const normalizedAnswers: HrDiagnosticNormalizedAnswer[] = [];

  for (const question of visibleQuestions) {
    const answer = answerByQuestionKey.get(question.key);
    const error = validateHrDiagnosticQuestionAnswer(question, answer);
    if (error) {
      errors.push(`${question.title}: ${error}`);
      continue;
    }

    const normalizedAnswer = normalizeAnswer(question, answer);
    if (normalizedAnswer) {
      normalizedAnswers.push(normalizedAnswer);
    }
  }

  for (const answer of answers) {
    const questionKey = answer.questionKey.trim();
    if (!allQuestionKeys.has(questionKey)) {
      errors.push("Обнаружен ответ на неизвестный вопрос");
      continue;
    }

    if (!visibleQuestionKeys.has(questionKey)) {
      continue;
    }
  }

  const targetSegment = resolveSegment(answerByQuestionKey);

  return {
    valid: errors.length === 0,
    errors,
    normalizedAnswers,
    targetSegment,
  };
}
