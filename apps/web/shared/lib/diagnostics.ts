import type {
  DiagnosticCampaign,
  DiagnosticPublicQuestion,
  DiagnosticQuestion,
  DiagnosticSubmissionAnswerSnapshot,
} from "@/shared/api/types/diagnostic";

export interface DiagnosticAnswerInput {
  questionKey: string;
  answerKey: string;
}

function compareByOrderThenLabel<T extends { order: number; key: string }>(left: T, right: T) {
  if (left.order !== right.order) {
    return left.order - right.order;
  }

  return left.key.localeCompare(right.key, "ru");
}

export function sortDiagnosticQuestions(questions: DiagnosticQuestion[]): DiagnosticQuestion[] {
  return [...questions]
    .map((question) => ({
      ...question,
      options: [...question.options].sort(compareByOrderThenLabel),
    }))
    .sort(compareByOrderThenLabel);
}

export function toPublicDiagnosticQuestions(
  questions: DiagnosticQuestion[]
): DiagnosticPublicQuestion[] {
  return sortDiagnosticQuestions(questions).map((question) => ({
    key: question.key,
    title: question.title,
    description: question.description,
    order: question.order,
    options: question.options.map((option) => ({
      key: option.key,
      label: option.label,
      order: option.order,
    })),
  }));
}

export function isDiagnosticCampaignAvailable(
  campaign: Pick<DiagnosticCampaign, "isActive" | "startsAt" | "endsAt">,
  now: Date = new Date()
) {
  if (!campaign.isActive) {
    return false;
  }

  if (campaign.startsAt) {
    const startsAt = new Date(campaign.startsAt);
    if (!Number.isNaN(startsAt.getTime()) && now < startsAt) {
      return false;
    }
  }

  if (campaign.endsAt) {
    const endsAt = new Date(campaign.endsAt);
    if (!Number.isNaN(endsAt.getTime()) && now > endsAt) {
      return false;
    }
  }

  return true;
}

export function normalizeDiagnosticEmail(email: string) {
  return email.trim().toLowerCase();
}

export function evaluateDiagnosticSubmission(
  campaign: DiagnosticCampaign,
  answers: DiagnosticAnswerInput[]
): {
  totalScore: number;
  answersSnapshot: DiagnosticSubmissionAnswerSnapshot[];
} {
  if (!campaign.test) {
    throw new Error("Тест для диагностики не настроен");
  }

  const questions = sortDiagnosticQuestions(campaign.test.questions);
  if (questions.length === 0) {
    throw new Error("Тест не содержит вопросов");
  }

  const answerByQuestionKey = new Map<string, string>();

  for (const answer of answers) {
    const questionKey = answer.questionKey.trim();
    const answerKey = answer.answerKey.trim();

    if (!questionKey || !answerKey) {
      throw new Error("Некорректный формат ответов");
    }

    if (answerByQuestionKey.has(questionKey)) {
      throw new Error("Обнаружены дублирующиеся ответы");
    }

    answerByQuestionKey.set(questionKey, answerKey);
  }

  if (answerByQuestionKey.size !== questions.length) {
    throw new Error("Пожалуйста, ответьте на все вопросы");
  }

  let totalScore = 0;
  const answersSnapshot: DiagnosticSubmissionAnswerSnapshot[] = [];

  for (const question of questions) {
    const answerKey = answerByQuestionKey.get(question.key);
    if (!answerKey) {
      throw new Error("Пожалуйста, ответьте на все вопросы");
    }

    const selectedOption = question.options.find((option) => option.key === answerKey);
    if (!selectedOption) {
      throw new Error("Обнаружен недопустимый вариант ответа");
    }

    totalScore += selectedOption.weight;
    answersSnapshot.push({
      questionKey: question.key,
      questionTitle: question.title,
      answerKey: selectedOption.key,
      answerLabel: selectedOption.label,
      weight: selectedOption.weight,
    });
  }

  return {
    totalScore,
    answersSnapshot,
  };
}
