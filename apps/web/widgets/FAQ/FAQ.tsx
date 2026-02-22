import { ChevronDown } from "lucide-react";
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
  /** Open the first item by default (server-rendered). */
  defaultOpenFirst?: boolean;
}

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

function FAQAccordionItem({
  item,
  defaultOpen,
}: {
  item: FAQItem;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className={cn(
        "group relative border-b border-[#E2E8F0]/70 last:border-b-0",
        "open:bg-white/70"
      )}
      open={defaultOpen ? true : undefined}
    >
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
        <ChevronDown
          size={20}
          className="mt-1 shrink-0 text-[#94A3B8] transition-transform duration-200 group-open:rotate-180"
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
}: {
  items: FAQItem[];
  defaultOpenFirst?: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0]/70 bg-white/80 shadow-sm backdrop-blur-sm">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,rgba(30,58,95,0.20)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,58,95,0.20)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-[#3B82F6]/10 blur-3xl" />
        <div className="absolute -bottom-44 left-1/4 h-[560px] w-[560px] rounded-full bg-[#58A8E0]/8 blur-3xl" />
      </div>

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

export function FAQ({
  title,
  lead,
  items,
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
      <div className="max-w-4xl mx-auto">
        <FAQAccordion
          items={displayItems}
          defaultOpenFirst={defaultOpenFirst}
          footer={
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <p>Не нашли ответ? Оставьте заявку, и мы свяжемся с вами.</p>
              <Button variant="secondary" size="sm" href="#lead-form">
                Оставить заявку
              </Button>
            </div>
          }
        />
      </div>
    </Section>
  );
}
