"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/shared/lib/cn";
import { getInitials } from "./team-utils";
import type { TeamMember } from "./types";

// Hero Card (2x2) - for Founder
export function HeroCard({
  member,
  index,
  prefersReducedMotion,
}: {
  member: TeamMember;
  index: number;
  prefersReducedMotion: boolean | null;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.article
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[#E2E8F0] p-6",
        "bg-[linear-gradient(135deg,#FFFFFF_0%,#F8FAFC_55%,#FFFFFF_100%)]",
        "shadow-sm transition-all duration-200",
        "hover:border-[#3B82F6]/35 hover:shadow-md",
        "focus-within:ring-2 focus-within:ring-[#3B82F6] focus-within:ring-offset-2"
      )}
      style={{ gridArea: "hero" }}
      initial={
        prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
      }
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.4, delay: index * 0.05, ease: "easeOut" }
      }
      whileHover={prefersReducedMotion ? {} : { y: -2 }}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_80%_20%,rgba(88,168,224,0.18)_0%,transparent_55%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 h-full flex flex-col">
        {/* Avatar */}
        <motion.div
          className={cn(
            "h-24 w-24 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#3B82F6] p-[2px]",
            "shadow-sm shadow-black/5",
            "transition-transform duration-200"
          )}
          whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
        >
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
            {member.photoUrl ? (
              <Image
                src={member.photoUrl}
                alt={member.fullName}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-[#1E3A5F]">
                {getInitials(member.fullName)}
              </span>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <h3 className="mt-4 text-xl font-bold text-[#1E3A5F]">
          {member.fullName}
        </h3>
        <p className="font-medium text-[#475569]">{member.position}</p>
        {member.headline && (
          <p className="mt-2 text-sm text-[#475569] line-clamp-2">
            {member.headline}
          </p>
        )}

        {/* Experience badge */}
        {member.experienceYears && (
          <div className="mt-auto pt-4">
            <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-3 py-1 text-sm font-semibold text-[#3B82F6]">
              {member.experienceYears}+ лет опыта
            </span>
          </div>
        )}
      </div>
    </motion.article>
  );
}

// Featured Card (2x1) - for Leader
export function FeaturedCard({
  member,
  index,
  gridArea,
  prefersReducedMotion,
}: {
  member: TeamMember;
  index: number;
  gridArea: string;
  prefersReducedMotion: boolean | null;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.article
      ref={ref}
      className={cn(
        "relative p-5 rounded-xl overflow-hidden",
        "bg-white",
        "border border-[#E2E8F0] shadow-sm",
        "group",
        "transition-all duration-300",
        "hover:border-[#3B82F6]/35 hover:shadow-md",
        "focus-within:ring-2 focus-within:ring-[#3B82F6] focus-within:ring-offset-2"
      )}
      style={{ gridArea }}
      initial={
        prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
      }
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.4, delay: index * 0.05, ease: "easeOut" }
      }
      whileHover={prefersReducedMotion ? {} : { y: -2 }}
    >
      {/* Accent gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#58A8E0] to-[#3B82F6]"
        aria-hidden="true"
      />

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <motion.div
          className={cn(
            "flex-shrink-0 h-16 w-16 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#3B82F6] p-[2px]",
            "shadow-sm shadow-black/5",
            "transition-transform duration-200"
          )}
          whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
        >
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
            {member.photoUrl ? (
              <Image
                src={member.photoUrl}
                alt={member.fullName}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-[#1E3A5F]">
                {getInitials(member.fullName)}
              </span>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#1E3A5F] text-lg">
            {member.fullName}
          </h3>
          <p className="text-sm font-medium text-[#475569]">{member.position}</p>
          {member.experienceYears && (
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-2 py-0.5 text-xs font-semibold text-[#3B82F6]">
                {member.experienceYears}+ лет опыта
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// Team Card (1x1) - for regular members
export function TeamCard({
  member,
  index,
  gridArea,
  prefersReducedMotion,
}: {
  member: TeamMember;
  index: number;
  gridArea?: string;
  prefersReducedMotion: boolean | null;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.article
      ref={ref}
      className={cn(
        "relative p-4 rounded-xl overflow-hidden",
        "bg-[#F8FAFC] border border-[#E2E8F0] shadow-sm",
        "group",
        "transition-all duration-300",
        "hover:bg-white hover:shadow-md hover:border-[#3B82F6]/25",
        "focus-within:ring-2 focus-within:ring-[#3B82F6] focus-within:ring-offset-2"
      )}
      style={gridArea ? { gridArea } : undefined}
      initial={
        prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
      }
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.4, delay: index * 0.05, ease: "easeOut" }
      }
      whileHover={prefersReducedMotion ? {} : { y: -2 }}
    >
      <div className="relative z-10">
        {/* Avatar */}
        <motion.div
          className={cn(
            "h-14 w-14 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#3B82F6] p-px",
            "shadow-sm shadow-black/5",
            "transition-transform duration-200"
          )}
          whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
        >
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
            {member.photoUrl ? (
              <Image
                src={member.photoUrl}
                alt={member.fullName}
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-base font-bold text-[#1E3A5F]">
                {getInitials(member.fullName)}
              </span>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <h4 className="mt-3 font-semibold text-[#1E3A5F]">
          {member.fullName}
        </h4>
        <p className="text-sm text-[#475569] line-clamp-2">{member.position}</p>

        {/* Experience badge - always visible */}
        {member.experienceYears && (
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-2 py-0.5 text-xs font-semibold text-[#3B82F6]">
              {member.experienceYears}+ лет опыта
            </span>
          </div>
        )}
      </div>
    </motion.article>
  );
}

// Accent Card - for quote or stats
export function AccentCard({
  index,
  prefersReducedMotion,
}: {
  index: number;
  prefersReducedMotion: boolean | null;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative p-6 rounded-xl overflow-hidden",
        "bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6]",
        "text-white"
      )}
      style={{ gridArea: "acc" }}
      initial={
        prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
      }
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.4, delay: index * 0.05, ease: "easeOut" }
      }
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.55)_0%,transparent_55%),radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.55)_0%,transparent_55%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center justify-center h-full">
        <blockquote className="text-lg md:text-xl font-medium italic text-white/90 text-center max-w-2xl">
          &ldquo;Объединяя экспертизу и современные технологии для решения сложных финансовых задач&rdquo;
        </blockquote>
      </div>
    </motion.div>
  );
}

