import { Check, ChevronDown, Clock3 } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";
import { Section } from "@/shared/ui/Section";

import type {
  SeasonOfferProgram,
  SeasonOfferProgramCatalogContent,
} from "../model/types";

interface SeasonOfferProgramsProps extends SeasonOfferProgramCatalogContent {
  formHref: string;
}

function ProgramList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#1E3A5F]">
        {title}
      </h4>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-[#475569]">
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-[#3B82F6]"
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProgramCard({
  program,
  formHref,
  ctaLabel,
}: {
  program: SeasonOfferProgram;
  formHref: string;
  ctaLabel: string;
}) {
  return (
    <details
      id={program.id}
      className={cn(
        "group scroll-mt-28 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm open:border-[#3B82F6]/35 open:shadow-lg",
        program.featured &&
          "border-[#3B82F6]/35 bg-[linear-gradient(135deg,rgba(59,130,246,0.045),#FFFFFF_38%)]"
      )}
    >
      <summary className="faq-summary cursor-pointer select-none px-5 py-5 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#3B82F6] md:px-7 md:py-6">
        <h3 className="flex items-start gap-4">
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
              {program.type}
            </span>
            <span className="mt-2 block text-lg font-semibold leading-snug text-[#1E3A5F] md:text-2xl">
              {program.title}
            </span>
            <span className="mt-2 block text-sm font-normal leading-relaxed text-[#475569] md:text-base">
              {program.value}
            </span>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#F1F5F9] px-3 py-1.5 text-xs font-semibold text-[#475569] md:text-sm">
              <Clock3 className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
              {program.duration}
            </span>
          </span>

          <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC] text-[#3B82F6] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none">
            <ChevronDown className="h-5 w-5" aria-hidden="true" />
          </span>
        </h3>
      </summary>

      <div className="border-t border-[#E2E8F0] px-5 py-6 md:px-7 md:py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <ProgramList title={program.audienceTitle} items={program.audience} />
          <ProgramList title={program.outcomesTitle} items={program.outcomes} />
          <ProgramList title="Формат" items={program.format} />
        </div>

        <div className="mt-7 flex flex-col gap-4 border-t border-[#E2E8F0] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-[#64748B]">
            Состав программы и примеры адаптируем под аудиторию на брифинге.
          </p>
          <Button
            href={formHref}
            data-ym-goal="cta_click"
            className="w-full shrink-0 sm:w-auto"
            aria-label={`${ctaLabel}: ${program.title}`}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </details>
  );
}

export function SeasonOfferPrograms({
  title,
  lead,
  ctaLabel,
  programs,
  formHref,
}: SeasonOfferProgramsProps) {
  return (
    <Section
      id="season-offer-programs"
      title={title}
      lead={lead}
      background="gray"
    >
      <div className="mx-auto max-w-5xl space-y-4">
        {programs.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            formHref={formHref}
            ctaLabel={ctaLabel}
          />
        ))}
      </div>
    </Section>
  );
}
