"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useMemo } from "react";
import { Section } from "@/shared/ui/Section";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface HowWeWorkProps {
  title: string;
  steps: Step[];
}

interface TimelineItemProps {
  step: Step;
  totalSteps: number;
  isLeft: boolean;
  prefersReducedMotion: boolean | null;
}

// Generate S-curve ribbon path for desktop
function generateRibbonPath(itemCount: number): string {
  const waveHeight = 180; // px per step
  const amplitude = 100; // horizontal deviation
  const centerX = 200;

  let path = `M ${centerX} 0`;

  for (let i = 0; i < itemCount; i++) {
    const startY = i * waveHeight;
    const endY = (i + 1) * waveHeight;
    const midY = startY + waveHeight / 2;
    const direction = i % 2 === 0 ? 1 : -1;
    const controlX = centerX + amplitude * direction;

    path += ` Q ${controlX} ${midY}, ${centerX} ${endY}`;
  }

  return path;
}


// SVG Flowing Ribbon component for desktop
function FlowingRibbon({
  itemCount,
  prefersReducedMotion,
}: {
  itemCount: number;
  prefersReducedMotion: boolean | null;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const path = useMemo(() => generateRibbonPath(itemCount), [itemCount]);
  const height = itemCount * 180 + 40;

  return (
    <svg
      ref={ref}
      className="absolute left-1/2 -translate-x-[200px] top-0 pointer-events-none"
      width="400"
      height={height}
      viewBox={`0 0 400 ${height}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        {/* Main gradient */}
        <linearGradient id="ribbonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#58A8E0" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E3A5F" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="ribbonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background glow path */}
      <motion.path
        d={path}
        stroke="url(#ribbonGradient)"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        opacity={0.2}
        filter="url(#ribbonGlow)"
        initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* Main ribbon path */}
      <motion.path
        d={path}
        stroke="url(#ribbonGradient)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* Pulsing animation overlay */}
      {!prefersReducedMotion && (
        <motion.path
          d={path}
          stroke="url(#ribbonGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity={0.5}
          initial={{ strokeWidth: 6 }}
          animate={
            isInView
              ? {
                  strokeWidth: [6, 8, 6],
                  opacity: [0.3, 0.5, 0.3],
                }
              : {}
          }
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 2,
          }}
        />
      )}
    </svg>
  );
}

// Simple vertical line for mobile
function MobileRibbon({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean | null;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      className="absolute left-6 top-0 bottom-0 w-1
                 bg-gradient-to-b from-[#58A8E0] via-[#3B82F6] to-[#1E3A5F]
                 rounded-full origin-top"
      initial={prefersReducedMotion ? { scaleY: 1 } : { scaleY: 0 }}
      animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      aria-hidden="true"
    />
  );
}

export function HowWeWork({ title, steps }: HowWeWorkProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Section id="how-we-work" title={title} background="gray">
      <div className="relative">
        {/* Desktop: Flowing S-curve ribbon */}
        <div className="hidden md:block">
          <FlowingRibbon
            itemCount={steps.length}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>

        {/* Mobile: Simple vertical line */}
        <div className="md:hidden">
          <MobileRibbon prefersReducedMotion={prefersReducedMotion} />
        </div>

        {/* Steps as ordered list for accessibility */}
        <ol className="relative space-y-8 md:space-y-0 list-none m-0 p-0">
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

  // Card rotation follows the curve direction
  const cardRotation = isLeft ? -2 : 2;

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
            className="relative bg-white rounded-xl p-6 max-w-sm
                       shadow-md hover:shadow-xl transition-shadow duration-300
                       border border-[#E2E8F0]/50 hover:border-[#3B82F6]/30
                       before:absolute before:left-0 before:top-4 before:bottom-4
                       before:w-1 before:rounded-full
                       before:bg-gradient-to-b before:from-[#58A8E0] before:to-[#3B82F6]"
            style={{
              marginLeft: isLeft ? "auto" : 0,
              marginRight: isLeft ? 0 : "auto",
            }}
            initial={
              shouldAnimate
                ? {
                    opacity: 0,
                    x: isLeft ? -50 : 50,
                    rotate: isLeft ? -6 : 6,
                    scale: 0.8,
                  }
                : { opacity: 1 }
            }
            animate={
              isInView
                ? {
                    opacity: 1,
                    x: 0,
                    rotate: cardRotation,
                    scale: 1,
                  }
                : {}
            }
            transition={
              shouldAnimate
                ? {
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: 0.1,
                  }
                : { duration: 0 }
            }
          >
            <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2">
              <span className="sr-only">
                Шаг {step.id} из {totalSteps}:{" "}
              </span>
              {step.title}
            </h3>
            <p className="text-[#475569] text-sm leading-relaxed">
              {step.description}
            </p>
          </motion.div>

          {/* Connector line from card to marker */}
          <motion.div
            className={`absolute top-[50px] h-0.5 w-12
                       ${isLeft ? "right-[calc(50%-60px)]" : "left-[calc(50%-60px)]"}`}
            style={{
              background: isLeft
                ? "linear-gradient(to left, #3B82F6, transparent)"
                : "linear-gradient(to right, #3B82F6, transparent)",
            }}
            initial={shouldAnimate ? { scaleX: 0 } : { scaleX: 1 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.4 }}
            aria-hidden="true"
          />
        </div>

        {/* Marker on the ribbon */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 z-10
                     w-14 h-14 rounded-full flex items-center justify-center
                     bg-gradient-to-br from-[#58A8E0] to-[#3B82F6]
                     text-white text-xl font-bold
                     shadow-lg shadow-[#3B82F6]/30
                     ring-4 ring-[#58A8E0]/20"
          style={{ top: "36px" }}
          initial={
            shouldAnimate ? { scale: 0, rotate: -180 } : { scale: 1, rotate: 0 }
          }
          animate={isInView ? { scale: 1, rotate: 0 } : {}}
          transition={
            shouldAnimate
              ? {
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }
              : { duration: 0 }
          }
          whileHover={
            shouldAnimate
              ? {
                  y: -4,
                  transition: { duration: 0.2 },
                }
              : {}
          }
          aria-hidden="true"
        >
          {step.id}
        </motion.div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex items-start gap-4">
        {/* Marker circle with step number */}
        <motion.div
          className="relative z-10 flex-shrink-0 ml-1
                     w-12 h-12 rounded-full flex items-center justify-center
                     bg-gradient-to-br from-[#58A8E0] to-[#3B82F6]
                     text-white text-lg font-bold shadow-lg"
          initial={shouldAnimate ? { scale: 0 } : { scale: 1 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={
            shouldAnimate
              ? {
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                }
              : { duration: 0 }
          }
          aria-hidden="true"
        >
          {step.id}
        </motion.div>

        {/* Card */}
        <motion.div
          className="relative bg-white rounded-xl p-5 flex-1
                     shadow-md
                     border border-[#E2E8F0]/50
                     before:absolute before:left-0 before:top-3 before:bottom-3
                     before:w-1 before:rounded-full
                     before:bg-gradient-to-b before:from-[#58A8E0] before:to-[#3B82F6]"
          initial={shouldAnimate ? { opacity: 0, x: 30 } : { opacity: 1 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={
            shouldAnimate ? { duration: 0.4, delay: 0.1 } : { duration: 0 }
          }
        >
          <h3 className="text-base font-semibold text-[#1E3A5F] mb-1.5">
            <span className="sr-only">
              Шаг {step.id} из {totalSteps}:{" "}
            </span>
            {step.title}
          </h3>
          <p className="text-[#475569] text-sm leading-relaxed">
            {step.description}
          </p>
        </motion.div>
      </div>
    </motion.li>
  );
}
