"use client";

import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { CheckCircle, Send, ShieldCheck } from "lucide-react";

import { Button } from "@/shared/ui/Button";
import {
  FormErrorAlert,
  FormFieldLabel,
  FormPrivacyConsent,
  formInputClassName,
} from "@/shared/ui/form";
import { postJsonOrThrow } from "@/features/form-core";
import { cn } from "@/shared/lib/cn";
import { captureCurrentPageUrl } from "@/shared/lib/source-page";
import {
  VACANCY_APPLICATION_CONSENT_REQUIRED_ERROR,
  normalizeAbsoluteHttpUrl,
  VACANCY_APPLICATION_INVALID_EMAIL_ERROR,
  VACANCY_APPLICATION_INVALID_RESUME_URL_ERROR,
  VACANCY_APPLICATION_REQUIRED_FIELDS_ERROR,
} from "@/shared/lib/vacancy-application";
import { getUtmParams } from "@/shared/lib/utm";
import { reachGoal, YM_GOALS } from "@/shared/lib/ym";

interface VacancyApplicationFormProps {
  vacancySlug: string;
  vacancyTitle: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  telegram: string;
  message: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

const inputBaseClass = formInputClassName("md");

export function VacancyApplicationForm({
  vacancySlug,
  vacancyTitle,
}: VacancyApplicationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    resumeUrl: "",
    telegram: "",
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

  const handleFormFieldFocus = () => {
    if (!formStarted) {
      setFormStarted(true);
      reachGoal(YM_GOALS.LEAD_FORM_START);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const resumeUrl = formData.resumeUrl.trim();

    if (!name || !email || !phone || !resumeUrl) {
      setStatus("error");
      setErrorMessage(VACANCY_APPLICATION_REQUIRED_FIELDS_ERROR);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage(VACANCY_APPLICATION_INVALID_EMAIL_ERROR);
      return;
    }

    if (!normalizeAbsoluteHttpUrl(resumeUrl)) {
      setStatus("error");
      setErrorMessage(VACANCY_APPLICATION_INVALID_RESUME_URL_ERROR);
      return;
    }

    if (!consent) {
      setStatus("error");
      setErrorMessage(VACANCY_APPLICATION_CONSENT_REQUIRED_ERROR);
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      await postJsonOrThrow(
        "/api/vacancy-application",
        {
          ...formData,
          vacancySlug,
          consentToProcessing: consent,
          name,
          email,
          phone,
          resumeUrl,
          sourcePageUrl: captureCurrentPageUrl(),
        },
        "Произошла ошибка при отправке отклика"
      );

      setStatus("success");
      reachGoal(YM_GOALS.LEAD_FORM_SUBMIT, {
        ...getUtmParams(),
        vacancy_slug: vacancySlug,
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        resumeUrl: "",
        telegram: "",
        message: "",
      });
      setConsent(false);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Произошла ошибка при отправке отклика"
      );
    }
  };

  return (
    <section
      id="vacancy-application"
      data-scroll-reveal=""
      className="scroll-mt-28 pt-0"
    >
      <div className="rounded-2xl border border-[#E2E8F0]/80 bg-[#F8FAFC] p-6 shadow-[0_18px_56px_rgba(15,23,42,0.06)] md:p-8">
        {status === "success" ? (
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-6 py-8 text-center md:px-8 md:py-10">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-[#10B981]" />
            <h2 className="text-xl font-semibold text-[#1E3A5F] md:text-2xl">
              Отклик отправлен!
            </h2>
            <p className="mx-auto mt-3 max-w-[38rem] text-base leading-relaxed text-[#475569] md:text-lg">
              Спасибо за интерес к вакансии «{vacancyTitle}». Мы свяжемся с вами в
              ближайшее время.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="mt-0 text-[28px] font-bold leading-tight text-[#1E3A5F] md:text-[32px]">
              Расскажите о себе
            </h2>

            <form onSubmit={handleSubmit} onFocus={handleFormFieldFocus} noValidate>
              <div className="space-y-5">
                {status === "error" ? (
                  <FormErrorAlert id={errorId} message={errorMessage} />
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FormFieldLabel htmlFor="vacancy-application-name" required>
                      Имя
                    </FormFieldLabel>
                    <input
                      id="vacancy-application-name"
                      name="name"
                      type="text"
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
                    <FormFieldLabel htmlFor="vacancy-application-email" required>
                      Email
                    </FormFieldLabel>
                    <input
                      id="vacancy-application-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputBaseClass}
                      placeholder="ivan@example.ru"
                      aria-describedby={status === "error" ? errorId : undefined}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FormFieldLabel htmlFor="vacancy-application-phone" required>
                      Телефон
                    </FormFieldLabel>
                    <input
                      id="vacancy-application-phone"
                      name="phone"
                      type="tel"
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={inputBaseClass}
                      placeholder="+7 (999) 123-45-67"
                      aria-describedby={status === "error" ? errorId : undefined}
                    />
                  </div>

                  <div>
                    <FormFieldLabel htmlFor="vacancy-application-telegram">
                      Telegram
                    </FormFieldLabel>
                    <input
                      id="vacancy-application-telegram"
                      name="telegram"
                      type="text"
                      autoComplete="off"
                      value={formData.telegram}
                      onChange={handleChange}
                      className={inputBaseClass}
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div>
                  <FormFieldLabel htmlFor="vacancy-application-resume-url" required>
                    Ссылка на резюме или портфолио
                  </FormFieldLabel>
                  <input
                    id="vacancy-application-resume-url"
                    name="resumeUrl"
                    type="url"
                    required
                    autoComplete="url"
                    value={formData.resumeUrl}
                    onChange={handleChange}
                    className={inputBaseClass}
                    placeholder="https://example.com/resume"
                    aria-describedby={status === "error" ? errorId : undefined}
                  />
                </div>

                <div>
                  <FormFieldLabel htmlFor="vacancy-application-message">
                    Сопроводительное сообщение
                  </FormFieldLabel>
                  <textarea
                    id="vacancy-application-message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className={cn(formInputClassName("md"), "resize-none")}
                    placeholder="Коротко опишите релевантный опыт, формат занятости или вопросы по роли"
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
                  className="bg-white"
                />

                <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="submit"
                    className="w-full shrink-0 whitespace-nowrap sm:w-auto sm:min-w-[220px]"
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? (
                      "Отправка..."
                    ) : (
                      <>
                        Отправить резюме
                        <Send size={18} className="ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-start gap-2 text-xs leading-relaxed text-[#64748B] sm:max-w-[22rem]">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#3B82F6]" />
                    <span>
                      Подтверждение придёт на email. Данные используем только для
                      рассмотрения отклика.
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
