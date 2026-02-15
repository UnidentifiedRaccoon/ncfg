"use client";

import { Section } from "@/shared/ui/Section";
import { cn } from "@/shared/lib/cn";
import { useRef, useState, useEffect } from "react";
import { useInView, useReducedMotion, animate } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// Animated Counter
// ─────────────────────────────────────────────────────────────────────────────

interface AnimatedCounterProps {
  to: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
}

function AnimatedCounter({
  to,
  duration = 2,
  suffix = "",
  decimals = 0,
}: AnimatedCounterProps) {
  const prefersReducedMotion = useReducedMotion();
  const [count, setCount] = useState(prefersReducedMotion ? to : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || prefersReducedMotion || hasAnimated.current) return;

    hasAnimated.current = true;
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setCount(decimals > 0 ? v : Math.round(v)),
    });

    return () => controls.stop();
  }, [isInView, to, duration, decimals, prefersReducedMotion]);

  const formatted =
    decimals > 0
      ? count.toLocaleString("ru-RU", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : count.toLocaleString("ru-RU");

  return (
    <span ref={ref}>
      {formatted}
      {suffix}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Item
// ─────────────────────────────────────────────────────────────────────────────

interface StatItemProps {
  value: number;
  label: string;
  decimals?: number;
  suffix?: string;
  isLast?: boolean;
  isBottomRow?: boolean;
}

function StatItem({
  value,
  label,
  decimals = 0,
  suffix = "",
  isLast = false,
  isBottomRow = false,
}: StatItemProps) {
  return (
    <div
      className={cn(
        "px-4 py-6 md:px-6 md:py-8 text-center",
        // Desktop: vertical divider (except last)
        !isLast && "md:border-r md:border-[#E2E8F0]",
        // Mobile: right border for left column items
        !isLast && "border-r border-[#E2E8F0]",
        // Mobile: bottom border for top row
        !isBottomRow && "border-b border-[#E2E8F0] md:border-b-0"
      )}
    >
      <div className="text-2xl md:text-4xl font-bold text-[#1E3A5F]">
        <AnimatedCounter to={value} decimals={decimals} suffix={suffix} />
      </div>
      <div className="mt-1 text-sm text-[#64748B]">{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats Data
// ─────────────────────────────────────────────────────────────────────────────

export interface Stat {
  value: number;
  label: string;
  decimals?: number;
  suffix?: string;
}

const defaultStats: Stat[] = [
  { value: 3502, label: "клиентов" },
  { value: 9.63, decimals: 2, label: "NPS" },
  { value: 30.2, decimals: 1, suffix: " млн", label: "участников" },
  { value: 84, label: "региона" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Stats Component
// ─────────────────────────────────────────────────────────────────────────────

export function Stats({ items }: { items?: Stat[] }) {
  const stats = items && items.length > 0 ? items : defaultStats;

  return (
    <Section
      id="about"
      background="gray"
      className="pt-12 md:pt-16 pb-0 md:pb-0"
    >
      {/* Screen reader content */}
      <div className="sr-only">
        <h2>Наши достижения в цифрах</h2>
        <ul>
          <li>3502 довольных корпоративных клиента</li>
          <li>9.63 — индекс NPS наших программ</li>
          <li>30.2 миллиона участников мероприятий</li>
          <li>84 региона участвуют в проектах</li>
        </ul>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4">
        {stats.map((stat, index) => (
          <StatItem
            key={stat.label}
            value={stat.value}
            label={stat.label}
            decimals={stat.decimals}
            suffix={stat.suffix}
            isLast={index === stats.length - 1}
            isBottomRow={index >= 2}
          />
        ))}
      </div>
    </Section>
  );
}
