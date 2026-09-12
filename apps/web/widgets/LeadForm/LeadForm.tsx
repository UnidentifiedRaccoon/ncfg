"use client";

import { ContentTransition } from "@/shared/ui/ContentTransition";
import { Reveal } from "@/shared/ui/Reveal";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ListChecks,
  Sparkles,
  Clock3,
} from "lucide-react";
import { Section } from "@/shared/ui/Section";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";
import { captureCurrentPageUrl } from "@/shared/lib/source-page";
import {
  buildInquiryMessage,
  useInquiryDiagnostics,
  type InquiryContext,
  type InquiryErrorDetail,
  type InquiryProgram,
} from "@/features/inquiry-diagnostics";

interface LeadFormProps {
  audience?: "general" | "corporate";
  program?: InquiryProgram;
  programs?: readonly InquiryProgram[];
}

const NO_PROGRAMS: readonly InquiryProgram[] = [];

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

const TRUST_CHIPS = [
  "Лемана ПРО",
  "Газпромнефть",
  "Сбер",
  "ВТБ Мои Инвестиции",
  "Марс",
] as const;

const fieldLabelClass = "block text-sm font-medium text-[#1E3A5F]";

const leadBadgeClass =
  "inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/70 px-3 py-1 text-xs font-semibold text-[#1E3A5F] backdrop-blur";

const inputBaseClass = cn(
  "w-full rounded-md border border-[#E2E8F0] bg-white px-4 py-3",
  "text-[#0F172A] placeholder:text-[#64748B]",
  "shadow-[0_1px_0_rgba(15,23,42,0.02)]",
  "focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[rgba(59,130,246,0.15)]",
  "transition-all duration-150"
);

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className={cn(fieldLabelClass, "mb-2")}>
      {children}
      {required && <span className="text-[#3B82F6]"> *</span>}
    </label>
  );
}

function LeadFormCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#E2E8F0]/80 bg-white",
        "shadow-[0_18px_56px_rgba(15,23,42,0.08)]",
        className
      )}
    >
      {/* Premium top accent line */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#58A8E0] via-[#3B82F6] to-transparent"
      />
      <div className="relative p-5 md:p-6">{children}</div>
    </div>
  );
}

