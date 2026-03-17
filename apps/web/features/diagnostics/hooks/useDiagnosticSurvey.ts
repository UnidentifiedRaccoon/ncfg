"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import type { DiagnosticPublicQuestion } from "@/shared/api/types/diagnostic";
import { captureCurrentPageUrl } from "@/shared/lib/source-page";

export interface RespondentFormData {
  fullName: string;
  email: string;
  phone: string;
}

export type SubmitStatus = "idle" | "submitting" | "success" | "error";

interface UseDiagnosticSurveyOptions {
  campaignSlug: string;
  questions: DiagnosticPublicQuestion[];
  demoMode?: boolean;
}

export function useDiagnosticSurvey({
  campaignSlug,
  questions,
  demoMode,
}: UseDiagnosticSurveyOptions) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [respondent, setRespondent] = useState<RespondentFormData>({
    fullName: "",
    email: "",
    phone: "",
  });
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isContactStep = currentStep === questions.length;
  const currentQuestion = !isContactStep ? questions[currentStep] : null;
  const answeredCount = questions.filter((question) => Boolean(answers[question.key])).length;
  const progressPercent = questions.length
    ? Math.max(8, Math.round((answeredCount / questions.length) * 100))
    : 100;

  const clearError = () => {
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
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

    setCurrentStep((prev) => prev + 1);
    clearError();
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    clearError();
  };

  const goToStep = (index: number) => {
    if (index < 0 || index > questions.length) return;
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

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Не удалось сохранить результаты");
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Не удалось сохранить результаты"
      );
    }
  };

  return {
    currentStep,
    answers,
    respondent,
    consentAccepted,
    status,
    errorMessage,
    isContactStep,
    currentQuestion,
    answeredCount,
    progressPercent,
    handleSelectAnswer,
    handleRespondentChange,
    handleConsentChange,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    handleSubmit,
    clearError,
  };
}
