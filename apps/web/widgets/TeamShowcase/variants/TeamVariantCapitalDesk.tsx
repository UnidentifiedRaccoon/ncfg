import Image from "next/image";
import { Clock3 } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  getDisplayPosition,
  getInitials,
  getMemberLead,
} from "../team-showcase-utils";
import type { TeamShowcaseMember, TeamShowcaseVariantProps } from "../types";

function Avatar({
  member,
  size = "md",
}: {
  member: TeamShowcaseMember;
  size?: "md" | "lg";
}) {
  const avatarSizeClass = size === "lg" ? "h-20 w-20" : "h-14 w-14";
  const imageSize = size === "lg" ? 80 : 56;
  const initialsClass = size === "lg" ? "text-xl" : "text-base";

  return (
    <div
      className={cn(
        avatarSizeClass,
        "shrink-0 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#1E3A5F] p-[1.5px]"
      )}
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white font-bold text-[#1E3A5F]">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={member.fullName}
            width={imageSize}
            height={imageSize}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className={initialsClass}>{getInitials(member.fullName)}</span>
        )}
      </div>
    </div>
  );
}

function ExperienceBadge({ years }: { years: number | null }) {
  if (!years) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0]/70 bg-white/75 px-3 py-1 text-xs font-semibold text-[#475569]">
      <Clock3 size={13} className="text-[#3B82F6]" />
      {years}+ лет опыта
    </span>
  );
}

function LeaderCard({ member }: { member: TeamShowcaseMember }) {
  const subtitle = getMemberLead(member);

  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-[#DBEAFE]/90 bg-white p-6 shadow-[0_16px_42px_rgba(30,58,95,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_56px_rgba(30,58,95,0.16)] md:p-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_5%_0%,rgba(88,168,224,0.2),transparent_48%),radial-gradient(circle_at_100%_100%,rgba(59,130,246,0.14),transparent_42%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-[#58A8E0]/85 to-transparent"
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center gap-4">
          <Avatar member={member} size="lg" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3B82F6]">
              Лидер команды
            </p>
            <h3 className="mt-1 text-2xl font-semibold leading-tight text-[#1E3A5F]">
              {member.fullName}
            </h3>
            <p className="mt-2 text-sm font-medium text-[#475569]">{getDisplayPosition(member)}</p>
          </div>
        </div>

        {subtitle && (
          <p className="mt-4 text-sm leading-relaxed text-[#475569] md:text-base">
            {subtitle}
          </p>
        )}

        <div className="mt-auto pt-6">
          <ExperienceBadge years={member.experienceYears} />
        </div>
      </div>
    </article>
  );
}

function CompactCard({ member }: { member: TeamShowcaseMember }) {
  return (
    <article className="group relative h-full overflow-hidden rounded-xl border border-[#E2E8F0]/80 bg-white/90 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#3B82F6]/30 hover:shadow-lg hover:shadow-[#3B82F6]/10">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#58A8E0]/70 to-transparent"
      />
      <div className="relative flex h-full flex-col">
        <div className="flex items-center gap-3">
          <Avatar member={member} />
          <div className="min-w-0">
            <h4 className="truncate text-base font-semibold text-[#1E3A5F]">{member.fullName}</h4>
            <p className="line-clamp-2 text-sm text-[#475569]">{getDisplayPosition(member)}</p>
          </div>
        </div>

        <div className="mt-4">
          <ExperienceBadge years={member.experienceYears} />
        </div>
      </div>
    </article>
  );
}

export function TeamVariantCapitalDesk({
  leader,
  regularMembers,
}: TeamShowcaseVariantProps) {
  if (!leader) return null;

  return (
    <div className="rounded-[28px] bg-gradient-to-br from-[#58A8E0]/35 via-[#3B82F6]/15 to-[#1E3A5F]/12 p-px">
      <div className="relative overflow-hidden rounded-[28px] bg-[#F8FAFC] p-4 md:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,rgba(30,58,95,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,58,95,0.2)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(88,168,224,0.22)_0%,transparent_62%)]" />
        </div>

        <div className="relative">
          <ul
            role="list"
            aria-label="Capital Desk — мобильная раскладка"
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:hidden"
          >
            <li className="min-w-[320px] snap-start">
              <LeaderCard member={leader} />
            </li>
            {regularMembers.map((member) => (
              <li key={member.id} className="min-w-[280px] snap-start">
                <CompactCard member={member} />
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            {regularMembers.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-5">
                <LeaderCard member={leader} />
                <ul role="list" className="grid auto-rows-fr gap-4 sm:grid-cols-2">
                  {regularMembers.map((member) => (
                    <li key={member.id}>
                      <CompactCard member={member} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl">
                <LeaderCard member={leader} />
              </div>
            )}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#F8FAFC] to-transparent md:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#F8FAFC] to-transparent md:hidden" />
        </div>
      </div>
    </div>
  );
}
