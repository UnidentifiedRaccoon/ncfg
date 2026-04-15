import { VacancyCard } from "@/entities/VacancyCard";
import type { VacancyData } from "@/shared/api/types/vacancy";
import { makeExcerpt, stripHtmlToText } from "@/shared/lib/excerpt";
import { Section } from "@/shared/ui/Section";

interface CareerVacanciesProps {
  title: string;
  lead?: string | null;
  vacancies: VacancyData[];
  emptyTitle: string;
  emptyDescription: string;
}

export function CareerVacancies({
  title,
  lead,
  vacancies,
  emptyTitle,
  emptyDescription,
}: CareerVacanciesProps) {
  return (
    <Section
      id="career"
      title={title}
      lead={lead ?? undefined}
      background="gray"
      className="relative isolate -mt-16 pt-16 md:-mt-20 md:pt-20"
      containerClassName="pt-12 md:pt-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[320px] content-[''] [background-image:radial-gradient(640px_circle_at_14%_18%,rgba(88,168,224,0.18),transparent_54%),radial-gradient(540px_circle_at_88%_0%,rgba(37,99,235,0.16),transparent_60%),radial-gradient(700px_circle_at_52%_-12%,rgba(30,58,95,0.12),transparent_66%)] [mask-image:linear-gradient(to_bottom,black,transparent_92%)] -z-10"
      />

      {vacancies.length === 0 ? (
        <div className="mx-auto max-w-[760px] overflow-hidden rounded-2xl border border-[#E2E8F0]/70 bg-white/85 shadow-sm">
          <div className="p-6 md:p-8">
            <p className="text-base font-semibold text-[#1E3A5F] md:text-lg">{emptyTitle}</p>
            <p className="mt-2 text-sm leading-relaxed text-[#475569]">{emptyDescription}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          {vacancies.map((vacancy) => {
            const excerpt =
              vacancy.lead ?? makeExcerpt(stripHtmlToText(vacancy.body ?? ""), 180);

            return (
              <VacancyCard
                key={vacancy.id}
                vacancy={{
                  id: vacancy.id,
                  slug: vacancy.slug,
                  title: vacancy.title,
                  lead: vacancy.lead,
                  excerpt,
                  department: vacancy.department
                    ? {
                        slug: vacancy.department.slug,
                        title: vacancy.department.title,
                      }
                    : null,
                  employmentTypeLabel: vacancy.employmentTypeLabel,
                  workFormatLabel: vacancy.workFormatLabel,
                  location: vacancy.location,
                  salaryText: vacancy.salaryText,
                  coverImage: vacancy.coverImage,
                  publishedDate: vacancy.publishedDate,
                }}
              />
            );
          })}
        </div>
      )}
    </Section>
  );
}