export function LeadForm({ audience = "general", program, programs = NO_PROGRAMS }: LeadFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const selectedProgram = program ?? programs.find((item) => item.id === selectedProgramId);
  const corporate = audience === "corporate";
  const companyProvided = Boolean(formData.company.trim());
  const context: InquiryContext = {
    formType: audience,
    programId: selectedProgram?.id,
    companyProvided,
  };
  const { diagnostics, observeForm } = useInquiryDiagnostics(context);
  const submittingRef = useRef(false);
  const errorRef = useRef<HTMLDivElement>(null);
  // This form has the page-unique #lead-form anchor. Keep its field references
  // stable when the surrounding server components finish streaming.
  const consentId = "lead-form-consent";
  const errorId = "lead-form-error";

  useEffect(() => {
    if (status === "error") errorRef.current?.focus();
  }, [status]);

  useEffect(() => {
    if (!programs.length) return;
    const handleProgramChoice = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const trigger = event.target.closest("[data-lead-program]");
      if (!(trigger instanceof HTMLElement)) return;
      const choice = programs.find((item) => item.id === trigger.dataset.leadProgram);
      if (!choice || submittingRef.current) return;
      setSelectedProgramId(choice.id);
      diagnostics.select({ formType: audience, programId: choice.id, companyProvided });
    };
    document.addEventListener("click", handleProgramChoice);
    return () => document.removeEventListener("click", handleProgramChoice);
  }, [audience, companyProvided, diagnostics, programs]);

  const clearError = () => {
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const showError = (message: string) => {
    setStatus("error");
    setErrorMessage(message);
    // Also handle another submit while the same error is already displayed.
    errorRef.current?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    diagnostics.attempt(context);

    const fail = (message: string, detail: InquiryErrorDetail) => {
      diagnostics.error(context, detail);
      showError(message);
    };

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name || !email) {
      fail("Укажите имя и email, чтобы мы могли ответить на запрос.", {
        code: "required_fields",
        fields: [...(!name ? ["name" as const] : []), ...(!email ? ["email" as const] : [])],
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      fail("Проверьте email: например, name@company.ru.", { code: "invalid_email", fields: ["email"] });
      return;
    }

    if (!consent) {
      fail("Подтвердите согласие на обработку персональных данных.", { code: "consent_required", fields: ["consent"] });
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    submittingRef.current = true;
    let requestId: string | null = null;

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          name,
          email,
          message: buildInquiryMessage(formData.message, selectedProgram),
          sourcePageUrl: captureCurrentPageUrl(),
        }),
      });

      requestId = response.headers.get("x-request-id");
      if (!response.ok) {
        fail(
          response.status === 429
            ? "Слишком много попыток. Подождите немного и отправьте запрос снова — данные сохранены."
            : "Не удалось отправить запрос. Данные сохранены — попробуйте ещё раз.",
          {
            code: response.status === 429 ? "rate_limit" : response.status >= 500 ? "server_error" : "request_rejected",
            httpStatus: response.status,
            requestId,
          }
        );
        return;
      }

      const result: unknown = await response.json().catch(() => null);
      if (typeof result !== "object" || result === null || !("success" in result) || result.success !== true) {
        fail("Не удалось подтвердить отправку. Данные сохранены — попробуйте ещё раз.", { code: "invalid_response", requestId });
        return;
      }
      setStatus("success");
      diagnostics.success(context, requestId);
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
    } catch {
      fail("Не удалось подтвердить отправку. Проверьте подключение и попробуйте ещё раз — данные сохранены.", { code: "network_error", requestId });
    } finally {
      submittingRef.current = false;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (value.trim()) diagnostics.input(context);
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleFormFieldFocus = () => {
    diagnostics.focus(context);
  };

  if (status === "success") {
    return (
      <Reveal viewport="inset">
        <Section
          id="lead-form"
          background="gray"
          className="relative overflow-clip"
        >
          {/* Background atmosphere (subtle) */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,rgba(30,58,95,0.20)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,58,95,0.20)_1px,transparent_1px)] bg-[size:56px_56px]" />
            <div className="absolute -top-44 -left-44 h-[520px] w-[520px] rounded-full bg-[#3B82F6]/16 blur-3xl" />
            <div className="absolute -bottom-56 left-1/3 h-[640px] w-[640px] rounded-full bg-[#58A8E0]/14 blur-3xl" />
            <div className="absolute -top-52 -right-52 h-[560px] w-[560px] rounded-full bg-[#1E3A5F]/10 blur-3xl" />
          </div>

          <ContentTransition enter focusOnChange stateKey="success" className="relative z-10 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/70 px-3 py-1 text-xs font-semibold text-[#1E3A5F] backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#58A8E0]" />
                Заявка принята. Ответим быстро
              </div>

              <h2 className="mt-5 text-3xl md:text-4xl lg:text-[42px] font-bold tracking-tight text-[#1E3A5F] leading-tight">
                Заявка отправлена
              </h2>
              <p className="mt-4 text-lg md:text-xl text-[#475569] leading-relaxed">
                Спасибо за обращение. Мы свяжемся с вами в ближайшее время и уточним
                детали.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-[#475569]">
                <ShieldCheck className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
                <span className="font-semibold text-[#1E3A5F]">Нам доверяют:</span>
                {TRUST_CHIPS.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-[#E2E8F0] bg-white/70 px-2.5 py-1"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <LeadFormCard>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-6 w-6 text-[#10B981]" />
                <div>
                  <div className="text-lg font-semibold text-[#1E3A5F]">
                    Отлично. Мы на связи
                  </div>
                  <div className="mt-1 text-sm text-[#475569] leading-relaxed">
                    Если хотите, можете отправить ещё одну заявку.
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    diagnostics.reset();
                    setStatus("idle");
                    setErrorMessage("");
                    setConsent(false);
                  }}
                >
                  Отправить ещё
                </Button>
              </div>
            </LeadFormCard>
          </ContentTransition>
        </Section>
      </Reveal>
    );
  }

  return (
    <Reveal viewport="inset">
      <Section
        id="lead-form"
        background="gray"
        className="relative overflow-clip"
      >
        {/* Background atmosphere (subtle) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,rgba(30,58,95,0.20)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,58,95,0.20)_1px,transparent_1px)] bg-[size:56px_56px]" />
          <div className="absolute -top-44 -left-44 h-[520px] w-[520px] rounded-full bg-[#3B82F6]/14 blur-3xl" />
          <div className="absolute -bottom-56 left-1/3 h-[640px] w-[640px] rounded-full bg-[#58A8E0]/12 blur-3xl" />
          <div className="absolute -top-52 -right-52 h-[560px] w-[560px] rounded-full bg-[#1E3A5F]/10 blur-3xl" />
        </div>

        <div className="relative z-10 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className={leadBadgeClass}>
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-[#58A8E0]"
                />
                Консультация бесплатно
              </div>
              <div className={leadBadgeClass}>
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]"
                />
                Ответим в течение 1 дня
              </div>
            </div>

            <h2 className="mt-5 text-3xl md:text-4xl lg:text-[42px] font-bold tracking-tight text-[#1E3A5F] leading-tight">
              {corporate ? "Обсудим программу для вашей компании" : "Оставить заявку"}
            </h2>
            <p className="mt-4 text-lg md:text-xl text-[#475569] leading-relaxed">
              {corporate
                ? "Оставьте имя и email. Мы уточним задачу команды и поможем выбрать подходящий формат. Если программа ещё не выбрана, начнём с вашей задачи."
                : "Заполните форму, и мы свяжемся с вами, чтобы уточнить задачу и предложить подходящий формат сотрудничества."}
            </p>
          </div>

          <LeadFormCard className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-28">
            <ContentTransition stateKey={status} immediate={status === "error"}><form ref={observeForm} onSubmit={handleSubmit} onFocus={handleFormFieldFocus} className="space-y-5" noValidate aria-busy={status === "loading"}>
              <fieldset disabled={status === "loading"} className="min-w-0 space-y-5">
              <div data-inquiry-view className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold text-[#1E3A5F]">
                    Контактные данные
                  </div>
                  <div className="mt-1 text-sm text-[#475569]">
                    Обязательны только имя, email и согласие на обработку данных.
                  </div>
                </div>
              </div>

              {programs.length > 0 && (
                <div>
                  <FieldLabel htmlFor="lead-form-program">Программа</FieldLabel>
                  <select
                    id="lead-form-program"
                    name="program"
                    className={cn(inputBaseClass, "min-w-0 text-ellipsis")}
                    value={selectedProgramId}
                    disabled={status === "loading"}
                    onChange={(event) => {
                      const choice = programs.find((item) => item.id === event.target.value);
                      setSelectedProgramId(choice?.id ?? "");
                      diagnostics.select({ ...context, programId: choice?.id });
                    }}
                    aria-describedby="lead-form-program-help"
                  >
                    <option value="">Помогите выбрать программу</option>
                    {programs.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                  </select>
                  <p id="lead-form-program-help" aria-live="polite" className="mt-2 text-sm leading-relaxed text-[#475569]">
                    {selectedProgram ? `В запрос попадёт: ${selectedProgram.title}. Выбор можно изменить.` : "Можно оставить этот вариант — подберём формат вместе."}
                  </p>
                </div>
              )}
              {program && (
                <p className="text-sm leading-relaxed text-[#475569]">
                  Программа в запросе: <strong className="font-semibold text-[#1E3A5F]">{program.title}</strong>
                </p>
              )}

              {status === "error" && (
                <div
                  id={errorId}
                  ref={errorRef}
                  tabIndex={-1}
                  role="alert"
                  aria-live="polite"
                  className="scroll-mt-24 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span className="text-sm leading-relaxed">{errorMessage}</span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="name" required>
                    Имя
                  </FieldLabel>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputBaseClass}
                    placeholder="Иван Петров"
                    aria-describedby={status === "error" ? errorId : undefined}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="email" required>
                    Email
                  </FieldLabel>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputBaseClass}
                    placeholder="ivan@company.ru"
                    aria-describedby={status === "error" ? errorId : undefined}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="phone">Телефон</FieldLabel>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    inputMode="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputBaseClass}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="company">Компания</FieldLabel>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    autoComplete="organization"
                    value={formData.company}
                    onChange={handleChange}
                    className={inputBaseClass}
                    placeholder="ООО «Компания»"
                  />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="message">Сообщение</FieldLabel>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className={cn(inputBaseClass, "resize-none")}
                  placeholder="Расскажите о вашем запросе..."
                />
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0]/80 bg-[#F8FAFC] p-4">
                <input
                  id={consentId}
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    clearError();
                  }}
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0 rounded border border-[#E2E8F0] bg-white",
                    "accent-[#3B82F6]",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                  )}
                  required
                />
                <label htmlFor={consentId} className="text-sm text-[#475569] leading-relaxed">
                  Согласен(на) на обработку персональных данных и принимаю{" "}
                  <Link
                    href="/politika-konfidencialnosti"
                    className="font-semibold text-[#3B82F6] hover:underline"
                  >
                    политику конфиденциальности
                  </Link>
                  .
                </label>
              </div>

              <div className="pt-1">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    "Отправка..."
                  ) : (
                    <>
                      {corporate ? "Отправить запрос" : "Отправить заявку"}
                      <Send size={18} className="ml-2" />
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-[#475569] leading-relaxed">
                Мы используем ваши данные только для связи по обращению. Без рассылок и передачи
                третьим лицам.
              </p>
              </fieldset>
            </form></ContentTransition>
          </LeadFormCard>

          <div className="max-w-xl lg:col-start-1 lg:row-start-2">
            <div className="grid gap-3">
              <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0]/70 bg-white/60 p-4">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
                  <ListChecks className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="font-semibold text-[#1E3A5F]">Уточним задачу</div>
                  <div className="mt-1 text-sm text-[#475569] leading-relaxed">
                    Поймём аудиторию, формат и сроки. Без лишних созвонов.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0]/70 bg-white/60 p-4">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#58A8E0]/18 text-[#1E3A5F]">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="font-semibold text-[#1E3A5F]">Предложим формат</div>
                  <div className="mt-1 text-sm text-[#475569] leading-relaxed">
                    Подберём программу, материалы или проект под ваш контекст.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0]/70 bg-white/60 p-4">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#1E3A5F]/10 text-[#1E3A5F]">
                  <Clock3 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="font-semibold text-[#1E3A5F]">Ответим быстро</div>
                  <div className="mt-1 text-sm text-[#475569] leading-relaxed">
                    Обычно в течение 1 рабочего дня. Можно начать с письма.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-[#475569]">
              <ShieldCheck className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
              <span className="font-semibold text-[#1E3A5F]">Нам доверяют:</span>
              {TRUST_CHIPS.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[#E2E8F0] bg-white/70 px-2.5 py-1"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </Reveal>
  );
}