// Mobile hero card for leadership
export function MobileHeroCard({
  member,
  index,
  prefersReducedMotion,
}: {
  member: TeamMember;
  index: number;
  prefersReducedMotion: boolean | null;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className="relative overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-6 text-center shadow-sm"
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={
        prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay: index * 0.1 }
      }
    >
      <div
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#58A8E0] to-[#3B82F6]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#58A8E0]/18 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[#3B82F6]/12 blur-3xl"
        aria-hidden="true"
      />

      {/* Inner content */}
      <div className="relative z-10">
        {/* Avatar */}
        <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#3B82F6] p-[2px] shadow-sm shadow-black/5">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
            {member.photoUrl ? (
              <Image
                src={member.photoUrl}
                alt={member.fullName}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-[#1E3A5F]">
                {getInitials(member.fullName)}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <h3 className="mt-4 text-xl font-semibold text-[#1E3A5F]">
          {member.fullName}
        </h3>
        <p className="mt-1 text-sm font-medium text-[#475569]">{member.position}</p>
        {member.experienceYears && (
          <div className="mt-3 flex justify-center">
            <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-3 py-1 text-xs font-semibold text-[#3B82F6]">
              {member.experienceYears}+ лет опыта
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Mobile team card (compact)
export function MobileTeamCard({
  member,
  index,
  prefersReducedMotion,
}: {
  member: TeamMember;
  index: number;
  prefersReducedMotion: boolean | null;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className="flex-shrink-0 w-[160px] snap-center"
      initial={
        prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }
      }
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.3, delay: index * 0.05 }
      }
    >
      <div
        className="relative h-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-4 text-center shadow-sm"
      >
        {/* Subtle glow */}
        <div
          className="absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_50%_0%,rgba(88,168,224,0.18)_0%,transparent_65%)]"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#3B82F6] p-px shadow-sm shadow-black/5">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
              {member.photoUrl ? (
                <Image
                  src={member.photoUrl}
                  alt={member.fullName}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-base font-bold text-[#1E3A5F]">
                  {getInitials(member.fullName)}
                </span>
              )}
            </div>
          </div>

          <h4 className="mt-3 text-sm font-semibold text-[#1E3A5F] line-clamp-2">
            {member.fullName}
          </h4>
          <p className="mt-1 text-xs text-[#475569] line-clamp-2">{member.position}</p>
          {member.experienceYears && (
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-[#3B82F6]/10 px-2 py-0.5 text-xs font-semibold text-[#3B82F6]">
                {member.experienceYears}+ лет
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
