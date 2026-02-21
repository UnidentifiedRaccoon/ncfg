import { cn } from "@/shared/lib/cn";
import type { HowWeWorkVariantProps } from "../types";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function HowWeWorkVariantPulseRail({ steps }: HowWeWorkVariantProps) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#E2E8F0]/80 bg-[linear-gradient(180deg,#FFFFFF_0%,#F7FBFF_100%)] p-4 md:p-6 lg:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(88,168,224,0.18),transparent_46%),radial-gradient(circle_at_90%_80%,rgba(59,130,246,0.12),transparent_38%)]"
      />

      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-6 top-0 z-0 w-px bg-gradient-to-b from-[#58A8E0] via-[#3B82F6] to-[#1E3A5F]/30 md:left-1/2 md:-translate-x-1/2"
        />

        <ol className="relative z-10 list-none m-0 space-y-6 p-0 md:space-y-0">
          {steps.map((step, index) => {
            const isLeft = index % 2 === 0;
            const stepCode = pad2(step.id);

            return (
              <li key={`${step.id}-${step.title}`} className="relative md:min-h-[176px]">
                <div className="hidden md:flex md:items-start">
                  <div className={cn("w-1/2", isLeft ? "order-2" : "order-1")} />

                  <div className={cn("w-1/2", isLeft ? "order-1 pr-14" : "order-2 pl-14")}>
                    <article
                      tabIndex={0}
                      className="group relative rounded-2xl border border-[#E2E8F0]/80 bg-white/90 p-6 shadow-[0_12px_34px_rgba(15,23,42,0.07)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#3B82F6]/30 hover:shadow-[0_18px_46px_rgba(30,58,95,0.12)] focus-visible:-translate-y-1 focus-visible:border-[#3B82F6]/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                    >
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#58A8E0]/70 to-transparent"
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(115deg,transparent,rgba(88,168,224,0.10),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                      />

                      <div className="relative flex items-center gap-3">
                        <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-3 py-1 text-xs font-mono font-semibold tracking-wide text-[#1E3A5F]">
                          {stepCode}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-[#E2E8F0] via-[#E2E8F0]/60 to-transparent" />
                      </div>

                      <h3 className="relative mt-3 text-lg font-semibold leading-snug text-[#1E3A5F]">
                        {step.title}
                      </h3>

                      {step.description && (
                        <p className="relative mt-2 text-sm leading-relaxed text-[#475569]">
                          {step.description}
                        </p>
                      )}
                    </article>
                  </div>
                </div>

                <div className="relative pl-14 md:hidden">
                  <article
                    tabIndex={0}
                    className="group relative rounded-2xl border border-[#E2E8F0]/80 bg-white/90 p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#3B82F6]/30 hover:shadow-[0_16px_40px_rgba(30,58,95,0.11)] focus-visible:-translate-y-1 focus-visible:border-[#3B82F6]/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#58A8E0]/70 to-transparent"
                    />
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-3 py-1 text-xs font-mono font-semibold tracking-wide text-[#1E3A5F]">
                        {stepCode}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-[#E2E8F0] via-[#E2E8F0]/60 to-transparent" />
                    </div>

                    <h3 className="mt-3 text-base font-semibold leading-snug text-[#1E3A5F]">
                      {step.title}
                    </h3>

                    {step.description && (
                      <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                        {step.description}
                      </p>
                    )}
                  </article>
                </div>

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-6 top-8 z-20 -translate-x-1/2 md:left-1/2"
                >
                  <span className="absolute -inset-1.5 rounded-full bg-[#58A8E0]/35 motion-safe:animate-ping" />
                  <span className="relative block h-3 w-3 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#3B82F6] ring-4 ring-[#58A8E0]/18 shadow-[0_6px_18px_rgba(59,130,246,0.32)]" />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
