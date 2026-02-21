import { cn } from "@/shared/lib/cn";
import type { HowWeWorkVariantProps } from "../types";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function getDesktopSpan(index: number) {
  if (index === 0) return "xl:col-span-7";
  if (index === 1) return "xl:col-span-5";
  if (index % 3 === 2) return "xl:col-span-4";
  return "xl:col-span-6";
}

export function HowWeWorkVariantFlowCards({ steps }: HowWeWorkVariantProps) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#E2E8F0]/80 bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FBFF_100%)] p-4 md:p-6 lg:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(88,168,224,0.18),transparent_46%),radial-gradient(circle_at_84%_80%,rgba(59,130,246,0.12),transparent_40%)]"
      />

      <div className="relative -mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0 md:overflow-visible">
        <ol className="flex list-none gap-4 p-0 md:grid md:grid-cols-2 xl:grid-cols-12">
          {steps.map((step, index) => (
            <li
              key={`${step.id}-${step.title}`}
              className={cn(
                "min-w-[292px] snap-start md:min-w-0",
                getDesktopSpan(index),
                index % 2 === 1 && "md:translate-y-6 xl:translate-y-8"
              )}
            >
              <article
                tabIndex={0}
                className="group relative h-full overflow-hidden rounded-2xl border border-[#E2E8F0]/80 bg-white/92 p-5 shadow-[0_14px_36px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#3B82F6]/30 hover:shadow-[0_20px_48px_rgba(30,58,95,0.14)] focus-visible:-translate-y-1 focus-visible:border-[#3B82F6]/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] md:p-6"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-2 text-[72px] font-semibold leading-none tracking-tight text-[#1E3A5F]/7 md:right-4 md:top-3"
                >
                  {pad2(step.id)}
                </div>

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#58A8E0]/60 to-transparent"
                />

                <div className="relative flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-3 py-1 text-xs font-mono font-semibold tracking-wide text-[#1E3A5F]">
                    Шаг {pad2(step.id)}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#E2E8F0] to-transparent" />
                </div>

                <h3 className="relative mt-3 text-lg font-semibold leading-snug text-[#1E3A5F]">
                  {step.title}
                </h3>

                {step.description && (
                  <p className="relative mt-3 text-sm leading-relaxed text-[#475569]">
                    {step.description}
                  </p>
                )}
              </article>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
