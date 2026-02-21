import type { TeamShowcaseMember } from "./types";

interface TeamMembersSplit {
  teamMembers: TeamShowcaseMember[];
  leader: TeamShowcaseMember | null;
  regularMembers: TeamShowcaseMember[];
}

const LEADER_KEYWORDS = [
  { token: "руководитель", weight: 140 },
  { token: "директор", weight: 130 },
  { token: "основатель", weight: 120 },
  { token: "head", weight: 95 },
  { token: "lead", weight: 90 },
  { token: "chief", weight: 90 },
  { token: "менеджер", weight: 70 },
] as const;

function normalizeText(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function scoreText(text: string): number {
  return LEADER_KEYWORDS.reduce((acc, rule) => {
    return text.includes(rule.token) ? acc + rule.weight : acc;
  }, 0);
}

function scoreMember(member: TeamShowcaseMember, index: number): number {
  const positionScore = scoreText(normalizeText(member.position));
  const headlineScore = Math.round(scoreText(normalizeText(member.headline)) * 0.7);
  const experienceScore =
    typeof member.experienceYears === "number"
      ? Math.max(0, Math.min(member.experienceYears, 40))
      : 0;

  // Keep stable ordering when scores are equal.
  return positionScore + headlineScore + experienceScore - index / 1000;
}

export function pickTeamLeader(members: TeamShowcaseMember[]): TeamShowcaseMember {
  if (members.length === 0) {
    throw new Error("Team leader selection requires at least one team member");
  }

  let best = members[0];
  let bestScore = scoreMember(best, 0);

  for (let index = 1; index < members.length; index += 1) {
    const current = members[index];
    const currentScore = scoreMember(current, index);
    if (currentScore > bestScore) {
      best = current;
      bestScore = currentScore;
    }
  }

  return best;
}

export function splitTeamMembers(members: TeamShowcaseMember[]): TeamMembersSplit {
  const teamMembers = members.filter((member) => member.isTeam);
  if (teamMembers.length === 0) {
    return {
      teamMembers: [],
      leader: null,
      regularMembers: [],
    };
  }

  const leader = pickTeamLeader(teamMembers);
  const leaderIndex = teamMembers.findIndex((member) => member.id === leader.id);
  const regularMembers = teamMembers.filter((_, index) => index !== leaderIndex);

  return {
    teamMembers,
    leader,
    regularMembers,
  };
}

export function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return fullName.trim().slice(0, 2).toUpperCase();
}

export function getDisplayPosition(member: TeamShowcaseMember): string {
  const value = member.position?.trim();
  return value && value.length > 0 ? value : "Эксперт НЦФГ";
}

export function getMemberLead(member: TeamShowcaseMember): string | null {
  const headline = member.headline?.trim();
  if (headline && headline.length > 0) {
    return headline;
  }

  const position = member.position?.trim();
  return position && position.length > 0 ? position : null;
}
