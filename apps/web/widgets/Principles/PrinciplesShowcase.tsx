import { cn } from "@/shared/lib/cn";
import { Container } from "@/shared/ui/Container";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  CircleDot,
  FlaskConical,
  Heart,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Principle {
  id: string;
  order: number;
  title: string;
  description: string;
}

interface PrinciplesShowcaseProps {
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

function getVariantOneSpan(index: number) {
  if (index === 0) return "md:col-span-2 xl:col-span-6";
  if (index === 1) return "md:col-span-2 xl:col-span-6";
  if (index === 2) return "md:col-span-2 xl:col-span-5";
  if (index === 3) return "md:col-span-1 xl:col-span-3";
  return "md:col-span-1 xl:col-span-4";
}

function getVariantTagClass(isDark: boolean) {
  return isDark
    ? "border-white/20 bg-white/10 text-white/90"
    : "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]";
}

function getSequence(index: number) {
  return `${index + 1}`.padStart(2, "0");
}

export function PrinciplesShowcase({ title, lead, principles }: PrinciplesShowcaseProps) {
  const sortedPrinciples = [...principles].sort((a, b) => a.order - b.order);

  return (
    <div className="pb-16 md:pb-20">
      <section className="border-b border-[#E2E8F0] bg-white py-10 md:py-14">
        <Container>
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#3B82F6]">
              Демо-сравнение
            </p>
            <h2 className="mt-3 text-[30px] font-bold leading-tight tracking-tight text-[#1E3A5F] md:text-5xl">
              {title}: 3 варианта в стиле современного банкинга
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#475569] md:text-lg">
              {lead ??
                "Собрал три визуальные концепции с разным настроением: спокойный премиум, динамичный контраст и продуктовый roadmap."}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-[#F8FAFC] py-12 md:py-16">
        <Container>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#3B82F6]">
                Вариант 1
              </p>
              <h3 className="mt-2 text-2xl font-bold text-[#1E3A5F] md:text-[34px]">
                Air Grid
              </h3>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#475569]">
                Светлая карточная сетка с финансовой «чистотой»: много воздуха, аккуратные градиенты, акцент на содержании.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">
                Premium Light
              </span>
              <span className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">
                Карточный сценарий
              </span>
            </div>
          </div>

          <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-12" aria-label="Вариант Air Grid">
            {sortedPrinciples.map((principle, index) => {
              const Icon = iconMap[principle.id] ?? BookOpen;

              return (
                <li key={`variant-one-${principle.id}`} className={getVariantOneSpan(index)}>
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
                        <h4 className="text-lg font-semibold leading-tight text-[#1E3A5F]">
                          {principle.title}
                        </h4>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-[#475569] md:text-[15px]">
                        {principle.description}
                      </p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#0F1F34] py-12 md:py-16">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-24 top-4 h-56 w-56 rounded-full bg-[#58A8E0]/20 blur-3xl" />
          <div className="absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#3B82F6]/20 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.05)_0%,transparent_38%,rgba(88,168,224,0.12)_100%)]" />
        </div>

        <Container className="relative z-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#A5D8FF]">
                Вариант 2
              </p>
              <h3 className="mt-2 text-2xl font-bold text-white md:text-[34px]">Signal Cards</h3>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#D5E6F8]">
                Контрастная композиция в духе digital-банкинга: темная подложка, яркий акцент, сильный ритм карточек.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", getVariantTagClass(true))}>
                High Contrast
              </span>
              <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", getVariantTagClass(true))}>
                Digital Banking
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <article className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-sm lg:col-span-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9AD8FF]">
                Почему работает
              </p>
              <p className="mt-4 text-2xl font-semibold leading-tight text-white">
                Сначала внимание, потом детали
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2 text-sm leading-relaxed text-[#D5E6F8]">
                  <Sparkles className="mt-0.5 h-4 w-4 text-[#58A8E0]" aria-hidden="true" />
                  Контраст быстро формирует «финтех»-ощущение.
                </li>
                <li className="flex items-start gap-2 text-sm leading-relaxed text-[#D5E6F8]">
                  <Sparkles className="mt-0.5 h-4 w-4 text-[#58A8E0]" aria-hidden="true" />
                  Карточки хорошо читаются даже при длинных описаниях.
                </li>
                <li className="flex items-start gap-2 text-sm leading-relaxed text-[#D5E6F8]">
                  <Sparkles className="mt-0.5 h-4 w-4 text-[#58A8E0]" aria-hidden="true" />
                  Подходит для анимаций появления по скроллу.
                </li>
              </ul>
            </article>

            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8" aria-label="Вариант Signal Cards">
              {sortedPrinciples.map((principle, index) => {
                const Icon = iconMap[principle.id] ?? BookOpen;

                return (
                  <li key={`variant-two-${principle.id}`}>
                    <article className="group relative h-full overflow-hidden rounded-2xl border border-white/15 bg-[#122A46]/90 p-5 transition-colors duration-200 hover:border-[#58A8E0]/60">
                      <div
                        className="pointer-events-none absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#58A8E0] to-[#3B82F6]"
                        aria-hidden="true"
                      />

                      <div className="flex items-start justify-between gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#A8DAFF]">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <span className="rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-xs font-semibold text-[#C8E6FF]">
                          {getSequence(index)}
                        </span>
                      </div>

                      <h4 className="mt-4 text-lg font-semibold leading-snug text-white">
                        {principle.title}
                      </h4>
                      <p className="mt-3 text-sm leading-relaxed text-[#D5E6F8]">
                        {principle.description}
                      </p>

                      <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#9AD8FF]">
                        Подробнее <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12 md:py-16">
        <Container>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#3B82F6]">
                Вариант 3
              </p>
              <h3 className="mt-2 text-2xl font-bold text-[#1E3A5F] md:text-[34px]">
                Route Timeline
              </h3>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#475569]">
                Пошаговый формат, где каждый принцип выглядит как «станция» маршрута. Хорошо подходит для narrative-подачи.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", getVariantTagClass(false))}>
                Storytelling
              </span>
              <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", getVariantTagClass(false))}>
                Путь клиента
              </span>
            </div>
          </div>

          <div className="relative mt-8">
            <div
              className="pointer-events-none absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-[#BFDBFE] via-[#3B82F6]/55 to-[#BFDBFE] xl:block"
              aria-hidden="true"
            />
            <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5" aria-label="Вариант Route Timeline">
              {sortedPrinciples.map((principle, index) => {
                const Icon = iconMap[principle.id] ?? BookOpen;

                return (
                  <li key={`variant-three-${principle.id}`} className="relative h-full">
                    <article className="relative h-full rounded-2xl border border-[#DBEAFE] bg-gradient-to-b from-[#F8FBFF] to-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.05)]">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-full border border-[#93C5FD] bg-white text-[#2563EB] shadow-sm">
                          <CircleDot className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[#2563EB]">
                          Этап {getSequence(index)}
                        </div>
                      </div>

                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>

                      <h4 className="mt-4 text-lg font-semibold leading-snug text-[#1E3A5F]">
                        {principle.title}
                      </h4>
                      <p className="mt-3 text-sm leading-relaxed text-[#475569]">{principle.description}</p>
                    </article>
                  </li>
                );
              })}
            </ol>
          </div>
        </Container>
      </section>
    </div>
  );
}
