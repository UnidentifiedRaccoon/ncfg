import { ArrowRight, BarChart3, ShieldCheck } from "lucide-react";

import { Button } from "@/shared/ui/Button";
import { Section } from "@/shared/ui/Section";

import type {
  SeasonOfferAssuranceColumn,
  SeasonOfferAssuranceContent,
} from "../model/types";

function AssuranceColumn({
  content,
  variant,
}: {
  content: SeasonOfferAssuranceColumn;
  variant: "reporting" | "boundaries";
}) {
  const Icon = variant === "reporting" ? BarChart3 : ShieldCheck;

  return (
    <article className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm md:p-8">
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#58A8E0]/10 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B82F6]/10 text-[#3B82F6]">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
            {content.eyebrow}
          </span>
        </div>

        <h3 className="mt-5 text-2xl font-semibold leading-tight text-[#1E3A5F] md:text-3xl">
          {content.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#64748B] md:text-base">
          {content.lead}
        </p>

        <ol className="mt-6 space-y-4">
          {content.items.map((item, index) => (
            <li
              key={item.title}
              className="grid grid-cols-[2rem_1fr] gap-3 border-t border-[#E2E8F0] pt-4 first:border-t-0 first:pt-0"
            >
              <span className="font-mono text-xs font-semibold tracking-[0.12em] text-[#64748B]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h4 className="font-semibold text-[#1E3A5F]">{item.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-[#475569]">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}

export function SeasonOfferAssurance({
  title,
  lead,
  reporting,
  boundaries,
  expertise,
}: SeasonOfferAssuranceContent) {
  return (
    <Section
      id="season-offer-assurance"
      title={title}
      lead={lead}
      background="gray"
    >
      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <AssuranceColumn content={reporting} variant="reporting" />
        <AssuranceColumn content={boundaries} variant="boundaries" />
      </div>

      <div className="mt-6 flex flex-col gap-6 rounded-3xl bg-[#1E3A5F] p-6 text-white shadow-[0_18px_50px_rgba(30,58,95,0.18)] md:flex-row md:items-center md:justify-between md:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">
            {expertise.eyebrow}
          </p>
          <h3 className="mt-3 text-2xl font-semibold leading-tight md:text-3xl">
            {expertise.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
            {expertise.description}
          </p>
        </div>

        <Button
          href={expertise.action.href}
          variant="secondary"
          className="w-full shrink-0 !bg-white !text-[#1E3A5F] hover:!bg-[#F1F5F9] md:w-auto"
        >
          {expertise.action.label}
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </Section>
  );
}
