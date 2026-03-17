"use client";

import { useId, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Send,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { DiagnosticPublicQuestion } from "@/shared/api/types/diagnostic";
import { useDiagnosticSurvey } from "../hooks/useDiagnosticSurvey";

interface DiagnosticSurveyProps {
  campaignSlug: string;
  campaignTitle: string;
  organizationName: string;
  testTitle: string;
  questions: DiagnosticPublicQuestion[];
  demoMode?: boolean;
}

const inputClass = cn(
  "w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3.5",
  "text-[#0F172A] placeholder:text-[#94A3B8]",
  "focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[rgba(59,130,246,0.15)]",
  "transition-all duration-150"
);

/* ------------------------------------------------------------------ */
/*  Sidebar step dot                                                   */
/* ------------------------------------------------------------------ */
function StepDot({ state }: { state: "active" | "done" | "pending" }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
        state === "done" && "border-[#3B82F6] bg-[#3B82F6] text-white",
        state === "active" && "border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]",
        state === "pending" && "border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]"
      )}
    >
      {state === "done" ? (
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      ) : null}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export function DiagnosticSurvey({
  campaignSlug,
  campaignTitle,
  organizationName,
  testTitle,
  questions,
  demoMode,
}: DiagnosticSurveyProps) {
  const survey = useDiagnosticSurvey({ campaignSlug, questions, demoMode });
  const consentId = useId();
  const errorId = useId();
  const [stepKey, setStepKey] = useState(0);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
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
    goToNextStep: rawGoToNextStep,
    goToPreviousStep: rawGoToPreviousStep,
    goToStep: rawGoToStep,
    handleSubmit,
  } = survey;

  const goToNextStep = () => {
    if (currentQuestion && answers[currentQuestion.key]) {
      setStepKey((k) => k + 1);
      setHasNavigated(true);
    }
    rawGoToNextStep();
  };

  const goToPreviousStep = () => {
    rawGoToPreviousStep();
    setStepKey((k) => k + 1);
    setHasNavigated(true);
  };

  const goToStep = (index: number) => {
    rawGoToStep(index);
    setStepKey((k) => k + 1);
    setHasNavigated(true);
    setSidebarOpen(false);
  };

  return (
    <div className="relative text-[#0F172A]">
      {/* Background extending behind the sticky header */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -top-20 bg-[#F8FAFC]" />
      {/* Animated background blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -top-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,rgba(30,58,95,0.20)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,58,95,0.20)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute -top-40 left-[15%] h-[500px] w-[500px] rounded-full bg-[#3B82F6]/14 blur-3xl animate-[blobDrift_18s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 right-[10%] h-[600px] w-[600px] rounded-full bg-[#58A8E0]/12 blur-3xl animate-[blobDrift_22s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 md:px-6 lg:pt-24 lg:pb-24">
        {/* ============================================================ */}
        {/*  Page heading                                                */}
        {/* ============================================================ */}
        <div className="mb-8 text-center lg:mb-10">
          <h1 className="text-[28px] md:text-4xl lg:text-[48px] font-bold text-[#1E3A5F] leading-tight tracking-tight">
            {testTitle}
          </h1>
        </div>

        {/* ============================================================ */}
        {/*  MOBILE: collapsible progress header                         */}
        {/* ============================================================ */}
        <div className="mb-6 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-2xl border border-[#E2E8F0]/80 bg-white px-5 py-4 shadow-[0_18px_56px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#3B82F6]/40 bg-[#3B82F6]/10 text-xs font-semibold text-[#3B82F6]">
                {answeredCount}/{questions.length}
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-[#1E3A5F]">{testTitle}</div>
                <div className="text-xs text-[#475569]">
                  Вопрос {Math.min(currentStep + 1, questions.length)} из{" "}
                  {questions.length}
                </div>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-[#94A3B8] transition-transform duration-200",
                sidebarOpen && "rotate-180"
              )}
            />
          </button>

          {sidebarOpen && (
            <div className="mt-3 space-y-2 rounded-2xl border border-[#E2E8F0]/80 bg-white p-4 shadow-[0_18px_56px_rgba(15,23,42,0.08)] animate-[cardIn_0.25s_ease-out]">
              {questions.map((question, index) => {
                const stepState =
                  answers[question.key]
                    ? "done"
                    : currentStep === index
                      ? "active"
                      : "pending";

                return (
                  <button
                    key={question.key}
                    type="button"
                    onClick={() => goToStep(index)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      stepState === "active"
                        ? "bg-[#3B82F6]/[0.06] border border-[#3B82F6]/30"
                        : "border border-transparent hover:bg-[#3B82F6]/[0.06]"
                    )}
                  >
                    <StepDot state={stepState} />
                    <span
                      className={cn(
                        "min-w-0 truncate text-sm",
                        stepState === "active"
                          ? "text-[#1E3A5F]"
                          : stepState === "done"
                            ? "text-[#475569]"
                            : "text-[#94A3B8]"
                      )}
                    >
                      {question.title}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/*  DESKTOP: two-column layout                                  */}
        {/* ============================================================ */}
        <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
          {/* ---------- LEFT SIDEBAR (desktop only) ---------- */}
          <aside className="hidden lg:sticky lg:top-8 lg:block">
            <div className="rounded-2xl border border-[#E2E8F0]/80 bg-white p-4 shadow-[0_18px_56px_rgba(15,23,42,0.08)]">
              <p className="text-lg font-medium leading-7 text-[#475569]">
                {campaignTitle}
              </p>
              <p className="mt-1 text-lg leading-7 text-[#94A3B8]">
                {organizationName}
              </p>

              {/* Progress bar */}
              <div className="mt-6 rounded-xl border border-[#E2E8F0]/80 bg-[#F8FAFC] p-3">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-[#475569]">Заполнено</span>
                  <span className="font-semibold text-[#1E3A5F]">
                    {answeredCount} из {questions.length}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#3B82F6_0%,#58A8E0_100%)] transition-[width] duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Question list */}
              <nav className="mt-6 space-y-2" aria-label="Навигация по вопросам">
                {questions.map((question, index) => {
                  const stepState =
                    answers[question.key]
                      ? "done"
                      : currentStep === index
                        ? "active"
                        : "pending";

                  return (
                    <button
                      key={question.key}
                      type="button"
                      onClick={() => goToStep(index)}
                      className={cn(
                        "group flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200",
                        stepState === "active"
                          ? "border-[#3B82F6]/30 bg-[#3B82F6]/[0.06]"
                          : stepState === "done"
                            ? "border-[#E2E8F0]/80 bg-[#F8FAFC] hover:bg-[#3B82F6]/[0.04]"
                            : "border-transparent bg-transparent hover:bg-[#F8FAFC]"
                      )}
                      aria-current={stepState === "active" ? "step" : undefined}
                    >
                      <StepDot state={stepState} />
                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-[0.18em]",
                            stepState === "active"
                              ? "text-[#3B82F6]"
                              : "text-[#94A3B8]"
                          )}
                        >
                          Вопрос {index + 1}
                        </div>
                        <div
                          className={cn(
                            "mt-0.5 line-clamp-2 text-sm leading-5",
                            stepState === "active"
                              ? "text-[#1E3A5F]"
                              : stepState === "done"
                                ? "text-[#475569]"
                                : "text-[#94A3B8]"
                          )}
                        >
                          {question.title}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Contact step */}
                <button
                  type="button"
                  onClick={() => goToStep(questions.length)}
                  className={cn(
                    "group flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200",
                    isContactStep
                      ? "border-[#3B82F6]/30 bg-[#3B82F6]/[0.06]"
                      : status === "success"
                        ? "border-[#E2E8F0]/80 bg-[#F8FAFC]"
                        : "border-transparent bg-transparent hover:bg-[#F8FAFC]"
                  )}
                  aria-current={isContactStep ? "step" : undefined}
                >
                  <StepDot
                    state={
                      status === "success" || isContactStep
                        ? "active"
                        : answeredCount === questions.length
                          ? "done"
                          : "pending"
                    }
                  />
                  <div className="min-w-0">
                    <div
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-[0.18em]",
                        isContactStep ? "text-[#3B82F6]" : "text-[#94A3B8]"
                      )}
                    >
                      Финал
                    </div>
                    <div
                      className={cn(
                        "mt-0.5 text-sm leading-5",
                        isContactStep ? "text-[#1E3A5F]" : "text-[#94A3B8]"
                      )}
                    >
                      Контактные данные
                    </div>
                  </div>
                </button>
              </nav>

              {/* Privacy note */}
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/[0.04] p-4 text-sm leading-6 text-[#475569]">
                <ShieldCheck
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#3B82F6]"
                  aria-hidden="true"
                />
                <span>
                  Результаты сохраняются только для внутренней аналитики и связи
                  по итогам диагностики.
                </span>
              </div>
            </div>
          </aside>

          {/* ---------- RIGHT: main content ---------- */}
          <div className="min-w-0">
            <div
              key={status === "success" ? "success" : `step-${stepKey}`}
              className={cn(
                "rounded-2xl border border-[#E2E8F0]/80 bg-white p-4 shadow-[0_18px_56px_rgba(15,23,42,0.08)] md:p-6",
                hasNavigated && "animate-[cardIn_0.35s_ease-out]"
              )}
            >

              {/* ---- SUCCESS ---- */}
              {status === "success" ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10B981]/10 text-[#10B981]">
                    <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold tracking-tight text-[#1E3A5F] md:text-3xl">
                    Диагностика сохранена
                  </h2>
                  <p className="mt-4 text-base leading-7 text-[#475569]">
                    Спасибо за ваши ответы. При необходимости специалисты НЦФГ
                    свяжутся с вами по указанным контактам.
                  </p>
                </>
              ) : isContactStep ? (
                /* ---- CONTACT FORM ---- */
                <form onSubmit={handleSubmit}>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">
                    Завершение
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1E3A5F] md:text-3xl">
                    Контактные данные
                  </h2>
                  <p className="mt-3 text-base leading-7 text-[#475569]">
                    Заполните форму, чтобы мы связали ответы с участником.
                  </p>

                  {status === "error" && (
                    <div
                      id={errorId}
                      role="alert"
                      aria-live="polite"
                      className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
                    >
                      <AlertCircle
                        className="mt-0.5 h-5 w-5 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-sm leading-6">{errorMessage}</span>
                    </div>
                  )}

                  <div className="mt-8 space-y-5">
                    <div>
                      <label
                        className="mb-2 block text-sm font-medium text-[#1E3A5F]"
                        htmlFor="d-fullName"
                      >
                        ФИО <span className="text-[#3B82F6]">*</span>
                      </label>
                      <input
                        id="d-fullName"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        className={inputClass}
                        value={respondent.fullName}
                        onChange={handleRespondentChange}
                        aria-describedby={
                          status === "error" ? errorId : undefined
                        }
                        placeholder="Иван Петров"
                      />
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label
                          className="mb-2 block text-sm font-medium text-[#1E3A5F]"
                          htmlFor="d-email"
                        >
                          Email <span className="text-[#3B82F6]">*</span>
                        </label>
                        <input
                          id="d-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          className={inputClass}
                          value={respondent.email}
                          onChange={handleRespondentChange}
                          aria-describedby={
                            status === "error" ? errorId : undefined
                          }
                          placeholder="ivan@company.ru"
                        />
                      </div>
                      <div>
                        <label
                          className="mb-2 block text-sm font-medium text-[#1E3A5F]"
                          htmlFor="d-phone"
                        >
                          Телефон
                        </label>
                        <input
                          id="d-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          className={inputClass}
                          value={respondent.phone}
                          onChange={handleRespondentChange}
                          placeholder="+7 (999) 123-45-67"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-[#E2E8F0]/80 bg-[#F8FAFC] p-4">
                    <div className="flex items-start gap-3">
                      <input
                        id={consentId}
                        type="checkbox"
                        checked={consentAccepted}
                        onChange={(e) => handleConsentChange(e.target.checked)}
                        className="mt-0.5 h-5 w-5 shrink-0 rounded border-[#E2E8F0] bg-white accent-[#3B82F6]"
                      />
                      <label
                        htmlFor={consentId}
                        className="text-sm leading-6 text-[#475569]"
                      >
                        Согласен(на) на обработку персональных данных и
                        принимаю{" "}
                        <Link
                          href="/politika-konfidencialnosti"
                          className="font-medium text-[#3B82F6] hover:underline"
                        >
                          политику конфиденциальности
                        </Link>
                        .
                      </label>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={goToPreviousStep}
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-[#475569] transition-colors hover:bg-[#3B82F6]/[0.06] hover:text-[#1E3A5F]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Назад
                    </button>
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#58A8E0] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#4A96CC] hover:shadow-[0_4px_12px_rgba(88,168,224,0.3)] disabled:opacity-60"
                    >
                      {status === "submitting" ? (
                        "Сохраняем..."
                      ) : (
                        <>
                          Завершить <Send className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : currentQuestion ? (
                /* ---- QUESTION ---- */
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">
                    Вопрос {currentStep + 1} из {questions.length}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1E3A5F] md:text-3xl">
                    {currentQuestion.title}
                  </h2>
                  {currentQuestion.description && (
                    <p className="mt-3 text-base leading-7 text-[#475569]">
                      {currentQuestion.description}
                    </p>
                  )}

                  {status === "error" && (
                    <div
                      id={errorId}
                      role="alert"
                      aria-live="polite"
                      className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
                    >
                      <AlertCircle
                        className="mt-0.5 h-5 w-5 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-sm leading-6">{errorMessage}</span>
                    </div>
                  )}

                  <div className="mt-8 space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected =
                        answers[currentQuestion.key] === option.key;

                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() =>
                            handleSelectAnswer(currentQuestion.key, option.key)
                          }
                          aria-pressed={isSelected}
                          className={cn(
                            "group relative w-full rounded-xl border px-5 py-4 text-left transition-all duration-200",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
                            isSelected
                              ? "border-[#3B82F6]/40 bg-[#3B82F6]/[0.06]"
                              : "border-[#E2E8F0]/70 bg-white hover:border-[#3B82F6]/30 hover:shadow-sm"
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <span
                              className={cn(
                                "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold transition-colors",
                                isSelected
                                  ? "border-[#3B82F6] bg-[#3B82F6] text-white"
                                  : "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]"
                              )}
                            >
                              {index + 1}
                            </span>
                            <span className="min-w-0 pt-0.5 text-base leading-7 text-[#1E3A5F]">
                              {option.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={goToPreviousStep}
                      disabled={currentStep === 0}
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-[#475569] transition-colors hover:bg-[#3B82F6]/[0.06] hover:text-[#1E3A5F] disabled:opacity-40"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Назад
                    </button>
                    <button
                      type="button"
                      onClick={goToNextStep}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#58A8E0] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#4A96CC] hover:shadow-[0_4px_12px_rgba(88,168,224,0.3)]"
                    >
                      {currentStep === questions.length - 1
                        ? "К контактам"
                        : "Далее"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : null}
            </div>

            {/* Privacy note (mobile only) */}
            {status !== "success" && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/[0.04] p-4 text-sm leading-6 text-[#475569] lg:hidden">
                <ShieldCheck
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#3B82F6]"
                  aria-hidden="true"
                />
                <span>
                  Результаты сохраняются только для внутренней аналитики и связи
                  по итогам диагностики.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
