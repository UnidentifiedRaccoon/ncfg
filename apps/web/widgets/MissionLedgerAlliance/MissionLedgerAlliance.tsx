"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  type KeyboardEvent,
  type MutableRefObject,
  useId,
  useRef,
  useState,
} from "react";

import { cn } from "@/shared/lib/cn";
import { Section } from "@/shared/ui/Section";

import { missionDirections } from "./model/directions";

type HeadingTag = "h2" | "h3";
type DeckDepth = 0 | 1 | 2 | 3;

interface MissionLedgerAllianceProps {
  embedded?: boolean;
  headingAs?: HeadingTag;
}

interface LayerClassSet {
  card: string;
  glow: string;
}

interface StableSlotLayout {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

const STABLE_DOM_DURATION_S = 0.37;

const desktopLayerClasses: Record<DeckDepth, LayerClassSet> = {
  0: {
    card:
      "border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(244,249,255,0.98)_100%)] shadow-[0_30px_80px_rgba(18,45,78,0.18)]",
    glow: "opacity-100",
  },
  1: {
    card:
      "border-[#D7E5F6] bg-[linear-gradient(180deg,rgba(246,250,255,0.98)_0%,rgba(234,242,252,0.98)_100%)] shadow-[0_22px_55px_rgba(18,45,78,0.12)]",
    glow: "opacity-70",
  },
  2: {
    card:
      "border-[#D5E0EF] bg-[linear-gradient(180deg,rgba(242,247,253,0.98)_0%,rgba(228,237,248,0.98)_100%)] shadow-[0_16px_40px_rgba(18,45,78,0.10)]",
    glow: "opacity-45",
  },
  3: {
    card:
      "border-[#D5E0EF] bg-[linear-gradient(180deg,rgba(242,247,253,0.98)_0%,rgba(228,237,248,0.98)_100%)] shadow-[0_16px_40px_rgba(18,45,78,0.10)]",
    glow: "opacity-0",
  },
};

const stableSlotLayouts: Record<DeckDepth, StableSlotLayout> = {
  0: { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 30 },
  1: { x: 20, y: 40, scale: 0.97, opacity: 0.95, zIndex: 20 },
  2: { x: 40, y: 80, scale: 0.94, opacity: 0.8, zIndex: 10 },
  3: { x: 60, y: 112, scale: 0.9, opacity: 0, zIndex: 0 },
};

function wrapIndex(index: number): number {
  const total = missionDirections.length;

  if (index >= total) {
    return index % total;
  }

  if (index < 0) {
    return (index % total + total) % total;
  }

  return index;
}

function getStableDepth(cardIndex: number, activeIndex: number): DeckDepth {
  const total = missionDirections.length;
  const relativeIndex = (cardIndex - activeIndex + total) % total;

  if (relativeIndex === 0 || relativeIndex === 1 || relativeIndex === 2) {
    return relativeIndex as DeckDepth;
  }

  return 3;
}

function MissionDirectionControls({
  activeIndex,
  baseId,
  controlRefs,
  onKeyDown,
  onSelect,
}: {
  activeIndex: number;
  baseId: string;
  controlRefs: MutableRefObject<Array<HTMLButtonElement | null>>;
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
              "group w-full rounded-[24px] border px-4 py-4 text-left transition-all duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] motion-reduce:transition-none md:px-5",
              isActive
                ? "border-[#BFD5EE] bg-[linear-gradient(180deg,#FFFFFF_0%,#F5F9FF_100%)] shadow-[0_16px_35px_rgba(18,45,78,0.10)]"
                : "border-[#D8E4F2] bg-white/76 hover:border-[#BFD5EE] hover:bg-white"
            )}
          >
            <span className="block min-w-0">
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
  dataIndex,
  depth,
}: {
  dataIndex: number;
  depth: DeckDepth;
}) {
  const direction = missionDirections[dataIndex];
  const isActive = depth === 0;
  const layerClass = desktopLayerClasses[depth];

  return (
    <div className="relative h-[31rem] rounded-[34px] text-left" role="presentation">
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-[7%] top-[72%] h-24 rounded-full bg-[radial-gradient(circle,rgba(74,132,214,0.22)_0%,rgba(74,132,214,0)_74%)] blur-2xl transition-opacity duration-[340ms] motion-reduce:hidden",
          layerClass.glow
        )}
      />

      <article
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[34px] border p-6 transition-all duration-[340ms] motion-reduce:transition-none md:p-8",
          layerClass.card
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(88,168,224,0.16),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.15),transparent_46%)]" />

        <div className="relative flex h-full flex-col">
          <div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6E88A8]">
                {direction.label}
              </p>
              <h3
                className={cn(
                  "mt-3 max-w-[20ch] text-[26px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#153153] transition-opacity duration-200 motion-reduce:transition-none",
                  !isActive && "max-w-[16ch] text-[21px] leading-[1.08]"
                )}
              >
                {isActive ? direction.title : direction.label}
              </h3>
            </div>
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

