import Image from "next/image";
import { Section } from "@/shared/ui/Section";
import { Clock } from "lucide-react";

interface Expert {
  id: string;
  fullName: string;
  photoUrl: string | null;
  position: string | null;
  headline: string | null;
  experienceYears: number | null;
  isTeam: boolean;
  isExpert: boolean;
}

interface ExpertsProps {
  title: string;
  experts: Expert[];
}

function getInitials(fullName: string): string {
  const parts = fullName.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return fullName.substring(0, 2).toUpperCase();
}

function ExpertCard({ expert }: { expert: Expert }) {
  const hasHeadline = Boolean(expert.headline);
  const subtitle = hasHeadline ? expert.headline : expert.position;

  return (
    <article
      className="group relative h-full rounded-xl border border-[#E2E8F0]/70 bg-white/85 backdrop-blur-sm p-5 shadow-sm
                 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[#3B82F6]/25 hover:shadow-lg hover:shadow-blue-500/10
                 before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/80 before:to-transparent before:opacity-60
                 after:pointer-events-none after:absolute after:top-6 after:bottom-6 after:left-0 after:w-[2px] after:rounded-full after:bg-gradient-to-b after:from-[#58A8E0] after:via-[#3B82F6] after:to-transparent after:opacity-0 after:transition-opacity after:duration-200 group-hover:after:opacity-100"
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#1E3A5F]
                     flex items-center justify-center text-white font-bold overflow-hidden
                     ring-1 ring-white/60 shadow-sm shadow-blue-500/15"
        >
          {expert.photoUrl ? (
            <Image
              src={expert.photoUrl}
              alt={expert.fullName}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(expert.fullName)
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-[#1E3A5F] leading-snug truncate">
            {expert.fullName}
          </h3>
          {subtitle && (
            <p
              className={
                hasHeadline
                  ? "text-sm text-[#3B82F6] line-clamp-2"
                  : "text-sm text-[#475569] line-clamp-2"
              }
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {expert.experienceYears && (
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                     bg-white/60 backdrop-blur-sm border border-[#E2E8F0]/70 text-sm text-[#475569]"
        >
          <Clock size={14} className="text-[#3B82F6]" />
          {expert.experienceYears}+ лет опыта
        </span>
      )}
    </article>
  );
}

export function Experts({ title, experts }: ExpertsProps) {
  // Filter: external experts only, and keep section alive even if headline is missing.
  const displayExperts = experts.filter(
    (e) =>
      e.isExpert &&
      !e.isTeam &&
      (e.headline || e.position)
  );

  if (displayExperts.length === 0) return null;

  return (
    <Section id="experts" title={title}>
      <div className="rounded-2xl bg-gradient-to-br from-[#58A8E0]/35 via-[#3B82F6]/15 to-[#1E3A5F]/10 p-px">
        <div className="relative rounded-2xl bg-[#F8FAFC] p-4 md:p-6 overflow-hidden">
          {/* Atmosphere blob (decorative) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full opacity-90
                       bg-[radial-gradient(circle_at_40%_40%,rgba(88,168,224,0.22)_0%,transparent_60%)]"
          />

          <div className="relative">
            <ul
              role="list"
              className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4
                         overflow-x-auto pb-4 md:overflow-visible md:pb-0
                         snap-x snap-mandatory md:snap-none"
            >
              {displayExperts.map((expert) => (
                <li
                  key={expert.id}
                  className="min-w-[280px] md:min-w-0 snap-start md:snap-none"
                >
                  <ExpertCard expert={expert} />
                </li>
              ))}
            </ul>

            {/* Edge fades hint horizontal scroll on mobile */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#F8FAFC] to-transparent md:hidden" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#F8FAFC] to-transparent md:hidden" />
          </div>
        </div>
      </div>
    </Section>
  );
}
