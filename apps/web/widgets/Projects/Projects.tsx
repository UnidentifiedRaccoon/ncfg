"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Section } from "@/shared/ui/Section";
import { cn } from "@/shared/lib/cn";

const projects = [
  {
    title: "коплю-трачу-помогаю.рф",
    label: "Социальный проект",
    description:
      "Развитие финансовой культуры с ранних лет. Социальный проект для педагогов, волонтеров и родителей.",
    href: "https://коплю-трачу-помогаю.рф",
  },
  {
    title: "культура-денег.рф",
    label: "Медиа проект",
    description:
      "Медиа-проект о практиках развития финансового благополучия в корпоративной среде.",
    href: "https://культура-денег.рф",
  },
] as const;

export function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion ?? false;
  const safeActiveIndex = Math.min(activeIndex, Math.max(projects.length - 1, 0));
  const activeProject = projects[safeActiveIndex];

  useEffect(() => {
    if (projects.length <= 1 || shouldReduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % projects.length);
    }, 6800);
    return () => window.clearInterval(timer);
  }, [shouldReduceMotion]);

  if (!activeProject) return null;

  return (
    <Section id="projects" title="Проекты" background="gray">
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.a
            key={activeProject.href}
            href={activeProject.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 34, scale: 0.98 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -34, scale: 0.98 }}
            transition={{ duration: 0.36, ease: "easeOut" }}
            className={cn(
              "group relative isolate block overflow-hidden rounded-3xl bg-[linear-gradient(155deg,#FFFFFF,#F4F8FF)] p-6 shadow-sm",
              "transition-all duration-300 ease-out [will-change:transform]",
              "hover:-translate-y-1.5 hover:shadow-[0_24px_54px_rgba(42,92,182,0.22)]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
              "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:content-['']",
              "before:[background-image:radial-gradient(720px_circle_at_18%_12%,rgba(48,215,255,0.18),transparent_60%),radial-gradient(640px_circle_at_90%_45%,rgba(138,92,255,0.14),transparent_62%)]",
              "before:transition-opacity before:duration-300 hover:before:opacity-100"
            )}
            aria-label={`Открыть проект ${activeProject.title}`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[#5B8DFF]/14 blur-3xl transition-opacity duration-300 group-hover:opacity-90"
            />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="inline-flex rounded-full bg-[#5B8DFF]/10 px-2.5 py-1 text-xs font-semibold text-[#18345A]">
                  {activeProject.label}
                </span>
                <h3 className="mt-2 truncate text-xl font-extrabold tracking-tight text-[#122848]">
                  {activeProject.title}
                </h3>
              </div>

              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/90 text-[#3A5378] transition-colors group-hover:text-[#3B82F6]">
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>

            <p className="relative z-10 mt-4 text-sm leading-relaxed text-[#39557B]">
              {activeProject.description}
            </p>

            <div className="relative z-10 mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#3B82F6]">
              Открыть
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </motion.a>
        </AnimatePresence>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {projects.map((project, index) => (
            <button
              key={`projects-dot-${project.href}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                index === safeActiveIndex
                  ? "bg-[#3B82F6]/10 text-[#1E3A5F]"
                  : "bg-white/85 text-[#5A7297] hover:bg-[#EAF2FF]"
              )}
              aria-label={`Показать проект: ${project.title}`}
              aria-current={index === safeActiveIndex ? "true" : undefined}
            >
              {project.title}
            </button>
          ))}
        </div>
      </div>
    </Section>
  );
}