function MissionLedgerAlliancePanel({
  headingAs = "h2",
  renderHiddenHeading = true,
}: {
  headingAs?: HeadingTag;
  renderHiddenHeading?: boolean;
}) {
  const Heading = headingAs;
  const baseId = useId();
  const controlRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDirection = missionDirections[activeIndex];

  function selectIndex(index: number) {
    setActiveIndex(wrapIndex(index));
  }

  function focusControl(index: number) {
    const wrappedIndex = wrapIndex(index);
    selectIndex(wrappedIndex);
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
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-start">
      {renderHiddenHeading ? <Heading className="sr-only">Наша миссия</Heading> : null}

      <div className="order-2 xl:order-2">
        <div className="xl:hidden">
          <div className="rounded-[30px] border border-[#DCE7F3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,249,255,0.95)_100%)] p-5 shadow-[0_18px_45px_rgba(18,45,78,0.07)] md:p-6">
            <div aria-live="polite">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6E88A8]">
                  {activeDirection.label}
                </p>
                <h3 className="mt-3 text-[25px] font-semibold leading-[1.04] tracking-[-0.045em] text-[#153153] md:text-[30px]">
                  {activeDirection.title}
                </h3>
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
          </div>
        </div>

        <div className="relative hidden min-h-[38rem] xl:block">
          <div className="relative h-full px-6 py-7">
            <p id={`${baseId}-hint`} className="sr-only">
              Навигация по четырём направлениям миссии. Наведите курсор, переведите фокус или
              нажмите на список слева, чтобы вынести карточку на передний план.
            </p>

            {missionDirections.map((direction, cardIndex) => {
              const depth = getStableDepth(cardIndex, activeIndex);
              const layout = stableSlotLayouts[depth];

              return (
                <motion.div
                  key={direction.id}
                  animate={{
                    opacity: layout.opacity,
                    scale: layout.scale,
                    x: layout.x,
                    y: layout.y,
                  }}
                  className={cn(
                    "absolute inset-x-0 top-0 h-[31rem] origin-top-left rounded-[34px]",
                    depth === 3 ? "pointer-events-none" : "cursor-pointer"
                  )}
                  initial={false}
                  onClick={depth === 3 ? undefined : () => selectIndex(cardIndex)}
                  style={{ zIndex: layout.zIndex }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : STABLE_DOM_DURATION_S,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <MissionLayerCard dataIndex={cardIndex} depth={depth} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="order-1 xl:order-1 xl:sticky xl:top-20">
        <MissionDirectionControls
          activeIndex={activeIndex}
          baseId={baseId}
          controlRefs={controlRefs}
          onKeyDown={handleControlKeyDown}
          onSelect={selectIndex}
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
    <Section
      id="mission"
      className="pt-8 pb-2 md:pt-10 md:pb-4 lg:pb-6"
      title="Наша миссия"
      lead="Решаем комплексные задачи в области финансового благополучия и финансовой культуры населения."
    >
      <MissionLedgerAlliancePanel
        headingAs={headingAs}
        renderHiddenHeading={false}
      />
    </Section>
  );
}
