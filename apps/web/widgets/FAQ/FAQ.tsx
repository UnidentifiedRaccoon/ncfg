import { ChevronDown, Clock3, ListChecks, Plus, Sparkles } from "lucide-react";
import { Section } from "@/shared/ui/Section";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";

export interface FAQItem {
  question: string;
  answer: string;
}

export type FAQVariant = "stage" | "split" | "cards";

interface FAQProps {
  title: string;
  lead?: string;
  items: FAQItem[];
  variant?: FAQVariant;
  /** Open the first item by default (server-rendered). */
  defaultOpenFirst?: boolean;
}

const placeholderFAQ: FAQItem[] = [
  {
    question: "Что такое финансовая грамотность и зачем она нужна?",
    answer: "Финансовая грамотность — это набор знаний и навыков, которые помогают принимать взвешенные решения о личных финансах: планировать бюджет, управлять долгами, инвестировать и защищаться от финансового мошенничества.",
  },
  {
    question: "Какие программы вы предлагаете для компаний?",
    answer: "Мы разрабатываем комплексные программы финансового well-being для сотрудников: онлайн-курсы, вебинары, индивидуальные консультации, марафоны и офлайн-мероприятия. Программы адаптируются под потребности конкретной компании.",
  },
  {
    question: "Как начать сотрудничество с НЦФГ?",
    answer: "Оставьте заявку на сайте или свяжитесь с нами напрямую. Наши специалисты проведут бесплатную консультацию, определят потребности и предложат оптимальное решение для вашей организации.",
  },
  {
    question: "Есть ли бесплатные материалы для самостоятельного изучения?",
    answer: "Да, мы предоставляем бесплатные материалы: статьи, чек-листы, памятки и видеоуроки по основам финансовой грамотности. Они доступны в разделе «Наработки» на нашем сайте.",
  },
  {
    question: "Работаете ли вы с государственными организациями?",
    answer: "Да, мы активно сотрудничаем с Минфином России, Центральным банком, региональными министерствами финансов и другими государственными структурами в рамках национальных проектов по повышению финансовой грамотности населения.",
  },
];

