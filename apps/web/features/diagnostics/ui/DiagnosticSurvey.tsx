"use client";

import { useEffect, useId, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Lightbulb,
  PlayCircle,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { DiagnosticPublicQuestion } from "@/shared/api/types/diagnostic";
import type { DiagnosticResult, DiagnosticResultInsight } from "@/shared/api/types/diagnostic";
import { useDiagnosticSurvey } from "../hooks/useDiagnosticSurvey";

interface DiagnosticSurveyProps {
  campaignSlug: string;
  campaignTitle: string;
  organizationName: string;
  testTitle: string;
  questions: DiagnosticPublicQuestion[];
}

const inputClass = cn(
  "w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3.5",
  "text-[#0F172A] placeholder:text-[#94A3B8]",
  "focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[rgba(59,130,246,0.15)]",
  "transition-all duration-150"
);

/** Card container: edge-to-edge on mobile, rounded with shadow on md+ */
const cardClass = cn(
  "-mx-4 bg-white p-4",
  "md:mx-0 md:rounded-2xl md:border md:border-[#E2E8F0]/80 md:shadow-[0_18px_56px_rgba(15,23,42,0.08)]"
);

const primaryCtaClass = cn(
  "inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-white transition-all duration-150",
  "bg-[#5485d5] hover:bg-[#4874c4] hover:shadow-[0_4px_12px_rgba(84,133,213,0.3)] active:bg-[#3d65b3]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
);

const primaryCtaLargeClass = cn(primaryCtaClass, "px-8 py-3.5");
const primaryCtaCompactClass = cn(primaryCtaClass, "px-6 py-3");

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
/*  Skeleton placeholder                                               */
/* ------------------------------------------------------------------ */
function SurveySkeleton() {
  return (
    <div className="relative text-[#0F172A]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -top-20 bg-[#F8FAFC]" />
      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 md:px-6 lg:pt-24 lg:pb-24">
        <div className="mb-8 text-center lg:mb-10">
          <div className="mx-auto h-10 w-3/4 animate-pulse rounded-lg bg-[#E2E8F0]" />
        </div>
        <div className="mx-auto max-w-2xl">
          <div className={cn(cardClass, "p-6")}>
            <div className="space-y-4">
              <div className="h-6 w-1/2 animate-pulse rounded bg-[#E2E8F0]" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#E2E8F0]" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-[#E2E8F0]" />
              <div className="mt-6 h-12 w-40 animate-pulse rounded-xl bg-[#E2E8F0]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated counter                                                   */
/* ------------------------------------------------------------------ */
function useAnimatedCount(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

/* ------------------------------------------------------------------ */
/*  Score tone (0-35 red, 36-70 yellow, 71-100 green)                  */
/* ------------------------------------------------------------------ */
function scoreTone(percent: number) {
  if (percent <= 40) return "red" as const;
  if (percent <= 70) return "yellow" as const;
  return "green" as const;
}

const scoreCircleStyles = {
  red:    "border-[#E2969C]/60 bg-[#FDF0F1]/60",
  yellow: "border-[#D4B678]/60 bg-[#FBF4E8]/60",
  green:  "border-[#7DB8A4]/60 bg-[#EDF6F2]/60",
} as const;

const scoreNumberColor = {
  red:    "text-[#C2555E]",
  yellow: "text-[#9A7530]",
  green:  "text-[#3D7D65]",
} as const;

/* ------------------------------------------------------------------ */
/*  Insight card (accordion)                                           */
/* ------------------------------------------------------------------ */
function insightTone(weight: number) {
  if (weight <= 3) return "red" as const;
  if (weight <= 6) return "yellow" as const;
  return "green" as const;
}

const toneBorder = {
  red:    { closed: "border-[#E2969C]/40", open: "border-[#C9686F]/40 shadow-[0_4px_16px_rgba(194,85,94,0.10)]" },
  yellow: { closed: "border-[#D4B678]/40", open: "border-[#BF9A4E]/40 shadow-[0_4px_16px_rgba(191,154,78,0.10)]" },
  green:  { closed: "border-[#7DB8A4]/40", open: "border-[#549479]/40 shadow-[0_4px_16px_rgba(84,148,121,0.10)]" },
} as const;

const toneBadge = {
  red:    { closed: "bg-[#FDF0F1] text-[#A84850]", open: "bg-[#C2555E] text-white" },
  yellow: { closed: "bg-[#FBF4E8] text-[#856428]", open: "bg-[#9A7530] text-white" },
  green:  { closed: "bg-[#EDF6F2] text-[#2F6B52]", open: "bg-[#3D7D65] text-white" },
} as const;

const toneBg = {
  red:    "bg-[#FCECED]/50",
  yellow: "bg-[#FAF2E5]/50",
  green:  "bg-[#ECF5F0]/50",
} as const;

function InsightCard({
  insight,
  index,
  isOpen,
  onToggle,
}: {
  insight: DiagnosticResultInsight;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const tone = insightTone(insight.weight);

  return (
    <div
      className={cn(
        "rounded-xl border bg-white transition-all duration-300 overflow-hidden",
        isOpen ? toneBorder[tone].open : toneBorder[tone].closed,
        !isOpen && "hover:shadow-sm"
      )}
    >
      {/* ---- Top: badge + question + answer + chevron ---- */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 px-5 py-4 text-left"
      >
        <span
          className={cn(
            "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors",
            isOpen ? toneBadge[tone].open : toneBadge[tone].closed
          )}
        >
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#94A3B8]">
            {insight.questionTitle}
          </p>
          <p className="mt-1.5 text-sm text-[#475569]">
            <span className="font-medium text-[#1E3A5F]">Ваш ответ:</span>{" "}
            {insight.answerLabel}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "mt-1 h-5 w-5 shrink-0 text-[#94A3B8] transition-transform duration-300",
            isOpen && "rotate-180 text-[#3B82F6]"
          )}
          aria-hidden="true"
        />
      </button>

      {/* ---- Divider (edge-to-edge) ---- */}
      <div className="h-px bg-[#E2E8F0]/70" />

      {/* ---- Insight title (edge-to-edge, clickable) ---- */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-3 text-left"
      >
        <h4 className="text-[15px] font-semibold leading-snug text-[#1E3A5F]">
          {insight.insightTitle}
        </h4>
      </button>

      {/* ---- Expanded body ---- */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          {/* Insight text */}
          <div className="px-5 pb-4">
            <p className="text-sm leading-6 text-[#475569]">
              {insight.insightText}
            </p>
          </div>

          {/* Practice step — edge-to-edge banner */}
          <div className={cn("border-t border-[#E2E8F0]/60 px-5 py-4", toneBg[tone])}>
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#3B82F6]" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">
                  Практический шаг
                </p>
                <p className="mt-1 text-sm leading-6 text-[#1E3A5F]">
                  {insight.practiceStep}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Result display (score + band + insights)                           */
/* ------------------------------------------------------------------ */
function DiagnosticResultDisplay({ result }: { result: DiagnosticResult }) {
  const [openInsight, setOpenInsight] = useState<number>(0);
  const animatedScore = useAnimatedCount(result.scorePercent);
  const tone = scoreTone(result.scorePercent);

  const toggleInsight = useCallback((index: number) => {
    setOpenInsight((prev) => (prev === index ? -1 : index));
  }, []);

  return (
    <div>
      {/* Score */}
      <div className="text-center">
        <div className={cn("mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 transition-colors duration-700", scoreCircleStyles[tone])}>
          <div>
            <span className={cn("text-4xl font-bold tabular-nums transition-colors duration-700", scoreNumberColor[tone])}>{animatedScore}</span>
            <span className="block text-sm text-[#94A3B8]">из 100</span>
          </div>
        </div>

        {result.band ? (
          <>
            <h2 className="mt-6 text-2xl font-semibold tracking-tight text-[#1E3A5F] md:text-3xl">
              {result.band.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-[#475569]">
              {result.band.summary}
            </p>
            {result.band.ctaLabel && result.band.ctaHref && (
              <Link
                href={result.band.ctaHref}
                className={cn("mt-6", primaryCtaLargeClass)}
              >
                {result.band.ctaLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </>
        ) : (
          <>
            <h2 className="mt-6 text-2xl font-semibold tracking-tight text-[#1E3A5F] md:text-3xl">
              Результаты готовы
            </h2>
            <p className="mt-4 text-base leading-7 text-[#475569]">
              Подробный анализ будет доступен после настройки диагностики.
              При необходимости специалисты НЦФГ свяжутся с вами по указанным контактам.
            </p>
          </>
        )}
      </div>

      {/* Insight cards */}
      {result.insights.length > 0 && (
        <div className="mt-10 text-left">
          <h3 className="text-xl font-semibold text-[#1E3A5F] md:text-2xl">
            Персональные рекомендации
          </h3>
          <p className="mt-2 text-sm text-[#475569]">
            На основе ваших ответов
          </p>
          <div className="mt-6 space-y-3">
            {result.insights.map((insight, index) => (
              <InsightCard
                key={insight.questionKey}
                insight={insight}
                index={index}
                isOpen={openInsight === index}
                onToggle={() => toggleInsight(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Result skeleton (loading state)                                    */
/* ------------------------------------------------------------------ */
function ResultSkeleton() {
  return (
    <div className="text-center">
      {/* Score circle skeleton */}
      <div className="mx-auto flex h-28 w-28 animate-pulse items-center justify-center rounded-full border-4 border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="h-10 w-14 rounded bg-[#E2E8F0]" />
      </div>
      <div className="mx-auto mt-6 h-8 w-2/3 animate-pulse rounded-lg bg-[#E2E8F0]" />
      <div className="mx-auto mt-4 h-4 w-3/4 animate-pulse rounded bg-[#E2E8F0]" />
      <div className="mx-auto mt-2 h-4 w-1/2 animate-pulse rounded bg-[#E2E8F0]" />

      {/* Insight skeletons */}
      <div className="mt-10 space-y-3 text-left">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-[#E2E8F0]/80 bg-[#F8FAFC] p-5">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 animate-pulse rounded-lg bg-[#E2E8F0]" />
              <div className="h-3 w-24 animate-pulse rounded bg-[#E2E8F0]" />
            </div>
            <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-[#E2E8F0]" />
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-[#E2E8F0]" />
            <div className="mt-1 h-4 w-3/4 animate-pulse rounded bg-[#E2E8F0]" />
          </div>
        ))}
      </div>
    </div>
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
}: DiagnosticSurveyProps) {
  const survey = useDiagnosticSurvey({ campaignSlug, questions });
  const consentId = useId();
  const errorId = useId();
  const [stepKey, setStepKey] = useState(0);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
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
    goToNextStep: rawGoToNextStep,
    goToPreviousStep: rawGoToPreviousStep,
    goToStep: rawGoToStep,
    handleSubmit,
    startFresh,
    continueDraft,
    startFromIntro,
  } = survey;

  const goToNextStep = () => {
    if (currentQuestion && answers[currentQuestion.key]) {
      setStepKey((k) => k + 1);
      setHasNavigated(true);
    }
    rawGoToNextStep();
  };

  const goToPreviousStep = () => {
    if (phase === "results" || isSubmitted) return;
    rawGoToPreviousStep();
    setStepKey((k) => k + 1);
    setHasNavigated(true);
  };

  const goToStep = (index: number) => {
    if (phase === "results" || isSubmitted) return;
    rawGoToStep(index);
    setStepKey((k) => k + 1);
    setHasNavigated(true);
    setSidebarOpen(false);
  };

  const handleStartFresh = () => {
    startFresh();
    setStepKey(0);
    setHasNavigated(false);
    setSidebarOpen(false);
  };

  const handleContinueDraft = () => {
    continueDraft();
    setStepKey(0);
    setHasNavigated(false);
    setSidebarOpen(false);
  };

  const handleStartFromIntro = () => {
    startFromIntro();
    setStepKey(0);
    setHasNavigated(false);
    setSidebarOpen(false);
  };

  /* ---- Scroll to top on phase change to results or on submit ---- */
  useEffect(() => {
    if (phase === "results" || isSubmitted) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [phase, isSubmitted]);

  /* ---- SSR skeleton ---- */
  if (!isHydrated) {
    return <SurveySkeleton />;
  }

  const estimatedMinutes = Math.ceil(questions.length * 0.5);
  const showSidebar = phase === "survey" || phase === "results";
  const areAnswersLocked = phase === "results" || isSubmitted;

  // The result to display: canonical (from submit) takes priority over preview
  const displayResult = isSubmitted && result ? result : previewResult;

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
        {/*  INTRO SCREEN                                                */}
        {/* ============================================================ */}
        {phase === "intro" && (
          <div className="mx-auto max-w-2xl animate-[cardIn_0.35s_ease-out]">
            <div className={cn(cardClass, "p-6 md:p-8")}>
              <div className="text-center">
                <p className="text-lg font-medium text-[#475569]">{campaignTitle}</p>
                <p className="mt-1 text-base text-[#94A3B8]">{organizationName}</p>

                <div className="mt-6 inline-flex items-center gap-4 rounded-xl border border-[#E2E8F0]/80 bg-[#F8FAFC] px-5 py-3 text-sm text-[#475569]">
                  <span className="font-semibold text-[#1E3A5F]">
                    {questions.length} {questions.length === 1 ? "вопрос" : questions.length < 5 ? "вопроса" : "вопросов"}
                  </span>
                  <span className="h-4 w-px bg-[#E2E8F0]" />
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
                    ~{estimatedMinutes} мин
                  </span>
                </div>

                <p className="mt-6 text-base leading-7 text-[#475569]">
                  Ответьте на вопросы, чтобы получить рекомендации по улучшению вашего финансового благополучия.
                </p>

                <div className="mt-8 flex flex-col items-center gap-3">
                  {hasDraft ? (
                    <>
                      <button
                        type="button"
                        onClick={handleContinueDraft}
                        className={primaryCtaLargeClass}
                      >
                        <PlayCircle className="h-4 w-4" aria-hidden="true" />
                        Продолжить
                      </button>
                      <button
                        type="button"
                        onClick={handleStartFresh}
                        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-[#475569] transition-colors hover:bg-[#3B82F6]/[0.06] hover:text-[#1E3A5F]"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        Начать заново
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartFresh}
                      className={primaryCtaLargeClass}
                    >
                      Начать
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/*  SURVEY + RESULTS PHASE                                      */}
        {/* ============================================================ */}
        {(phase === "survey" || phase === "results") && (
          <>
            {/* ---- MOBILE: collapsible progress header ---- */}
            <div className="mb-6 lg:hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen((o) => !o)}
                className="-mx-4 flex w-[calc(100%+2rem)] items-center justify-between bg-white px-5 py-4 md:mx-0 md:w-full md:rounded-2xl md:border md:border-[#E2E8F0]/80 md:shadow-[0_18px_56px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#3B82F6]/40 bg-[#3B82F6]/10 text-xs font-semibold text-[#3B82F6]">
                    {answeredCount}/{questions.length}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-[#1E3A5F]">{testTitle}</div>
                    <div className="text-xs text-[#475569]">
                      {phase === "results"
                        ? "Результат"
                        : `Вопрос ${Math.min(currentStep + 1, questions.length)} из ${questions.length}`}
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
                <div className={cn(cardClass, "mt-3 space-y-2 p-4 animate-[cardIn_0.25s_ease-out]")}>
                  {questions.map((question, index) => {
                    const stepState =
                      answers[question.key]
                        ? "done"
                        : phase === "survey" && currentStep === index
                          ? "active"
                          : "pending";

                    return (
                      <button
                        key={question.key}
                        type="button"
                        onClick={() => goToStep(index)}
                        disabled={areAnswersLocked}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                          areAnswersLocked && "opacity-60 cursor-default",
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

                  {/* Result step (mobile sidebar) */}
                  <div
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
                      phase === "results"
                        ? "bg-[#3B82F6]/[0.06] border border-[#3B82F6]/30"
                        : "border border-transparent"
                    )}
                  >
                    <StepDot
                      state={
                        isSubmitted
                          ? "done"
                          : phase === "results"
                            ? "active"
                            : answeredCount === questions.length
                              ? "done"
                              : "pending"
                      }
                    />
                    <span
                      className={cn(
                        "min-w-0 truncate text-sm",
                        phase === "results" ? "text-[#1E3A5F]" : "text-[#94A3B8]"
                      )}
                    >
                      Результат
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ---- DESKTOP: two-column layout ---- */}
            <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
              {/* ---------- LEFT SIDEBAR (desktop only) ---------- */}
              {showSidebar && (
                <aside className="hidden lg:sticky lg:top-24 lg:block">
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
                            : phase === "survey" && currentStep === index
                              ? "active"
                              : "pending";

                        return (
                          <button
                            key={question.key}
                            type="button"
                            onClick={() => goToStep(index)}
                            disabled={areAnswersLocked}
                            className={cn(
                              "group flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200",
                              areAnswersLocked && "opacity-60 cursor-default",
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

                      {/* Result step */}
                      <div
                        className={cn(
                          "group flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200",
                          phase === "results" && !isSubmitted
                            ? "border-[#3B82F6]/30 bg-[#3B82F6]/[0.06]"
                            : isSubmitted
                              ? "border-[#E2E8F0]/80 bg-[#F8FAFC] opacity-60"
                              : "border-transparent bg-transparent"
                        )}
                      >
                        <StepDot
                          state={
                            isSubmitted
                              ? "done"
                              : phase === "results"
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
                              phase === "results" ? "text-[#3B82F6]" : "text-[#94A3B8]"
                            )}
                          >
                            Финал
                          </div>
                          <div
                            className={cn(
                              "mt-0.5 text-sm leading-5",
                              phase === "results" ? "text-[#1E3A5F]" : "text-[#94A3B8]"
                            )}
                          >
                            Результат
                          </div>
                        </div>
                      </div>
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
              )}

              {/* ---------- RIGHT: main content ---------- */}
              <div className={cn("min-w-0", !showSidebar && "lg:col-span-2")}>
                {/* ============================================ */}
                {/*  RESULTS PHASE                               */}
                {/* ============================================ */}
                {phase === "results" ? (
                  <div className="space-y-6 animate-[cardIn_0.35s_ease-out]">
                    {/* Card 1: Results */}
                    <div className={cn(cardClass, "p-4 md:p-6")}>
                      {previewStatus === "loading" ? (
                        <ResultSkeleton />
                      ) : previewStatus === "error" ? (
                        <div className="text-center py-8">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-200 bg-red-50">
                            <AlertCircle className="h-8 w-8 text-red-400" aria-hidden="true" />
                          </div>
                          <h2 className="mt-4 text-xl font-semibold text-[#1E3A5F]">
                            Не удалось загрузить результаты
                          </h2>
                          <p className="mt-2 text-sm text-[#475569]">{errorMessage}</p>
                          <div className="mt-6 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => fetchPreviewResult()}
                              className={primaryCtaCompactClass}
                            >
                              <RotateCcw className="h-4 w-4" aria-hidden="true" />
                              Попробовать снова
                            </button>
                          </div>
                        </div>
                      ) : displayResult ? (
                        <DiagnosticResultDisplay result={displayResult} />
                      ) : null}
                    </div>

                    {/* Card 2: Contact form (only when preview is successful) */}
                    {(previewStatus === "success" || isSubmitted) && (
                      <div className={cn(cardClass, "p-4 md:p-6 animate-[cardIn_0.35s_ease-out]")}>
                        {isSubmitted ? (
                          /* ---- Submitted confirmation ---- */
                          <div className="text-center py-4">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-200 bg-green-50">
                              <CheckCircle2 className="h-8 w-8 text-green-500" aria-hidden="true" />
                            </div>
                            <h2 className="mt-4 text-xl font-semibold text-[#1E3A5F]">
                              Данные сохранены
                            </h2>
                            <div className="mt-6">
                              <button
                                type="button"
                                onClick={handleStartFromIntro}
                                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-[#475569] transition-colors hover:bg-[#3B82F6]/[0.06] hover:text-[#1E3A5F]"
                              >
                                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                                Пройти заново
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ---- Contact form ---- */
                          <form onSubmit={handleSubmit}>
                            <h2 className="text-2xl font-semibold tracking-tight text-[#1E3A5F] md:text-3xl">
                              Контактные данные
                            </h2>
                            <p className="mt-3 text-base leading-7 text-[#475569]">
                              Заполните форму, чтобы получить результаты на почту
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
                              <p className="text-sm leading-6 text-[#94A3B8]">
                                После перехода к результату ответы фиксируются.
                              </p>
                              <button
                                type="submit"
                                disabled={status === "submitting"}
                                className={cn(primaryCtaCompactClass, "disabled:opacity-60")}
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
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* ============================================ */
                  /*  SURVEY PHASE — questions                     */
                  /* ============================================ */
                  <div>
                    <div
                      key={`step-${stepKey}`}
                      className={cn(
                        cardClass,
                        "p-4 md:p-6",
                        hasNavigated && "animate-[cardIn_0.35s_ease-out]"
                      )}
                    >
                      {currentQuestion ? (
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
                              className={primaryCtaCompactClass}
                            >
                              {currentStep === questions.length - 1
                                ? "К результатам"
                                : "Далее"}
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      ) : null}
                    </div>

                    {/* Privacy note (mobile only, survey phase) */}
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
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
