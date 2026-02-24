"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Section } from "@/shared/ui/Section";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title: string;
  lead?: string;
  items: FAQItem[];
  defaultOpenFirst?: boolean;
}

const FAQ_AUTOPLAY_DELAY_MS = 7000;

const placeholderFAQ: FAQItem[] = [
  {
    question: "Что такое финансовая грамотность и зачем она нужна?",
    answer:
      "Финансовая грамотность — это набор знаний и навыков, которые помогают принимать взвешенные решения о личных финансах: планировать бюджет, управлять долгами, инвестировать и защищаться от финансового мошенничества.",
  },
  {
    question: "Какие программы вы предлагаете для компаний?",
    answer:
      "Мы разрабатываем комплексные программы финансового well-being для сотрудников: онлайн-курсы, вебинары, индивидуальные консультации, марафоны и офлайн-мероприятия. Программы адаптируются под потребности конкретной компании.",
  },
  {
    question: "Как начать сотрудничество с НЦФГ?",
    answer:
      "Оставьте заявку на сайте или свяжитесь с нами напрямую. Наши специалисты проведут бесплатную консультацию, определят потребности и предложат оптимальное решение для вашей организации.",
  },
  {
    question: "Есть ли бесплатные материалы для самостоятельного изучения?",
    answer:
      "Да, мы предоставляем бесплатные материалы: статьи, чек-листы, памятки и видеоуроки по основам финансовой грамотности. Они доступны в разделе «Наработки» на нашем сайте.",
  },
  {
    question: "Работаете ли вы с государственными организациями?",
    answer:
      "Да, мы активно сотрудничаем с Минфином России, Центральным банком, региональными министерствами финансов и другими государственными структурами в рамках национальных проектов по повышению финансовой грамотности населения.",
  },
];

function FAQSlide({
  item,
}: {
  item: FAQItem;
}) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-3xl border border-[#CFE0FF]/80",
        "bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(242,247,255,0.95))]",
        "shadow-[0_18px_42px_rgba(27,68,141,0.12)] backdrop-blur-sm"
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-[#3B82F6]/10 blur-3xl" />
        <div className="absolute -bottom-44 left-1/4 h-[560px] w-[560px] rounded-full bg-[#58A8E0]/8 blur-3xl" />
      </div>
      <div className="relative p-6 md:p-8">
        <h3 className="text-lg font-bold leading-snug text-[#122848] md:text-2xl">
          {item.question}
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-[#39557B] md:text-base">
          {item.answer}
        </p>
      </div>
    </article>
  );
}

export function FAQ({
  title,
  lead,
  items,
}: FAQProps) {
  const displayItems = useMemo(
    () => (items.length > 0 ? items : placeholderFAQ),
    [items]
  );
  const normalizedTitle = title.trim();
  const displayTitle =
    normalizedTitle.length === 0 || normalizedTitle.toLowerCase() === "faq"
      ? "Частые вопросы"
      : normalizedTitle;
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion ?? false;

  useEffect(() => {
    if (displayItems.length <= 1) return;
    if (shouldReduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayItems.length);
    }, FAQ_AUTOPLAY_DELAY_MS);

    return () => window.clearInterval(timer);
  }, [displayItems.length, shouldReduceMotion]);

  const activeItem = displayItems[activeIndex];

  if (!activeItem) return null;

  return (
    <Section id="faq" title={displayTitle} lead={lead}>
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={`faq-slide-${activeItem.question}`}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 28 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -28 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <FAQSlide item={activeItem} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setActiveIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length)
              }
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#CFE0FF] bg-white text-[#3B82F6] transition-colors hover:bg-[#EFF6FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
              aria-label="Предыдущий вопрос"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev + 1) % displayItems.length)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#CFE0FF] bg-white text-[#3B82F6] transition-colors hover:bg-[#EFF6FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
              aria-label="Следующий вопрос"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2" aria-label="Пагинация вопросов">
            {displayItems.map((item, index) => (
              <button
                key={`faq-dot-${item.question}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  index === activeIndex
                    ? "w-7 bg-[#3B82F6]"
                    : "w-2.5 bg-[#BFDBFE] hover:bg-[#93C5FD]"
                )}
                aria-label={`Перейти к вопросу ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#DDEBFF] bg-white/80 px-5 py-4 text-sm text-[#475569] sm:flex-row sm:items-center">
          <p>Не нашли ответ? Оставьте заявку, и мы свяжемся с вами.</p>
          <Button variant="secondary" size="sm" href="#lead-form">
            Оставить заявку
          </Button>
        </div>
      </div>
    </Section>
  );
}
