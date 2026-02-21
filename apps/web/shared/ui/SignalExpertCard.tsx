import Image from "next/image";
import { cn } from "@/shared/lib/cn";

export interface SignalExpertCardData {
  fullName: string;
  photoUrl: string | null;
  subtitle: string;
  experienceYears: number | null;
  tags: string[];
}

interface SignalExpertCardProps {
  expert: SignalExpertCardData;
  featured?: boolean;
  className?: string;
  headingLevel?: "h3" | "h4";
  showSkillTags?: boolean;
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return fullName.slice(0, 2).toUpperCase();
}

export function SignalExpertCard({
  expert,
  featured = false,
  className,
  headingLevel = "h3",
  showSkillTags = true,
}: SignalExpertCardProps) {
  const avatarSize = featured ? 64 : 56;
  const HeadingTag = headingLevel;
  const visibleTags = showSkillTags ? expert.tags.slice(0, featured ? 3 : 2) : [];
  const hasSkillRow = visibleTags.length > 0;
  const hasExperienceRow = Boolean(expert.experienceYears);

  return (
    <article
      className={cn(
        "group h-full overflow-hidden rounded-xl border border-[#E2E8F0]/80 bg-white p-4 shadow-sm",
        "flex flex-col",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3B82F6]/25 hover:shadow-md",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <div
          className={cn(
            "shrink-0 rounded-full bg-gradient-to-br from-[#58A8E0] to-[#1E3A5F] p-[1px]",
            featured ? "h-16 w-16" : "h-14 w-14"
          )}
        >
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white font-bold text-[#1E3A5F]">
            {expert.photoUrl ? (
              <Image
                src={expert.photoUrl}
                alt={expert.fullName}
                width={avatarSize}
                height={avatarSize}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(expert.fullName)
            )}
          </div>
        </div>

        <div className="min-w-0">
          <HeadingTag
            className={cn(
              "truncate font-semibold text-[#1E3A5F]",
              featured ? "text-base md:text-lg" : "text-sm md:text-base"
            )}
          >
            {expert.fullName}
          </HeadingTag>
          <p className="line-clamp-2 text-sm text-[#475569]">{expert.subtitle}</p>
        </div>
      </div>

      {(hasSkillRow || hasExperienceRow) && (
        <div className="mt-2 space-y-2 overflow-hidden">
          {hasSkillRow && (
            <div className="flex flex-nowrap items-center gap-2 overflow-hidden whitespace-nowrap">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="max-w-[190px] shrink-0 truncate rounded-full border border-[#E2E8F0]/80 bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-[#475569]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {hasExperienceRow && (
            <div className="overflow-hidden">
              <span
                className="inline-flex items-center whitespace-nowrap rounded-full bg-[#3B82F6]/10 px-2 py-0.5 text-xs font-semibold text-[#3B82F6]"
              >
                {expert.experienceYears}+ лет опыта
              </span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
