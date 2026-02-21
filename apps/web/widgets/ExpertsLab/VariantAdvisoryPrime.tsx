import { BarChart3, Grid2x2 } from "lucide-react";
import type { ExpertsLabItem, VariantProps } from "./ExpertsLab.types";
import { SignalExpertCard } from "@/shared/ui";

function getAverageExperience(items: ExpertsLabItem[]): number | null {
  const valid = items.filter((item) => typeof item.experienceYears === "number");
  if (valid.length === 0) return null;

  const total = valid.reduce((acc, item) => acc + (item.experienceYears ?? 0), 0);
  return Math.round(total / valid.length);
}

export function VariantAdvisoryPrime({
  items,
  title = "Signal Panel",
  lead = "Вариация базового Signal-стиля в сетке: главный профиль + компактные карточки остальных экспертов.",
}: VariantProps) {
  if (items.length === 0) return null;

  const [featured, ...rest] = items;
  const averageExperience = getAverageExperience(items);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_16px_34px_rgba(30,58,95,0.08)]">
      <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3B82F6]">
              {title}
            </p>
            <p className="mt-1 text-sm text-[#475569] md:text-base">{lead}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-semibold text-[#1E3A5F]">
              <Grid2x2 size={12} aria-hidden="true" />
              {items.length} экспертов
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-semibold text-[#1E3A5F]">
              <BarChart3 size={12} aria-hidden="true" />
              {averageExperience ? `${averageExperience}+` : "n/a"} средний стаж
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <SignalExpertCard expert={featured} featured headingLevel="h4" />

        {rest.length > 0 && (
          <ul role="list" className="mt-4 grid gap-3 sm:grid-cols-2 lg:mt-5">
            {rest.map((item) => (
              <li key={item.id}>
                <SignalExpertCard expert={item} headingLevel="h4" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
