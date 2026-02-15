import { Section } from "@/shared/ui/Section";
import { BookOpen, FlaskConical, Users, Award, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Principle {
  id: string;
  order: number;
  title: string;
  description: string;
}

interface PrinciplesProps {
  title: string;
  lead?: string;
  principles: Principle[];
}

const iconMap: Record<string, LucideIcon> = {
  methodology: BookOpen,
  scientific_approach: FlaskConical,
  individual_approach: Users,
  experience: Award,
  team: Heart,
};

function getBentoSpan(index: number) {
  if (index === 0) return "lg:col-span-7";
  if (index === 1) return "lg:col-span-5";
  return "lg:col-span-4";
}

export function Principles({ title, lead, principles }: PrinciplesProps) {
  const sortedPrinciples = [...principles].sort((a, b) => a.order - b.order);
  const leadNode = lead ? (
    <span className="text-xl md:text-2xl">{lead}</span>
  ) : undefined;

  return (
    <Section id="principles" title={title} lead={leadNode} background="gray">
      <div className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white px-5 py-6 md:px-8 md:py-8">
        {/* Ambient gradients */}
        <div
          className="pointer-events-none absolute -top-40 -right-28 h-[420px] w-[420px] rounded-full bg-[#58A8E0]/25 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-44 -left-32 h-[520px] w-[520px] rounded-full bg-[#3B82F6]/18 blur-3xl"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative">
          <ul
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12"
            aria-label="Наши принципы"
          >
            {sortedPrinciples.map((principle, index) => {
              const Icon = iconMap[principle.id] ?? BookOpen;
              const span = getBentoSpan(index);

              return (
                <li key={principle.id} className={span}>
                  <article className="group relative h-full overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white/70 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#3B82F6]/40 hover:shadow-lg hover:shadow-[#3B82F6]/10">
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      aria-hidden="true"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(88,168,224,0.22)_0%,transparent_62%)]" />
                      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_100%_0%,rgba(59,130,246,0.16)_0%,transparent_55%)]" />
                    </div>

                    <div className="relative">
                      <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#58A8E0] to-[#3B82F6] p-[1px] shadow-sm shadow-[#3B82F6]/10">
                          <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-white">
                            <Icon className="h-6 w-6 text-[#1E3A5F]" aria-hidden="true" />
                          </div>
                        </div>

                        {/* Heading */}
                        <h3 className="min-w-0 text-base font-semibold leading-snug text-[#1E3A5F]">
                          {principle.title}
                        </h3>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-[#475569] line-clamp-5">
                        {principle.description}
                      </p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Section>
  );
}
