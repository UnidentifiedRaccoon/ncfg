import { ArrowUpRight } from "lucide-react";

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
  return (
    <Section id="projects" title="Проекты" background="gray">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {projects.map((project) => (
          <a
            key={project.href}
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group relative isolate overflow-hidden rounded-3xl border border-[#CFE0FF]/90 bg-[linear-gradient(155deg,#FFFFFF,#F4F8FF)] p-6 shadow-sm",
              "transition-all duration-300 ease-out [will-change:transform]",
              "hover:-translate-y-1.5 hover:border-[#3B82F6]/45 hover:shadow-[0_24px_54px_rgba(42,92,182,0.22)]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
              "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:content-['']",
              "before:[background-image:radial-gradient(720px_circle_at_18%_12%,rgba(48,215,255,0.18),transparent_60%),radial-gradient(640px_circle_at_90%_45%,rgba(138,92,255,0.14),transparent_62%)]",
              "before:transition-opacity before:duration-300 hover:before:opacity-100"
            )}
            aria-label={`Открыть проект ${project.title}`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[#5B8DFF]/14 blur-3xl transition-opacity duration-300 group-hover:opacity-90"
            />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="inline-flex rounded-full border border-[#5B8DFF]/35 bg-[#5B8DFF]/10 px-2.5 py-1 text-xs font-semibold text-[#18345A]">
                  {project.label}
                </span>
                <h3 className="mt-2 truncate text-xl font-extrabold tracking-tight text-[#122848]">
                  {project.title}
                </h3>
              </div>

              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#CFE0FF] bg-white/90 text-[#3A5378] transition-colors group-hover:border-[#5B8DFF]/45 group-hover:text-[#3B82F6]">
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>

            <p className="relative z-10 mt-4 text-sm leading-relaxed text-[#39557B]">
              {project.description}
            </p>

            <div className="relative z-10 mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#3B82F6]">
              Открыть
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}
