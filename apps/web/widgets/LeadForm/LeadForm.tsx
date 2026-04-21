"use client";

import { useId, useState, type FormEvent } from "react";
import {
  Send,
  CheckCircle,
  ShieldCheck,
  ListChecks,
  Sparkles,
  Clock3,
} from "lucide-react";
import { Section } from "@/shared/ui/Section";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";
import {
  FormErrorAlert,
  FormFieldLabel,
  FormPrivacyConsent,
  formInputClassName,
  formTextareaClassName,
} from "@/shared/ui/form";
import { postJsonOrThrow, validateLeadBasics } from "@/features/form-core";
import { captureCurrentPageUrl } from "@/shared/lib/source-page";
import { reachGoal, YM_GOALS } from "@/shared/lib/ym";
import { getUtmParams } from "@/shared/lib/utm";

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

const leadBadgeClass =
  "inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/70 px-3 py-1 text-xs font-semibold text-[#1E3A5F] backdrop-blur";

const inputBaseClass = formInputClassName("md");

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
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#58A8E0] via-[#3B82F6] to-transparent"
      />
      <div className="relative p-5 md:p-6">{children}</div>
    </div>
  );
}

export function LeadForm() {
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
  const [formStarted, setFormStarted] = useState(false);
  const consentId = useId();
  const errorId = useId();

  const clearError = () => {
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();

    const validation = validateLeadBasics({
      name,
      email,
      consent,
    });
    if (validation) {
      setStatus("error");
      setErrorMessage(validation);
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      await postJsonOrThrow(
        "/api/lead",
        {
          ...formData,
          name,
          email,
          sourcePageUrl: captureCurrentPageUrl(),
        },
        "Произошла ошибка при отправке"
      );

      setStatus("success");
      reachGoal(YM_GOALS.LEAD_FORM_SUBMIT, getUtmParams());
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Произошла ошибка");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleFormFieldFocus = () => {
    if (!formStarted) {
      setFormStarted(true);
      reachGoal(YM_GOALS.LEAD_FORM_START);
    }
  };

  if (status === "success") {
    return (
      <Section
        id="lead-form"
        background="gray"
        className="relative overflow-hidden"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,rgba(30,58,95,0.20)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,58,95,0.20)_1px,transparent_1px)] bg-[size:56px_56px]" />
          <div className="absolute -top-44 -left-44 h-[520px] w-[520px] rounded-full bg-[#3B82F6]/16 blur-3xl" />
          <div className="absolute -bottom-56 left-1/3 h-[640px] w-[640px] rounded-full bg-[#58A8E0]/14 blur-3xl" />
          <div className="absolute -top-52 -right-52 h-[560px] w-[560px] rounded-full bg-[#1E3A5F]/10 blur-3xl" />
        </div>

        <div className="relative z-10 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white/70 px-3 py-1 text-xs font-semibold text-[#1E3A5F] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#58A8E0]" />
              Заявка принята. Ответим быстро
            </div>

            <h2 className="mt-5 text-3xl md:text-4xl lg:text-[42px] font-bold tracking-tight text-[#1E3A5F] leading-tight">
              Заявка отправлена
            </h2>
            <p className="mt-4 text-lg md:text-xl text-[#475569] leading-relaxed">
              Спасибо за обращение. Мы свяжемся с вами в ближайшее время и уточним
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
                  setStatus("idle");
                  setErrorMessage("");
                  setConsent(false);
                }}
              >
                Отправить ещё
              </Button>
            </div>
          </LeadFormCard>
        </div>
      </Section>
    );
  }

  return (
    <Section
      id="lead-form"
      background="gray"
      className="relative overflow-hidden"
    >
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
	              Ответим в течение 1 дня
	            </div>
	          </div>

	          <h2 className="mt-5 text-3xl md:text-4xl lg:text-[42px] font-bold tracking-tight text-[#1E3A5F] leading-tight">
	            Оставить заявку
	          </h2>
	          <p className="mt-4 text-lg md:text-xl text-[#475569] leading-relaxed">
            Заполните форму, и мы свяжемся с вами, чтобы уточнить задачу и предложить
            подходящий формат сотрудничества.
          </p>

          <div className="mt-8 grid gap-3">
            <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0]/70 bg-white/60 p-4">
              <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
                <ListChecks className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="font-semibold text-[#1E3A5F]">Уточним задачу</div>
                <div className="mt-1 text-sm text-[#475569] leading-relaxed">
                  Поймём аудиторию, формат и сроки. Без лишних созвонов.
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
                  Обычно в течение 1 рабочего дня. Можно начать с письма.
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

        <LeadFormCard className="lg:sticky lg:top-28">
          <form onSubmit={handleSubmit} onFocus={handleFormFieldFocus} className="space-y-5" noValidate>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-[#1E3A5F]">
                  Контактные данные
                </div>
                <div className="mt-1 text-sm text-[#475569]">
                  Ответим в течение 1 рабочего дня
                </div>
              </div>
            </div>

            {status === "error" ? (
              <FormErrorAlert id={errorId} message={errorMessage} />
            ) : null}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <FormFieldLabel htmlFor="name" required>
                  Имя
                </FormFieldLabel>
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
                <FormFieldLabel htmlFor="email" required>
                  Email
                </FormFieldLabel>
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
                <FormFieldLabel htmlFor="phone">Телефон</FormFieldLabel>
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
                <FormFieldLabel htmlFor="company">Компания</FormFieldLabel>
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
              <FormFieldLabel htmlFor="message">Сообщение</FormFieldLabel>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className={formTextareaClassName("md")}
                placeholder="Расскажите о вашем запросе..."
              />
            </div>

            <FormPrivacyConsent
              id={consentId}
              checked={consent}
              onCheckedChange={(next) => {
                setConsent(next);
                clearError();
              }}
              required
              variant="lead"
            />

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
                    Отправить заявку
                    <Send size={18} className="ml-2" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Мы используем ваши данные только для связи по обращению. Без рассылок и
              передачи третьим лицам.
            </p>
          </form>
        </LeadFormCard>
      </div>
    </Section>
  );
}
