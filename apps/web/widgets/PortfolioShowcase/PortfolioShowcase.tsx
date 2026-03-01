import { ArrowUpRight, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Lexend } from "next/font/google";
import { cn } from "@/shared/lib/cn";
import { Section } from "@/shared/ui/Section";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-portfolio-lexend",
  display: "swap",
  weight: ["500", "600", "700"],
});

interface PortfolioProject {
  id: number;
  title: string;
  description: string;
  period?: string | null;
}

interface PortfolioShowcaseProps {
  title?: string;
  lead?: string;
  projects: PortfolioProject[];
  presentation?: {
    label: string;
    href: string;
  };
}

function renderPanelIcon(index: number, className: string) {
  const iconIndex = index % 4;

  if (iconIndex === 0) {
    return <TrendingUp className={className} aria-hidden="true" />;
  }
  if (iconIndex === 1) {
    return <ShieldCheck className={className} aria-hidden="true" />;
  }
  if (iconIndex === 2) {
    return <Zap className={className} aria-hidden="true" />;
  }

  return <Sparkles className={className} aria-hidden="true" />;
}

function MediaPanel({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate aspect-[4/3] overflow-hidden rounded-2xl border border-[#E2E8F0]/60 bg-[#F8FAFC] md:h-full md:min-h-0 md:aspect-auto",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0B1A33] via-[#1E3A5F] to-[#3B82F6]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.14] bg-[radial-gradient(circle_at_24%_28%,rgba(88,168,224,0.65),transparent_58%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.10] bg-[linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:56px_56px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/18 via-white/0 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-transparent"
      />

      <div className="absolute inset-0 flex items-center justify-center">
        {renderPanelIcon(index, "h-20 w-20 text-white/30")}
      </div>
    </div>
  );
}

function EmptyProjectsFallback() {
  return (
    <article className="rounded-3xl border border-[#D1E3FB] bg-white/90 p-6 shadow-[0_20px_50px_rgba(59,130,246,0.12)] md:p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-[#102A4A]">
        Проекты временно недоступны
      </h2>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#3F5C86]">
        Мы обновляем подборку кейсов. Попробуйте открыть страницу позже.
      </p>
    </article>
  );
}

export function PortfolioShowcase({
  title,
  lead,
  projects,
  presentation,
}: PortfolioShowcaseProps) {
  if (projects.length === 0) {
    return (
      <Section id="portfolio-projects" title={title} lead={lead} className={cn(lexend.variable)}>
        <EmptyProjectsFallback />
      </Section>
    );
  }

  return (
    <Section
      id="portfolio-projects"
      title={title}
      lead={lead}
      className={cn(lexend.variable)}
    >
      <div className="space-y-4 md:space-y-5">
        {projects.map((project, index) => (
          <article
            key={project.id}
            className={cn(
              "group relative isolate overflow-hidden rounded-3xl border transition-all duration-300 ease-out [will-change:transform]",
              "border-[#E2E8F0]/70 bg-white/75 shadow-sm backdrop-blur-sm",
              "hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 hover:border-[#3B82F6]/25",
              "before:pointer-events-none before:absolute before:inset-x-10 before:top-0 before:z-0 before:h-px before:content-['']",
              "before:bg-gradient-to-r before:from-transparent before:via-[#58A8E0]/70 before:to-transparent",
              "before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100",
              "after:pointer-events-none after:absolute after:inset-0 after:z-0 after:rounded-3xl after:content-['']",
              "after:bg-[radial-gradient(circle_at_18%_12%,rgba(88,168,224,0.18),transparent_60%)]",
              "after:opacity-0 after:transition-opacity after:duration-300 group-hover:after:opacity-100"
            )}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-28 -top-24 z-0 h-72 w-72 rounded-full bg-gradient-to-br from-[#58A8E0]/24 via-[#3B82F6]/14 to-transparent blur-2xl"
            />

            <div
              className={cn(
                "relative z-10 grid items-stretch gap-6 p-5 md:grid-cols-12 md:gap-8 md:p-6 lg:gap-10 lg:p-7"
              )}
            >
              <MediaPanel
                index={index}
                className={cn(
                  "md:col-span-5",
                  index % 2 === 0 ? "md:order-1" : "md:order-2"
                )}
              />

              <div
                className={cn(
                  "min-w-0 md:col-span-7",
                  index % 2 === 0 ? "md:order-2" : "md:order-1"
                )}
              >
                <h3 className="mt-4 text-xl font-semibold leading-tight tracking-tight text-[#1E3A5F] md:text-2xl lg:text-3xl">
                  {project.title}
                </h3>

                <p className="mt-3 text-base leading-relaxed text-[#475569] md:text-lg">
                  {project.description}
                </p>
              </div>
            </div>
          </article>
        ))}

        {presentation && (
          <div className="relative overflow-hidden rounded-[28px] border border-[#1D4ED8]/25 bg-[#0C1D39] p-6 text-white shadow-[0_24px_55px_rgba(15,23,42,0.45)] md:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.34),transparent_48%),radial-gradient(circle_at_100%_100%,rgba(37,99,235,0.34),transparent_42%)]"
            />
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <h3 className="text-xl font-semibold tracking-tight text-white font-[family-name:var(--font-portfolio-lexend)] md:text-2xl">
                  Презентация со всеми кейсами НЦФГ
                </h3>
              </div>

              <a
                href={presentation.href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#38BDF8]/55 bg-[#0EA5E9]/25 px-6 text-base font-semibold text-white transition-colors hover:bg-[#0EA5E9]/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38BDF8]"
              >
                {presentation.label}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
