import Image from "next/image";
import { Clock3, MapPin } from "lucide-react";
import {
  getDisplayPosition,
  getInitials,
  getMemberLead,
} from "../team-showcase-utils";
import type { TeamShowcaseMember, TeamShowcaseVariantProps } from "../types";

function RouteAvatar({ member }: { member: TeamShowcaseMember }) {
  return (
    <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#3B82F6] p-[1.5px]">
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white font-semibold text-[#1E3A5F]">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={member.fullName}
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm">{getInitials(member.fullName)}</span>
        )}
      </div>
    </div>
  );
}

function ExperienceBadge({ years }: { years: number | null }) {
  if (!years) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#1D4ED8]">
      <Clock3 size={12} />
      {years}+ лет
    </span>
  );
}

function StationCard({
  member,
  index,
}: {
  member: TeamShowcaseMember;
  index: number;
}) {
  const subtitle = getMemberLead(member);
  const isLeadStation = index === 0;
  const stationCode = String(index + 1).padStart(2, "0");

  return (
    <article
      className={`relative h-full overflow-hidden rounded-2xl border p-5 shadow-[0_10px_28px_rgba(15,23,42,0.07)] transition-all duration-200 hover:-translate-y-1 ${
        isLeadStation
          ? "border-[#93C5FD] bg-gradient-to-b from-[#F0F8FF] to-white"
          : "border-[#DBEAFE] bg-white"
      } xl:pt-10`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3B82F6]/10 px-2.5 py-1 text-xs font-semibold text-[#1E3A5F]">
          <MapPin size={12} />
          Станция {stationCode}
        </span>
        <ExperienceBadge years={member.experienceYears} />
      </div>

      <div className="flex items-center gap-3">
        <RouteAvatar member={member} />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-[#1E3A5F]">{member.fullName}</h3>
          <p className="line-clamp-2 text-sm text-[#475569]">{getDisplayPosition(member)}</p>
        </div>
      </div>

      {subtitle && (
        <p className="mt-4 text-sm leading-relaxed text-[#475569]">
          {subtitle}
        </p>
      )}
    </article>
  );
}

export function TeamVariantTrustRail({
  members,
  leader,
  regularMembers,
}: TeamShowcaseVariantProps) {
  const routeMembers = leader ? [leader, ...regularMembers] : members;
  if (routeMembers.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#E2E8F0]/80 bg-[linear-gradient(180deg,#FFFFFF_0%,#F7FBFF_100%)] p-4 md:p-6 lg:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(88,168,224,0.16),transparent_46%),radial-gradient(circle_at_100%_100%,rgba(59,130,246,0.12),transparent_40%)]"
      />

      <div className="relative">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">
            Narrative-маршрут
          </span>
          <span className="rounded-full border border-[#DBEAFE] bg-white px-3 py-1 text-xs font-semibold text-[#1E3A5F]">
            Точки доверия и экспертизы
          </span>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-6 top-0 w-px bg-gradient-to-b from-[#93C5FD] via-[#3B82F6]/60 to-transparent md:hidden"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-[#BFDBFE] via-[#3B82F6]/55 to-[#BFDBFE] xl:block"
          />

          <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" role="list">
            {routeMembers.map((member, index) => (
              <li key={`${member.id}-${index}`} className="relative pl-11 md:pl-0">
                <span
                  aria-hidden="true"
                  className="absolute left-6 top-8 h-3 w-3 -translate-x-1/2 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#3B82F6] ring-4 ring-[#58A8E0]/18 md:hidden"
                />
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-7 hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#3B82F6] ring-4 ring-[#58A8E0]/18 xl:block"
                />
                <StationCard member={member} index={index} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
