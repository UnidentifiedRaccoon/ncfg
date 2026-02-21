import { ArrowUpRight } from "lucide-react";
import type { VariantProps } from "./ExpertsLab.types";
import { SignalExpertCard } from "@/shared/ui";

export function VariantCapitalRibbon({
  items,
  title = "Signal Rail",
  lead = "Базовый стиль: простые карточки в горизонтальной ленте, опыт и навыки вынесены в лейблы.",
}: VariantProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 md:p-5">
      <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3B82F6]">
            {title}
          </p>
          <p className="mt-1 text-sm text-[#475569] md:text-base">{lead}</p>
        </div>

        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-semibold text-[#1E3A5F]">
          Base style
          <ArrowUpRight size={13} aria-hidden="true" />
        </span>
      </header>

      <div className="relative">
        <ul role="list" className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
          {items.map((item) => (
            <li key={item.id}>
              <SignalExpertCard
                expert={item}
                className="min-w-[300px] snap-start sm:min-w-[340px]"
                headingLevel="h4"
              />
            </li>
          ))}
        </ul>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#F8FAFC] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#F8FAFC] to-transparent" />
      </div>
    </div>
  );
}
