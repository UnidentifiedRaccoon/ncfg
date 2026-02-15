import { ArrowUpRight } from "lucide-react";

import { Section } from "@/shared/ui/Section";
import { cn } from "@/shared/lib/cn";

const projects = [
  {
    title: "коплю-трачу-помогаю.рф",
    description:
      "Развитие финансовой культуры с ранних лет. Социальный проект для педагогов, волонтеров и родителей.",
    href: "https://коплю-трачу-помогаю.рф",
  },
  {
    title: "культура-денег.рф",
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
              "group relative isolate overflow-hidden rounded-2xl border border-[#E2E8F0]/80 bg-white p-6 shadow-sm",
              "transition-all duration-300 ease-out [will-change:transform]",
              "hover:-translate-y-1 hover:border-[#3B82F6]/25 hover:shadow-lg hover:shadow-blue-500/10",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
              "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:content-['']",
              "before:[background-image:radial-gradient(720px_circle_at_18%_12%,rgba(88,168,224,0.16),transparent_60%),radial-gradient(640px_circle_at_90%_45%,rgba(59,130,246,0.12),transparent_62%)]",
              "before:transition-opacity before:duration-300 hover:before:opacity-100",
              "after:pointer-events-none after:absolute after:inset-x-6 after:top-0 after:h-px after:opacity-0 after:content-['']",
              "after:bg-gradient-to-r after:from-transparent after:via-[#58A8E0]/70 after:to-transparent",
              "after:transition-opacity after:duration-300 hover:after:opacity-100"
            )}
            aria-label={`Открыть проект ${project.title}`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[#3B82F6]/10 blur-3xl transition-opacity duration-300 group-hover:opacity-80"
            />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-semibold tracking-wide text-[#475569] uppercase">
                  Внешний проект
                </div>
                <h3 className="mt-2 truncate text-xl font-bold tracking-tight text-[#1E3A5F]">
                  {project.title}
                </h3>
              </div>

              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-white/80 text-[#475569] transition-colors group-hover:border-[#3B82F6]/35 group-hover:text-[#3B82F6]">
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>

            <p className="relative z-10 mt-4 text-sm leading-relaxed text-[#475569]">
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

