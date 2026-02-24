"use client";

import { memo, useMemo } from "react";
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
  prefersReducedMotion: boolean;
}

const MemoHeroCard = memo(HeroCard);
const MemoFeaturedCard = memo(FeaturedCard);
const MemoTeamCard = memo(TeamCard);
const MemoAccentCard = memo(AccentCard);
const MemoMobileHeroCard = memo(MobileHeroCard);
const MemoMobileTeamCard = memo(MobileTeamCard);

function DesktopBentoView({ featured, regular, prefersReducedMotion }: TeamListProps) {
  const totalMembers = featured.length + regular.length;
  const hasAccentCard = totalMembers >= 4;
  const gridTemplate = useMemo(() => {
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
    return {
      areas: `
        "hero hero  lead lead"
        "p1   p2    p3   p4"
      `,
      columns: "repeat(4, 1fr)",
      rows: "auto auto",
    };
  }, [totalMembers]);

  const { heroMember, featuredMember } = pickLeadershipMembers(featured);
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
        {heroMember && (
          <MemoHeroCard
            member={heroMember}
            index={0}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}

        {featuredMember && (
          <MemoFeaturedCard
            member={featuredMember}
            index={1}
            gridArea="lead"
            prefersReducedMotion={prefersReducedMotion}
          />
        )}

        {regular.slice(0, regularGridAreas.length).map((member, index) => (
          <MemoTeamCard
            key={member.id}
            member={member}
            index={index + 2}
            gridArea={regularGridAreas[index]}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}

        {hasAccentCard && totalMembers >= 8 && (
          <MemoAccentCard
            index={regular.length + 2}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}
      </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {featured.map((member, index) => (
          <MemoMobileHeroCard
            key={member.id}
            member={member}
            index={index}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>

      {regular.length > 0 && (
        <div className="-mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
            {regular.map((member, index) => (
              <MemoMobileTeamCard
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

