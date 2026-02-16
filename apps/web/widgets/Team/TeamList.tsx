"use client";

import { Container } from "@/shared/ui/Container";
import type { TeamMember } from "./types";
import { pickLeadershipMembers } from "./team-utils";
import {
  AccentCard,
  FeaturedCard,
  HeroCard,
  MobileHeroCard,
  MobileTeamCard,
  TeamCard,
} from "./TeamItem";

interface TeamListProps {
  featured: TeamMember[];
  regular: TeamMember[];
  prefersReducedMotion: boolean | null;
}

function DesktopBentoView({ featured, regular, prefersReducedMotion }: TeamListProps) {
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
  const { heroMember, featuredMember } = pickLeadershipMembers(featured);

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
        {[
          ...(heroMember ? [heroMember] : []),
          ...(featuredMember ? [featuredMember] : []),
          ...regular,
        ].map((member) => (
          <li key={member.id}>
            <strong>{member.fullName}</strong>: {member.position}
            {member.experienceYears && <>, {member.experienceYears}+ лет опыта</>}
          </li>
        ))}
      </ul>
    </Container>
  );
}

function MobileTeamStack({ featured, regular, prefersReducedMotion }: TeamListProps) {
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

export function TeamList(props: TeamListProps) {
  return (
    <>
      <div className="hidden md:block">
        <DesktopBentoView {...props} />
      </div>

      <Container className="md:hidden">
        <MobileTeamStack {...props} />
      </Container>
    </>
  );
}

