"use client";

import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Container } from "@/shared/ui/Container";
import { cn } from "@/shared/lib/cn";

interface TeamMember {
  id: string;
  fullName: string;
  photoUrl: string | null;
  position: string | null;
  headline: string | null;
  experienceYears: number | null;
  isTeam: boolean;
  isExpert: boolean;
}

interface TeamProps {
  title: string;
  members: TeamMember[];
}

function getInitials(fullName: string): string {
  const parts = fullName.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return fullName.substring(0, 2).toUpperCase();
}

// Hero Card (2x2) - for Founder
function HeroCard({
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
        "relative p-6 rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-blue-50 to-blue-100",
        "border border-blue-100",
        "group",
        "transition-shadow duration-300",
        "hover:shadow-xl",
        "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
      )}
      style={{ gridArea: "hero" }}
      initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.4, delay: index * 0.05, ease: "easeOut" }
      }
      whileHover={prefersReducedMotion ? {} : { y: -4 }}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 h-full flex flex-col">
        {/* Avatar */}
        <motion.div
          className={cn(
            "w-24 h-24 rounded-full overflow-hidden",
            "bg-gradient-to-br from-blue-500 to-[#1E3A5F]",
            "flex items-center justify-center",
            "shadow-lg shadow-blue-500/25",
            "transition-transform duration-300"
          )}
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
        >
          {member.photoUrl ? (
            <Image
              src={member.photoUrl}
              alt={member.fullName}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold text-white">
              {getInitials(member.fullName)}
            </span>
          )}
        </motion.div>

        {/* Info */}
        <h3 className="mt-4 text-xl font-bold text-[#1E3A5F]">
          {member.fullName}
        </h3>
        <p className="text-blue-600 font-medium">
          {member.position}
        </p>
        {member.headline && (
          <p className="mt-2 text-slate-500 text-sm line-clamp-2">
            {member.headline}
          </p>
        )}

        {/* Experience badge */}
        {member.experienceYears && (
          <div className="mt-auto pt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium">
              {member.experienceYears}+ лет опыта
            </span>
          </div>
        )}
      </div>
    </motion.article>
  );
}

// Featured Card (2x1) - for Leader
function FeaturedCard({
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
        "border-2 border-blue-200",
        "group",
        "transition-all duration-300",
        "hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10",
        "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
      )}
      style={{ gridArea }}
      initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.4, delay: index * 0.05, ease: "easeOut" }
      }
      whileHover={prefersReducedMotion ? {} : { y: -4 }}
    >
      {/* Accent gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"
        aria-hidden="true"
      />

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <motion.div
          className={cn(
            "flex-shrink-0 w-16 h-16 rounded-full overflow-hidden",
            "bg-gradient-to-br from-[#58A8E0] to-[#1E3A5F]",
            "flex items-center justify-center",
            "shadow-md shadow-blue-500/20",
            "transition-transform duration-300"
          )}
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
        >
          {member.photoUrl ? (
            <Image
              src={member.photoUrl}
              alt={member.fullName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-white">
              {getInitials(member.fullName)}
            </span>
          )}
        </motion.div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#1E3A5F] text-lg">
            {member.fullName}
          </h3>
          <p className="text-blue-600 text-sm font-medium">
            {member.position}
          </p>
          {member.experienceYears && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium">
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
function TeamCard({
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
        "bg-slate-50",
        "border border-slate-200",
        "group",
        "transition-all duration-300",
        "hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300",
        "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
      )}
      style={gridArea ? { gridArea } : undefined}
      initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.4, delay: index * 0.05, ease: "easeOut" }
      }
      whileHover={prefersReducedMotion ? {} : { y: -4 }}
    >
      <div className="relative z-10">
        {/* Avatar */}
        <motion.div
          className={cn(
            "w-14 h-14 rounded-full overflow-hidden",
            "bg-gradient-to-br from-[#58A8E0] to-[#3B82F6]",
            "flex items-center justify-center",
            "shadow-md shadow-blue-500/15",
            "transition-transform duration-300"
          )}
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
        >
          {member.photoUrl ? (
            <Image
              src={member.photoUrl}
              alt={member.fullName}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-bold text-white">
              {getInitials(member.fullName)}
            </span>
          )}
        </motion.div>

        {/* Info */}
        <h4 className="mt-3 font-semibold text-[#1E3A5F]">
          {member.fullName}
        </h4>
        <p className="text-slate-500 text-sm line-clamp-2">
          {member.position}
        </p>

        {/* Experience badge - always visible */}
        {member.experienceYears && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium">
              {member.experienceYears}+ лет опыта
            </span>
          </div>
        )}
      </div>
    </motion.article>
  );
}

