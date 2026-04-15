import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, MapPin, Wallet } from "lucide-react";

import { cn } from "@/shared/lib/cn";

export interface VacancyCardVacancy {
  id: string;
  slug: string;
  title: string;
  lead: string | null;
  excerpt?: string | null;
  department: { slug: string; title: string } | null;
  employmentTypeLabel: string | null;
  workFormatLabel: string | null;
  location: string | null;
  salaryText: string | null;
  coverImage: string | null;
  publishedDate: string;
}

interface VacancyCardProps {
  vacancy: VacancyCardVacancy;
}

const COVER_VARIANTS = [
  "bg-gradient-to-br from-[#1E3A5F] via-[#2563EB] to-[#58A8E0]",
  "bg-gradient-to-tr from-[#0F172A] via-[#1E3A5F] to-[#38BDF8]",
  "bg-gradient-to-r from-[#1E3A5F] via-[#3B82F6] to-[#0F172A]",
  "bg-gradient-to-br from-[#1E3A5F] via-[#0F172A] to-[#2563EB]",
] as const;

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function VacancyCover({
  slug,
  title,
  coverImage,
  departmentTitle,
}: {
  slug: string;
  title: string;
  coverImage: string | null;
  departmentTitle?: string;
}) {
  const variant = COVER_VARIANTS[hashString(slug) % COVER_VARIANTS.length];

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0">
        {coverImage ? (
          <>
            <Image
              src={coverImage}
              alt={title}
              fill
              sizes="(min-width: 1024px) 280px, (min-width: 768px) 240px, 100vw"
              className="object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#58A8E0]/12 via-transparent to-[#3B82F6]/10"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5"
              aria-hidden="true"
            />
          </>
        ) : (
          <div
            className={cn(
              "absolute inset-0",
              variant,
              "before:absolute before:inset-0 before:content-[''] before:opacity-70 before:[background-image:radial-gradient(circle_at_22%_20%,rgba(255,255,255,0.24),transparent_54%),radial-gradient(circle_at_85%_72%,rgba(191,219,254,0.32),transparent_58%)]",
              "after:absolute after:inset-0 after:content-[''] after:opacity-20 after:[background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.16)_0,rgba(255,255,255,0.16)_1px,transparent_1px,transparent_14px)]"
            )}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#071223]/85 via-[#071223]/20 to-transparent" />
      </div>

      {departmentTitle ? (
        <div className="absolute left-3 top-3 z-10 max-w-[85%] truncate rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">
          {departmentTitle}
        </div>
      ) : null}

      <div className="relative z-10 flex h-full flex-col justify-end p-4 text-white md:p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
          Карьера
        </div>
        <div className="mt-2 text-lg font-semibold tracking-tight text-white/92">НЦФГ</div>
      </div>
    </div>
  );
}

function MetaPill({
  icon: Icon,
  value,
}: {
  icon: typeof BriefcaseBusiness;
  value: string;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-[#475569]">
      <Icon className="h-3.5 w-3.5 text-[#3B82F6]" />
      <span className="truncate">{value}</span>
    </span>
  );
}

export function VacancyCard({ vacancy }: VacancyCardProps) {
  const departmentTitle = vacancy.department?.title?.trim();
  const excerpt = vacancy.excerpt ?? vacancy.lead;

  return (
    <article className="group relative w-full max-w-[680px] lg:max-w-[760px]">
      <Link
        href={`/career/${vacancy.slug}`}
        className="relative block overflow-hidden rounded-xl bg-white shadow-sm transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none md:hover:scale-[1.006] [backface-visibility:hidden] transform-gpu will-change-transform"
      >
        <div className="relative z-10 flex flex-col md:flex-row">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F8FAFC] md:w-[240px] md:flex-none md:border-r md:border-[#E2E8F0]/70 lg:w-[280px]">
            <VacancyCover
              slug={vacancy.slug}
              title={vacancy.title}
              coverImage={vacancy.coverImage}
              departmentTitle={departmentTitle}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-5 md:px-6 md:py-5">
            <h3 className="text-[20px] leading-snug font-semibold text-[#1E3A5F] transition-colors group-hover:text-[#3B82F6] md:text-[22px] line-clamp-2">
              {vacancy.title}
            </h3>

            {excerpt ? (
              <p className="mt-3 text-sm leading-relaxed text-[#475569] line-clamp-4 md:text-[15px]">
                {excerpt}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {vacancy.employmentTypeLabel ? (
                <MetaPill icon={BriefcaseBusiness} value={vacancy.employmentTypeLabel} />
              ) : null}
              {vacancy.location ? <MetaPill icon={MapPin} value={vacancy.location} /> : null}
              {vacancy.salaryText ? <MetaPill icon={Wallet} value={vacancy.salaryText} /> : null}
            </div>

            <div className="mt-auto flex items-end justify-between gap-4 pt-5">
              <time className="whitespace-nowrap text-xs font-medium text-[#94A3B8]">
                {formatDate(vacancy.publishedDate)}
              </time>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[#1E3A5F] transition-colors group-hover:text-[#3B82F6]">
                Подробнее
                <ArrowRight className="h-4 w-4 text-[#94A3B8] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#3B82F6]" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
