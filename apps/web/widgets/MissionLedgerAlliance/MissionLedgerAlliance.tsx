"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { type KeyboardEvent, useId, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";
import { Section } from "@/shared/ui/Section";

import {
  missionDirections,
  missionIntroHighlights,
  missionIntroTitle,
} from "./model/directions";

type HeadingTag = "h2" | "h3";

interface MissionLedgerAllianceProps {
  embedded?: boolean;
  headingAs?: HeadingTag;
}

const desktopLayerClasses = [
  {
    shell:
      "z-30 translate-x-0 translate-y-0 scale-100 opacity-100 motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100",
    card:
      "border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(244,249,255,0.98)_100%)] shadow-[0_30px_80px_rgba(18,45,78,0.18)]",
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
  const total = missionDirections.length;

  if (index >= total) {
    return index % total;
  }

  if (index < 0) {
    return (index % total + total) % total;
  }

  return index;
}

function MissionDirectionControls({
  activeIndex,
  baseId,
  controlRefs,
  onKeyDown,
  onSelect,
}: {
  activeIndex: number | null;
  baseId: string;
  controlRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, index: number) => void;
  onSelect: (index: number) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Направления миссии"
      aria-describedby={`${baseId}-hint`}
      className="grid gap-3"
    >
      {missionDirections.map((direction, index) => {
        const Icon = direction.icon;
        const isActive = index === activeIndex;

        return (
          <button
            key={direction.id}
            ref={(node) => {
              controlRefs.current[index] = node;
            }}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(index)}
            onFocus={() => onSelect(index)}
            onMouseEnter={() => onSelect(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
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
              <span className="block text-base font-semibold leading-6 text-[#163153] md:text-[17px]">
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
  const direction = missionDirections[index];
  const Icon = direction.icon;
  const isActive = depth === 0;
  const layerClass = desktopLayerClasses[depth];

  return (
    <div
      onClick={() => onSelect(index)}
      onMouseEnter={() => onSelect(index)}
      className={cn(
        "absolute inset-x-0 top-0 h-[31rem] origin-top-left cursor-pointer rounded-[34px] text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        layerClass.shell
      )}
      role="presentation"
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-[7%] top-[72%] h-24 rounded-full bg-[radial-gradient(circle,rgba(74,132,214,0.22)_0%,rgba(74,132,214,0)_74%)] blur-2xl transition-opacity duration-500 motion-reduce:hidden",
          layerClass.glow
        )}
      />

      <article
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[34px] border p-6 transition-all duration-500 motion-reduce:transition-none md:p-8",
          layerClass.card
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(88,168,224,0.16),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.15),transparent_46%)]" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6E88A8]">
                {direction.label}
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
    </div>
  );
}

function MissionIntroCard({ depth }: { depth: number }) {
  const layerClass = desktopLayerClasses[depth];

  return (
    <div
      className={cn(
        "absolute inset-x-0 top-0 h-[31rem] origin-top-left rounded-[34px] text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        layerClass.shell
      )}
      role="presentation"
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-[7%] top-[72%] h-24 rounded-full bg-[radial-gradient(circle,rgba(74,132,214,0.22)_0%,rgba(74,132,214,0)_74%)] blur-2xl transition-opacity duration-500 motion-reduce:hidden",
          layerClass.glow
        )}
      />

      <article
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[34px] border p-6 transition-all duration-500 motion-reduce:transition-none md:p-8",
          layerClass.card
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(88,168,224,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.18),transparent_46%)]" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="max-w-[18ch] text-[30px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#153153]">
                {missionIntroTitle}
              </h3>
            </div>

            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D5E3F2] bg-white/70 text-[#1E3A5F] shadow-[0_10px_24px_rgba(18,45,78,0.08)]">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>

          <div className="mt-auto">
            <ul className="grid gap-3 text-sm leading-6 text-[#234361] md:grid-cols-2 md:text-[15px]">
              {missionIntroHighlights.map((highlight) => (
                <li
                  key={highlight}
                  className="rounded-[20px] border border-[#D8E4F2] bg-white/78 px-4 py-3"
                >
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
    </div>
  );
}

function MissionLedgerAlliancePanel({ headingAs = "h2" }: { headingAs?: HeadingTag }) {
  const Heading = headingAs;
  const baseId = useId();
  const controlRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeDirection = activeIndex === null ? null : missionDirections[activeIndex];
  const ActiveDirectionIcon = activeDirection?.icon ?? Sparkles;

  function focusControl(index: number) {
    const wrappedIndex = getWrappedIndex(index);

    setActiveIndex(wrappedIndex);
    controlRefs.current[wrappedIndex]?.focus();
  }

  function handleControlKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = missionDirections.length - 1;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        focusControl(index === lastIndex ? 0 : index + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        focusControl(index === 0 ? lastIndex : index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusControl(0);
        break;
      case "End":
        event.preventDefault();
        focusControl(lastIndex);
        break;
      default:
        break;
    }
  }

  return (
    <div
      className="grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-start"
      onMouseLeave={() => setActiveIndex(null)}
    >
      <Heading className="sr-only">{missionIntroTitle}</Heading>
      <div className="order-2 xl:order-2">
        <div className="xl:hidden">
          <div className="rounded-[30px] border border-[#DCE7F3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,249,255,0.95)_100%)] p-5 shadow-[0_18px_45px_rgba(18,45,78,0.07)] md:p-6">
            <div aria-live="polite">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6E88A8]">
                    {activeDirection?.label ?? "Миссия НЦФГ"}
                  </p>
                  <h3 className="mt-3 text-[25px] font-semibold leading-[1.04] tracking-[-0.045em] text-[#153153] md:text-[30px]">
                    {activeDirection?.title ?? missionIntroTitle}
                  </h3>
                </div>
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D5E3F2] bg-white/80 text-[#1E3A5F]">
                  <ActiveDirectionIcon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>

              {activeDirection ? (
                <p className="mt-5 text-[15px] leading-7 text-[#52657D]">{activeDirection.detail}</p>
              ) : null}

              <ul className="mt-5 grid gap-3 text-sm leading-6 text-[#234361]">
                {(activeDirection?.outcomes ?? missionIntroHighlights).map((outcome) => (
                  <li
                    key={outcome}
                    className="rounded-[18px] border border-[#D8E4F2] bg-white/80 px-4 py-3"
                  >
                    {outcome}
                  </li>
                ))}
              </ul>
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
              нажмите на контрол справа, чтобы вынести слой на передний план.
            </p>

            <div className="pointer-events-none absolute left-7 top-7 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6E88A8] shadow-[0_10px_24px_rgba(18,45,78,0.06)]">
              <Sparkles className="h-4 w-4 text-[#4C83D5]" aria-hidden="true" />
              Видно 3 слоя
            </div>

            {activeIndex === null ? (
              <>
                <MissionIntroCard depth={0} />
                {[0, 1].map((index) => (
                  <MissionLayerCard
                    key={missionDirections[index].id}
                    index={index}
                    depth={index + 1}
                    onSelect={setActiveIndex}
                  />
                ))}
              </>
            ) : (
              [0, 1, 2].map((depth) => (
                <MissionLayerCard
                  key={missionDirections[getWrappedIndex(activeIndex + depth)].id}
                  index={getWrappedIndex(activeIndex + depth)}
                  depth={depth}
                  onSelect={setActiveIndex}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="order-1 xl:order-1 xl:sticky xl:top-20">
        <MissionDirectionControls
          activeIndex={activeIndex}
          baseId={baseId}
          controlRefs={controlRefs}
          onKeyDown={handleControlKeyDown}
          onSelect={setActiveIndex}
        />
      </div>
    </div>
  );
}

export function MissionLedgerAlliance({
  embedded = false,
  headingAs = "h2",
}: MissionLedgerAllianceProps) {
  if (embedded) {
    return <MissionLedgerAlliancePanel headingAs={headingAs} />;
  }

  return (
    <Section id="mission" className="pt-8 pb-2 md:pt-10 md:pb-4 lg:pb-6">
      <MissionLedgerAlliancePanel headingAs={headingAs} />
    </Section>
  );
}
