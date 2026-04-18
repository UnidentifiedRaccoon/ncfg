import { VacancyCard, type VacancyCardVacancy } from "@/entities/VacancyCard";
import { Button } from "@/shared/ui/Button";

interface OtherVacanciesProps {
  vacancies: VacancyCardVacancy[];
}

export function OtherVacancies({ vacancies }: OtherVacanciesProps) {
  if (vacancies.length === 0) return null;

  return (
    <section data-scroll-reveal="" className="bg-[#F8FAFC] py-12 md:py-16">
      <div className="mx-auto max-w-[760px] px-5 md:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-[#1E3A5F] md:text-3xl">
          Другие вакансии
        </h2>
        <div className="flex flex-col items-center gap-6">
          {vacancies.map((vacancy) => (
            <VacancyCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </div>
        <div className="mt-8">
          <Button href="/vacancies" variant="secondary" className="w-full">
            Все вакансии
          </Button>
        </div>
      </div>
    </section>
  );
}
