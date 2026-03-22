"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { DiagnosticPublicQuestion } from "@/shared/api/types/diagnostic";
import type {
  DiagnosticPreviewResponse,
  DiagnosticResult,
  DiagnosticSubmitResponse,
} from "@/shared/api/types/diagnostic";
import { captureCurrentPageUrl } from "@/shared/lib/source-page";

export interface RespondentFormData {
  fullName: string;
  email: string;
  phone: string;
}

export type SubmitStatus = "idle" | "submitting" | "success" | "error";
export type PreviewStatus = "idle" | "loading" | "success" | "error";
export type DiagnosticPhase = "intro" | "survey" | "results";

interface UseDiagnosticSurveyOptions {
  campaignSlug: string;
  questions: DiagnosticPublicQuestion[];
  demoMode?: boolean;
}

/* ------------------------------------------------------------------ */
/*  localStorage draft helpers                                         */
/* ------------------------------------------------------------------ */

interface DraftState {
  currentStep: number;
  answers: Record<string, string>;
  respondent: RespondentFormData;
  consentAccepted: boolean;
  phase: DiagnosticPhase;
}

function draftKey(campaignSlug: string): string {
  return `ncfg.diagnostic.${campaignSlug}.draft.v1`;
}

function loadDraft(campaignSlug: string): DraftState | null {
  try {
    const raw = localStorage.getItem(draftKey(campaignSlug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftState;
    if (
      typeof parsed.currentStep !== "number" ||
      typeof parsed.answers !== "object" ||
      typeof parsed.respondent !== "object"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveDraft(campaignSlug: string, state: DraftState): void {
  try {
    localStorage.setItem(draftKey(campaignSlug), JSON.stringify(state));
  } catch {
    // quota exceeded — silently ignore
  }
}

function clearDraft(campaignSlug: string): void {
  try {
    localStorage.removeItem(draftKey(campaignSlug));
  } catch {
    // ignore
  }
}

/* ------------------------------------------------------------------ */
/*  Demo mock result                                                   */
/* ------------------------------------------------------------------ */

const DEMO_MOCK_RESULT: DiagnosticResult = {
  totalScore: 75,
  maxScore: 100,
  scorePercent: 75,
  band: {
    key: "mid",
    title: "Средний уровень",
    summary:
      "У вас есть базовые знания, но есть потенциал для роста. Рекомендуем углубить знания в области инвестиций и страхования.",
    ctaLabel: "Узнать о программах",
    ctaHref: "/uslugi",
  },
  insights: [
    {
      questionKey: "demo-q1",
      questionTitle: "Финансовое планирование",
      answerKey: "demo-a1",
      answerLabel: "Планирую от случая к случаю",
      weight: 3,
      insightTitle: "Регулярное планирование повышает устойчивость",
      insightText:
        "Исследования показывают, что люди с регулярным финансовым планом на 40% устойчивее к непредвиденным расходам. Даже простой ежемесячный обзор бюджета значительно улучшает финансовое здоровье.",
      practiceStep:
        "Выделите 30 минут в начале каждого месяца для обзора доходов, расходов и целей. Используйте таблицу или приложение для отслеживания.",
    },
    {
      questionKey: "demo-q2",
      questionTitle: "Инвестиционная стратегия",
      answerKey: "demo-a2",
      answerLabel: "Только банковские вклады",
      weight: 2,
      insightTitle: "Диверсификация снижает риски",
      insightText:
        "Банковские вклады — надёжный, но ограниченный инструмент. Диверсификация портфеля между разными классами активов помогает защитить накопления от инфляции и получить более высокую доходность.",
      practiceStep:
        "Изучите базовые инвестиционные инструменты: облигации, ETF-фонды, ИИС. Начните с минимальных сумм для получения опыта.",
    },
    {
      questionKey: "demo-q3",
      questionTitle: "Страховая защита",
      answerKey: "demo-a3",
      answerLabel: "Только ОМС",
      weight: 5,
      insightTitle: "Комплексная защита — основа стабильности",
      insightText:
        "ОМС покрывает базовые медицинские потребности, но не защищает от финансовых последствий серьёзных заболеваний или несчастных случаев. Дополнительное страхование создаёт финансовую подушку безопасности.",
      practiceStep:
        "Оцените свои текущие риски и рассмотрите ДМС или страхование от несчастных случаев. Сравните предложения нескольких страховых компаний.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

const EMPTY_RESPONDENT: RespondentFormData = { fullName: "", email: "", phone: "" };

export function useDiagnosticSurvey({
  campaignSlug,
  questions,
  demoMode,
}: UseDiagnosticSurveyOptions) {
  const [phase, setPhase] = useState<DiagnosticPhase>("intro");
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [respondent, setRespondent] = useState<RespondentFormData>(EMPTY_RESPONDENT);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const [previewResult, setPreviewResult] = useState<DiagnosticResult | null>(null);
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>("idle");
  const previewCounter = useRef(0);

  const currentQuestion = currentStep < questions.length ? questions[currentStep] : null;
  const answeredCount = questions.filter((question) => Boolean(answers[question.key])).length;
  const progressPercent = questions.length
    ? Math.max(8, Math.round((answeredCount / questions.length) * 100))
    : 100;
  const isSubmitted = status === "success" && result !== null;

  /* ---- Hydration: check for existing draft ---- */
  const hydrationDone = useRef(false);
  useEffect(() => {
    if (hydrationDone.current) return;
    hydrationDone.current = true;

    const draft = loadDraft(campaignSlug);
    if (draft) {
      setHasDraft(true);
    }
    setIsHydrated(true);
  }, [campaignSlug]);

  /* ---- Autosave draft during survey / results phase ---- */
  useEffect(() => {
    if ((phase !== "survey" && phase !== "results") || !isHydrated || isSubmitted) return;

    saveDraft(campaignSlug, { currentStep, answers, respondent, consentAccepted, phase });
  }, [phase, isHydrated, isSubmitted, campaignSlug, currentStep, answers, respondent, consentAccepted]);

  /* ---- Preview fetch ---- */

  const fetchPreviewResult = async () => {
    if (demoMode) {
      setPreviewResult(DEMO_MOCK_RESULT);
      setPreviewStatus("success");
      return;
    }

    const counter = ++previewCounter.current;
    setPreviewStatus("loading");

    try {
      const response = await fetch(`/api/diagnostics/${campaignSlug}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: questions.map((question) => ({
            questionKey: question.key,
            answerKey: answers[question.key],
          })),
        }),
      });

      // Stale request guard
      if (counter !== previewCounter.current) return;

      const payload = (await response.json()) as DiagnosticPreviewResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Не удалось получить результаты");
      }

      setPreviewResult(payload.data.result);
      setPreviewStatus("success");
    } catch (error) {
      if (counter !== previewCounter.current) return;
      setPreviewStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Не удалось получить результаты"
      );
    }
  };

  /* ---- Actions ---- */

  const clearError = () => {
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const resetSurveyState = () => {
    setCurrentStep(0);
    setAnswers({});
    setRespondent(EMPTY_RESPONDENT);
    setConsentAccepted(false);
    setStatus("idle");
    setErrorMessage("");
    setResult(null);
    setPreviewResult(null);
    setPreviewStatus("idle");
  };

  const startFresh = () => {
    clearDraft(campaignSlug);
    resetSurveyState();
    setHasDraft(false);
    setPhase("survey");
  };

  const continueDraft = () => {
    const draft = loadDraft(campaignSlug);
    if (draft) {
      setCurrentStep(draft.currentStep);
      setAnswers(draft.answers);
      setRespondent(draft.respondent);
      setConsentAccepted(draft.consentAccepted);

      // If draft was in results phase, restore and re-fetch preview
      if (draft.phase === "results") {
        setPhase("results");
        setStatus("idle");
        setErrorMessage("");
        setResult(null);
        // fetchPreviewResult will be triggered by the effect below
        return;
      }
    }
    setStatus("idle");
    setErrorMessage("");
    setResult(null);
    setPhase("survey");
  };

  // Auto-fetch preview when entering results phase from draft restore
  const prevPhaseRef = useRef<DiagnosticPhase>("intro");
  useEffect(() => {
    if (phase === "results" && prevPhaseRef.current !== "results" && !previewResult && previewStatus === "idle") {
      fetchPreviewResult();
    }
    prevPhaseRef.current = phase;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const startFromIntro = () => {
    clearDraft(campaignSlug);
    resetSurveyState();
    setHasDraft(false);
    setPhase("intro");
  };

  const handleSelectAnswer = (questionKey: string, answerKey: string) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: answerKey }));
    clearError();
  };

  const handleRespondentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setRespondent((prev) => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleConsentChange = (checked: boolean) => {
    setConsentAccepted(checked);
    clearError();
  };

  const goToNextStep = () => {
    if (!currentQuestion) return;

    if (!answers[currentQuestion.key]) {
      setStatus("error");
      setErrorMessage("Выберите один вариант ответа, чтобы продолжить");
      return;
    }

    // Last question → go to results phase
    if (currentStep === questions.length - 1) {
      setPhase("results");
      clearError();
      fetchPreviewResult();
      return;
    }

    setCurrentStep((prev) => prev + 1);
    clearError();
  };

  const goToPreviousStep = () => {
    if (phase === "results") {
      setPhase("survey");
      setCurrentStep(questions.length - 1);
      clearError();
      return;
    }

    setCurrentStep((prev) => Math.max(prev - 1, 0));
    clearError();
  };

  const goToStep = (index: number) => {
    if (index < 0 || index >= questions.length) return;

    if (phase === "results") {
      setPhase("survey");
    }
    setCurrentStep(index);
    clearError();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fullName = respondent.fullName.trim();
    const email = respondent.email.trim();
    const phone = respondent.phone.trim();

    if (!fullName || !email) {
      setStatus("error");
      setErrorMessage("Имя и email обязательны для заполнения");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage("Укажите корректный email");
      return;
    }

    if (!consentAccepted) {
      setStatus("error");
      setErrorMessage("Подтвердите согласие на обработку персональных данных");
      return;
    }

    if (demoMode) {
      clearDraft(campaignSlug);
      setResult(DEMO_MOCK_RESULT);
      setStatus("success");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/diagnostics/${campaignSlug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: questions.map((question) => ({
            questionKey: question.key,
            answerKey: answers[question.key],
          })),
          sourcePageUrl: captureCurrentPageUrl(),
          respondent: {
            fullName,
            email,
            phone: phone || undefined,
            consentAccepted: true,
          },
        }),
      });

      const payload = (await response.json()) as DiagnosticSubmitResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Не удалось сохранить результаты");
      }

      clearDraft(campaignSlug);
      setResult(payload.data.result);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Не удалось сохранить результаты"
      );
    }
  };

  return {
    phase,
    isHydrated,
    hasDraft,
    result,
    isSubmitted,
    currentStep,
    answers,
    respondent,
    consentAccepted,
    status,
    errorMessage,
    currentQuestion,
    answeredCount,
    progressPercent,
    previewResult,
    previewStatus,
    fetchPreviewResult,
    handleSelectAnswer,
    handleRespondentChange,
    handleConsentChange,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    handleSubmit,
    clearError,
    startFresh,
    continueDraft,
    startFromIntro,
  };
}
