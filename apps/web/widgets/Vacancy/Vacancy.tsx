import { BriefcaseBusiness, CalendarDays, MapPin, Wallet } from "lucide-react";

import { VacancyApplicationForm } from "@/features/VacancyApplicationForm";
import { Container } from "@/shared/ui/Container";
import type { VacancyCardVacancy } from "@/entities/VacancyCard";
import type { VacancyData } from "@/shared/api/types/vacancy";
import { OtherVacancies } from "./OtherVacancies";

interface VacancyProps {
  vacancy: VacancyData;
  allVacancies?: VacancyData[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function MetaRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof BriefcaseBusiness;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3B82F6]/10 text-[#3B82F6]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-[#1E3A5F]">{value}</p>
      </div>
    </div>
  );
}

function toCardVacancy(vacancy: VacancyData): VacancyCardVacancy {
  return {
    id: vacancy.id,
    slug: vacancy.slug,
    title: vacancy.title,
    lead: vacancy.lead,
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
  };
}

export function Vacancy({ vacancy, allVacancies = [] }: VacancyProps) {
  const otherVacancies = allVacancies
    .filter((item) => item.id !== vacancy.id)
    .sort(
      (a, b) =>
        new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    )
    .slice(0, 3)
    .map(toCardVacancy);

  const metaRows = [
    vacancy.department?.title
      ? {
          label: "Направление",
          value: vacancy.department.title,
          icon: BriefcaseBusiness,
        }
      : null,
    vacancy.employmentTypeLabel
      ? {
          label: "Занятость",
          value: vacancy.employmentTypeLabel,
          icon: BriefcaseBusiness,
        }
      : null,
    vacancy.workFormatLabel
      ? {
          label: "Формат",
          value: vacancy.workFormatLabel,
          icon: BriefcaseBusiness,
        }
      : null,
    vacancy.location
      ? {
          label: "Локация",
          value: vacancy.location,
          icon: MapPin,
        }
      : null,
    vacancy.salaryText
      ? {
          label: "Условия",
          value: vacancy.salaryText,
          icon: Wallet,
        }
      : null,
    {
      label: "Опубликовано",
      value: formatDate(vacancy.publishedDate),
      icon: CalendarDays,
    },
  ].filter(
    (
      item
    ): item is {
      label: string;
      value: string;
      icon: typeof BriefcaseBusiness;
    } => Boolean(item)
  );

  return (
    <>
      <article data-scroll-reveal="" className="py-12 md:py-16">
        <Container className="px-5 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[960px]">
            <header className="mx-auto max-w-[760px] text-center">
              <h1 className="text-[30px] font-bold leading-tight text-[#1E3A5F] md:text-[40px] lg:text-[46px]">
                {vacancy.title}
              </h1>

              {vacancy.lead ? (
                <p className="mx-auto mt-5 max-w-[60ch] text-lg leading-relaxed text-[#475569] md:text-xl">
                  {vacancy.lead}
                </p>
              ) : null}
            </header>

            <div className="mt-10 grid gap-8 lg:mt-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-2xl border border-[#E2E8F0]/80 bg-white p-5 shadow-sm">
                  <div className="space-y-4">
                    {metaRows.map((item) => (
                      <MetaRow
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        icon={item.icon}
                      />
                    ))}
                  </div>
                </div>
              </aside>

              <div className="min-w-0">
                <div className="mx-auto max-w-[760px] rounded-2xl border border-[#E2E8F0]/80 bg-white p-5 shadow-sm md:p-6">
                  <div className="post-content vacancy-post-content mx-auto max-w-[624px]">
                    <div dangerouslySetInnerHTML={{ __html: vacancy.body }} />
                  </div>
                </div>
                <div className="mx-auto mt-10 max-w-[624px]">
                  <VacancyApplicationForm
                    vacancySlug={vacancy.slug}
                    vacancyTitle={vacancy.title}
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </article>

      <OtherVacancies vacancies={otherVacancies} />
    </>
  );
}