function FAQAccordionItem({
  item,
  defaultOpen,
  icon = "chevron",
}: {
  item: FAQItem;
  defaultOpen?: boolean;
  icon?: "chevron" | "plus";
}) {
  const ToggleIcon = icon === "plus" ? Plus : ChevronDown;

  return (
    <details
      className={cn(
        "group relative border-b border-[#E2E8F0]/70 last:border-b-0",
        "transition-colors hover:bg-white/60 open:bg-white/70"
      )}
      open={defaultOpen ? true : undefined}
    >
      {/* Hairline highlight + accent rail (decorative) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 transition-opacity duration-200 group-open:opacity-60"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-6 bottom-6 left-0 w-[2px] rounded-full bg-gradient-to-b from-[#58A8E0] via-[#3B82F6] to-transparent opacity-0 transition-opacity duration-200 group-open:opacity-100"
      />

      <summary className="faq-summary flex cursor-pointer select-none items-start justify-between gap-4 px-5 py-5 text-left md:px-6">
        <span className="text-[15px] font-semibold leading-snug text-[#1E3A5F] transition-colors group-hover:text-[#3B82F6] md:text-lg">
          {item.question}
        </span>
        <ToggleIcon
          size={20}
          className={cn(
            "mt-1 shrink-0 text-[#94A3B8] transition-transform duration-200",
            icon === "plus" ? "group-open:rotate-45" : "group-open:rotate-180"
          )}
          aria-hidden="true"
        />
      </summary>

      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pr-10 text-sm leading-relaxed text-[#475569] opacity-0 translate-y-1 transition duration-200 ease-out group-open:translate-y-0 group-open:opacity-100 md:px-6 md:text-base">
            {item.answer}
          </div>
        </div>
      </div>
    </details>
  );
}

function FAQAccordion({
  items,
  defaultOpenFirst = true,
  footer,
  withAtmosphere = false,
  className,
}: {
  items: FAQItem[];
  defaultOpenFirst?: boolean;
  footer?: React.ReactNode;
  withAtmosphere?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#E2E8F0]/70 bg-white shadow-sm",
        withAtmosphere && "bg-white/80 backdrop-blur-sm",
        className
      )}
    >
      {withAtmosphere && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,rgba(30,58,95,0.20)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,58,95,0.20)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-[#3B82F6]/10 blur-3xl" />
          <div className="absolute -bottom-44 left-1/4 h-[560px] w-[560px] rounded-full bg-[#58A8E0]/8 blur-3xl" />
        </div>
      )}

      <div className="relative">
        {items.map((item, index) => (
          <FAQAccordionItem
            key={`${index}-${item.question}`}
            item={item}
            defaultOpen={defaultOpenFirst && index === 0}
          />
        ))}
        {footer && (
          <div className="border-t border-[#E2E8F0]/70 px-5 py-4 text-sm text-[#475569] md:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function FAQCards({
  items,
  defaultOpenFirst = false,
}: {
  items: FAQItem[];
  defaultOpenFirst?: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item, index) => (
        <details
          key={`${index}-${item.question}`}
          className={cn(
            "group relative overflow-hidden rounded-xl border border-[#E2E8F0]/70 bg-white/85 shadow-sm backdrop-blur-sm",
            "transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3B82F6]/25 hover:shadow-lg hover:shadow-blue-500/10",
            "open:shadow-md"
          )}
          open={defaultOpenFirst && index === 0 ? true : undefined}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-60"
          />

          <summary className="faq-summary flex cursor-pointer select-none items-start justify-between gap-4 p-5 text-left">
            <span className="text-[15px] font-semibold leading-snug text-[#1E3A5F] transition-colors group-hover:text-[#3B82F6] md:text-lg">
              {item.question}
            </span>
            <Plus
              size={20}
              className="mt-1 shrink-0 text-[#94A3B8] transition-transform duration-200 group-open:rotate-45"
              aria-hidden="true"
            />
          </summary>

          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr]">
            <div className="overflow-hidden">
              <div className="px-5 pb-5 pr-10 text-sm leading-relaxed text-[#475569] opacity-0 translate-y-1 transition duration-200 ease-out group-open:translate-y-0 group-open:opacity-100 md:text-base">
                {item.answer}
              </div>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

function FAQSupportCard() {
  return (
    <aside className="relative overflow-hidden rounded-2xl border border-[#E2E8F0]/70 bg-white/85 p-6 shadow-sm backdrop-blur-sm">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#58A8E0] via-[#3B82F6] to-transparent"
      />

      <div className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0]/70 bg-white/70 px-3 py-1 text-xs font-semibold text-[#1E3A5F] backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-[#58A8E0]" aria-hidden="true" />
        Поддержка
      </div>

      <h3 className="mt-5 text-xl font-bold tracking-tight text-[#1E3A5F] md:text-2xl">
        Не нашли ответ?
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[#475569] md:text-base">
        Оставьте заявку, и мы подскажем формат сотрудничества и следующий шаг.
      </p>

      <ul role="list" className="mt-5 space-y-3 text-sm text-[#475569]">
        <li className="flex items-start gap-2.5">
          <Sparkles className="mt-0.5 h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
          <span>Бесплатная консультация по задаче</span>
        </li>
        <li className="flex items-start gap-2.5">
          <Clock3 className="mt-0.5 h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
          <span>Ответим в течение 1 рабочего дня</span>
        </li>
        <li className="flex items-start gap-2.5">
          <ListChecks className="mt-0.5 h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
          <span>Предложим план и набор материалов</span>
        </li>
      </ul>

      <div className="mt-6">
        <Button variant="secondary" href="#lead-form" className="w-full sm:w-auto">
          Оставить заявку
        </Button>
      </div>
    </aside>
  );
}

export function FAQ({
  title,
  lead,
  items,
  variant = "stage",
  defaultOpenFirst = true,
}: FAQProps) {
  const displayItems = items.length > 0 ? items : placeholderFAQ;
  const normalizedTitle = title.trim();
  const displayTitle =
    normalizedTitle.length === 0 || normalizedTitle.toLowerCase() === "faq"
      ? "Частые вопросы"
      : normalizedTitle;

  return (
    <Section id="faq" title={displayTitle} lead={lead}>
      <div className={cn(variant === "split" ? "max-w-5xl mx-auto" : "max-w-4xl mx-auto")}>
        {variant === "split" ? (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <FAQSupportCard />
            <FAQAccordion items={displayItems} defaultOpenFirst={defaultOpenFirst} />
          </div>
        ) : variant === "cards" ? (
          <>
            <FAQCards items={displayItems} defaultOpenFirst={false} />
            <div className="mt-5 flex flex-col items-start justify-between gap-3 text-sm text-[#475569] sm:flex-row sm:items-center">
              <p>Не нашли ответ? Оставьте заявку, и мы свяжемся с вами.</p>
              <Button variant="secondary" size="sm" href="#lead-form">
                Оставить заявку
              </Button>
            </div>
          </>
        ) : (
          <FAQAccordion
            items={displayItems}
            defaultOpenFirst={defaultOpenFirst}
            withAtmosphere
            footer={
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <p>Не нашли ответ? Оставьте заявку, и мы свяжемся с вами.</p>
                <Button variant="secondary" size="sm" href="#lead-form">
                  Оставить заявку
                </Button>
              </div>
            }
          />
        )}
      </div>
    </Section>
  );
}
