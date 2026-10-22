"use client";

import { useReducedMotion, motionTokens } from "@/shared/lib/motion";

import { m as motion } from "motion/react";
import {
  type KeyboardEvent,
  type MutableRefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { cn } from "@/shared/lib/cn";
import { Section } from "@/shared/ui/Section";

import { missionDirections } from "./model/directions";
import { ChevronDown } from "lucide-react";
import { MotionDetails } from "@/shared/ui/MotionDetails";

type HeadingTag = "h2" | "h3";
type DeckDepth = 0 | 1 | 2 | 3;

interface MissionLedgerAllianceProps {
  embedded?: boolean;
  headingAs?: HeadingTag;
}

interface LayerClassSet {
  card: string;
}

interface StableSlotLayout {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

const STABLE_DOM_DURATION_S = motionTokens.reveal;

const desktopLayerClasses: Record<DeckDepth, LayerClassSet> = {
  0: {
    card: "border-[#BDD2EC] bg-[#F9FCFF]",
  },
  1: {
    card: "border-[#D3E1F2] bg-[#F6FAFE]",
  },
  2: {
    card: "border-[#D5E0EF] bg-[#F2F6FB]",
  },
  3: {
    card: "border-[#D5E0EF] bg-[#F2F6FB]",
  },
};

const stableSlotLayouts: Record<DeckDepth, StableSlotLayout> = {
  0: { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 30 },
  1: { x: 16, y: 30, scale: 0.97, opacity: 1, zIndex: 20 },
  2: { x: 32, y: 60, scale: 0.94, opacity: 1, zIndex: 10 },
  3: { x: 48, y: 88, scale: 0.9, opacity: 0, zIndex: 0 },
};
const DECK_MIN_HEIGHT_REM = 28.5;
const DECK_MIN_HEIGHT_PX = DECK_MIN_HEIGHT_REM * 16;
const visibleDesktopLayouts = Object.values(stableSlotLayouts).filter(
  (layout) => layout.opacity > 0
);

function getDeckCardHeight(deckHeightPx: number): number {
  const constrainedHeight = visibleDesktopLayouts.reduce(
    (height, layout) => Math.min(height, (deckHeightPx - layout.y) / layout.scale),
    deckHeightPx
  );

  return Math.max(0, constrainedHeight);
}

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
      aria-label="Направления нашего подхода"
      aria-describedby={`${baseId}-hint`}
      className="grid gap-2"
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
            aria-controls={`${baseId}-card-${direction.id}`}
            aria-pressed={isActive}
            onClick={() => onSelect(index)}
            onFocus={() => onSelect(index)}
            onPointerMove={(event) => {
              // Scrolling a focused control under a resting cursor must not change selection.
              if (event.pointerType === "mouse" && (event.movementX || event.movementY)) onSelect(index);
            }}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "group w-full rounded-[24px] border px-4 py-2.5 text-left transition-[border-color,background-color,box-shadow] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] motion-reduce:transition-none md:px-5",
              isActive
                ? "border-[#9FBFE6] bg-[#F3F8FF] shadow-[0_12px_26px_rgba(18,45,78,0.10)]"
                : "border-[#D8E4F2] bg-white/76 hover:border-[#BFD5EE] hover:bg-white"
            )}
          >
            <span className="block min-w-0">
              <span
                className={cn(
                  "block text-base font-semibold leading-6 md:text-[17px]",
                  isActive ? "text-[#12325A]" : "text-[#163153]"
                )}
              >
                {direction.label}
              </span>
              <span
                className={cn(
                  "mt-1 block text-sm leading-[1.55]",
                  isActive ? "text-[#486481]" : "text-[#5E738E]"
                )}
              >
                {direction.compactSummary}
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
    <div data-mission-layer={depth} className="relative h-full min-h-0 rounded-[34px] text-left" role="presentation">
      <article
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[34px] border p-6 transition-[border-color,background-color] duration-[340ms] motion-reduce:transition-none md:p-8",
          isActive && "pt-7 md:pt-8",
          layerClass.card
        )}
      >
        <div className="relative flex h-full flex-col justify-center gap-8">
          <div>
            <div>
              <h3
                className={cn(
                  "w-full max-w-none text-[32px] font-semibold leading-[1.02] tracking-[-0.03em] text-[#153153] transition-opacity duration-200 motion-reduce:transition-none",
                  isActive && "text-center",
                  !isActive && "text-[26px] leading-[1.08]"
                )}
              >
                {isActive ? direction.title : direction.label}
              </h3>
            </div>
          </div>

          {isActive ? (
            <>
              <div className="grid w-full max-w-none gap-3 text-center text-[17px] leading-8 text-[#52657D] md:text-lg">
                {direction.detail.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <ul className="grid gap-3 text-sm leading-6 text-[#234361] md:grid-cols-2 md:text-[15px]">
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
            <p className="w-full max-w-none text-sm leading-6 text-[#5E738E]">
              {direction.summary}
            </p>
          )}
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
  const controlsColumnRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [desktopDeckHeight, setDesktopDeckHeight] = useState<number | null>(null);
  const desktopDeckHeightPx = desktopDeckHeight ?? DECK_MIN_HEIGHT_PX;
  const desktopCardHeightPx = getDeckCardHeight(desktopDeckHeightPx);

  useEffect(() => {
    const controlsColumn = controlsColumnRef.current;

    if (!controlsColumn || typeof ResizeObserver === "undefined") {
      return;
    }

    const updateDeckHeight = () => {
      const nextHeight = Math.ceil(controlsColumn.getBoundingClientRect().height);

      setDesktopDeckHeight((currentHeight) =>
        currentHeight === nextHeight ? currentHeight : nextHeight
      );
    };

    updateDeckHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateDeckHeight();
    });

    resizeObserver.observe(controlsColumn);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  function selectIndex(index: number) {
    const nextIndex = wrapIndex(index);

    if (nextIndex === activeIndex) {
      return;
    }

    setActiveIndex(nextIndex);
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
    <div data-mission-panel className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-start">
      {renderHiddenHeading ? <Heading className="sr-only">Наш подход</Heading> : null}
      <div className="space-y-3 xl:hidden">
        {missionDirections.map((direction) => (
          <MotionDetails key={direction.id} className="group rounded-[24px] border border-[#D8E4F2] bg-white open:border-[#9FBFE6] open:bg-[#F9FCFF]">
            <summary className="faq-summary flex cursor-pointer items-start gap-3 rounded-[24px] p-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold leading-6 text-[#163153]">{direction.label}</span>
                <span className="mt-1 block text-sm leading-6 text-[#52657D]">{direction.summary}</span>
              </span>
              <ChevronDown aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
            </summary>
            <div>
              <div className="mx-5 border-t border-[#D8E4F2] pb-5 pt-4">
                <div className="space-y-3 text-base leading-7 text-[#52657D]">
                  {direction.detail.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
                <ul className="mt-5 grid gap-3 text-sm leading-6 text-[#234361] sm:grid-cols-2">
                  {direction.outcomes.map((outcome) => <li key={outcome} className="rounded-[18px] border border-[#D8E4F2] bg-[#F3F8FF] px-4 py-3">{outcome}</li>)}
                </ul>
              </div>
            </div>
          </MotionDetails>
        ))}
      </div>

      <div className="hidden xl:order-2 xl:block xl:self-stretch">
        <div
          className="relative hidden xl:block"
          style={{
            height: `${desktopDeckHeightPx}px`,
          }}
        >
          <div className="relative h-full px-6 py-6">
            <p id={`${baseId}-hint`} className="sr-only">
              Навигация по направлениям миссии. Наведите курсор, переведите фокус или нажмите
              на список слева, чтобы вынести карточку на передний план.
            </p>

            {missionDirections.map((direction, cardIndex) => {
              const depth = getStableDepth(cardIndex, activeIndex);
              const layout = stableSlotLayouts[depth];

              return (
                <motion.div
                  key={direction.id}
                  id={`${baseId}-card-${direction.id}`}
                  aria-hidden={depth !== 0}
                  animate={{
                    opacity: layout.opacity,
                    scale: layout.scale,
                    x: layout.x,
                    y: layout.y,
                  }}
                  className={cn(
                    "absolute inset-x-0 top-0 origin-top-left rounded-[34px]",
                    depth === 3 ? "pointer-events-none" : "cursor-pointer"
                  )}
                  initial={false}
                  onClick={depth === 3 ? undefined : () => selectIndex(cardIndex)}
                  style={{
                    zIndex: layout.zIndex,
                    height: `${desktopCardHeightPx}px`,
                  }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : STABLE_DOM_DURATION_S,
                    ease: motionTokens.ease,
                  }}
                >
                  <MissionLayerCard dataIndex={cardIndex} depth={depth} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div data-mission-controls ref={controlsColumnRef} className="hidden xl:order-1 xl:block">
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
      className="bg-white lg:py-8"
      title="Наш подход"
    >
      <MissionLedgerAlliancePanel
        headingAs={headingAs}
        renderHiddenHeading={false}
      />
    </Section>
  );
}
