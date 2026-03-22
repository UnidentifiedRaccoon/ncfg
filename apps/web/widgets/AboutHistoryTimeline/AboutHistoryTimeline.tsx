import { ArrowUpRight } from "lucide-react";
import { Container } from "@/shared/ui/Container";
import {
  ABOUT_HISTORY_MILESTONES,
  type AboutHistoryMilestone,
  type AboutHistoryMilestoneLink,
} from "./timelineData";

function ExternalLinkChip({ link }: { link: AboutHistoryMilestoneLink }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noreferrer noopener"
      className="group inline-flex items-center gap-2 rounded-full border border-white/[0.15] bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
    >
      {link.label}
      <ArrowUpRight
        className="h-4 w-4 shrink-0 text-[#9DD3FF] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
    </a>
  );
}

function LinksRow({ milestone }: { milestone: AboutHistoryMilestone }) {
  if (!milestone.links || milestone.links.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {milestone.links.map((link) => (
        <ExternalLinkChip key={link.href} link={link} />
      ))}
    </div>
  );
}

function HistoryLabel({ children }: { children: string }) {
  return (
    <div className="inline-flex rounded-full border border-[#66BBFF]/30 bg-[linear-gradient(90deg,rgba(88,168,224,0.25)_0%,rgba(88,168,224,0.06)_100%)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#9DD3FF] shadow-[0_0_0_1px_rgba(88,168,224,0.08),0_10px_30px_rgba(59,130,246,0.10)]">
      {children}
    </div>
  );
}

function EventsCard({ items }: { items?: string[] }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[0.055] p-4 text-white/[0.86] md:p-5">
      <HistoryLabel>Ключевые события</HistoryLabel>
      <ul className="mt-4 divide-y divide-white/10" aria-label="Ключевые события">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#58A8E0]" />
            <span className="text-sm leading-6 text-white/[0.78]">{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function InsightCard({
  label,
  text,
}: {
  label: "Цель" | "Результат";
  text: string;
}) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[0.055] p-4 text-white/[0.86] md:p-5">
      <HistoryLabel>{label}</HistoryLabel>
      <p className="mt-4 text-sm leading-6 md:text-[15px]">{text}</p>
    </article>
  );
}

function TimelineItem({ milestone }: { milestone: AboutHistoryMilestone }) {
  return (
    <li data-scroll-reveal="" className="relative">
      <article className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04]">
        <div className="grid gap-0 lg:grid-cols-[132px_minmax(0,1fr)]">
          <div className="border-b border-white/10 bg-white/[0.06] px-5 py-6 text-white lg:border-b-0 lg:border-r">
            <div className="text-[34px] font-semibold tracking-[-0.05em]">
              {milestone.period}
            </div>
          </div>

          <div className="p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 max-w-3xl">
                <h3 className="text-[24px] font-semibold tracking-[-0.035em] text-white md:text-[30px]">
                  {milestone.organization}
                </h3>
              </div>
              <LinksRow milestone={milestone} />
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <InsightCard label="Цель" text={milestone.goal} />
              <InsightCard label="Результат" text={milestone.result} />
            </div>

            <div className="mt-4">
              <EventsCard items={milestone.highlights} />
            </div>
          </div>
        </div>
      </article>
    </li>
  );
}

export function AboutHistoryTimeline() {
  return (
    <section
      id="history-center"
      className="relative -mt-px overflow-hidden bg-[#071321] pb-16 pt-0 md:pb-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#071321_0%,#071321_22%,#08192E_100%),radial-gradient(circle_at_14%_0%,rgba(88,168,224,0.16),transparent_32%),radial-gradient(circle_at_86%_6%,rgba(59,130,246,0.14),transparent_28%)]"
      />

      <Container className="relative z-10 px-0 md:px-0 lg:px-8">
        <div className="mx-auto max-w-3xl px-4 pb-10 pt-12 text-center md:px-6 md:pb-12 md:pt-16 lg:px-0">
          <h2 className="text-[28px] font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-[48px]">
            История центра
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/[0.72] md:text-xl">
            Пять ключевых этапов развития НЦФГ: от ИНФИС и ИФП до центра методологии и проектной
            деятельности в области финансового благополучия населения.
          </p>
        </div>

        <div className="relative lg:overflow-hidden lg:rounded-[34px] lg:border lg:border-white/10 lg:bg-[#071321] lg:p-6 lg:shadow-[0_28px_90px_rgba(7,19,33,0.5)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden lg:block lg:bg-[linear-gradient(135deg,rgba(88,168,224,0.14)_0%,transparent_38%),radial-gradient(circle_at_90%_0%,rgba(59,130,246,0.18),transparent_26%)]"
          />

          <div className="relative z-10">
            <ol className="space-y-5" aria-label="История НЦФГ">
              {ABOUT_HISTORY_MILESTONES.map((milestone) => (
                <TimelineItem key={milestone.id} milestone={milestone} />
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}
