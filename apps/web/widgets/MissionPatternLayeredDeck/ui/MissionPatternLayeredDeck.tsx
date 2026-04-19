"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/shared/lib/cn";
import { Container } from "@/shared/ui/Container";

import {
  MISSION_PATTERN_LAYERED_DECK_DIRECTIONS,
  MISSION_PATTERN_LAYERED_DECK_INTRO,
} from "../model/directions";

interface MissionPatternLayeredDeckProps {
  embedded?: boolean;
}

const DESKTOP_LAYER_CLASSES = [
  {
    shell:
      "z-30 translate-x-0 translate-y-0 scale-100 opacity-100 motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100",
    card:
      "border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(244,249,255,0.98)_100%)] shadow-[0_30px_80px_rgba(18,45,78,0.18)]",
    glow: "opacity-100",
  },
  {
    shell:
      "z-20 translate-x-5 translate-y-10 scale-[0.97] opacity-95 motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100",
    card:
      "border-[#D7E5F6] bg-[linear-gradient(180deg,rgba(246,250,255,0.98)_0%,rgba(234,242,252,0.98)_100%)] shadow-[0_22px_55px_rgba(18,45,78,0.12)]",
    glow: "opacity-70",
  },
  {
    shell:
      "z-10 translate-x-10 translate-y-20 scale-[0.94] opacity-80 motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100",
    card:
      "border-[#D5E0EF] bg-[linear-gradient(180deg,rgba(242,247,253,0.98)_0%,rgba(228,237,248,0.98)_100%)] shadow-[0_16px_40px_rgba(18,45,78,0.10)]",
    glow: "opacity-45",
  },
] as const;

function getWrappedIndex(index: number): number {
  const total = MISSION_PATTERN_LAYERED_DECK_DIRECTIONS.length;

  if (index >= total) {
    return index % total;
  }

  if (index < 0) {
    return (index % total + total) % total;
  }

  return index;
}

