import Image from "next/image";
import { BriefcaseBusiness, ShieldCheck } from "lucide-react";
import type { ExpertsLabItem, VariantProps } from "./ExpertsLab.types";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return fullName.slice(0, 2).toUpperCase();
}

function getExperienceCoverage(items: ExpertsLabItem[]): string {
  const withExperience = items.filter((item) => item.experienceYears).length;
  return `${withExperience}/${items.length}`;
}

function DossierRow({
  item,
  index,
}: {
  item: ExpertsLabItem;
  index: number;
}) {
  return (
    <li className="border-b border-[#E2E8F0] last:border-b-0">
      <article className="grid gap-3 p-4 md:grid-cols-[auto_1fr_auto] md:items-center md:px-5">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#475569]">
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="flex min-w-0 items-center gap-3">
          <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#1E3A5F] p-[1px]">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white font-bold text-[#1E3A5F]">
              {item.photoUrl ? (
                <Image
                  src={item.photoUrl}
                  alt={item.fullName}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(item.fullName)
              )}
            </div>
          </div>

          <div className="min-w-0">
            <h4 className="truncate text-base font-semibold text-[#1E3A5F]">{item.fullName}</h4>
            <p className="line-clamp-2 text-sm text-[#475569]">{item.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
          <span className="rounded-full border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11px] font-medium text-[#475569]">
            {item.experienceYears ? `${item.experienceYears}+ лет` : "Подтвержден"}
          </span>
          {item.tags.slice(0, 1).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] text-[#475569]"
            >
              {tag}
            </span>
          ))}
        </div>
      </article>
    </li>
  );
}

export function VariantTrustLedger({
  items,
  title = "Dossier Board",
  lead = "Строгий модульный формат для B2B-контекста: максимум структуры, минимум визуального шума.",
}: VariantProps) {
  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#FCFDFE]">
      <div className="grid lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
        <aside className="border-b border-[#E2E8F0] p-5 lg:border-b-0 lg:border-r lg:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3B82F6]">
            {title}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#475569] md:text-base">{lead}</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-3">
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
                <BriefcaseBusiness size={12} aria-hidden="true" />
                профили
              </div>
              <div className="mt-1 text-2xl font-bold leading-none text-[#1E3A5F]">{items.length}</div>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-3">
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
                <ShieldCheck size={12} className="text-[#3B82F6]" aria-hidden="true" />
                стаж
              </div>
              <div className="mt-1 text-2xl font-bold leading-none text-[#1E3A5F]">
                {getExperienceCoverage(items)}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
              Режим показа
            </p>
            <p className="mt-1 text-sm text-[#475569]">
              Dossier-first: карточки читаются как экспертные досье в едином реестре.
            </p>
          </div>
        </aside>

        <div>
          <ol role="list" className="divide-y divide-[#E2E8F0]">
            {items.map((item, index) => (
              <DossierRow key={item.id} item={item} index={index} />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
