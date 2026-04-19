"use client";

import {
  BrainCircuit,
  GraduationCap,
  HandHeart,
  Repeat2,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/shared/lib/cn";

type MissionDirectionTone = "psychology" | "children" | "support" | "habits";

interface MissionDirection {
  id: MissionDirectionTone;
  orderLabel: string;
  shortTitle: string;
  title: string;
  summary: string;
  focus: string;
  outcome: string;
  icon: LucideIcon;
}

interface DesktopPlacement {
  rest: string;
  active: string;
  stack: string;
}

interface MissionPatternShuffleDeckProps {
  className?: string;
}

const missionDirections = [
  {
    id: "psychology",
    orderLabel: "01",
    shortTitle: "Финансовая психология",
    title: "внедрение методик финансовой психологии и работы с установками",
    summary:
      "Помогает говорить не только о навыках, но и о причинах решений: сценариях, тревоге и личных установках.",
    focus: "установки и сценарии",
    outcome: "осознанные финансовые решения",
    icon: BrainCircuit,
  },
  {
    id: "children",
    orderLabel: "02",
    shortTitle: "Дети и экономика",
    title: "качественное финансовое и экономическое развитие детей",
    summary:
      "Собирает раннюю траекторию обучения: от базовых привычек до уверенного разговора о деньгах и выборе.",
    focus: "раннее развитие",
    outcome: "спокойное знакомство с деньгами",
    icon: GraduationCap,
  },
  {
    id: "support",
    orderLabel: "03",
    shortTitle: "Поддерживающая среда",
    title: "создание поддерживающей среды для взрослых",
    summary:
      "Делает тему финансов не разовой лекцией, а устойчивой средой, где взрослым проще менять поведение без стыда и давления.",
    focus: "среда и сопровождение",
    outcome: "устойчивый взрослый контекст",
    icon: HandHeart,
  },
  {
    id: "habits",
    orderLabel: "04",
    shortTitle: "Здоровые привычки",
    title: "внедрение здоровых финансовых привычек",
    summary:
      "Переводит знания в повторяемые действия: от маленьких рутин до понятной системы личных финансовых решений.",
    focus: "повседневные действия",
    outcome: "повторяемое полезное поведение",
    icon: Repeat2,
  },
] as const satisfies readonly MissionDirection[];

const desktopPlacements = [
  {
    rest: "left-[2%] top-[18%] rotate-[-10deg]",
    active: "left-[0%] top-[11%] rotate-[-4deg]",
    stack: "z-10",
  },
  {
    rest: "left-[12%] top-[16%] rotate-[-3deg]",
    active: "left-[9%] top-[10%] rotate-[-1deg]",
    stack: "z-20",
  },
  {
    rest: "left-[21%] top-[18%] rotate-[4deg]",
    active: "left-[18%] top-[11%] rotate-[1deg]",
    stack: "z-30",
  },
  {
    rest: "left-[31%] top-[24%] rotate-[10deg]",
    active: "left-[25%] top-[14%] rotate-[4deg]",
    stack: "z-40",
  },
] as const satisfies readonly DesktopPlacement[];

function MissionDirectionDetails({
  direction,
  activeIndex,
}: {
  direction: MissionDirection;
  activeIndex: number;
}) {
  const Icon = direction.icon;

  return (
    <section
      id="mission-shuffle-current-panel"
      aria-labelledby="mission-shuffle-current-direction"
      className="order-2 rounded-[30px] border border-[#DCE7F3] bg-white/92 p-5 shadow-[0_22px_60px_rgba(21,49,83,0.08)] md:p-7 xl:order-1"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#D7E7F8] bg-[#F3F8FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4D6A89]">
          Карточка в фокусе
        </span>
        <span className="text-sm font-medium text-[#688099]">Направление {direction.orderLabel}</span>
      </div>

      <div className="mt-5 flex items-start gap-4">
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-[#D8E7F8] bg-[linear-gradient(145deg,#F5FAFF_0%,#E8F2FF_100%)] text-[#1D4ED8] shadow-[0_12px_24px_rgba(59,130,246,0.14)]">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>

        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6B84A0]">
            {direction.shortTitle}
          </p>
          <h2
            id="mission-shuffle-current-direction"
            className="mt-2 text-[25px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#163153] md:text-[34px]"
          >
            {direction.title}
          </h2>
        </div>
      </div>

      <p className="mt-5 max-w-[52ch] text-[15px] leading-7 text-[#4F657F] md:text-base">
        {direction.summary}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <article className="rounded-[22px] border border-[#E1ECF7] bg-[#F8FBFF] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7790AA]">
            Фокус
          </p>
          <p className="mt-2 text-sm leading-6 text-[#254563] md:text-[15px]">
            {direction.focus}
          </p>
        </article>

        <article className="rounded-[22px] border border-[#E1ECF7] bg-[#F8FBFF] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7790AA]">
            Эффект
          </p>
          <p className="mt-2 text-sm leading-6 text-[#254563] md:text-[15px]">
            {direction.outcome}
          </p>
        </article>
      </div>

      <div className="mt-6 rounded-[24px] border border-[#DCE7F3] bg-[linear-gradient(135deg,rgba(239,247,255,0.92),rgba(255,255,255,0.96))] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6E87A2]">
          Поведение паттерна
        </p>
        <p className="mt-2 text-sm leading-6 text-[#48617D] md:text-[15px]">
          Hover временно поднимает карточку в фокус, а click и keyboard focus закрепляют
          выбор. Сейчас закреплена карточка №{activeIndex + 1}.
        </p>
      </div>
    </section>
  );
}

export function MissionPatternShuffleDeck({ className }: MissionPatternShuffleDeckProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const currentIndex = previewIndex ?? activeIndex;
  const currentDirection = missionDirections[currentIndex] ?? missionDirections[0];

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[38px] border border-[#DCE7F3] bg-[linear-gradient(180deg,rgba(247,250,255,0.96)_0%,rgba(255,255,255,0.98)_18%,#FFFFFF_100%)] p-5 shadow-[0_30px_90px_rgba(21,49,83,0.08)] md:p-8",
        className
      )}
    >
      <div className="max-w-[44rem]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3B82F6]">
          Shuffle Deck
        </p>
        <h2 className="mt-3 text-[32px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#153153] md:text-[46px]">
          Спокойная веерная колода для блока миссии
        </h2>
        <p className="mt-4 max-w-[58ch] text-[15px] leading-7 text-[#536781] md:text-base">
          Здесь карточки не соревнуются за внимание. Они образуют мягкий fan deck: контекст
          остаётся видимым, а выбранное направление поднимается вперёд без тяжёлой анимации.
        </p>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-start">
        <MissionDirectionDetails direction={currentDirection} activeIndex={activeIndex} />

        <div
          className="order-1 xl:order-2"
          onMouseLeave={() => setPreviewIndex(null)}
        >
          <div className="hidden rounded-[32px] border border-[#DCE7F3] bg-[radial-gradient(circle_at_top_left,rgba(88,168,224,0.22),transparent_42%),linear-gradient(180deg,#F9FBFF_0%,#EEF5FF_100%)] p-5 md:block">
            <div className="relative min-h-[520px] overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.66)_0%,rgba(243,248,255,0.92)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(88,168,224,0.18),transparent_28%),radial-gradient(circle_at_82%_84%,rgba(29,78,216,0.14),transparent_26%)]"
              />

              <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full border border-white/80 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#59728E] shadow-[0_6px_16px_rgba(21,49,83,0.05)]">
                  Hover / focus / click
                </span>
                <span className="inline-flex rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-medium text-[#64809E]">
                  4 направления в одном веере
                </span>
              </div>

              {missionDirections.map((direction, index) => {
                const Icon = direction.icon;
                const isSelected = activeIndex === index;
                const isCurrent = currentIndex === index;
                const placement = desktopPlacements[index];

                return (
                  <button
                    key={direction.id}
                    type="button"
                    aria-controls="mission-shuffle-current-panel"
                    aria-pressed={isSelected}
                    className={cn(
                      "group absolute flex h-[300px] w-[70%] max-w-[410px] flex-col overflow-hidden rounded-[30px] border px-5 py-5 text-left transition-[left,top,transform,box-shadow,border-color,background-color] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B82F6] motion-reduce:transition-none md:px-6 md:py-6",
                      isCurrent ? placement.active : placement.rest,
                      isCurrent ? "z-50 border-[#BED8F3] bg-white shadow-[0_28px_70px_rgba(21,49,83,0.18)]" : placement.stack,
                      !isCurrent && "border-white/70 bg-white/78 shadow-[0_14px_38px_rgba(21,49,83,0.10)]"
                    )}
                    onClick={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    onMouseEnter={() => setPreviewIndex(index)}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.88)_0%,rgba(239,247,255,0.82)_72%,rgba(220,235,255,0.76)_100%)]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#7DB2E8] to-transparent opacity-80"
                    />

                    <div className="relative z-10 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7490AB]">
                          Направление {direction.orderLabel}
                        </p>
                        <p className="mt-2 text-sm font-medium text-[#58718D]">
                          {direction.focus}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border text-[#1D4ED8] transition-colors duration-200 motion-reduce:transition-none",
                          isCurrent ? "border-[#D7E7F8] bg-[#EDF5FF]" : "border-[#E3EEF8] bg-white/72"
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>

                    <div className="relative z-10 mt-10 space-y-4">
                      <h3 className="text-[24px] font-semibold leading-[1.04] tracking-[-0.04em] text-[#183153]">
                        {direction.shortTitle}
                      </h3>
                      <p className="max-w-[28ch] text-sm leading-6 text-[#5B728C] md:text-[15px]">
                        {direction.title}
                      </p>
                    </div>

                    <div className="relative z-10 mt-auto flex items-end justify-between gap-4 pt-6">
                      <span className="inline-flex rounded-full border border-[#D9E7F5] bg-white/72 px-3 py-1 text-xs font-medium text-[#48627F]">
                        {direction.outcome}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold uppercase tracking-[0.14em]",
                          isSelected ? "text-[#1D4ED8]" : "text-[#8197AF]"
                        )}
                      >
                        {isSelected ? "Закреплено" : isCurrent ? "В фокусе" : "Выбрать"}
                      </span>
                    </div>
                  </button>
                );
              })}

              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/70 bg-white/66 px-4 py-3 shadow-[0_12px_28px_rgba(21,49,83,0.06)] backdrop-blur-sm">
                <p className="text-sm leading-6 text-[#4B6682]">
                  Карточка под курсором временно выходит вперёд, но основное состояние
                  фиксируется нажатием.
                </p>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6A84A0]">
                  reduced motion без лишнего сдвига
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:hidden">
            {missionDirections.map((direction, index) => {
              const Icon = direction.icon;
              const isSelected = activeIndex === index;

              return (
                <button
                  key={direction.id}
                  type="button"
                  aria-controls="mission-shuffle-current-panel"
                  aria-pressed={isSelected}
                  className={cn(
                    "group rounded-[24px] border px-4 py-4 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] motion-reduce:transition-none",
                    isSelected ? "border-[#BED8F3] bg-[#F4F9FF] shadow-[0_16px_36px_rgba(21,49,83,0.08)]" : "border-[#DCE7F3] bg-white"
                  )}
                  onClick={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7290AC]">
                        Направление {direction.orderLabel}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold leading-tight tracking-[-0.03em] text-[#183153]">
                        {direction.shortTitle}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#5B728C]">
                        {direction.title}
                      </p>
                    </div>

                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-[#DDE9F6] bg-[#F8FBFF] text-[#1D4ED8]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
