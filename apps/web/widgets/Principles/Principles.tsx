"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { Section } from "@/shared/ui/Section";
import { BookOpen, FlaskConical, Users, Award, Heart, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Principle {
  id: string;
  order: number;
  title: string;
  description: string;
}

interface PrinciplesProps {
  title: string;
  principles: Principle[];
}

const iconMap: Record<string, LucideIcon> = {
  methodology: BookOpen,
  scientific_approach: FlaskConical,
  individual_approach: Users,
  experience: Award,
  team: Heart,
};

// Planet positions around the central orb (desktop)
// Adjusted for expanded cards (200px width on hover)
const PLANET_POSITIONS = [
  { x: -240, y: 20, angle: 150 },   // 1. Methodology (left)
  { x: -140, y: -170, angle: 120 }, // 2. Scientific approach (top-left)
  { x: 140, y: -170, angle: 60 },   // 3. Individual approach (top-right)
  { x: 240, y: 20, angle: 30 },     // 4. Experience (right)
  { x: 0, y: 210, angle: 270 },     // 5. Team (bottom)
];

// Central Orb component (the "Sun")
// Fixed: Removed scale animation on text container to prevent jerkiness
function CentralOrb({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                 w-40 h-40 rounded-full z-20
                 bg-gradient-to-br from-[#58A8E0] via-[#3B82F6] to-[#1E3A5F]
                 flex items-center justify-center flex-col
                 text-white text-center transform-gpu"
      initial={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : {}}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 200, damping: 20, duration: 0.6 }
      }
      aria-hidden="true"
    >
      {/* Glow effect - only opacity animation, no scale */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-[#58A8E0] via-[#3B82F6] to-[#1E3A5F] transform-gpu"
        style={{ filter: "blur(20px)" }}
        animate={
          prefersReducedMotion
            ? { opacity: 0.4 }
            : { opacity: [0.4, 0.6, 0.4] }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {/* Static content - no scale animation to prevent text jerkiness */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <Target className="w-8 h-8 mb-2" />
        <span className="text-sm font-semibold leading-tight px-4">
          Финансовое благополучие
        </span>
      </div>
    </motion.div>
  );
}

// Orbital rings SVG
function OrbitalRings({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <svg
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="orbitGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#58A8E0" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="orbitGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1E3A5F" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Inner orbit ring */}
      <motion.ellipse
        cx="50%"
        cy="50%"
        rx="180"
        ry="120"
        stroke="url(#orbitGradient1)"
        strokeWidth="2"
        strokeDasharray="8 8"
        fill="none"
        initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
        style={{
          strokeDashoffset: prefersReducedMotion ? 0 : undefined,
        }}
      />

      {/* Inner orbit - rotating dash animation */}
      {!prefersReducedMotion && isInView && (
        <motion.ellipse
          cx="50%"
          cy="50%"
          rx="180"
          ry="120"
          stroke="url(#orbitGradient1)"
          strokeWidth="2"
          strokeDasharray="8 8"
          fill="none"
          animate={{ strokeDashoffset: [0, -100] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Outer orbit ring */}
      <motion.ellipse
        cx="50%"
        cy="50%"
        rx="280"
        ry="180"
        stroke="url(#orbitGradient2)"
        strokeWidth="1.5"
        strokeDasharray="12 6"
        fill="none"
        initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : {}}
        transition={{ duration: 1.4, delay: 1, ease: "easeOut" }}
      />

      {/* Outer orbit - rotating dash animation */}
      {!prefersReducedMotion && isInView && (
        <motion.ellipse
          cx="50%"
          cy="50%"
          rx="280"
          ry="180"
          stroke="url(#orbitGradient2)"
          strokeWidth="1.5"
          strokeDasharray="12 6"
          fill="none"
          animate={{ strokeDashoffset: [0, 100] }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        />
      )}
    </svg>
  );
}

// Connection beams from center to planets
function ConnectionBeams({
  principles,
  prefersReducedMotion,
}: {
  principles: Principle[];
  prefersReducedMotion: boolean | null;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const centerX = 50; // percentage
  const centerY = 50;

  return (
    <svg
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#58A8E0" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#58A8E0" stopOpacity="0" />
        </linearGradient>
      </defs>

      {principles.slice(0, 5).map((principle, index) => {
        const pos = PLANET_POSITIONS[index];
        // Calculate end position relative to center
        // Container is 600px height, center at 300px
        // Positions are in pixels from center
        const containerWidth = 800; // approximate
        const containerHeight = 600;
        const endX = centerX + (pos.x / containerWidth) * 100;
        const endY = centerY + (pos.y / containerHeight) * 100;

        return (
          <motion.line
            key={principle.id}
            x1={`${centerX}%`}
            y1={`${centerY}%`}
            x2={`${endX}%`}
            y2={`${endY}%`}
            stroke="url(#beamGradient)"
            strokeWidth="2"
            initial={prefersReducedMotion ? { opacity: 0.3 } : { opacity: 0, pathLength: 0 }}
            animate={isInView ? { opacity: 0.3, pathLength: 1 } : {}}
            transition={{
              duration: 0.8,
              delay: 0.6 + index * 0.1,
              ease: "easeOut",
            }}
          />
        );
      })}
    </svg>
  );
}

// Individual orbiting planet (principle card)
// Refactored: Static card with background pulsation, instant hover/opacity changes
function OrbitingPlanet({
  principle,
  position,
  index,
  isHovered,
  isDimmed,
  onHover,
  onLeave,
  prefersReducedMotion,
}: {
  principle: Principle;
  position: { x: number; y: number; angle: number };
  index: number;
  isHovered: boolean;
  isDimmed: boolean;
  onHover: () => void;
  onLeave: () => void;
  prefersReducedMotion: boolean | null;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const Icon = iconMap[principle.id] || BookOpen;

  // Card dimensions
  const defaultSize = 112; // 28 * 4 = 112px (w-28)
  const expandedWidth = 220;

  return (
    <motion.div
      ref={ref}
      className="absolute left-1/2 top-1/2 transform-gpu"
      style={{
        x: position.x - defaultSize / 2,
        y: position.y - defaultSize / 2,
        zIndex: isHovered ? 30 : 10,
        opacity: isDimmed ? 0.4 : 1, // Instant opacity change
      }}
      initial={prefersReducedMotion ? { scale: 1 } : { opacity: 0, scale: 0 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{
        scale: prefersReducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 300, damping: 25, delay: 1.2 + index * 0.15 },
        opacity: { duration: 0.3 }, // Only for initial fade-in
      }}
    >
      {/* Background pulsation layer - works for both open and closed cards */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            width: isHovered ? expandedWidth : defaultSize,
            background: "linear-gradient(135deg, rgba(88, 168, 224, 0.1), rgba(59, 130, 246, 0.15))",
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.5,
          }}
        />
      )}

      {/* Static card - no animation on the element itself */}
      <button
        className="relative rounded-2xl
                   bg-white/90 backdrop-blur-md
                   border border-white/50
                   flex flex-col items-center
                   cursor-pointer
                   transform-gpu
                   focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2
                   overflow-hidden text-left"
        style={{
          width: isHovered ? expandedWidth : defaultSize,
          boxShadow: isHovered
            ? "0 0 30px rgba(59, 130, 246, 0.4), 0 15px 30px rgba(59, 130, 246, 0.25)"
            : "0 10px 25px rgba(59, 130, 246, 0.15)",
        }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onFocus={onHover}
        onBlur={onLeave}
        type="button"
        aria-label={`${principle.title}: ${principle.description}`}
      >
        <div className="p-4 flex flex-col items-center w-full">
          {/* Icon circle with gradient */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#3B82F6] flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </div>

          {/* Title */}
          <span className="mt-2 text-xs font-semibold text-[#1E3A5F] text-center leading-tight">
            {principle.title}
          </span>

          {/* Description - appears instantly on hover */}
          {isHovered && (
            <p className="mt-3 text-xs text-[#475569] text-center leading-relaxed">
              {principle.description}
            </p>
          )}
        </div>
      </button>
    </motion.div>
  );
}

// Mobile Mission Badge (compact, above the stack)
function MobileMissionBadge({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className="bg-gradient-to-br from-[#58A8E0] via-[#3B82F6] to-[#1E3A5F]
                 rounded-xl p-5 mb-4 text-white text-center
                 shadow-lg shadow-[#3B82F6]/20"
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.4 }
      }
    >
      <div className="flex items-center justify-center gap-3">
        <Target className="w-6 h-6 flex-shrink-0" />
        <div className="text-left">
          <span className="text-xs uppercase tracking-wide opacity-80">Миссия</span>
          <p className="font-semibold leading-tight">Финансовое благополучие</p>
        </div>
      </div>
    </motion.div>
  );
}

// Mobile Principle Card (for vertical stack)
function MobilePrincipleCard({
  principle,
  index,
  prefersReducedMotion,
}: {
  principle: Principle;
  index: number;
  prefersReducedMotion: boolean | null;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const Icon = iconMap[principle.id] || BookOpen;

  return (
    <motion.div
      ref={ref}
      className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-sm"
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.4, delay: index * 0.1 }
      }
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#58A8E0] to-[#3B82F6] flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#1E3A5F] mb-1">
            {principle.title}
          </h3>
          <p className="text-sm text-[#475569] leading-relaxed">
            {principle.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Mobile Principle Stack (vertical list)
function MobilePrincipleStack({
  principles,
  prefersReducedMotion,
}: {
  principles: Principle[];
  prefersReducedMotion: boolean | null;
}) {
  return (
    <div className="space-y-3">
      {/* Mission badge at top */}
      <MobileMissionBadge prefersReducedMotion={prefersReducedMotion} />

      {/* Principle cards */}
      {principles.map((principle, index) => (
        <MobilePrincipleCard
          key={principle.id}
          principle={principle}
          index={index}
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </div>
  );
}

export function Principles({ title, principles }: PrinciplesProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const sortedPrinciples = [...principles].sort((a, b) => a.order - b.order);

  return (
    <Section id="principles" title={title}>
      {/* Desktop: Orbital System */}
      <div className="hidden md:block relative h-[600px]">
        {/* Orbital rings (background) */}
        <OrbitalRings prefersReducedMotion={prefersReducedMotion} />

        {/* Connection beams from center to planets */}
        <ConnectionBeams
          principles={sortedPrinciples}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Central orb ("Sun") */}
        <CentralOrb prefersReducedMotion={prefersReducedMotion} />

        {/* Orbiting planets (principles) */}
        {sortedPrinciples.slice(0, 5).map((principle, index) => (
          <OrbitingPlanet
            key={principle.id}
            principle={principle}
            position={PLANET_POSITIONS[index]}
            index={index}
            isHovered={hoveredId === principle.id}
            isDimmed={hoveredId !== null && hoveredId !== principle.id}
            onHover={() => setHoveredId(principle.id)}
            onLeave={() => setHoveredId(null)}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}

        {/* Accessible list for screen readers */}
        <ul className="sr-only" aria-label="Наши принципы">
          {sortedPrinciples.map((principle) => (
            <li key={principle.id}>
              <strong>{principle.title}</strong>: {principle.description}
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile: Vertical stack with mission badge */}
      <div className="md:hidden">
        <MobilePrincipleStack
          principles={sortedPrinciples}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>
    </Section>
  );
}
