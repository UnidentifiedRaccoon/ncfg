import { cn } from "@/shared/lib/cn";
import { Section } from "@/shared/ui/Section";

import { missionEditorialDirections } from "../model/content";

type HeadingTag = "h2" | "h3";

interface MissionPatternEditorialStackProps {
  embedded?: boolean;
  headingAs?: HeadingTag;
}

const stackTopClassNames = ["lg:top-20", "lg:top-28", "lg:top-36", "lg:top-44"] as const;
const overlapClassNames = ["", "lg:-mt-24", "lg:-mt-24", "lg:-mt-24"] as const;
const accentClassNames = [
  "bg-[radial-gradient(circle_at_top_right,rgba(89,144,214,0.16),transparent_38%),linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)]",
  "bg-[radial-gradient(circle_at_top_left,rgba(134,169,225,0.14),transparent_36%),linear-gradient(180deg,#FFFFFF_0%,#F7FAFF_100%)]",
  "bg-[radial-gradient(circle_at_right_center,rgba(107,164,213,0.12),transparent_34%),linear-gradient(180deg,#FFFFFF_0%,#F8FBFF_100%)]",
  "bg-[radial-gradient(circle_at_bottom_right,rgba(92,152,212,0.14),transparent_36%),linear-gradient(180deg,#FFFFFF_0%,#F5FAFF_100%)]",
] as const;

function MissionPatternEditorialStackBody({ headingAs = "h2" }: { headingAs?: HeadingTag }) {
  const Heading = headingAs;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-10">
      <div className="self-start lg:sticky lg:top-20">
        <div className="overflow-hidden rounded-[32px] border border-[#D8E5F2] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(244,248,253,0.96)_100%)] p-6 shadow-[0_22px_60px_rgba(21,49,83,0.08)] md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4E7DB3]">
            Mission Pattern / Editorial Stack
          </p>
          <Heading className="mt-4 max-w-[14ch] text-[30px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#153153] md:text-[42px]">
            Миссия как четыре последовательных манифеста
          </Heading>
          <p className="mt-5 max-w-[48ch] text-[15px] leading-7 text-[#52657D] md:text-base">
            В этом варианте блок читается сверху вниз как спокойная редакционная сцена. На
            desktop карточки собираются в pinned stack, а на мобильных просто идут
            последовательной колонкой без лишнего эффекта.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-[#E0E9F4] bg-white/82 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D84A0]">
                Ритм
              </p>
              <p className="mt-2 text-sm leading-6 text-[#486079]">
                Последовательное чтение вместо подмены текста по наведению.
              </p>
            </div>
            <div className="rounded-[24px] border border-[#E0E9F4] bg-white/82 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D84A0]">
                Приоритет
              </p>
              <p className="mt-2 text-sm leading-6 text-[#486079]">
                Формулировка миссии всегда остаётся видимой и не прячется за motion.
              </p>
            </div>
          </div>

          <nav aria-label="Направления миссии" className="mt-8 flex flex-wrap gap-2.5">
            {missionEditorialDirections.map((direction, index) => (
              <a
                key={direction.id}
                href={`#${direction.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-[#D3E0EE] bg-white/88 px-3.5 py-2 text-sm font-medium text-[#173A63] transition-[border-color,color,transform] duration-200 hover:border-[#9FC3EA] hover:text-[#1D4ED8] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] motion-reduce:transform-none motion-reduce:transition-none"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4E7DB3]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{direction.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>

      <ol className="space-y-4 md:space-y-5 lg:space-y-0">
        {missionEditorialDirections.map((direction, index) => {
          const Icon = direction.icon;

          return (
            <li
              key={direction.id}
              id={direction.id}
              className={cn("scroll-mt-28", overlapClassNames[index])}
            >
              <article
                aria-labelledby={`${direction.id}-title`}
                className={cn(
                  "relative overflow-hidden rounded-[32px] border border-[#D8E4F1] p-6 shadow-[0_22px_60px_rgba(21,49,83,0.08)] backdrop-blur md:p-8 lg:min-h-[440px] lg:sticky",
                  stackTopClassNames[index],
                  accentClassNames[index]
                )}
              >
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0.14)_100%)]" />

                <div className="relative flex h-full flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/88 text-[#1D4ED8] shadow-[0_10px_25px_rgba(21,49,83,0.08)]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D84A0]">
                          Направление {String(index + 1).padStart(2, "0")}
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#355679]">
                          {direction.label}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex rounded-full border border-[#CFE0F1] bg-white/78 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4E7DB3]">
                      Манифест
                    </span>
                  </div>

                  <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)]">
                    <div>
                      <h3
                        id={`${direction.id}-title`}
                        className="max-w-[18ch] text-[24px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#153153] md:text-[32px]"
                      >
                        <a
                          href={`#${direction.id}`}
                          className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B82F6]"
                        >
                          {direction.title}
                        </a>
                      </h3>
                      <p className="mt-4 max-w-[44ch] text-[15px] leading-7 text-[#52657D] md:text-base">
                        {direction.description}
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-white/75 bg-white/82 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D84A0]">
                        Формулировка миссии
                      </p>
                      <p className="mt-3 text-[17px] font-medium leading-7 text-[#173A63]">
                        {direction.manifesto}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-8">
                    <div className="rounded-[24px] border border-[#D7E4F1] bg-[#F8FBFF]/92 p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D84A0]">
                        Зачем это в стеке
                      </p>
                      <p className="mt-3 max-w-[52ch] text-[15px] leading-7 text-[#3F5874] md:text-base">
                        {direction.outcome}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function MissionPatternEditorialStack({
  embedded = false,
  headingAs = "h2",
}: MissionPatternEditorialStackProps) {
  if (embedded) {
    return <MissionPatternEditorialStackBody headingAs={headingAs} />;
  }

  return (
    <Section id="mission-editorial-stack" reveal={false} className="pt-8 pb-12 md:pt-10 md:pb-16">
      <MissionPatternEditorialStackBody headingAs={headingAs} />
    </Section>
  );
}
