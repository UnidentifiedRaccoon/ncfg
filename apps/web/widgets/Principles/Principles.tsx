import { Section } from "@/shared/ui/Section";
import { ArrowRight, BookOpen, FlaskConical, Users, Award, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CmsAwareLink } from "@/shared/ui/CmsAwareLink";

interface Principle {
  id: string;
  order: number;
  title: string;
  description: string;
  linkLabel?: string;
  href?: string;
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
  if (index === 0) return "md:col-span-2 lg:col-span-6";
  if (index === 1) return "md:col-span-2 lg:col-span-6";
  if (index === 2) return "md:col-span-2 lg:col-span-5";
  if (index === 3) return "md:col-span-1 lg:col-span-3";
  return "md:col-span-1 lg:col-span-4";
}

export function Principles({ title, lead, principles }: PrinciplesProps) {
  const sortedPrinciples = [...principles].sort((a, b) => a.order - b.order);
  const leadNode = lead ? (
    <span className="text-xl md:text-2xl">{lead}</span>
  ) : undefined;

  return (
    <Section id="principles" title={title} lead={leadNode} background="gray">
      <ul
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12"
        aria-label="Наши принципы"
      >
        {sortedPrinciples.map((principle, index) => {
          const Icon = iconMap[principle.id] ?? BookOpen;
          const span = getBentoSpan(index);

          return (
            <li key={principle.id} className={span}>
              <article className="group relative h-full overflow-hidden rounded-2xl border border-[#DBEAFE] bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(30,58,95,0.12)] md:p-6">
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  aria-hidden="true"
                >
                  <div className="absolute -left-10 -top-14 h-44 w-44 rounded-full bg-[#58A8E0]/15 blur-2xl" />
                  <div className="absolute -bottom-10 -right-12 h-36 w-36 rounded-full bg-[#3B82F6]/15 blur-2xl" />
                </div>

                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#58A8E0] to-[#3B82F6] text-white shadow-[0_8px_20px_rgba(59,130,246,0.28)]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="min-w-0 text-lg font-semibold leading-tight text-[#1E3A5F]">
                      {principle.title}
                    </h3>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-[#475569] md:text-[15px]">
                    {principle.description}
                  </p>

                  {principle.href ? (
                    <CmsAwareLink
                      href={principle.href}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                    >
                      <span>{principle.linkLabel ?? "История центра"}</span>
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </CmsAwareLink>
                  ) : null}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
