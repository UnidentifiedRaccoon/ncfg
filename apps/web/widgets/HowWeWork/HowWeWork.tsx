"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Section } from "@/shared/ui/Section";

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface HowWeWorkProps {
  title: string;
  lead?: string;
  steps: Step[];
}

interface TimelineItemProps {
  step: Step;
  totalSteps: number;
  isLeft: boolean;
  prefersReducedMotion: boolean | null;
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function DecorativeBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute -top-24 left-1/2 h-72 w-[560px] -translate-x-1/2 rounded-full bg-[#58A8E0]/12 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 h-72 w-[560px] -translate-x-1/2 rounded-full bg-[#3B82F6]/10 blur-3xl" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,232,240,0.55)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.55)_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.35]" />
    </div>
  );
}

function Rail({
  align,
  prefersReducedMotion,
}: {
  align: "center" | "left";
  prefersReducedMotion: boolean | null;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const alignClass =
    align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "left-6 -translate-x-1/2";

  return (
    <motion.div
      ref={ref}
      className={`absolute ${alignClass} top-0 bottom-0 z-0 w-[2px] rounded-full origin-top
                  bg-gradient-to-b from-[#58A8E0] via-[#3B82F6] to-[#1E3A5F]
                  shadow-[0_0_0_6px_rgba(88,168,224,0.06)]`}
      initial={prefersReducedMotion ? { scaleY: 1 } : { scaleY: 0 }}
      animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
      transition={{ duration: 1.1, ease: "easeOut" }}
      aria-hidden="true"
    />
  );
}

export function HowWeWork({ title, lead, steps }: HowWeWorkProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Section id="how-we-work" title={title} lead={lead} background="gray">
      <div className="relative">
        <DecorativeBackground />

        <div className="relative z-10">
          {/* Desktop rail (center) */}
          <div className="hidden md:block">
            <Rail align="center" prefersReducedMotion={prefersReducedMotion} />
          </div>

          {/* Mobile rail (left) */}
          <div className="md:hidden">
            <Rail align="left" prefersReducedMotion={prefersReducedMotion} />
          </div>

          {/* Steps as ordered list for accessibility */}
          <ol className="relative z-10 space-y-8 md:space-y-0 list-none m-0 p-0">
            {steps.map((step, index) => (
              <TimelineItem
                key={step.id}
                step={step}
                totalSteps={steps.length}
                isLeft={index % 2 === 0}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}

function TimelineItem({
  step,
  totalSteps,
  isLeft,
  prefersReducedMotion,
}: TimelineItemProps) {
  const itemRef = useRef(null);
  const isInView = useInView(itemRef, { once: true, amount: 0.3 });
  const shouldAnimate = !prefersReducedMotion;

  const waveHeight = 180;
  const stepCode = pad2(step.id);

  return (
    <motion.li
      ref={itemRef}
      className="relative"
      style={{
        // Desktop: position based on wave
        height: "auto",
      }}
    >
      {/* Desktop layout */}
      <div
        className="hidden md:flex items-start"
        style={{
          minHeight: `${waveHeight}px`,
          paddingTop: "20px",
        }}
      >
        {/* Spacer for alternating layout */}
        <div className={`w-1/2 ${isLeft ? "order-2" : "order-1"}`} />

        {/* Card container */}
        <div className={`w-1/2 ${isLeft ? "order-1 pr-16" : "order-2 pl-16"}`}>
          <motion.div
            className={`relative max-w-md rounded-xl bg-white/90 backdrop-blur-sm p-6
                        border shadow-sm shadow-[#0F172A]/5 transition-colors transition-shadow duration-300
                        hover:shadow-lg hover:shadow-[#0F172A]/10 hover:border-[#3B82F6]/30
                        before:absolute before:inset-x-6 before:top-0 before:h-px
                        before:bg-gradient-to-r before:from-transparent before:via-[#58A8E0]/70 before:to-transparent
                        after:pointer-events-none after:absolute after:inset-0 after:rounded-xl
                        after:bg-[linear-gradient(110deg,transparent,rgba(88,168,224,0.10),transparent)]
                        after:opacity-0 after:translate-x-[-20%] after:transition after:duration-700
                        hover:after:opacity-100 hover:after:translate-x-[20%]
                        [will-change:transform]
                        ${
                          isInView
                            ? "border-[#3B82F6]/25"
                            : "border-[#E2E8F0]/70"
                        }`}
            style={{
              marginLeft: isLeft ? "auto" : 0,
              marginRight: isLeft ? 0 : "auto",
            }}
            initial={
              shouldAnimate
                ? {
                    opacity: 0,
                    y: 14,
                    x: isLeft ? -18 : 18,
                    scale: 0.985,
                  }
                : { opacity: 1 }
            }
            animate={isInView ? { opacity: 1, y: 0, x: 0, scale: 1 } : {}}
            transition={
              shouldAnimate
                ? { duration: 0.65, ease: EASE_OUT, delay: 0.02 }
                : { duration: 0 }
            }
            whileHover={shouldAnimate ? { y: -6 } : {}}
            whileTap={shouldAnimate ? { y: -2 } : {}}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-3 py-1 text-xs font-mono font-semibold tracking-wide text-[#1E3A5F]">
                {stepCode}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-[#E2E8F0] via-[#E2E8F0]/60 to-transparent" />
            </div>

            <h3 className="mt-3 text-lg font-semibold text-[#1E3A5F] leading-snug">
              <span className="sr-only">
                Шаг {step.id} из {totalSteps}:{" "}
              </span>
              {step.title}
            </h3>
            {step.description && (
              <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                {step.description}
              </p>
            )}
          </motion.div>

          {/* Connector line from card to marker */}
          <motion.div
            className={`absolute top-[56px] h-px w-14
                       ${isLeft ? "right-[calc(50%-60px)]" : "left-[calc(50%-60px)]"}`}
            style={{
              transformOrigin: isLeft ? "100% 50%" : "0% 50%",
              background: isLeft
                ? "linear-gradient(to left, rgba(59,130,246,0.55), transparent)"
                : "linear-gradient(to right, rgba(59,130,246,0.55), transparent)",
            }}
            initial={
              shouldAnimate
                ? { scaleX: 0, opacity: 0 }
                : { scaleX: 1, opacity: 1 }
            }
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={
              shouldAnimate
                ? { duration: 0.55, ease: EASE_OUT, delay: 0.06 }
                : { duration: 0 }
            }
            aria-hidden="true"
          />
        </div>

        {/* Marker dot on the rail */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 z-10"
          style={{ top: "46px" }}
          initial={
            shouldAnimate
              ? { scale: 0.85, opacity: 0 }
              : { scale: 1, opacity: 1 }
          }
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={
            shouldAnimate
              ? { duration: 0.55, ease: EASE_OUT }
              : { duration: 0 }
          }
          whileHover={shouldAnimate ? { scale: 1.08 } : {}}
          aria-hidden="true"
        >
          <div className="h-3 w-3 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#3B82F6] ring-4 ring-[#58A8E0]/15 shadow-[0_6px_18px_rgba(59,130,246,0.25)] [will-change:transform]" />
        </motion.div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden relative pl-14">
        {/* Marker dot */}
        <motion.div
          className="absolute left-6 -translate-x-1/2 z-10"
          style={{ top: "28px" }}
          initial={
            shouldAnimate
              ? { scale: 0.85, opacity: 0 }
              : { scale: 1, opacity: 1 }
          }
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={
            shouldAnimate
              ? { duration: 0.55, ease: EASE_OUT }
              : { duration: 0 }
          }
          aria-hidden="true"
        >
          <div className="h-3 w-3 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#3B82F6] ring-4 ring-[#58A8E0]/15 shadow-[0_6px_18px_rgba(59,130,246,0.25)] [will-change:transform]" />
        </motion.div>

        {/* Card */}
        <motion.div
          className={`relative rounded-xl bg-white/90 backdrop-blur-sm p-5
                      border shadow-sm shadow-[#0F172A]/5 transition-colors transition-shadow duration-300
                      hover:shadow-lg hover:shadow-[#0F172A]/10 hover:border-[#3B82F6]/30
                      before:absolute before:inset-x-6 before:top-0 before:h-px
                      before:bg-gradient-to-r before:from-transparent before:via-[#58A8E0]/70 before:to-transparent
                      after:pointer-events-none after:absolute after:inset-0 after:rounded-xl
                      after:bg-[linear-gradient(110deg,transparent,rgba(88,168,224,0.10),transparent)]
                      after:opacity-0 after:translate-x-[-20%] after:transition after:duration-700
                      hover:after:opacity-100 hover:after:translate-x-[20%]
                      [will-change:transform]
                      ${
                        isInView ? "border-[#3B82F6]/25" : "border-[#E2E8F0]/70"
                      }`}
          initial={
            shouldAnimate
              ? { opacity: 0, y: 14, scale: 0.99 }
              : { opacity: 1 }
          }
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={
            shouldAnimate
              ? { duration: 0.6, ease: EASE_OUT, delay: 0.02 }
              : { duration: 0 }
          }
          whileHover={shouldAnimate ? { y: -4 } : {}}
          whileTap={shouldAnimate ? { y: -2 } : {}}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-3 py-1 text-xs font-mono font-semibold tracking-wide text-[#1E3A5F]">
              {stepCode}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-[#E2E8F0] via-[#E2E8F0]/60 to-transparent" />
          </div>

          <h3 className="mt-3 text-base font-semibold text-[#1E3A5F] leading-snug">
            <span className="sr-only">
              Шаг {step.id} из {totalSteps}:{" "}
            </span>
            {step.title}
          </h3>
          {step.description && (
            <p className="mt-2 text-sm leading-relaxed text-[#475569]">
              {step.description}
            </p>
          )}
        </motion.div>
      </div>
    </motion.li>
  );
}
