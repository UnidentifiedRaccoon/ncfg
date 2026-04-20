"use client";

import {
  BrainCircuit,
  GraduationCap,
  HandHeart,
  Repeat2,
  type LucideIcon,
} from "lucide-react";
import { type KeyboardEvent, useId, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";
import { Section } from "@/shared/ui/Section";

type DirectionTone = "psychology" | "children" | "support" | "habits";
type HeadingTag = "h2" | "h3";

interface DirectionItem {
  id: DirectionTone;
  label: string;
  title: string;
  summary: string;
  detail: string;
  outcomes: readonly string[];
  note: string;
  icon: LucideIcon;
  accentClassName: string;
  coverClassName: string;
}

interface MissionPatternFlipLedgerProps {
  embedded?: boolean;
  headingAs?: HeadingTag;
}

const introText =
  "Решаем комплексные задачи в области финансового благополучия через аккуратный разворот: сначала внимание, затем содержание.";

const missionDirections = [
  {
    id: "psychology",
    label: "Направление 01",
    title: "внедрение методик финансовой психологии и работы с установками",
    summary:
      "Начинаем с причин: как установки, тревога и автоматические реакции влияют на денежные решения.",
    detail:
      "Разворот держит акцент на смысле, а не на эффекте. Поэтому даже при переключении сценарий читается как спокойный обзор практик, а не как аттракцион.",
    outcomes: [
      "помогает увидеть скрытые сценарии поведения",
      "делает разговор о деньгах спокойнее и предметнее",
      "даёт основу для дальнейших изменений",
    ],
    note: "Обложка приоткрывается, но текст остаётся на плоском листе и не уходит в 3D.",
    icon: BrainCircuit,
    accentClassName:
      "from-[#E9F2FF] via-[#F8FBFF] to-[#F4F8FF] text-[#163B6B] ring-[#BFDBFE]",
    coverClassName:
      "border-[#CFE0F7] bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(235,243,255,0.94)_100%)]",
  },
  {
    id: "children",
    label: "Направление 02",
    title: "качественное финансовое и экономическое развитие детей",
    summary:
      "Показываем путь от первых бытовых решений к системному пониманию денег, труда и выбора.",
    detail:
      "Folio-подача помогает держать образовательный тон: один экран показывает направление, второй — зачем оно нужно и как выглядит на практике.",
    outcomes: [
      "переводит абстрактные темы в понятные бытовые ситуации",
      "поддерживает разговор между ребёнком и взрослым",
      "собирает обучение в связную траекторию",
    ],
    note: "На мобильном слой с обложкой схлопывается в обычную карточку, чтобы не терять читаемость.",
    icon: GraduationCap,
    accentClassName:
      "from-[#EEF7F2] via-[#FBFEFC] to-[#F4FBF7] text-[#1E4F43] ring-[#BFDDD1]",
    coverClassName:
      "border-[#D8EADF] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(236,248,241,0.95)_100%)]",
  },
  {
    id: "support",
    label: "Направление 03",
    title: "создание поддерживающей среды для взрослых",
    summary:
      "Формируем пространство, где человеку не нужно разбираться с финансовыми задачами в одиночку.",
    detail:
      "Здесь важен эффект доверия: поверхность выглядит как спокойный рабочий folio, а не как карточка с резким hover-эффектом.",
    outcomes: [
      "снижает порог входа в сложные темы",
      "создаёт ощущение навигации и опоры",
      "поддерживает разговор о деньгах без давления",
    ],
    note: "Фокусный контур вынесен наружу: клавиатурная навигация не теряется в декоративных слоях.",
    icon: HandHeart,
    accentClassName:
      "from-[#FFF2EC] via-[#FFFCFB] to-[#FFF7F2] text-[#6C341C] ring-[#F8D3C0]",
    coverClassName:
      "border-[#F1DED3] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,241,233,0.94)_100%)]",
  },
  {
    id: "habits",
    label: "Направление 04",
    title: "внедрение здоровых финансовых привычек",
    summary:
      "Фиксируем не разовые действия, а повторяемые паттерны, которые удерживаются в обычной жизни.",
    detail:
      "У этого направления самый понятный для интерфейса ритм: короткий заголовок, ясная расшифровка и набор конкретных эффектов без перегруза.",
    outcomes: [
      "переводит намерения в регулярные действия",
      "делает полезные шаги заметными и измеримыми",
      "укрепляет повседневную финансовую устойчивость",
    ],
    note: "Режим reduced motion оставляет только смену слоёв и цвета, без подъёма и поворота обложки.",
    icon: Repeat2,
    accentClassName:
      "from-[#EEF3FF] via-[#FCFDFF] to-[#F3F6FF] text-[#26396B] ring-[#D0D8FA]",
    coverClassName:
      "border-[#D8E0F6] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(238,242,255,0.95)_100%)]",
  },
] satisfies readonly DirectionItem[];

function MissionPatternFlipLedgerPanel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDirection = missionDirections[activeIndex] ?? missionDirections[0];
  const idPrefix = useId();
  const panelId = `${idPrefix}-panel`;
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusTab(nextIndex: number) {
    setActiveIndex(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = missionDirections.length - 1;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        focusTab(index === lastIndex ? 0 : index + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        focusTab(index === 0 ? lastIndex : index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(lastIndex);
        break;
      default:
        break;
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.84fr_1.16fr] xl:items-start">
      <div className="space-y-4">
        <div className="rounded-[30px] border border-[#E2E8F0] bg-[linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_100%)] p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.45)] md:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5B7AA3]">
            Вариант flip-ledger
          </p>
          <p className="mt-3 max-w-[32rem] text-base leading-7 text-[#475569] md:text-[17px]">
            {introText}
          </p>
        </div>

        <div
          aria-label="Направления миссии"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1"
          role="tablist"
        >
          {missionDirections.map((direction, index) => {
            const Icon = direction.icon;
            const isActive = activeIndex === index;
            const tabId = `${idPrefix}-${direction.id}-tab`;

            return (
              <button
                key={direction.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                aria-controls={panelId}
                aria-selected={isActive}
                className={cn(
                  "group relative min-h-[180px] overflow-hidden rounded-[28px] text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B82F6]",
                  isActive && "z-10"
                )}
                id={tabId}
                onClick={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                onMouseEnter={() => setActiveIndex(index)}
                role="tab"
                tabIndex={isActive ? 0 : -1}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-0 rounded-[28px] bg-[linear-gradient(180deg,#F5F8FC_0%,#EAF0F8_100%)]",
                    isActive && "bg-[linear-gradient(180deg,#EDF5FF_0%,#E1ECFA_100%)]"
                  )}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-y-4 left-4 w-[3px] rounded-full bg-[#D7E4F3]"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-3 inset-y-2 rounded-[24px] border border-white/90 bg-white/92 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.48)] transition-[transform,box-shadow,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none md:group-hover:translate-x-[6px] md:group-hover:-translate-y-[3px]",
                    direction.coverClassName,
                    isActive &&
                      "translate-x-[10px] -translate-y-[5px] rotate-[1.15deg] shadow-[0_24px_48px_-30px_rgba(15,23,42,0.48)]"
                  )}
                />
                <span className="relative z-10 flex h-full flex-col gap-5 p-5 md:p-6">
                  <span className="flex items-start justify-between gap-4">
                    <span
                      className={cn(
                        "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/75 text-[#1D4ED8] shadow-[0_10px_22px_-18px_rgba(29,78,216,0.6)]",
                        isActive && "bg-white text-[#163B6B]"
                      )}
                    >
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="rounded-full border border-[#DCE6F3] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B85A8]">
                      {direction.label}
                    </span>
                  </span>
                  <span className="space-y-3">
                    <span className="block text-lg font-semibold leading-snug text-[#1E3A5F]">
                      {direction.title}
                    </span>
                    <span className="block text-sm leading-6 text-[#52657C]">
                      {direction.summary}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <article
        aria-labelledby={`${idPrefix}-${activeDirection.id}-tab`}
        className={cn(
          "relative overflow-hidden rounded-[32px] border border-[#D8E4F1] bg-gradient-to-br p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.42)] md:p-8",
          "ring-1 ring-inset",
          activeDirection.accentClassName
        )}
        id={panelId}
        role="tabpanel"
        tabIndex={0}
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-[22px] hidden w-px bg-[linear-gradient(180deg,rgba(148,163,184,0.1)_0%,rgba(148,163,184,0.5)_24%,rgba(148,163,184,0.18)_100%)] md:block"
        />
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-6 right-5 hidden w-[38%] rounded-[26px] border shadow-[0_26px_50px_-42px_rgba(15,23,42,0.55)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none xl:block",
            activeDirection.coverClassName,
            "translate-x-3 -translate-y-2 rotate-[1.8deg]"
          )}
        />
        <span
          aria-hidden="true"
          className="absolute bottom-4 right-4 h-32 w-32 rounded-full bg-white/70 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="absolute right-3 top-10 hidden h-[70%] w-3 rounded-full bg-[repeating-linear-gradient(180deg,rgba(191,219,254,0.9)_0px,rgba(191,219,254,0.9)_6px,rgba(255,255,255,0.88)_6px,rgba(255,255,255,0.88)_11px)] opacity-75 xl:block"
        />

        <div className="relative z-10 max-w-[38rem] space-y-6 md:space-y-7">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#5B7AA3]">
              {activeDirection.label}
            </p>
            <h3 className="max-w-[28rem] text-[24px] font-semibold leading-[1.2] tracking-tight text-[#1E3A5F] md:text-[32px]">
              {activeDirection.title}
            </h3>
            <p className="max-w-[36rem] text-base leading-7 text-[#475569] md:text-[17px]">
              {activeDirection.detail}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {activeDirection.outcomes.map((outcome, outcomeIndex) => (
              <div
                key={outcome}
                className="rounded-[22px] border border-white/80 bg-white/78 p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.45)]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7B92B2]">
                  Эффект {outcomeIndex + 1}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#334155]">{outcome}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[24px] border border-white/75 bg-white/82 p-5 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.38)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5B7AA3]">
              Что важно в этом варианте
            </p>
            <p className="mt-3 text-base leading-7 text-[#475569]">{activeDirection.note}</p>
          </div>
        </div>
      </article>
    </div>
  );
}

export function MissionPatternFlipLedger({
  embedded = false,
  headingAs = "h2",
}: MissionPatternFlipLedgerProps) {
  if (embedded) {
    return <MissionPatternFlipLedgerPanel />;
  }

  const Heading = headingAs;

  return (
    <Section
      className="pt-8 pb-4 md:pt-10 md:pb-6"
      id="mission-pattern-flip-ledger"
      reveal={false}
    >
      <div className="mb-8 max-w-[44rem] space-y-4 md:mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#5B7AA3]">
          Паттерн миссии
        </p>
        <Heading className="text-[30px] font-semibold leading-[1.08] tracking-tight text-[#1E3A5F] md:text-[42px]">
          Миссия в формате сдержанного folio-разворота
        </Heading>
        <p className="text-base leading-7 text-[#52657C] md:text-[17px]">
          Вариант с мягким ощущением разворота и частично приподнятой обложкой. Слой
          движения остаётся декоративным, поэтому содержание не теряется ни на desktop, ни
          на mobile.
        </p>
      </div>
      <MissionPatternFlipLedgerPanel />
    </Section>
  );
}
