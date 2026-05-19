"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Gift,
  Info,
  Mail,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  getHrDiagnosticVisibleQuestions,
  validateHrDiagnosticQuestionAnswer,
  validateHrDiagnosticSubmission,
  type HrDiagnosticAnswerInput,
  type HrDiagnosticQuestion,
  type HrDiagnosticSegment,
  type HrDiagnosticTest,
} from "@/entities/HrDiagnostic";
import { captureCurrentPageUrl } from "@/shared/lib/source-page";
import { cn } from "@/shared/lib/cn";
import { getUtmParams } from "@/shared/lib/utm";
import { reachGoal, YM_GOALS } from "@/shared/lib/ym";

type Phase = "intro" | "survey" | "complete";
type SubmitStatus = "idle" | "submitting" | "success" | "error";

interface AnswerDraft {
  selectedOptionKeys: string[];
  otherText: string;
  text: string;
}

interface DraftState {
  phase: Phase;
  currentStep: number;
  answers: Record<string, AnswerDraft>;
  consentAccepted: boolean;
  submissionKey: string;
}

interface HrDiagnosticSubmitResponse {
  success: boolean;
  message: string;
  data: {
    targetSegment: HrDiagnosticSegment;
    submittedAt: string;
  };
  error?: string;
}

interface HrDiagnosticSurveyProps {
  test: HrDiagnosticTest;
}

const OTHER_OPTION_KEY = "other";
const EMPTY_ANSWER: AnswerDraft = {
  selectedOptionKeys: [],
  otherText: "",
  text: "",
};

const cardClass = cn(
  "-mx-4 bg-white p-4",
  "md:mx-0 md:rounded-2xl md:border md:border-[#E2E8F0]/80 md:shadow-[0_18px_56px_rgba(15,23,42,0.08)]"
);

const primaryCtaClass = cn(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all duration-150",
  "bg-[#5485d5] hover:bg-[#4874c4] hover:shadow-[0_4px_12px_rgba(84,133,213,0.3)] active:bg-[#3d65b3]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
  "disabled:pointer-events-none disabled:opacity-60"
);

const primaryCtaLargeClass = cn(primaryCtaClass, "px-8 py-3.5");
const primaryCtaCompactClass = cn(primaryCtaClass, "px-6 py-3");

const secondaryButtonClass = cn(
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium",
  "text-[#475569] transition-colors hover:bg-[#3B82F6]/[0.06] hover:text-[#1E3A5F]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
  "disabled:pointer-events-none disabled:opacity-40"
);

const inputClass = cn(
  "w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3.5",
  "text-[#0F172A] placeholder:text-[#94A3B8]",
  "focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[rgba(59,130,246,0.15)]",
  "transition-all duration-150"
);

function createSubmissionKey() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `hr-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 10)}`;
}

function createEmptyDraft(questionKeys: string[]): Record<string, AnswerDraft> {
  return Object.fromEntries(
    questionKeys.map((key) => [key, { ...EMPTY_ANSWER }])
  );
}

function toAnswerInputs(answers: Record<string, AnswerDraft>): HrDiagnosticAnswerInput[] {
  return Object.entries(answers).map(([questionKey, answer]) => ({
    questionKey,
    selectedOptionKeys: answer.selectedOptionKeys,
    otherText: answer.otherText,
    text: answer.text,
  }));
}

function loadDraft(draftKey: string): DraftState | null {
  try {
    const raw = localStorage.getItem(draftKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DraftState>;
    if (
      !parsed.answers ||
      typeof parsed.answers !== "object" ||
      typeof parsed.currentStep !== "number" ||
      typeof parsed.submissionKey !== "string"
    ) {
      return null;
    }

    return {
      phase: parsed.phase === "survey" ? "survey" : "intro",
      currentStep: parsed.currentStep,
      answers: parsed.answers,
      consentAccepted: Boolean(parsed.consentAccepted),
      submissionKey: parsed.submissionKey,
    };
  } catch {
    return null;
  }
}

function saveDraft(draftKey: string, state: DraftState) {
  try {
    localStorage.setItem(draftKey, JSON.stringify(state));
  } catch {
    // Ignore storage quota and private-mode failures.
  }
}

function clearDraft(draftKey: string) {
  try {
    localStorage.removeItem(draftKey);
  } catch {
    // Ignore storage failures.
  }
}

function scrollToSurveyTop() {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

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
      {state === "done" ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : null}
    </span>
  );
}

