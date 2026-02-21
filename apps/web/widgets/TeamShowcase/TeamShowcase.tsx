import type { ComponentType } from "react";
import { Container } from "@/shared/ui/Container";
import { splitTeamMembers } from "./team-showcase-utils";
import type { TeamShowcaseProps, TeamShowcaseVariantProps } from "./types";
import { TeamVariantCapitalDesk } from "./variants/TeamVariantCapitalDesk";
import { TeamVariantSignalBoard } from "./variants/TeamVariantSignalBoard";
import { TeamVariantTrustRail } from "./variants/TeamVariantTrustRail";

interface ShowcaseVariant {
  id: string;
  title: string;
  caption: string;
  description: string;
  Component: ComponentType<TeamShowcaseVariantProps>;
}

const variants: ShowcaseVariant[] = [
  {
    id: "capital-desk",
    title: "Capital Desk",
    caption: "Светлая премиальная композиция",
    description:
      "Лидерская карточка в фокусе и компактная сетка команды для быстрого сканирования.",
    Component: TeamVariantCapitalDesk,
  },
  {
    id: "signal-board",
    title: "Signal Board",
    caption: "Темная fintech-панель",
    description:
      "Контрастный визуальный ритм, top-rails и dashboard-подача для технологичного тона.",
    Component: TeamVariantSignalBoard,
  },
  {
    id: "trust-rail",
    title: "Trust Rail",
    caption: "Narrative-маршрут команды",
    description:
      "Карточки-станции подчеркивают последовательность экспертизы и ощущение надежности.",
    Component: TeamVariantTrustRail,
  },
];

const DEFAULT_SHOWCASE_LEAD =
  "Три концепции блока «Наша команда» в духе современного банкинга, адаптированные к текущей дизайн-системе НЦФГ.";

export function TeamShowcase({ title, lead, members }: TeamShowcaseProps) {
  const { teamMembers, leader, regularMembers } = splitTeamMembers(members);
  if (teamMembers.length === 0) return null;

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

          <p className="mt-4 max-w-4xl text-base leading-relaxed text-[#475569] md:text-lg">
            {lead ?? DEFAULT_SHOWCASE_LEAD}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/10 px-3 py-1 text-xs font-semibold text-[#1E3A5F]">
              3 концепта
            </span>
            <span className="inline-flex items-center rounded-full border border-[#DBEAFE] bg-white px-3 py-1 text-xs font-semibold text-[#1E3A5F]">
              {teamMembers.length} участников в составе
            </span>
            <span className="text-sm text-[#64748B]">
              Один и тот же набор данных для сравнения визуальных сценариев
            </span>
          </div>

          <nav aria-label="Навигация по вариантам команды" className="mt-8">
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

                <VariantComponent
                  members={teamMembers}
                  leader={leader}
                  regularMembers={regularMembers}
                />
              </section>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
