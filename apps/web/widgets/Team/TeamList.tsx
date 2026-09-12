import { Container } from "@/shared/ui/Container";
import { Reveal } from "@/shared/ui/Reveal";
import { motionTokens } from "@/shared/lib/motion";
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
}
function DesktopBentoView({ featured, regular }: TeamListProps) {
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
  const regularGridAreas = ["[grid-area:p1]", "[grid-area:p2]", "[grid-area:p3]", "[grid-area:p4]", "[grid-area:p5]", "[grid-area:p6]", "[grid-area:p7]"];

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
          <Reveal variant="card" className="[grid-area:hero] [&>article]:h-full">
            <HeroCard member={heroMember} />
          </Reveal>
        )}
        {/* Featured Card (Leader) */}
        {featuredMember && (
          <Reveal variant="card" delay={motionTokens.stagger} className="[grid-area:lead] [&>article]:h-full">
            <FeaturedCard member={featuredMember} gridArea="lead" />
          </Reveal>
        )}
        {/* Regular Team Cards */}
        {regular.slice(0, regularGridAreas.length).map((member, index) => (
          <Reveal key={member.id} variant="card" delay={motionTokens.stagger * (index % 2)} className={`${regularGridAreas[index]} [&>article]:h-full`}>
            <TeamCard member={member} />
          </Reveal>
        ))}
        {/* Accent Card with quote/stats */}
        {hasAccentCard && totalMembers >= 8 && (
          <Reveal viewport="inset" className="[grid-area:acc] [&>div]:h-full"><AccentCard /></Reveal>
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
function MobileTeamStack({ featured, regular }: TeamListProps) {
  return (
    <div className="space-y-6">
      {/* Hero cards for leadership */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {featured.map((member) => (
          <Reveal key={member.id} variant="card" className="h-full [&>div]:h-full">
            <MobileHeroCard member={member} />
          </Reveal>
        ))}
      </div>

      {/* Horizontal scroll for team */}
      {regular.length > 0 && (
        <Reveal viewport="inset" className="-mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
            {regular.map((member) => (
              <MobileTeamCard
                key={member.id}
                member={member}
              />
            ))}
          </div>
        </Reveal>
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
