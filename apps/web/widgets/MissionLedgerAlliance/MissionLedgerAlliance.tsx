"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { type KeyboardEvent, useId, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";
import { ContentTransition } from "@/shared/ui/ContentTransition";
import { MotionDetails } from "@/shared/ui/MotionDetails";
import { Section } from "@/shared/ui/Section";

import { missionDirections, type MissionDirection } from "./model/directions";

type HeadingTag = "h2" | "h3";

interface MissionLedgerAllianceProps {
  embedded?: boolean;
  headingAs?: HeadingTag;
}

function DirectionDetails({ direction }: { direction: MissionDirection }) {
  return (
    <div className="space-y-5 text-base leading-relaxed text-primary/85 lg:space-y-6 lg:text-center lg:text-xl lg:leading-[30px]">
      {direction.detail.map((paragraph) => (
        <p key={paragraph} className="lg:text-primary/90">{paragraph}</p>
      ))}
      <ul role="list" className="list-disc space-y-2 pl-5 marker:text-secondary lg:grid lg:list-none lg:grid-cols-2 lg:gap-3 lg:space-y-0 lg:pl-0 lg:text-center lg:text-base lg:leading-[26px]">
        {direction.outcomes.map((outcome) => (
          <li key={outcome} className="pl-1 lg:grid lg:content-center lg:rounded-xl lg:border lg:border-[#D8E4F2] lg:bg-[#F3F8FF] lg:p-4">{outcome}</li>
        ))}
      </ul>
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
  const controls = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number;

    switch (event.key) {
      case "ArrowDown":
        nextIndex = (index + 1) % missionDirections.length;
        break;
      case "ArrowUp":
        nextIndex = (index - 1 + missionDirections.length) % missionDirections.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = missionDirections.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    setActiveIndex(nextIndex);
    controls.current[nextIndex]?.focus();
  }

  return (
    <div>
      {renderHiddenHeading && <Heading className="sr-only">Наш подход</Heading>}

      <div className="space-y-2 lg:hidden">
        {missionDirections.map((direction) => (
          <MotionDetails
            key={direction.id}
            className="group rounded-xl border border-[#D8E4F2] bg-white open:border-[#9FBFE6] open:bg-[#F3F8FF]"
          >
            <summary className="faq-summary flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold leading-6 text-primary">
                  {direction.label}
                </span>
                <span className="mt-1 block text-base leading-6 text-primary/85">
                  {direction.summary}
                </span>
              </span>
              <ChevronDown
                aria-hidden="true"
                className="mt-1 size-5 shrink-0 text-secondary transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <div>
              <div className="mx-4 border-t border-[#D8E4F2] py-4">
                <DirectionDetails direction={direction} />
              </div>
            </div>
          </MotionDetails>
        ))}
      </div>

      <div className="hidden gap-8 lg:grid lg:grid-cols-2 lg:items-stretch">
        <div role="tablist" aria-label="Направления нашего подхода" aria-orientation="vertical" className="grid gap-2">
          {missionDirections.map((direction, index) => (
            <button
              key={direction.id}
              ref={(node) => { controls.current[index] = node; }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${direction.id}`}
              aria-controls={`${baseId}-panel-${direction.id}`}
              aria-selected={index === activeIndex}
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch") setActiveIndex(index);
              }}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none",
                index === activeIndex
                  ? "border-[#9FBFE6] bg-[#F3F8FF]"
                  : "border-[#D8E4F2] bg-white hover:border-[#BFD5EE] hover:bg-[#F9FCFF]"
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold leading-6 text-primary">{direction.label}</span>
                <span className="mt-1 block text-sm leading-5 text-primary/85">{direction.compactSummary}</span>
              </span>
              <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-secondary" />
            </button>
          ))}
        </div>

        <div className="grid min-w-0 content-center rounded-xl border border-[#BDD2EC] bg-[#F9FCFF] p-8">
          {/* Center a shared content area so changing directions keeps the panel and heading positions stable. */}
          {missionDirections.map((direction, index) => (
            <div
              key={direction.id}
              role="tabpanel"
              id={`${baseId}-panel-${direction.id}`}
              aria-labelledby={`${baseId}-tab-${direction.id}`}
              aria-hidden={index !== activeIndex}
              inert={index !== activeIndex}
              tabIndex={index === activeIndex ? 0 : -1}
              className={cn(
                "col-start-1 row-start-1 grid min-w-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
                index !== activeIndex && "invisible"
              )}
            >
              <ContentTransition stateKey={activeIndex} className="flex flex-col">
                <h3 className="mb-6 text-center text-[32px] font-semibold leading-[1.2] tracking-tight text-balance text-primary">{direction.title}</h3>
                <DirectionDetails direction={direction} />
              </ContentTransition>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MissionLedgerAlliance({
  embedded = false,
  headingAs = "h2",
}: MissionLedgerAllianceProps) {
  if (embedded) return <MissionLedgerAlliancePanel headingAs={headingAs} />;

  return (
    <Section id="mission" title="Наш подход" background="white" className="bg-white lg:py-8">
      <MissionLedgerAlliancePanel headingAs={headingAs} renderHiddenHeading={false} />
    </Section>
  );
}
