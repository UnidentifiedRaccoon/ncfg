import type { HowWeWorkVariantProps } from "../types";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function HowWeWorkVariantOpsBoard({ steps }: HowWeWorkVariantProps) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#1E3A5F] bg-[linear-gradient(180deg,#071020_0%,#0A1730_100%)] p-4 md:p-6 lg:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#3B82F6]/16 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-[#58A8E0]/14 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:34px_34px]"
      />

      <div className="relative">
        <div className="mb-6 md:mb-8">
          <div
            aria-hidden="true"
            className="h-px w-full bg-gradient-to-r from-[#58A8E0]/20 via-[#3B82F6]/70 to-[#58A8E0]/20"
          />
          <ol className="mt-3 grid list-none grid-cols-3 gap-2 p-0 text-[11px] md:grid-cols-6">
            {steps.map((step) => (
              <li
                key={`board-chip-${step.id}-${step.title}`}
                className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-center font-mono tracking-wide text-white/70"
              >
                {pad2(step.id)}
              </li>
            ))}
          </ol>
        </div>

        <ol className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 xl:grid-cols-3">
          {steps.map((step, index) => (
            <li key={`${step.id}-${step.title}`}>
              <article
                tabIndex={0}
                className="group relative h-full overflow-hidden rounded-2xl border border-white/14 bg-[linear-gradient(160deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] p-5 shadow-[0_20px_44px_rgba(0,0,0,0.38)] transition-all duration-300 hover:-translate-y-1 hover:border-[#58A8E0]/45 hover:shadow-[0_26px_56px_rgba(0,0,0,0.45)] focus-visible:-translate-y-1 focus-visible:border-[#58A8E0]/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58A8E0]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#58A8E0]/75 to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-5 h-8 w-[2px] rounded-full bg-gradient-to-b from-[#58A8E0] to-[#3B82F6]"
                />

                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center rounded-full border border-white/18 bg-white/[0.06] px-3 py-1 text-xs font-mono tracking-wide text-white/75">
                    {pad2(step.id)}
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
                    Этап {index + 1}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold leading-snug text-white">
                  {step.title}
                </h3>

                {step.description && (
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
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
