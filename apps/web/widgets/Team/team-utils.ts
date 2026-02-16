import type { TeamMember } from "./types";

export function getInitials(fullName: string): string {
  const parts = fullName.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return fullName.substring(0, 2).toUpperCase();
}

export function splitTeamMembers(members: TeamMember[]) {
  const teamMembers = members.filter((m) => m.isTeam);

  const featured = teamMembers.filter(
    (m) =>
      m.position?.includes("Основатель") || m.position === "Руководитель НЦФГ"
  );

  const rest = teamMembers.filter(
    (m) =>
      !m.position?.includes("Основатель") && m.position !== "Руководитель НЦФГ"
  );

  return { featured, rest } as const;
}

export function pickLeadershipMembers(featured: TeamMember[]) {
  const heroMember = featured.find((m) => m.position === "Руководитель НЦФГ");
  const featuredMember = featured.find((m) =>
    m.position?.includes("Основатель")
  );

  return { heroMember, featuredMember } as const;
}

