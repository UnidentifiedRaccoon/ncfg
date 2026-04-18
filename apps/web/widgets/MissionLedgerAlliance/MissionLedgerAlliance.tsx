import {
  BrainCircuit,
  GraduationCap,
  HandHeart,
  Repeat2,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Section } from "@/shared/ui/Section";

type DirectionTone = "psychology" | "children" | "support" | "habits";
type HeadingTag = "h2" | "h3";

interface DirectionItem {
  id: DirectionTone;
  title: string;
  icon: LucideIcon;
}

interface MissionLedgerAllianceProps {
  embedded?: boolean;
  headingAs?: HeadingTag;
}

const directions: DirectionItem[] = [
  {
    id: "psychology",
    title: "внедрение методик финансовой психологии и работы с установками",
    icon: BrainCircuit,
  },
  {
    id: "children",
    title: "качественное финансовое и экономическое развитие детей",
    icon: GraduationCap,
  },
  {
    id: "support",
    title: "создание поддерживающей среды для взрослых",
    icon: HandHeart,
  },
  {
    id: "habits",
    title: "внедрение здоровых финансовых привычек",
    icon: Repeat2,
  },
];

const introText =
  "Решаем комплексные задачи в области финансового благополучия";

function MissionLedgerAlliancePanel({ headingAs = "h2" }: { headingAs?: HeadingTag }) {
  const Heading = headingAs;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr] xl:items-stretch">
      <div className="flex h-full items-center justify-center rounded-[28px] border border-[#E2E8F0] bg-[#FAFCFF] p-6 text-center md:p-8">
        <Heading className="max-w-md text-[20px] font-semibold leading-[1.24] tracking-tight text-[#1E3A5F] md:text-[26px]">
          {introText}
        </Heading>
      </div>

      <ol className="grid h-full overflow-hidden rounded-[28px] border border-[#E2E8F0] bg-white">
        {directions.map((direction, index) => {
          const Icon = direction.icon;

          return (
            <li
              key={direction.id}
              className={cn(
                "flex flex-1 items-start gap-4 px-5 py-5 md:px-6",
                index > 0 && "border-t border-[#E2E8F0]"
              )}
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF4FF] text-[#1D4ED8]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 pt-1">
                <p className="text-base leading-relaxed text-[#1E3A5F] md:text-lg">
                  {direction.title}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function MissionLedgerAlliance({
  embedded = false,
  headingAs = "h2",
}: MissionLedgerAllianceProps) {
  if (embedded) {
    return <MissionLedgerAlliancePanel headingAs={headingAs} />;
  }

  return (
    <Section id="mission" className="pt-8 pb-2 md:pt-10 md:pb-4 lg:pb-6">
      <MissionLedgerAlliancePanel headingAs={headingAs} />
    </Section>
  );
}
