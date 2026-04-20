"use client";

import { Sparkles } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/shared/lib/cn";
import { Section } from "@/shared/ui/Section";

import { missionAccordionDirections } from "../model/content";

type HeadingTag = "h2" | "h3";

interface MissionPatternAccordionRevealProps {
  embedded?: boolean;
  headingAs?: HeadingTag;
}

const editorialSignals = [
  "hover, focus и tap ведут к одному reveal-сценарию",
  "активная карточка раскрывает внутренний лист, а не прячет текст",
  "мобильная версия сохраняет тот же UX без отдельной логики и тяжёлой анимации",
] as const;

function MissionPatternAccordionRevealBody({ headingAs = "h2" }: { headingAs?: HeadingTag }) {
  const Heading = headingAs;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDirection = missionAccordionDirections[activeIndex] ?? missionAccordionDirections[0];
  const idPrefix = useId();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] xl:gap-8">
      <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
        <article className="overflow-hidden rounded-[32px] border border-[#D7E4F2] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(246,250,255,0.98)_100%)] p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.32)] md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4E7DB3]">
            Лаборатория миссии / Accordion Reveal
          </p>
          <Heading className="mt-4 max-w-[13ch] text-[31px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#153153] md:text-[46px]">
            Reveal-подача, которая остаётся практичной для продовой главной
          </Heading>
          <p className="mt-5 max-w-[46ch] text-[15px] leading-7 text-[#52657D] md:text-base">
            Этот вариант собирает миссию в слоистую карточную сцену: активная карточка приоткрывает
            внутренний лист и даёт больше смысла, но не ломает общее чтение и не требует
            лишней клиентской логики.
          </p>

          <ul className="mt-8 space-y-3">
            {editorialSignals.map((signal) => (
              <li key={signal} className="flex items-start gap-3 text-sm leading-6 text-[#486079]">
                <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#D6E4F4] bg-white text-[#1D4ED8] shadow-[0_8px_20px_-18px_rgba(29,78,216,0.7)]">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </article>

        <article
          aria-labelledby={`${idPrefix}-${activeDirection.id}-summary`}
          className="relative overflow-hidden rounded-[32px] border border-[#D6E3F1] bg-[linear-gradient(180deg,#17304F_0%,#1B3C64_58%,#214873_100%)] p-6 text-white shadow-[0_32px_70px_-44px_rgba(15,23,42,0.58)] md:p-8"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(148,197,255,0.34),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(191,219,254,0.18),transparent_32%)]" />

          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C6DCF8]">
                  Активное направление
                </p>
                <h3
                  className="mt-3 max-w-[14ch] text-[28px] font-semibold leading-[1.02] tracking-[-0.045em] text-white md:text-[38px]"
                  id={`${idPrefix}-${activeDirection.id}-summary`}
                >
                  {activeDirection.label}
                </h3>
              </div>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D8E7FA]">
                Активное раскрытие
              </span>
            </div>

            <div className="mt-8 rounded-[26px] border border-white/12 bg-white/10 p-5 backdrop-blur md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C5DAF5]">
                Формулировка миссии
              </p>
              <p className="mt-3 text-[20px] font-medium leading-8 text-white md:text-[24px] md:leading-9">
                {activeDirection.manifesto}
              </p>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-[24px] border border-white/12 bg-white/8 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C5DAF5]">
                  Почему это работает
                </p>
                <p className="mt-3 text-[15px] leading-7 text-[#E6F0FF]">{activeDirection.detail}</p>
              </div>

              <div className="rounded-[24px] border border-white/12 bg-white/8 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C5DAF5]">
                  Что получает пользователь
                </p>
                <ul className="mt-4 space-y-3 text-[15px] leading-6 text-[#F5F9FF]">
                  {activeDirection.outcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#93C5FD]" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div className="space-y-4" aria-label="Направления миссии">
        {missionAccordionDirections.map((direction, index) => {
          const Icon = direction.icon;
          const isActive = activeIndex === index;
          const buttonId = `${idPrefix}-${direction.id}-trigger`;
          const panelId = `${idPrefix}-${direction.id}-panel`;

          return (
            <article
              key={direction.id}
              className={cn(
                "group relative overflow-hidden rounded-[30px] border p-2 shadow-[0_22px_50px_-42px_rgba(15,23,42,0.35)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                direction.accentClassName,
                isActive
                  ? "translate-y-0 shadow-[0_32px_70px_-42px_rgba(15,23,42,0.4)]"
                  : "md:hover:-translate-y-0.5"
              )}
            >
              <div className={cn("pointer-events-none absolute inset-0 opacity-90", direction.glowClassName)} />
              <div
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-5 top-4 h-[calc(100%-2rem)] rounded-[24px] border border-white/60 bg-white/42 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                  isActive
                    ? "translate-y-2 opacity-100"
                    : "translate-y-0 opacity-60 md:group-hover:translate-y-1"
                )}
              />
              <div
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-8 top-7 h-[calc(100%-2.75rem)] rounded-[22px] border border-white/55 bg-white/28 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                  isActive ? "translate-y-4 opacity-100" : "translate-y-1 opacity-50"
                )}
              />

              <div className="relative overflow-hidden rounded-[24px] border border-white/70 bg-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur">
                <button
                  aria-controls={panelId}
                  aria-expanded={isActive}
                  className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3B82F6]"
                  id={buttonId}
                  onClick={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  type="button"
                >
                  <div className="flex flex-col gap-5 p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <span
                          className={cn(
                            "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[#D8E4F1] bg-white text-[#1D4ED8] shadow-[0_14px_30px_-24px_rgba(29,78,216,0.7)] transition-colors duration-300 motion-reduce:transition-none",
                            isActive && "border-[#BFDBFE] text-[#163B6B]"
                          )}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D84A0]">
                            {String(index + 1).padStart(2, "0")} / {direction.label}
                          </p>
                          <h3 className="mt-3 max-w-[24ch] text-[22px] font-semibold leading-[1.16] tracking-[-0.035em] text-[#153153] md:text-[28px]">
                            {direction.title}
                          </h3>
                        </div>
                      </div>

                      <span
                        className={cn(
                          "inline-flex shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 motion-reduce:transition-none",
                          isActive
                            ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
                            : "border-[#D7E4F2] bg-white text-[#6D84A0]"
                        )}
                      >
                        {isActive ? "Раскрыто" : "Открыть"}
                      </span>
                    </div>

                    <p className="max-w-[60ch] pr-2 text-[15px] leading-7 text-[#52657D] md:text-base">
                      {direction.summary}
                    </p>
                  </div>
                </button>

                <div
                  aria-labelledby={buttonId}
                  hidden={!isActive}
                  id={panelId}
                  className="px-5 pb-5 md:px-6 md:pb-6"
                >
                    <div className="rounded-[24px] border border-[#DCE7F3] bg-[linear-gradient(180deg,rgba(248,251,255,0.95)_0%,rgba(255,255,255,0.98)_100%)] p-5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.28)]">
                      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(240px,0.82fr)] xl:gap-6">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D84A0]">
                            Внутренний лист
                          </p>
                          <p className="mt-3 text-[18px] font-medium leading-8 text-[#173A63] md:text-[21px]">
                            {direction.manifesto}
                          </p>
                          <p className="mt-4 max-w-[52ch] text-[15px] leading-7 text-[#486079] md:text-base">
                            {direction.detail}
                          </p>
                        </div>

                        <div className="rounded-[22px] border border-[#E0E9F4] bg-white/92 p-5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D84A0]">
                            Практический эффект
                          </p>
                          <ul className="mt-4 space-y-3 text-sm leading-6 text-[#486079] md:text-[15px]">
                            {direction.outcomes.map((outcome) => (
                              <li key={outcome} className="flex gap-3">
                                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#93C5FD]" />
                                <span>{outcome}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function MissionPatternAccordionReveal({
  embedded = false,
  headingAs = "h2",
}: MissionPatternAccordionRevealProps) {
  if (embedded) {
    return <MissionPatternAccordionRevealBody headingAs={headingAs} />;
  }

  return (
    <Section
      id="mission-accordion-reveal"
      reveal={false}
      className="pt-8 pb-12 md:pt-10 md:pb-16"
    >
      <MissionPatternAccordionRevealBody headingAs={headingAs} />
    </Section>
  );
}
