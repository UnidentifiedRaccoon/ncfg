import { Section, SignalExpertCard, type SignalExpertCardData } from "@/shared/ui";

interface Expert {
  id: string;
  fullName: string;
  photoUrl: string | null;
  position: string | null;
  headline: string | null;
  experienceYears: number | null;
  isTeam: boolean;
  isExpert: boolean;
}

interface ExpertsProps {
  title: string;
  experts: Expert[];
}

function getSubtitle(expert: Expert): string | null {
  return expert.headline ?? expert.position;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function toSignalCardData(expert: Expert): SignalExpertCardData {
  const subtitle = normalizeWhitespace(getSubtitle(expert) ?? "Финансовая экспертиза");

  return {
    fullName: expert.fullName,
    photoUrl: expert.photoUrl,
    subtitle,
    experienceYears: expert.experienceYears,
    tags: [],
  };
}

export function Experts({ title, experts }: ExpertsProps) {
  const displayExperts = experts.filter(
    (expert) => expert.isExpert && !expert.isTeam && (expert.headline || expert.position)
  );

  if (displayExperts.length === 0) return null;

  return (
    <Section id="experts" title={title}>
      <div className="relative">
        <ul
          role="list"
          className="flex gap-3 overflow-x-auto py-2 pr-2 snap-x snap-mandatory"
        >
          {displayExperts.map((expert) => (
            <li key={expert.id}>
              <SignalExpertCard
                expert={toSignalCardData(expert)}
                showSkillTags={false}
                className="min-w-[300px] snap-start hover:translate-y-0 sm:min-w-[340px]"
              />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
