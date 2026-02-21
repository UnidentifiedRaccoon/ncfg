export interface TeamShowcaseMember {
  id: string;
  fullName: string;
  photoUrl: string | null;
  position: string | null;
  headline: string | null;
  experienceYears: number | null;
  isTeam: boolean;
  isExpert: boolean;
}

export interface TeamShowcaseProps {
  title: string;
  lead?: string;
  members: TeamShowcaseMember[];
}

export interface TeamShowcaseVariantProps {
  members: TeamShowcaseMember[];
  leader: TeamShowcaseMember | null;
  regularMembers: TeamShowcaseMember[];
}