function isAnswered(question: HrDiagnosticQuestion, answer: AnswerDraft | undefined) {
  if (!answer) return false;
  if (question.type === "email") {
    return answer.text.trim().length > 0;
  }

  return answer.selectedOptionKeys.length > 0;
}

function getGroupTitle(test: HrDiagnosticTest, questionKey: string) {
  return (
    test.groups.find((group) =>
      group.questions.some((question) => question.key === questionKey)
    )?.title ?? ""
  );
}

function getQuestionAnswerInput(
  question: HrDiagnosticQuestion,
  answer: AnswerDraft | undefined
): HrDiagnosticAnswerInput {
  return {
    questionKey: question.key,
    selectedOptionKeys: answer?.selectedOptionKeys ?? [],
    otherText: answer?.otherText,
    text: answer?.text,
  };
}

function getExclusiveOptionKeys(question: HrDiagnosticQuestion) {
  return new Set(
    question.options
      ?.filter((option) => option.exclusive)
      .map((option) => option.key) ?? []
  );
}

function IntroScreen({
  test,
  hasDraft,
  onStart,
  onContinue,
}: {
  test: HrDiagnosticTest;
  hasDraft: boolean;
  onStart: () => void;
  onContinue: () => void;
}) {
  const questionCount = test.groups.reduce(
    (count, group) => count + group.questions.length,
    0
  );
  const introBodyBlocks = (test.introBody ?? "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  const introGiftText = test.introGiftText ?? "Подарок. В конце анкеты вас ждёт приятный бонус.";

  return (
    <div className="mx-auto max-w-2xl animate-[cardIn_0.35s_ease-out]">
      <div className={cn(cardClass, "p-6 md:p-8")}>
        <div className="text-center">
          <p className="text-lg font-medium text-[#475569]">
            {test.projectTitle}
          </p>
          <div className="mt-6 inline-flex items-center gap-4 rounded-xl border border-[#E2E8F0]/80 bg-[#F8FAFC] px-5 py-3 text-sm text-[#475569]">
            <span className="font-semibold text-[#1E3A5F]">
              {questionCount} вопросов
            </span>
            <span className="h-4 w-px bg-[#E2E8F0]" />
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
              5-7 мин
            </span>
          </div>

          <div className="mt-7 space-y-4 text-left text-base leading-7 text-[#475569]">
            <p className="text-lg font-semibold leading-7 text-[#1E3A5F]">
              {test.introLead ??
                "Привет! Вы занимаетесь управлением персоналом или развитием сотрудников в своей компании?"}
            </p>
            {introBodyBlocks.map((block) => (
              <p key={block}>{block}</p>
            ))}
            <div className="flex items-start gap-3 rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/[0.04] p-4">
              <Gift className="mt-0.5 h-5 w-5 shrink-0 text-[#3B82F6]" aria-hidden="true" />
              <p>{introGiftText}</p>
            </div>
            <p className="text-sm text-[#64748B]">
              {test.anonymousNotice ??
                "Все ответы анонимны и используются только в обобщённом виде."}
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            {hasDraft ? (
              <>
                <button type="button" onClick={onContinue} className={primaryCtaLargeClass}>
                  Продолжить
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={onStart} className={secondaryButtonClass}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Начать заново
                </button>
              </>
            ) : (
              <button type="button" onClick={onStart} className={primaryCtaLargeClass}>
                Начать
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompletionScreen({
  test,
  segment,
  onRestart,
}: {
  test: HrDiagnosticTest;
  segment: HrDiagnosticSegment;
  onRestart: () => void;
}) {
  const isTarget = segment === "target";
  const completion = isTarget ? test.targetCompletion : test.nonTargetCompletion;
  const completionTitle = completion?.title ?? "Большое спасибо за участие!";
  const completionBody =
    completion?.body ??
    (isTarget
      ? "Ваши ответы помогут нам разработать реально полезные инструменты для HR-сообщества."
      : "Ваши ответы очень важны для нас. Мы учтём их в нашем исследовании.");
  const giftTitle =
    completion?.giftTitle ??
    (isTarget ? "Подарок. Обещанный бонус - книга в подарок!" : "В подарок - гайд");
  const giftBody =
    completion?.giftBody ??
    (isTarget
      ? "Мы приглашаем вас на короткое личное интервью - 45-60 минут онлайн. Хотим глубже разобраться в вашем опыте и задачах. Интервью - не продажа. Нас интересует ваш реальный опыт и мнение."
      : "Если вы хотите узнать о результатах исследования или материалах НЦФГ по теме финансового благополучия, напишите нам.");
  const ctaHref = completion?.ctaHref ?? (isTarget ? test.interviewHref : test.guideHref);
  const ctaLabel =
    completion?.ctaLabel ??
    (isTarget ? "Записаться на интервью и выбрать книгу" : "Получить гайд");
  const secondaryText = completion?.secondaryText;

  return (
    <div className="mx-auto max-w-2xl animate-[cardIn_0.35s_ease-out]">
      <div className={cn(cardClass, "p-6 md:p-8 text-center")}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-200 bg-green-50">
          <CheckCircle2 className="h-8 w-8 text-green-500" aria-hidden="true" />
        </div>

        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[#1E3A5F] md:text-3xl">
          {completionTitle}
        </h2>

        <p className="mt-4 text-base leading-7 text-[#475569]">{completionBody}</p>
        <div className="mt-6 rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/[0.04] p-5 text-left">
          <p className="font-semibold text-[#1E3A5F]">{giftTitle}</p>
          <p className="mt-2 text-sm leading-6 text-[#475569]">{giftBody}</p>
          {secondaryText ? (
            <p className="mt-2 text-sm leading-6 text-[#475569]">{secondaryText}</p>
          ) : null}
          {!isTarget && test.contactEmail ? (
            <p className="mt-2 text-sm leading-6 text-[#475569]">
              Контакт:{" "}
              <a
                className="font-medium text-[#3B82F6] hover:underline"
                href={`mailto:${test.contactEmail}`}
              >
                {test.contactEmail}
              </a>
              .
            </p>
          ) : null}
        </div>
        {ctaHref ? (
          <a href={ctaHref} className={cn("mt-7", primaryCtaLargeClass)}>
            {ctaLabel}
            {isTarget ? (
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Mail className="h-4 w-4" aria-hidden="true" />
            )}
          </a>
        ) : null}

        <button type="button" onClick={onRestart} className={cn("mt-5", secondaryButtonClass)}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Пройти заново
        </button>
      </div>
    </div>
  );
}

function QuestionOptions({
  question,
  answer,
  onSelectSingle,
  onToggleCheckbox,
  onOtherTextChange,
}: {
  question: HrDiagnosticQuestion;
  answer: AnswerDraft;
  onSelectSingle: (optionKey: string) => void;
  onToggleCheckbox: (optionKey: string) => void;
  onOtherTextChange: (value: string) => void;
}) {
  const inputName = useId();

  if (!question.options && !question.allowOther) {
    return null;
  }

  const options = [
    ...(question.options ?? []),
    ...(question.allowOther
      ? [{ key: OTHER_OPTION_KEY, label: question.otherLabel ?? "Другое" }]
      : []),
  ];

  return (
    <fieldset className="mt-8 space-y-3">
      <legend className="sr-only">{question.title}</legend>
      {options.map((option) => {
        const isSelected = answer.selectedOptionKeys.includes(option.key);
        const isCheckbox = question.type === "checkbox";

        return (
          <div key={option.key}>
            <label
              className={cn(
                "group flex cursor-pointer items-start gap-4 rounded-xl border px-4 py-4 text-left transition-all duration-200",
                "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#3B82F6]",
                isSelected
                  ? "border-[#3B82F6]/45 bg-[#3B82F6]/[0.06]"
                  : "border-[#E2E8F0] bg-white hover:border-[#3B82F6]/30 hover:bg-[#F8FAFC] hover:shadow-sm"
              )}
            >
              <input
                type={isCheckbox ? "checkbox" : "radio"}
                name={inputName}
                value={option.key}
                checked={isSelected}
                onChange={() =>
                  isCheckbox
                    ? onToggleCheckbox(option.key)
                    : onSelectSingle(option.key)
                }
                className="peer sr-only"
              />
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border-2 bg-white transition-colors",
                  isCheckbox ? "rounded-md" : "rounded-full",
                  isSelected
                    ? isCheckbox
                      ? "border-[#3B82F6] bg-[#3B82F6] text-white"
                      : "border-[#3B82F6] text-[#3B82F6]"
                    : "border-[#CBD5E1] text-transparent group-hover:border-[#3B82F6]"
                )}
                aria-hidden="true"
              >
                {isCheckbox ? (
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                ) : (
                  <span
                    className={cn(
                      "h-3 w-3 rounded-full transition-transform",
                      isSelected ? "scale-100 bg-[#3B82F6]" : "scale-0 bg-transparent"
                    )}
                  />
                )}
              </span>
              <span className="min-w-0 pt-0.5 text-base leading-7 text-[#1E3A5F]">
                {option.label}
              </span>
            </label>

            {option.key === OTHER_OPTION_KEY && isSelected ? (
              <input
                type="text"
                value={answer.otherText}
                onChange={(event) => onOtherTextChange(event.target.value)}
                className={cn(inputClass, "mt-3")}
                placeholder="Уточните ваш вариант"
              />
            ) : null}
          </div>
        );
      })}
    </fieldset>
  );
}

function EmailQuestion({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-8">
      <label className="sr-only" htmlFor="hr-email">
        Email
      </label>
      <input
        id="hr-email"
        type="email"
        autoComplete="email"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
        placeholder="hr@company.ru"
      />
    </div>
  );
}

function InlineErrorMessage({ id, message }: { id: string; message: string }) {
  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="text-sm leading-6">{message}</span>
    </div>
  );
}

function QuestionInfoMessage({ message }: { message: string }) {
  return (
    <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/[0.04] px-4 py-3 text-[#1E3A5F]">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#3B82F6]" aria-hidden="true" />
      <span className="text-sm font-medium leading-6">{message}</span>
    </div>
  );
}

export function HrDiagnosticSurvey({ test }: HrDiagnosticSurveyProps) {
  const questionKeys = useMemo(
    () => test.groups.flatMap((group) => group.questions.map((question) => question.key)),
    [test.groups]
  );
  const draftKey = `ncfg.hr-diagnostic.${test.slug}.draft`;
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerDraft>>(() =>
    createEmptyDraft(questionKeys)
  );
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [submissionKey, setSubmissionKey] = useState(() => createSubmissionKey());
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [completedSegment, setCompletedSegment] = useState<HrDiagnosticSegment>("non_target");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const consentId = useId();
  const errorId = useId();
  const hydrationDone = useRef(false);

  const answerInputs = useMemo(() => toAnswerInputs(answers), [answers]);
  const visibleQuestions = useMemo(
    () => getHrDiagnosticVisibleQuestions(test, answerInputs),
    [answerInputs, test]
  );
  const currentQuestion = visibleQuestions[currentStep] ?? null;
  const isFinalStep = currentStep >= visibleQuestions.length;
  const currentAnswer = currentQuestion
    ? answers[currentQuestion.key] ?? { ...EMPTY_ANSWER }
    : { ...EMPTY_ANSWER };
  const currentQuestionError = currentQuestion
    ? validateHrDiagnosticQuestionAnswer(
        currentQuestion,
        getQuestionAnswerInput(currentQuestion, currentAnswer)
      )
    : null;
  const hasCurrentAnswerInput =
    currentAnswer.selectedOptionKeys.length > 0 ||
    currentAnswer.text.trim().length > 0 ||
    currentAnswer.otherText.trim().length > 0;
  const shouldShowCurrentQuestionError = Boolean(
    currentQuestionError && (status === "error" || hasCurrentAnswerInput)
  );
  const currentInlineErrorMessage = shouldShowCurrentQuestionError
    ? currentQuestionError
    : null;
  const isNextDisabled = Boolean(currentQuestionError);
  const answeredCount = visibleQuestions.filter((question) =>
    isAnswered(question, answers[question.key])
  ).length;
  const progressPercent = visibleQuestions.length
    ? Math.max(8, Math.round((answeredCount / visibleQuestions.length) * 100))
    : 100;

  useEffect(() => {
    if (hydrationDone.current) return;
    hydrationDone.current = true;

    const draft = loadDraft(draftKey);
    if (draft) {
      setHasDraft(true);
    }
    setIsHydrated(true);
  }, [draftKey]);

  useEffect(() => {
    if (!isHydrated || phase !== "survey" || status === "success") return;
    saveDraft(draftKey, {
      phase,
      currentStep,
      answers,
      consentAccepted,
      submissionKey,
    });
  }, [answers, consentAccepted, currentStep, draftKey, isHydrated, phase, status, submissionKey]);

  useEffect(() => {
    if (currentStep > visibleQuestions.length) {
      setCurrentStep(visibleQuestions.length);
    }
  }, [currentStep, visibleQuestions.length]);

  const clearError = () => {
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const startFresh = () => {
    clearDraft(draftKey);
    setAnswers(createEmptyDraft(questionKeys));
    setCurrentStep(0);
    setConsentAccepted(false);
    setSubmissionKey(createSubmissionKey());
    setStatus("idle");
    setErrorMessage("");
    setHasDraft(false);
    setSidebarOpen(false);
    setPhase("survey");
  };

  const continueDraft = () => {
    const draft = loadDraft(draftKey);
    if (!draft) {
      startFresh();
      return;
    }

    setAnswers({ ...createEmptyDraft(questionKeys), ...draft.answers });
    setCurrentStep(draft.currentStep);
    setConsentAccepted(draft.consentAccepted);
    setSubmissionKey(draft.submissionKey);
    setStatus("idle");
    setErrorMessage("");
    setSidebarOpen(false);
    setPhase("survey");
  };

  const restartFromComplete = () => {
    startFresh();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setQuestionAnswer = (questionKey: string, updater: (answer: AnswerDraft) => AnswerDraft) => {
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: updater(prev[questionKey] ?? { ...EMPTY_ANSWER }),
    }));
    clearError();
  };

  const selectSingle = (questionKey: string, optionKey: string) => {
    setQuestionAnswer(questionKey, (answer) => ({
      ...answer,
      selectedOptionKeys: [optionKey],
      otherText: optionKey === OTHER_OPTION_KEY ? answer.otherText : "",
    }));
  };

  const toggleCheckbox = (question: HrDiagnosticQuestion, optionKey: string) => {
    const exclusiveOptionKeys = getExclusiveOptionKeys(question);
    const isExclusiveOption = exclusiveOptionKeys.has(optionKey);

    setQuestionAnswer(question.key, (prev) => {
      const isSelected = prev.selectedOptionKeys.includes(optionKey);
      let nextKeys: string[];

      if (isSelected) {
        nextKeys = prev.selectedOptionKeys.filter((key) => key !== optionKey);
      } else if (isExclusiveOption) {
        nextKeys = [optionKey];
      } else {
        const retainedKeys = prev.selectedOptionKeys.filter(
          (key) => !exclusiveOptionKeys.has(key)
        );

        if (question.maxSelections && retainedKeys.length >= question.maxSelections) {
          return prev;
        }

        nextKeys = [...retainedKeys, optionKey];
      }

      return {
        ...prev,
        selectedOptionKeys: nextKeys,
        otherText: nextKeys.includes(OTHER_OPTION_KEY) ? prev.otherText : "",
      };
    });
  };

  const setTextAnswer = (questionKey: string, value: string) => {
    setQuestionAnswer(questionKey, (answer) => ({
      ...answer,
      text: value,
    }));
  };

  const setOtherText = (questionKey: string, value: string) => {
    setQuestionAnswer(questionKey, (answer) => ({
      ...answer,
      otherText: value,
    }));
  };

  const goToStep = (index: number) => {
    setCurrentStep(Math.max(0, Math.min(index, visibleQuestions.length)));
    setSidebarOpen(false);
    clearError();
    scrollToSurveyTop();
  };

  const goNext = () => {
    if (!currentQuestion) return;

    const error = validateHrDiagnosticQuestionAnswer(
      currentQuestion,
      getQuestionAnswerInput(currentQuestion, answers[currentQuestion.key])
    );

    if (error) {
      setStatus("error");
      setErrorMessage(error);
      return;
    }

    const nextStep = Math.min(currentStep + 1, visibleQuestions.length);
    setCurrentStep(nextStep);
    setStatus("idle");
    setErrorMessage("");
    scrollToSurveyTop();
    reachGoal(YM_GOALS.DIAGNOSTIC_STEP, {
      step: nextStep + 1,
      total: visibleQuestions.length + 1,
      survey: "hr",
    });
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    clearError();
    scrollToSurveyTop();
  };

  const submitSurvey = async () => {
    const validation = validateHrDiagnosticSubmission(test, answerInputs);

    if (!validation.valid) {
      setStatus("error");
      setErrorMessage(validation.errors[0] ?? "Проверьте ответы перед отправкой");
      return;
    }

    if (!consentAccepted) {
      setStatus("error");
      setErrorMessage("Подтвердите согласие на обработку персональных данных");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/hr-diagnostic/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionKey,
          answers: answerInputs,
          sourcePageUrl: captureCurrentPageUrl(),
          consentAccepted: true,
        }),
      });

      const payload = (await response.json()) as HrDiagnosticSubmitResponse;
      if (!response.ok) {
        throw new Error(payload.error || "Не удалось отправить анкету");
      }

      clearDraft(draftKey);
      setCompletedSegment(payload.data.targetSegment);
      setStatus("success");
      setPhase("complete");
      reachGoal(YM_GOALS.DIAGNOSTIC_COMPLETE, {
        ...getUtmParams(),
        survey: "hr",
        segment: payload.data.targetSegment,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Не удалось отправить анкету");
    }
  };

  if (!isHydrated) {
    return (
      <div className="relative min-h-screen text-[#0F172A]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -top-20 bg-[#F8FAFC]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 md:px-6 lg:pt-24">
          <div className="mx-auto h-10 w-2/3 animate-pulse rounded-lg bg-[#E2E8F0]" />
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[#E2E8F0]/80 bg-white p-8">
            <div className="h-6 w-1/2 animate-pulse rounded bg-[#E2E8F0]" />
            <div className="mt-4 h-4 w-full animate-pulse rounded bg-[#E2E8F0]" />
            <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-[#E2E8F0]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-[#0F172A]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -top-20 bg-[#F8FAFC]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -top-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,rgba(30,58,95,0.20)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,58,95,0.20)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute -top-40 left-[15%] h-[500px] w-[500px] rounded-full bg-[#3B82F6]/14 blur-3xl animate-[blobDrift_18s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 right-[10%] h-[600px] w-[600px] rounded-full bg-[#58A8E0]/12 blur-3xl animate-[blobDrift_22s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 md:px-6 lg:pt-24 lg:pb-24">
        <div className="mb-8 text-center lg:mb-10">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[#1E3A5F] md:text-4xl lg:text-[48px]">
            {test.testTitle}
          </h1>
        </div>

        {phase === "intro" ? (
          <IntroScreen
            test={test}
            hasDraft={hasDraft}
            onStart={startFresh}
            onContinue={continueDraft}
          />
        ) : null}

        {phase === "complete" ? (
          <CompletionScreen
            test={test}
            segment={completedSegment}
            onRestart={restartFromComplete}
          />
        ) : null}

        {phase === "survey" ? (
          <>
            <div className="mb-6 lg:hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen((open) => !open)}
                className="-mx-4 flex w-[calc(100%+2rem)] items-center justify-between bg-white px-5 py-4 md:mx-0 md:w-full md:rounded-2xl md:border md:border-[#E2E8F0]/80 md:shadow-[0_18px_56px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#3B82F6]/40 bg-[#3B82F6]/10 text-xs font-semibold text-[#3B82F6]">
                    {answeredCount}/{visibleQuestions.length}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-[#1E3A5F]">
                      {test.projectTitle}
                    </div>
                    <div className="text-xs text-[#475569]">
                      {isFinalStep
                        ? "Отправка"
                        : `Вопрос ${Math.min(currentStep + 1, visibleQuestions.length)} из ${visibleQuestions.length}`}
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-[#94A3B8] transition-transform duration-200",
                    sidebarOpen && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>

              {sidebarOpen ? (
                <div className={cn(cardClass, "mt-3 space-y-2 p-4 animate-[cardIn_0.25s_ease-out]")}>
                  {visibleQuestions.map((question, index) => {
                    const stepState =
                      currentStep === index
                        ? "active"
                        : isAnswered(question, answers[question.key])
                          ? "done"
                          : "pending";

                    return (
                      <button
                        key={question.key}
                        type="button"
                        onClick={() => goToStep(index)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                          stepState === "active"
                            ? "border-[#3B82F6]/30 bg-[#3B82F6]/[0.06]"
                            : "border-transparent hover:bg-[#3B82F6]/[0.06]"
                        )}
                      >
                        <StepDot state={stepState} />
                        <span className="min-w-0 truncate text-sm text-[#475569]">
                          {question.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
              <aside className="hidden lg:sticky lg:top-24 lg:block">
                <div className="rounded-2xl border border-[#E2E8F0]/80 bg-white p-4 shadow-[0_18px_56px_rgba(15,23,42,0.08)]">
                  <p className="text-lg font-medium leading-7 text-[#475569]">
                    {test.projectTitle}
                  </p>
                  <p className="mt-1 text-lg leading-7 text-[#94A3B8]">
                    Исследование для HR-аудитории
                  </p>

                  <div className="mt-6 rounded-xl border border-[#E2E8F0]/80 bg-[#F8FAFC] p-3">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-[#475569]">Заполнено</span>
                      <span className="font-semibold text-[#1E3A5F]">
                        {answeredCount} из {visibleQuestions.length}
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#3B82F6_0%,#58A8E0_100%)] transition-[width] duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <nav className="mt-6 space-y-2" aria-label="Навигация по вопросам">
                    {visibleQuestions.map((question, index) => {
                      const stepState =
                        currentStep === index
                          ? "active"
                          : isAnswered(question, answers[question.key])
                            ? "done"
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
                                stepState === "active" ? "text-[#3B82F6]" : "text-[#94A3B8]"
                              )}
                            >
                              {getGroupTitle(test, question.key)}
                            </div>
                            <div
                              className={cn(
                                "mt-0.5 line-clamp-2 text-sm leading-5",
                                stepState === "active" ? "text-[#1E3A5F]" : "text-[#475569]"
                              )}
                            >
                              {question.title}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </nav>

                  <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/[0.04] p-4 text-sm leading-6 text-[#475569]">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#3B82F6]" aria-hidden="true" />
                    <span>
                      Ответы сохраняются для исследования и используются только в обобщённом виде.
                    </span>
                  </div>
                </div>
              </aside>

              <div className="min-w-0">
                <div className={cn(cardClass, "p-4 md:p-6 animate-[cardIn_0.35s_ease-out]")}>
                  {status === "error" && !currentQuestion ? (
                    <div
                      id={errorId}
                      role="alert"
                      aria-live="polite"
                      className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
                    >
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                      <span className="text-sm leading-6">{errorMessage}</span>
                    </div>
                  ) : null}

                  {!isFinalStep && currentQuestion ? (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">
                        Вопрос {currentStep + 1} из {visibleQuestions.length}
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1E3A5F] md:text-3xl">
                        {currentQuestion.title}
                      </h2>
                      {currentQuestion.description ? (
                        <QuestionInfoMessage message={currentQuestion.description} />
                      ) : null}

                      {currentQuestion.type === "email" ? (
                        <EmailQuestion
                          value={answers[currentQuestion.key]?.text ?? ""}
                          onChange={(value) => setTextAnswer(currentQuestion.key, value)}
                        />
                      ) : (
                        <QuestionOptions
                          question={currentQuestion}
                          answer={currentAnswer}
                          onSelectSingle={(optionKey) => selectSingle(currentQuestion.key, optionKey)}
                          onToggleCheckbox={(optionKey) => toggleCheckbox(currentQuestion, optionKey)}
                          onOtherTextChange={(value) => setOtherText(currentQuestion.key, value)}
                        />
                      )}

                      {currentInlineErrorMessage ? (
                        <InlineErrorMessage id={errorId} message={currentInlineErrorMessage} />
                      ) : null}

                      <div className="mt-8 flex items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={goBack}
                          disabled={currentStep === 0}
                          className={secondaryButtonClass}
                        >
                          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                          Назад
                        </button>
                        <button
                          type="button"
                          onClick={goNext}
                          disabled={isNextDisabled}
                          className={primaryCtaCompactClass}
                          aria-describedby={currentInlineErrorMessage ? errorId : undefined}
                        >
                          {currentStep === visibleQuestions.length - 1 ? "К отправке" : "Далее"}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">
                        Финал
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1E3A5F] md:text-3xl">
                        Отправка анкеты
                      </h2>
                      <p className="mt-3 text-base leading-7 text-[#475569]">
                        Перед отправкой подтвердите согласие на обработку персональных данных.
                      </p>

                      <div className="mt-6 rounded-xl border border-[#E2E8F0]/80 bg-[#F8FAFC] p-4">
                        <div className="flex items-start gap-3">
                          <input
                            id={consentId}
                            type="checkbox"
                            checked={consentAccepted}
                            onChange={(event) => {
                              setConsentAccepted(event.target.checked);
                              clearError();
                            }}
                            className="mt-0.5 h-5 w-5 shrink-0 rounded border-[#E2E8F0] bg-white accent-[#3B82F6]"
                          />
                          <label htmlFor={consentId} className="text-sm leading-6 text-[#475569]">
                            Я согласен(на) на обработку моих персональных данных
                            (email, должность, компания) в соответствии с ФЗ-152 и{" "}
                            <Link
                              href="/politika-konfidencialnosti"
                              className="font-medium text-[#3B82F6] hover:underline"
                            >
                              Политикой конфиденциальности НЦФГ
                            </Link>
                            . Данные используются исключительно для проведения
                            исследования и не передаются третьим лицам.
                          </label>
                        </div>
                      </div>

                      <div className="mt-8 flex items-center justify-between gap-4">
                        <button type="button" onClick={goBack} className={secondaryButtonClass}>
                          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                          Назад
                        </button>
                        <button
                          type="button"
                          onClick={submitSurvey}
                          disabled={status === "submitting"}
                          className={primaryCtaCompactClass}
                          aria-describedby={status === "error" ? errorId : undefined}
                        >
                          {status === "submitting" ? (
                            "Отправляем..."
                          ) : (
                            <>
                              Отправить
                              <Send className="h-4 w-4" aria-hidden="true" />
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
