import type {
  DiagnosticCampaign,
  DiagnosticPublicQuestion,
  DiagnosticQuestion,
  DiagnosticResult,
  DiagnosticResultBand,
  DiagnosticResultInsight,
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

export function computeMaxScore(questions: DiagnosticQuestion[]): number {
  return questions.reduce((sum, question) => {
    const maxWeight = question.options.reduce(
      (max, option) => Math.max(max, option.weight),
      0
    );
    return sum + maxWeight;
  }, 0);
}

export function validateResultBands(
  bands: DiagnosticResultBand[]
): { valid: boolean; error?: string } {
  if (bands.length === 0) {
    return { valid: false, error: "Result bands array is empty" };
  }

  const sorted = [...bands].sort((a, b) => a.minPercent - b.minPercent);

  if (sorted[0].minPercent !== 0) {
    return { valid: false, error: "Bands must start at 0%" };
  }

  if (sorted[sorted.length - 1].maxPercent !== 100) {
    return { valid: false, error: "Bands must end at 100%" };
  }

  for (let i = 1; i < sorted.length; i++) {
    const expectedMin = sorted[i - 1].maxPercent + 1;
    if (sorted[i].minPercent !== expectedMin) {
      return {
        valid: false,
        error: `Gap or overlap between bands at ${sorted[i - 1].maxPercent}%-${sorted[i].minPercent}%`,
      };
    }
  }

  return { valid: true };
}

export function selectResultBand(
  bands: DiagnosticResultBand[],
  scorePercent: number
): DiagnosticResultBand | null {
  return (
    bands.find(
      (band) => scorePercent >= band.minPercent && scorePercent <= band.maxPercent
    ) ?? null
  );
}

export interface EvaluatedDiagnosticSubmission {
  totalScore: number;
  maxScore: number;
  scorePercent: number;
  answersSnapshot: DiagnosticSubmissionAnswerSnapshot[];
  insights: DiagnosticResultInsight[];
}

export function buildDiagnosticResult(
  campaign: DiagnosticCampaign,
  evaluatedSubmission: Pick<
    EvaluatedDiagnosticSubmission,
    "totalScore" | "maxScore" | "scorePercent" | "insights"
  >
): DiagnosticResult {
  const { totalScore, maxScore, scorePercent, insights } = evaluatedSubmission;
  const resultBands = campaign.test?.resultBands ?? [];
  let band: DiagnosticResult["band"] = null;

  if (resultBands.length > 0) {
    const validation = validateResultBands(resultBands);
    if (validation.valid) {
      const matched = selectResultBand(resultBands, scorePercent);
      if (matched) {
        band = {
          key: matched.key,
          title: matched.title,
          summary: matched.summary,
          ctaLabel: matched.ctaLabel,
          ctaHref: matched.ctaHref,
        };
      }
    }
  }

  return {
    totalScore,
    maxScore,
    scorePercent,
    band,
    insights,
  };
}

export function evaluateDiagnosticSubmission(
  campaign: DiagnosticCampaign,
  answers: DiagnosticAnswerInput[]
): EvaluatedDiagnosticSubmission {
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
  const insights: DiagnosticResultInsight[] = [];

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
      insightTitle: selectedOption.insightTitle,
      insightText: selectedOption.insightText,
      practiceStep: selectedOption.practiceStep,
    });

    if (selectedOption.insightTitle && selectedOption.insightText && selectedOption.practiceStep) {
      insights.push({
        questionKey: question.key,
        questionTitle: question.title,
        answerKey: selectedOption.key,
        answerLabel: selectedOption.label,
        weight: selectedOption.weight,
        insightTitle: selectedOption.insightTitle,
        insightText: selectedOption.insightText,
        practiceStep: selectedOption.practiceStep,
      });
    }
  }

  const maxScore = computeMaxScore(questions);
  const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    totalScore,
    maxScore,
    scorePercent,
    answersSnapshot,
    insights,
  };
}
