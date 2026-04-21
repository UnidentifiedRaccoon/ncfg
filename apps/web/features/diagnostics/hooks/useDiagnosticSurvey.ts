"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { DiagnosticPublicQuestion } from "@/shared/api/types/diagnostic";
import type {
  DiagnosticEmailDeliveryStatus,
  DiagnosticPreviewResponse,
  DiagnosticResult,
  DiagnosticSubmitResponse,
} from "@/shared/api/types/diagnostic";
import { validateDiagnosticContact } from "@/features/form-core";
import { captureCurrentPageUrl } from "@/shared/lib/source-page";
import { reachGoal, YM_GOALS } from "@/shared/lib/ym";
import { getUtmParams } from "@/shared/lib/utm";

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
}

interface DraftState {
  currentStep: number;
  answers: Record<string, string>;
  respondent: RespondentFormData;
  consentAccepted: boolean;
  phase: DiagnosticPhase;
  submissionKey: string;
  submissionDocumentId?: string;
}

function draftKey(campaignSlug: string): string {
  return `ncfg.diagnostic.${campaignSlug}.draft.v1`;
}

function createSubmissionKey() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `diag-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 10)}`;
}

function loadDraft(campaignSlug: string): DraftState | null {
  try {
    const raw = localStorage.getItem(draftKey(campaignSlug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftState;
    if (
      typeof parsed.currentStep !== "number" ||
      typeof parsed.answers !== "object" ||
      parsed.answers === null ||
      typeof parsed.respondent !== "object" ||
      parsed.respondent === null
    ) {
      return null;
    }

    return {
      ...parsed,
      submissionKey:
        typeof parsed.submissionKey === "string" && parsed.submissionKey.trim().length > 0
          ? parsed.submissionKey.trim()
          : createSubmissionKey(),
      submissionDocumentId:
        typeof parsed.submissionDocumentId === "string" &&
        parsed.submissionDocumentId.trim().length > 0
          ? parsed.submissionDocumentId.trim()
          : undefined,
    };
  } catch {
    return null;
  }
}

function saveDraft(campaignSlug: string, state: DraftState): void {
  try {
    localStorage.setItem(draftKey(campaignSlug), JSON.stringify(state));
  } catch {
  }
}

function clearDraft(campaignSlug: string): void {
  try {
    localStorage.removeItem(draftKey(campaignSlug));
  } catch {
  }
}

const EMPTY_RESPONDENT: RespondentFormData = { fullName: "", email: "", phone: "" };

export function useDiagnosticSurvey({
  campaignSlug,
  questions,
}: UseDiagnosticSurveyOptions) {
  const [phase, setPhase] = useState<DiagnosticPhase>("intro");
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [submissionKey, setSubmissionKey] = useState(() => createSubmissionKey());
  const [submissionDocumentId, setSubmissionDocumentId] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [respondent, setRespondent] = useState<RespondentFormData>(EMPTY_RESPONDENT);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [emailDeliveryStatus, setEmailDeliveryStatus] =
    useState<DiagnosticEmailDeliveryStatus | null>(null);

  const [previewResult, setPreviewResult] = useState<DiagnosticResult | null>(null);
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>("idle");
  const previewCounter = useRef(0);

  const currentQuestion = currentStep < questions.length ? questions[currentStep] : null;
  const answeredCount = questions.filter((question) => Boolean(answers[question.key])).length;
  const progressPercent = questions.length
    ? Math.max(8, Math.round((answeredCount / questions.length) * 100))
    : 100;
  const isSubmitted = status === "success" && result !== null;

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

  useEffect(() => {
    if ((phase !== "survey" && phase !== "results") || !isHydrated || isSubmitted) return;

    saveDraft(campaignSlug, {
      currentStep,
      answers,
      respondent,
      consentAccepted,
      phase,
      submissionKey,
      submissionDocumentId: submissionDocumentId ?? undefined,
    });
  }, [
    phase,
    isHydrated,
    isSubmitted,
    campaignSlug,
    currentStep,
    answers,
    respondent,
    consentAccepted,
    submissionKey,
    submissionDocumentId,
  ]);

  const fetchPreviewResult = async () => {
    const counter = ++previewCounter.current;
    setPreviewStatus("loading");

    try {
      const response = await fetch(`/api/diagnostics/${campaignSlug}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionKey,
          sourcePageUrl: captureCurrentPageUrl(),
          answers: questions.map((question) => ({
            questionKey: question.key,
            answerKey: answers[question.key],
          })),
        }),
      });

      if (counter !== previewCounter.current) return;

      const payload = (await response.json()) as DiagnosticPreviewResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Не удалось получить результаты");
      }

      setPreviewResult(payload.data.result);
      setSubmissionDocumentId(payload.data.documentId ?? null);
      setPreviewStatus("success");
    } catch (error) {
      if (counter !== previewCounter.current) return;
      setPreviewStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Не удалось получить результаты"
      );
    }
  };

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
    setEmailDeliveryStatus(null);
    setPreviewResult(null);
    setPreviewStatus("idle");
    setSubmissionDocumentId(null);
  };

  const startFresh = () => {
    clearDraft(campaignSlug);
    setSubmissionKey(createSubmissionKey());
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
      setSubmissionKey(draft.submissionKey);
      setSubmissionDocumentId(draft.submissionDocumentId ?? null);
      setEmailDeliveryStatus(null);

      if (draft.phase === "results") {
        setPhase("results");
        setStatus("idle");
        setErrorMessage("");
        setResult(null);
        return;
      }
    }
    setStatus("idle");
    setErrorMessage("");
    setResult(null);
    setEmailDeliveryStatus(null);
    setPhase("survey");
  };

  const prevPhaseRef = useRef<DiagnosticPhase>("intro");
  const fetchPreviewResultRef = useRef(fetchPreviewResult);
  fetchPreviewResultRef.current = fetchPreviewResult;
  useEffect(() => {
    if (phase === "results" && prevPhaseRef.current !== "results" && !previewResult && previewStatus === "idle") {
      void fetchPreviewResultRef.current();
    }
    prevPhaseRef.current = phase;
  }, [phase, previewResult, previewStatus]);

  const startFromIntro = () => {
    clearDraft(campaignSlug);
    setSubmissionKey(createSubmissionKey());
    resetSurveyState();
    setHasDraft(false);
    setPhase("intro");
  };

  const handleSelectAnswer = (questionKey: string, answerKey: string) => {
    if (phase === "results" || isSubmitted) return;
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

    if (currentStep === questions.length - 1) {
      setPhase("results");
      clearError();
      fetchPreviewResult();
      return;
    }

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    clearError();
    reachGoal(YM_GOALS.DIAGNOSTIC_STEP, { step: nextStep + 1, total: questions.length });
  };

  const goToPreviousStep = () => {
    if (phase === "results") {
      return;
    }

    setCurrentStep((prev) => Math.max(prev - 1, 0));
    clearError();
  };

  const goToStep = (index: number) => {
    if (index < 0 || index >= questions.length) return;

    if (phase === "results") return;
    setCurrentStep(index);
    clearError();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fullName = respondent.fullName.trim();
    const email = respondent.email.trim();
    const phone = respondent.phone.trim();

    const validation = validateDiagnosticContact({
      fullName,
      email,
      consent: consentAccepted,
    });
    if (validation) {
      setStatus("error");
      setErrorMessage(validation);
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/diagnostics/${campaignSlug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionKey,
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
      setEmailDeliveryStatus(payload.data.emailDeliveryStatus);
      setSubmissionDocumentId(payload.data.documentId ?? submissionDocumentId);
      setStatus("success");
      reachGoal(YM_GOALS.DIAGNOSTIC_COMPLETE, getUtmParams());
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
    emailDeliveryStatus,
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
