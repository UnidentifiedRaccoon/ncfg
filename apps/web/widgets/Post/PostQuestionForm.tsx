"use client";

import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { ChevronDown, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";
import { captureCurrentPageUrl } from "@/shared/lib/source-page";
import { reachGoal, YM_GOALS } from "@/shared/lib/ym";

interface PostQuestionFormProps {
  postTitle: string;
  questionFormConfig: {
    isVisible: boolean;
    title: string;
    description: string;
    buttonText: string;
    expandedTitle: string;
    questionLabel: string;
  };
}

interface FormData {
  question: string;
  name: string;
  email: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

export function PostQuestionForm({
  postTitle,
  questionFormConfig,
}: PostQuestionFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    question: "",
    name: "",
    email: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const formId = useId();
  const questionId = `${formId}-question`;
  const nameId = `${formId}-name`;
  const emailId = `${formId}-email`;
  const errorId = `${formId}-error`;
  const describedBy = status === "error" ? errorId : undefined;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          postTitle,
          sourcePageUrl: captureCurrentPageUrl(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Произошла ошибка при отправке");
      }

      setStatus("success");
      reachGoal(YM_GOALS.QUESTION_FORM_SUBMIT);
      setFormData({ question: "", name: "", email: "" });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Произошла ошибка");
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "question" && value.length > 1000) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!questionFormConfig.isVisible) {
    return null;
  }

  if (status === "success") {
    return (
      <section data-scroll-reveal="" className="pb-12 md:pb-16">
        <div className="mx-auto max-w-[760px] px-5 md:px-6 lg:px-8">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-[#10B981] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1E3A5F] mb-2">
              Вопрос отправлен!
            </h3>
            <p className="text-[#475569]">
              Спасибо за обращение. Мы ответим вам в ближайшее время.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section data-scroll-reveal="" className="pb-12 md:pb-16">
      <div className="mx-auto max-w-[760px] px-5 md:px-6 lg:px-8">
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-8">
          {!isExpanded ? (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-[#1E3A5F] mb-2">
                {questionFormConfig.title}
              </h3>
              <p className="text-base text-[#475569] mb-6">
                {questionFormConfig.description}
              </p>
              <Button
                variant="secondary"
                onClick={() => { setIsExpanded(true); reachGoal(YM_GOALS.QUESTION_FORM_EXPAND); }}
                className="inline-flex items-center gap-2"
              >
                {questionFormConfig.buttonText}
                <ChevronDown size={18} />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-[#1E3A5F] mb-2">
                  {questionFormConfig.expandedTitle}
                </h3>
              </div>

              {status === "error" && (
                <div
                  id={errorId}
                  role="alert"
                  aria-live="polite"
                  className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                >
                  <AlertCircle size={20} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor={questionId}
                  className="block text-sm font-medium text-[#1E3A5F] mb-2"
                >
                  {questionFormConfig.questionLabel} *
                </label>
                <div className="relative">
                  <textarea
                    id={questionId}
                    name="question"
                    required
                    aria-describedby={describedBy}
                    rows={4}
                    value={formData.question}
                    onChange={handleChange}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border border-[#E2E8F0] bg-white resize-none",
                      "text-[#0F172A] placeholder:text-[#94A3B8]",
                      "focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[rgba(59,130,246,0.15)]",
                      "transition-all duration-150"
                    )}
                    placeholder="Расскажите подробнее..."
                  />
                  <span className="absolute right-3 bottom-3 text-sm text-[#94A3B8]">
                    {formData.question.length}/1000
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor={nameId}
                    className="block text-sm font-medium text-[#1E3A5F] mb-2"
                  >
                    Имя *
                  </label>
                  <input
                    type="text"
                    id={nameId}
                    name="name"
                    required
                    aria-describedby={describedBy}
                    value={formData.name}
                    onChange={handleChange}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border border-[#E2E8F0] bg-white",
                      "text-[#0F172A] placeholder:text-[#94A3B8]",
                      "focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[rgba(59,130,246,0.15)]",
                      "transition-all duration-150"
                    )}
                    placeholder="Иван Петров"
                  />
                </div>

                <div>
                  <label
                    htmlFor={emailId}
                    className="block text-sm font-medium text-[#1E3A5F] mb-2"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id={emailId}
                    name="email"
                    required
                    aria-describedby={describedBy}
                    value={formData.email}
                    onChange={handleChange}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border border-[#E2E8F0] bg-white",
                      "text-[#0F172A] placeholder:text-[#94A3B8]",
                      "focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[rgba(59,130,246,0.15)]",
                      "transition-all duration-150"
                    )}
                    placeholder="ivan@company.ru"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    "Отправка..."
                  ) : (
                    <>
                      Отправить
                      <Send size={18} className="ml-2" />
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0]">
                <p className="text-sm text-[#94A3B8] mb-2">
                  Или свяжитесь с нами напрямую:
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <a
                    href="https://t.me/wellf_club"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3B82F6] hover:underline"
                  >
                    Telegram @wellf_club
                  </a>
                  <a
                    href="tel:+74995011173"
                    data-ym-goal="phone_click"
                    className="text-[#3B82F6] hover:underline"
                  >
                    +7 (499) 501-11-73
                  </a>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