function MissionDirectionTabs({
  activeIndex,
  baseId,
  onSelect,
}: {
  activeIndex: number;
  baseId: string;
  onSelect: (index: number) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Направления миссии"
      aria-describedby={`${baseId}-hint`}
      className="grid gap-3"
    >
      {MISSION_PATTERN_LAYERED_DECK_DIRECTIONS.map((direction, index) => {
        const Icon = direction.icon;
        const isActive = index === activeIndex;

        return (
          <button
            key={direction.id}
            type="button"
            aria-pressed={isActive}
            onMouseEnter={() => onSelect(index)}
            onFocus={() => onSelect(index)}
            onClick={() => onSelect(index)}
            className={cn(
              "group flex w-full items-start gap-4 rounded-[24px] border px-4 py-4 text-left transition-all duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] motion-reduce:transition-none md:px-5",
              isActive
                ? "border-[#BFD5EE] bg-[linear-gradient(180deg,#FFFFFF_0%,#F5F9FF_100%)] shadow-[0_16px_35px_rgba(18,45,78,0.10)]"
                : "border-[#D8E4F2] bg-white/76 hover:border-[#BFD5EE] hover:bg-white"
            )}
          >
            <span
              className={cn(
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-[#1E3A5F] transition-colors duration-300 motion-reduce:transition-none",
                isActive
                  ? "border-[#C9DCF3] bg-[#E9F2FD]"
                  : "border-[#DCE7F3] bg-[#F5F9FF] group-hover:bg-[#EEF5FF]"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7390B2]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-2 block text-base font-semibold leading-6 text-[#163153] md:text-[17px]">
                {direction.label}
              </span>
              <span className="mt-2 block text-sm leading-6 text-[#5E738E]">
                {direction.summary}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MissionLayerCard({
  index,
  depth,
  onSelect,
}: {
  index: number;
  depth: number;
  onSelect: (index: number) => void;
}) {
  const direction = MISSION_PATTERN_LAYERED_DECK_DIRECTIONS[index];
  const Icon = direction.icon;
  const isActive = depth === 0;
  const layerClasses = DESKTOP_LAYER_CLASSES[depth];

  return (
    <button
      type="button"
      onMouseEnter={() => onSelect(index)}
      onFocus={() => onSelect(index)}
      onClick={() => onSelect(index)}
      aria-label={
        isActive ? `${direction.label}. Активный слой` : `Открыть слой ${direction.label}`
      }
      className={cn(
        "absolute inset-x-0 top-0 h-[31rem] origin-top-left rounded-[34px] text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        layerClasses.shell
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-[7%] top-[72%] h-24 rounded-full bg-[radial-gradient(circle,rgba(74,132,214,0.22)_0%,rgba(74,132,214,0)_74%)] blur-2xl transition-opacity duration-500 motion-reduce:hidden",
          layerClasses.glow
        )}
      />

      <article
        aria-hidden={!isActive}
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[34px] border p-6 transition-all duration-500 motion-reduce:transition-none md:p-8",
          layerClasses.card
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(88,168,224,0.16),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.15),transparent_46%)]" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6E88A8]">
                Направление {String(index + 1).padStart(2, "0")}
              </p>
              <h3
                className={cn(
                  "mt-3 max-w-[20ch] text-[26px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#153153] transition-opacity duration-300 motion-reduce:transition-none",
                  !isActive && "max-w-[16ch] text-[21px] leading-[1.08]"
                )}
              >
                {isActive ? direction.title : direction.label}
              </h3>
            </div>

            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D5E3F2] bg-white/70 text-[#1E3A5F] shadow-[0_10px_24px_rgba(18,45,78,0.08)]">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>

          <div className="mt-auto">
            {isActive ? (
              <>
                <p className="max-w-[42ch] text-[15px] leading-7 text-[#52657D] md:text-base">
                  {direction.detail}
                </p>

                <ul className="mt-6 grid gap-3 text-sm leading-6 text-[#234361] md:grid-cols-2 md:text-[15px]">
                  {direction.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="rounded-[20px] border border-[#D8E4F2] bg-white/78 px-4 py-3"
                    >
                      {outcome}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1D4ED8]">
                  <span>Слой вынесен на передний план</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </div>
              </>
            ) : (
              <p className="max-w-[28ch] text-sm leading-6 text-[#5E738E]">{direction.summary}</p>
            )}
          </div>
        </div>
      </article>
    </button>
  );
}

function MissionPatternLayeredDeckBody() {
  const baseId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDirection = MISSION_PATTERN_LAYERED_DECK_DIRECTIONS[activeIndex];
  const ActiveDirectionIcon = activeDirection.icon;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] xl:items-start">
      <div className="max-w-[36rem]">
        <div className="rounded-[32px] border border-[#DCE7F3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,250,255,0.95)_100%)] p-6 shadow-[0_18px_45px_rgba(18,45,78,0.07)] md:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4C83D5]">
            Миссия / ценность
          </p>
          <h2 className="mt-4 text-[32px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#153153] md:text-[46px]">
            Контролируемая слоистая колода для миссии
          </h2>
          <p className="mt-5 max-w-[42ch] text-base leading-7 text-[#52657D] md:text-lg">
            {MISSION_PATTERN_LAYERED_DECK_INTRO}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm leading-6 text-[#38506C]">
            <span className="rounded-full border border-[#D5E1EF] bg-[#F7FAFF] px-4 py-2">
              Hover и focus меняют активный слой
            </span>
            <span className="rounded-full border border-[#D5E1EF] bg-[#F7FAFF] px-4 py-2">
              Click и tap фиксируют выбор
            </span>
            <span className="rounded-full border border-[#D5E1EF] bg-[#F7FAFF] px-4 py-2">
              На мобильном виден один основной слой
            </span>
          </div>
        </div>

        <div className="mt-5 hidden xl:block">
          <MissionDirectionTabs
            activeIndex={activeIndex}
            baseId={baseId}
            onSelect={setActiveIndex}
          />
        </div>
      </div>

      <div className="xl:hidden">
        <div className="rounded-[30px] border border-[#DCE7F3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,249,255,0.95)_100%)] p-5 shadow-[0_18px_45px_rgba(18,45,78,0.07)] md:p-6">
          <div aria-live="polite">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6E88A8]">
                  Направление {String(activeIndex + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-[25px] font-semibold leading-[1.04] tracking-[-0.045em] text-[#153153] md:text-[30px]">
                  {activeDirection.title}
                </h3>
              </div>
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D5E3F2] bg-white/80 text-[#1E3A5F]">
                <ActiveDirectionIcon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>

            <p className="mt-5 text-[15px] leading-7 text-[#52657D]">{activeDirection.detail}</p>

            <ul className="mt-5 grid gap-3 text-sm leading-6 text-[#234361]">
              {activeDirection.outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="rounded-[18px] border border-[#D8E4F2] bg-white/80 px-4 py-3"
                >
                  {outcome}
                </li>
              ))}
            </ul>
          </div>

          <div role="group" aria-label="Направления миссии" className="mt-5 grid gap-2 sm:grid-cols-2">
            {MISSION_PATTERN_LAYERED_DECK_DIRECTIONS.map((direction, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={direction.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  className={cn(
                    "rounded-[18px] border px-4 py-3 text-left text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] motion-reduce:transition-none",
                    isActive
                      ? "border-[#BFD5EE] bg-[#EEF5FF] text-[#163153]"
                      : "border-[#D8E4F2] bg-white text-[#4F6783]"
                  )}
                >
                  {direction.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative hidden min-h-[38rem] xl:block">
        <div className="absolute inset-0 rounded-[38px] border border-[#DCE7F3] bg-[linear-gradient(180deg,rgba(255,255,255,0.60)_0%,rgba(234,242,252,0.34)_100%)]" />
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[38px] bg-[radial-gradient(circle_at_top_left,rgba(88,168,224,0.20),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(29,78,216,0.12),transparent_24%)]"
        />
        <div className="relative h-full px-6 py-7">
          <p id={`${baseId}-hint`} className="sr-only">
            Навигация по четырём направлениям миссии. Наведите курсор, переведите фокус или
            нажмите на карточку либо контрол слева, чтобы вынести слой на передний план.
          </p>

          <div className="pointer-events-none absolute right-7 top-7 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6E88A8] shadow-[0_10px_24px_rgba(18,45,78,0.06)]">
            <Sparkles className="h-4 w-4 text-[#4C83D5]" aria-hidden="true" />
            Видно 3 слоя
          </div>

          {[0, 1, 2].map((depth) => (
            <MissionLayerCard
              key={MISSION_PATTERN_LAYERED_DECK_DIRECTIONS[getWrappedIndex(activeIndex + depth)].id}
              index={getWrappedIndex(activeIndex + depth)}
              depth={depth}
              onSelect={setActiveIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MissionPatternLayeredDeck({
  embedded = false,
}: MissionPatternLayeredDeckProps) {
  if (embedded) {
    return <MissionPatternLayeredDeckBody />;
  }

  return (
    <section className="relative overflow-hidden py-10 md:py-14">
      <Container>
        <MissionPatternLayeredDeckBody />
      </Container>
    </section>
  );
}
