"use client";

import type { ChangeEvent, FormEventHandler } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Clock3,
  ListChecks,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Section } from "@/shared/ui/Section";
import { Button } from "@/shared/ui/Button";
import { FormFieldLabel } from "@/shared/ui/FormFieldLabel";
import { cn } from "@/shared/lib/cn";
import type { FormStatus } from "@/shared/lib/forms";
import { LeadFormCard } from "./LeadFormCard";
import { inputBaseClassName, leadBadgeClassName, TRUST_CHIPS } from "./constants";
import type { LeadFormData } from "./types";

interface LeadFormFormProps {
  formData: LeadFormData;
  status: FormStatus;
  errorId: string;
  errorMessage: string;
  consentId: string;
  consent: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onConsentChange: (checked: boolean) => void;
}

export function LeadFormForm({
  formData,
  status,
  errorId,
  errorMessage,
  consentId,
  consent,
  onSubmit,
  onChange,
  onConsentChange,
}: LeadFormFormProps) {
  return (
    <Section id="lead-form" background="gray" className="relative overflow-hidden">
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
            <div className={leadBadgeClassName}>
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[#58A8E0]"
              />
              Консультация бесплатно
            </div>
            <div className={leadBadgeClassName}>
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
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
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

            {status === "error" && (
              <div
                id={errorId}
                role="alert"
                aria-live="polite"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span className="text-sm leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <FormFieldLabel htmlFor="name" required className="mb-2">
                  Имя
                </FormFieldLabel>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  autoComplete="name"
                  value={formData.name}
                  onChange={onChange}
                  className={inputBaseClassName}
                  placeholder="Иван Петров"
                  aria-describedby={status === "error" ? errorId : undefined}
                />
              </div>

              <div>
                <FormFieldLabel htmlFor="email" required className="mb-2">
                  Email
                </FormFieldLabel>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={onChange}
                  className={inputBaseClassName}
                  placeholder="ivan@company.ru"
                  aria-describedby={status === "error" ? errorId : undefined}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <FormFieldLabel htmlFor="phone" className="mb-2">
                  Телефон
                </FormFieldLabel>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  inputMode="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={onChange}
                  className={inputBaseClassName}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div>
                <FormFieldLabel htmlFor="company" className="mb-2">
                  Компания
                </FormFieldLabel>
                <input
                  type="text"
                  id="company"
                  name="company"
                  autoComplete="organization"
                  value={formData.company}
                  onChange={onChange}
                  className={inputBaseClassName}
                  placeholder="ООО «Компания»"
                />
              </div>
            </div>

            <div>
              <FormFieldLabel htmlFor="message" className="mb-2">
                Сообщение
              </FormFieldLabel>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={onChange}
                className={cn(inputBaseClassName, "resize-none")}
                placeholder="Расскажите о вашем запросе..."
              />
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-[#E2E8F0]/80 bg-[#F8FAFC] p-4">
              <input
                id={consentId}
                type="checkbox"
                checked={consent}
                onChange={(e) => onConsentChange(e.target.checked)}
                className={cn(
                  "mt-0.5 h-5 w-5 shrink-0 rounded border border-[#E2E8F0] bg-white",
                  "accent-[#3B82F6]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                )}
                required
              />
              <label htmlFor={consentId} className="text-sm text-[#475569] leading-relaxed">
                Согласен(на) на обработку персональных данных и принимаю{" "}
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
              <Button type="submit" className="w-full sm:w-auto" disabled={status === "loading"}>
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

