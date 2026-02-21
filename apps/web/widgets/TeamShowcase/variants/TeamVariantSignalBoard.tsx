import Image from "next/image";
import { Activity, Clock3, Users } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  getDisplayPosition,
  getInitials,
  getMemberLead,
} from "../team-showcase-utils";
import type { TeamShowcaseMember, TeamShowcaseVariantProps } from "../types";

function DarkAvatar({
  member,
  size = "md",
}: {
  member: TeamShowcaseMember;
  size?: "md" | "lg";
}) {
  const avatarSizeClass = size === "lg" ? "h-[72px] w-[72px]" : "h-12 w-12";
  const imageSize = size === "lg" ? 72 : 48;
  const initialsClass = size === "lg" ? "text-lg" : "text-sm";

  return (
    <div
      className={cn(
        avatarSizeClass,
        "shrink-0 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#2563EB] p-[1.5px]"
      )}
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#0B1424] font-semibold text-[#D9EEFF]">
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

function ExperienceChip({ years }: { years: number | null }) {
  if (!years) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-xs font-semibold text-[#D9EEFF]">
      <Clock3 size={12} className="text-[#58A8E0]" />
      {years}+ лет
    </span>
  );
}

function LeaderCard({ leader }: { leader: TeamShowcaseMember }) {
  const subtitle = getMemberLead(leader);

  return (
    <article className="relative h-full overflow-hidden rounded-3xl border border-white/15 bg-[#102742]/88 p-6 shadow-[0_20px_48px_rgba(5,11,22,0.55)] backdrop-blur-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(88,168,224,0.22),transparent_45%),radial-gradient(circle_at_100%_100%,rgba(59,130,246,0.16),transparent_38%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-[#58A8E0] via-[#3B82F6] to-transparent"
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center gap-4">
          <DarkAvatar member={leader} size="lg" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9AD8FF]">
              Лидер команды
            </p>
            <h3 className="mt-1 text-2xl font-semibold leading-tight text-white">
              {leader.fullName}
            </h3>
            <p className="mt-2 text-sm text-[#D5E6F8]">{getDisplayPosition(leader)}</p>
          </div>
        </div>

        {subtitle && (
          <p className="mt-4 text-sm leading-relaxed text-[#D5E6F8] md:text-base">
            {subtitle}
          </p>
        )}

        <div className="mt-auto pt-6">
          <ExperienceChip years={leader.experienceYears} />
        </div>
      </div>
    </article>
  );
}

function CompactCard({ member, index }: { member: TeamShowcaseMember; index: number }) {
  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-white/12 bg-[#122A46]/90 p-4 transition-colors duration-200 hover:border-[#58A8E0]/55">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#58A8E0]/75 to-transparent"
      />
      <div className="relative">
        <div className="mb-3 flex items-start justify-between gap-3">
          <DarkAvatar member={member} />
          <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs font-semibold text-[#9AD8FF]">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <h4 className="text-base font-semibold leading-snug text-white">{member.fullName}</h4>
        <p className="mt-1 line-clamp-2 text-sm text-[#D5E6F8]">{getDisplayPosition(member)}</p>
        <div className="mt-3">
          <ExperienceChip years={member.experienceYears} />
        </div>
      </div>
    </article>
  );
}

export function TeamVariantSignalBoard({
  members,
  leader,
  regularMembers,
}: TeamShowcaseVariantProps) {
  if (!leader) return null;

  const experienceValues = members
    .map((member) => member.experienceYears)
    .filter((value): value is number => typeof value === "number" && value > 0);
  const averageExperience =
    experienceValues.length > 0
      ? (experienceValues.reduce((sum, value) => sum + value, 0) / experienceValues.length).toFixed(1)
      : null;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#1E3A5F]/30 bg-[#0A1527] p-4 md:p-6 lg:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_6%_0%,rgba(88,168,224,0.24),transparent_36%),radial-gradient(circle_at_100%_70%,rgba(59,130,246,0.22),transparent_42%),linear-gradient(125deg,rgba(255,255,255,0.04)_0%,transparent_32%,rgba(88,168,224,0.1)_100%)]"
      />

      <div className="relative">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-[#D9EEFF]">
            Финтех-панель
          </span>
          <span className="rounded-full border border-[#58A8E0]/35 bg-[#58A8E0]/15 px-3 py-1 text-xs font-semibold text-[#D9EEFF]">
            {members.length} участника команды
          </span>
        </div>

        {regularMembers.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <LeaderCard leader={leader} />
            </div>

            <div className="space-y-4 lg:col-span-7">
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="list">
                {regularMembers.map((member, index) => (
                  <li key={member.id}>
                    <CompactCard member={member} index={index} />
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <article className="rounded-xl border border-white/12 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#9AD8FF]">
                    <Users size={14} />
                    Размер команды
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">{members.length}</p>
                </article>
                <article className="rounded-xl border border-white/12 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#9AD8FF]">
                    <Activity size={14} />
                    Средний опыт
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {averageExperience ? `${averageExperience} лет` : "Н/Д"}
                  </p>
                </article>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
            <LeaderCard leader={leader} />
            <article className="rounded-2xl border border-white/12 bg-white/[0.04] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9AD8FF]">
                Сводка
              </p>
              <p className="mt-3 text-base leading-relaxed text-[#D5E6F8]">
                В составе команды пока один представитель. Карточка лидера выступает центральной точкой сценария.
              </p>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