// Accent Card - for quote or stats
function AccentCard({
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
      initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.4, delay: index * 0.05, ease: "easeOut" }
      }
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, white 0%, transparent 50%),
                           radial-gradient(circle at 80% 50%, white 0%, transparent 50%)`,
        }}
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

// Desktop Bento Grid view
function DesktopBentoView({
  featured,
  regular,
  prefersReducedMotion,
}: {
  featured: TeamMember[];
  regular: TeamMember[];
  prefersReducedMotion: boolean | null;
}) {
  // Determine grid layout based on team size
  const totalMembers = featured.length + regular.length;
  const hasAccentCard = totalMembers >= 4;

  // Grid areas based on member count
  const getGridTemplate = () => {
    if (totalMembers >= 8) {
      return {
        areas: `
          "hero hero  p3   p4"
          "hero hero  lead p5"
          "p1   p2    lead p6"
          "acc  acc   acc  p7"
        `,
        columns: "repeat(4, 1fr)",
        rows: "auto auto auto auto",
      };
    }
    if (totalMembers >= 6) {
      return {
        areas: `
          "hero hero  lead lead"
          "hero hero  p3   p4"
          "p1   p2    p5   p6"
        `,
        columns: "repeat(4, 1fr)",
        rows: "auto auto auto",
      };
    }
    // Small team
    return {
      areas: `
        "hero hero  lead lead"
        "p1   p2    p3   p4"
      `,
      columns: "repeat(4, 1fr)",
      rows: "auto auto",
    };
  };

  const gridTemplate = getGridTemplate();

  // Get hero member (Руководитель НЦФГ - Евгения Блискавка)
  const heroMember = featured.find((m) => m.position === "Руководитель НЦФГ");
  // Get featured member (Основатель - Анна Деньгина)
  const featuredMember = featured.find((m) => m.position?.includes("Основатель"));

  // Map regular members to grid areas
  const regularGridAreas = ["p1", "p2", "p3", "p4", "p5", "p6", "p7"];

  return (
    <Container>
      <div
        className="grid gap-4"
        style={{
          gridTemplateAreas: gridTemplate.areas,
          gridTemplateColumns: gridTemplate.columns,
          gridTemplateRows: gridTemplate.rows,
        }}
      >
        {/* Hero Card (Founder) */}
        {heroMember && (
          <HeroCard
            member={heroMember}
            index={0}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}

        {/* Featured Card (Leader) */}
        {featuredMember && (
          <FeaturedCard
            member={featuredMember}
            index={1}
            gridArea="lead"
            prefersReducedMotion={prefersReducedMotion}
          />
        )}

        {/* Regular Team Cards */}
        {regular.slice(0, regularGridAreas.length).map((member, index) => (
          <TeamCard
            key={member.id}
            member={member}
            index={index + 2}
            gridArea={regularGridAreas[index]}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}

        {/* Accent Card with quote/stats */}
        {hasAccentCard && totalMembers >= 8 && (
          <AccentCard
            index={regular.length + 2}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}
      </div>

      {/* Accessible list for screen readers */}
      <ul className="sr-only" aria-label="Наша команда">
        {[...(heroMember ? [heroMember] : []), ...(featuredMember ? [featuredMember] : []), ...regular].map((member) => (
          <li key={member.id}>
            <strong>{member.fullName}</strong>: {member.position}
            {member.experienceYears && (
              <>, {member.experienceYears}+ лет опыта</>
            )}
          </li>
        ))}
      </ul>
    </Container>
  );
}

// Mobile hero card for leadership
function MobileHeroCard({
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
      className="relative overflow-hidden rounded-xl p-6 text-center"
      style={{
        background: "linear-gradient(135deg, #1E3A5F 0%, #3B82F6 50%, #1E3A5F 100%)",
      }}
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.4, delay: index * 0.1 }
      }
    >
      {/* Glow border effect */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: "linear-gradient(135deg, rgba(88, 168, 224, 0.3) 0%, transparent 50%, rgba(59, 130, 246, 0.3) 100%)",
          padding: "1px",
        }}
      />

      {/* Inner content */}
      <div className="relative z-10">
        {/* Avatar */}
        <div
          className="w-20 h-20 mx-auto rounded-full overflow-hidden
                     bg-gradient-to-br from-white/20 to-white/5
                     border-2 border-white/30
                     flex items-center justify-center
                     shadow-lg shadow-black/20"
        >
          {member.photoUrl ? (
            <Image
              src={member.photoUrl}
              alt={member.fullName}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-white">
              {getInitials(member.fullName)}
            </span>
          )}
        </div>

        {/* Info */}
        <h3 className="mt-4 text-xl font-bold text-white">
          {member.fullName}
        </h3>
        <p className="mt-1 text-white/80">
          {member.position}
        </p>
        {member.experienceYears && (
          <p className="mt-2 text-sm text-white/60">
            {member.experienceYears}+ лет опыта
          </p>
        )}
      </div>
    </motion.div>
  );
}

// Mobile team card (compact)
function MobileTeamCard({
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
      initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.3, delay: index * 0.05 }
      }
    >
      <div
        className="relative overflow-hidden rounded-xl p-4 text-center h-full"
        style={{
          background: "linear-gradient(180deg, #1E3A5F 0%, #0F172A 100%)",
        }}
      >
        {/* Subtle glow */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(circle at 50% 0%, #58A8E0 0%, transparent 60%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div
            className="w-14 h-14 mx-auto rounded-full overflow-hidden
                       bg-gradient-to-br from-[#58A8E0] to-[#3B82F6]
                       flex items-center justify-center
                       shadow-lg shadow-[#3B82F6]/30"
          >
            {member.photoUrl ? (
              <Image
                src={member.photoUrl}
                alt={member.fullName}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-white">
                {getInitials(member.fullName)}
              </span>
            )}
          </div>

          <h4 className="mt-3 font-semibold text-white text-sm line-clamp-2">
            {member.fullName}
          </h4>
          <p className="mt-1 text-white/60 text-xs line-clamp-2">
            {member.position}
          </p>
          {member.experienceYears && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/10 text-white/80 text-xs font-medium">
                {member.experienceYears}+ лет
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Mobile Team Stack
function MobileTeamStack({
  featured,
  regular,
  prefersReducedMotion,
}: {
  featured: TeamMember[];
  regular: TeamMember[];
  prefersReducedMotion: boolean | null;
}) {
  return (
    <div className="space-y-6">
      {/* Hero cards for leadership */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {featured.map((member, index) => (
          <MobileHeroCard
            key={member.id}
            member={member}
            index={index}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>

      {/* Horizontal scroll for team */}
      {regular.length > 0 && (
        <div className="-mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
            {regular.map((member, index) => (
              <MobileTeamCard
                key={member.id}
                member={member}
                index={index}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Team({ title, members }: TeamProps) {
  const prefersReducedMotion = useReducedMotion();
  const teamMembers = members.filter((m) => m.isTeam);

  // Featured: Основатель and Руководитель НЦФГ
  const featured = teamMembers.filter(
    (m) =>
      m.position?.includes("Основатель") ||
      m.position === "Руководитель НЦФГ"
  );

  // Rest of the team
  const rest = teamMembers.filter(
    (m) =>
      !m.position?.includes("Основатель") &&
      m.position !== "Руководитель НЦФГ"
  );

  return (
    <section id="team" className="py-12 md:py-16">
      {/* Section header - same style as other sections */}
      <Container>
        <div className="mb-10 md:mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-[28px] md:text-4xl lg:text-[48px] font-bold text-[#1E3A5F] leading-tight tracking-tight">
            {title}
          </h2>
        </div>
      </Container>

      {/* Desktop: Bento Grid */}
      <div className="hidden md:block">
        <DesktopBentoView
          featured={featured}
          regular={rest}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>

      {/* Mobile: Card stack */}
      <Container className="md:hidden">
        <MobileTeamStack
          featured={featured}
          regular={rest}
          prefersReducedMotion={prefersReducedMotion}
        />
      </Container>
    </section>
  );
}
