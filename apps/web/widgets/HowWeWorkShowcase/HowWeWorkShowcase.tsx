import type { ComponentType } from "react";
import { Container } from "@/shared/ui/Container";
import { HowWeWorkVariantFlowCards } from "./variants/HowWeWorkVariantFlowCards";
import { HowWeWorkVariantOpsBoard } from "./variants/HowWeWorkVariantOpsBoard";
import { HowWeWorkVariantPulseRail } from "./variants/HowWeWorkVariantPulseRail";
import type { HowWeWorkShowcaseProps, HowWeWorkVariantProps } from "./types";

interface ShowcaseVariant {
  id: string;
  title: string;
  caption: string;
  description: string;
  Component: ComponentType<HowWeWorkVariantProps>;
}

const variants: ShowcaseVariant[] = [
  {
    id: "pulse-rail",
    title: "Pulse Rail",
    caption: "Светлый premium-таймлайн",
    description:
      "Центральная rail-линия, мягкие пульс-маркеры и стеклянные карточки с banking-пластикой.",
    Component: HowWeWorkVariantPulseRail,
  },
  {
    id: "ops-board",
    title: "Ops Board",
    caption: "Тёмная fintech-панель",
    description:
      "Контрастная dashboard-композиция с progress-треком и карточками этапов в стиле операционного контура.",
    Component: HowWeWorkVariantOpsBoard,
  },
  {
    id: "flow-cards",
    title: "Flow Cards",
    caption: "Editorial banking-flow",
    description:
      "Смягчённая асимметрия сетки, крупные номера шагов и акцент на читаемом ритме длинных описаний.",
    Component: HowWeWorkVariantFlowCards,
  },
];

export function HowWeWorkShowcase({ title, lead, steps }: HowWeWorkShowcaseProps) {
  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="rounded-[28px] border border-[#E2E8F0]/80 bg-white p-6 shadow-[0_18px_46px_rgba(15,23,42,0.08)] md:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3B82F6]">
            Демо-концепты
          </p>

          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#1E3A5F] md:text-4xl lg:text-[44px]">
            {title}
          </h1>

          {lead && (
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#475569] md:text-lg">
              {lead}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/10 px-3 py-1 text-xs font-semibold text-[#1E3A5F]">
              3 концепта
            </span>
            <span className="text-sm text-[#64748B]">
              Визуальный вектор: современный banking в текущей дизайн-системе НЦФГ
            </span>
          </div>

          <nav aria-label="Навигация по вариантам" className="mt-8">
            <ul className="flex list-none flex-wrap gap-2 p-0">
              {variants.map((variant, index) => (
                <li key={variant.id}>
                  <a
                    href={`#${variant.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#1E3A5F] transition-colors hover:border-[#3B82F6]/35 hover:text-[#3B82F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                  >
                    <span className="font-mono text-xs text-[#64748B]">0{index + 1}</span>
                    {variant.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 space-y-10 md:mt-12 md:space-y-12">
          {variants.map((variant, index) => {
            const VariantComponent = variant.Component;

            return (
              <section
                key={variant.id}
                id={variant.id}
                className="scroll-mt-24 rounded-[28px] border border-[#E2E8F0]/80 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.08)] md:p-7 lg:p-8"
                aria-labelledby={`${variant.id}-title`}
              >
                <div className="mb-6 flex flex-col gap-3 md:mb-8">
                  <span className="inline-flex w-fit items-center rounded-full bg-[#3B82F6]/10 px-3 py-1 text-xs font-mono font-semibold tracking-wide text-[#1E3A5F]">
                    Вариант 0{index + 1}
                  </span>

                  <h2
                    id={`${variant.id}-title`}
                    className="text-2xl font-semibold leading-tight tracking-tight text-[#1E3A5F] md:text-[32px]"
                  >
                    {variant.title}
                  </h2>

                  <p className="text-sm font-medium text-[#3B82F6] md:text-base">
                    {variant.caption}
                  </p>

                  <p className="max-w-4xl text-sm leading-relaxed text-[#475569] md:text-base">
                    {variant.description}
                  </p>
                </div>

                <VariantComponent steps={steps} />
              </section>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
