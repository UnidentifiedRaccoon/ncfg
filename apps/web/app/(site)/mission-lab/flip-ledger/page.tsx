import type { Metadata } from "next";

import { MissionPatternFlipLedger } from "@/widgets/MissionPatternFlipLedger";
import { buildPageMetadata } from "@/shared/lib/metadata";
import { Container } from "@/shared/ui/Container";

export const metadata: Metadata = buildPageMetadata({
  path: "/mission-lab/flip-ledger",
  title: "Mission Lab: вариант flip-ledger",
  description:
    "Отдельная демонстрационная страница с restrained folio / cover-lift вариантом mission-блока для сравнения подходов.",
  robots: {
    index: false,
    follow: false,
  },
});

const comparisonPoints = [
  {
    title: "Читаемость",
    text: "Текст всегда лежит на плоском развороте. Flip работает как оболочка, а не как спецэффект поверх copy.",
  },
  {
    title: "Мобильный сценарий",
    text: "На малых экранах слои схлопываются в обычные карточки и один активный разворот ниже.",
  },
  {
    title: "Доступность",
    text: "Есть tab-навигация, focus-visible, role-атрибуты и предсказуемое переключение с клавиатуры.",
  },
  {
    title: "Движение",
    text: "Reduced motion убирает подъём и поворот обложки, оставляя только мягкую смену слоёв и цвета.",
  },
] as const;

export default function MissionLabFlipLedgerPage() {
  return (
    <main className="bg-[linear-gradient(180deg,#F6F8FC_0%,#F2F6FB_38%,#FFFFFF_100%)] pb-20 pt-8 md:pt-12 md:pb-24">
      <Container className="space-y-8 md:space-y-10">
        <section className="overflow-hidden rounded-[34px] border border-[#E2E8F0] bg-white/90 p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.42)] md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="max-w-[42rem]">
              <p className="inline-flex rounded-full border border-[#D8E4F1] bg-[#F8FBFF] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#5B7AA3]">
                Лаборатория миссии / flip-ledger
              </p>
              <h1 className="mt-5 text-[32px] font-semibold leading-[1.02] tracking-tight text-[#1E3A5F] md:text-[46px]">
                Вариант mission-блока со сдержанным folio-раскрытием
              </h1>
              <p className="mt-5 max-w-[38rem] text-base leading-7 text-[#475569] md:text-[18px]">
                Это отдельная демонстрационная страница для сравнения подходов. Здесь flip работает как
                намёк на открывающийся ledger, но не ломает чтение и не требует тяжёлой
                анимации.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {comparisonPoints.map((point) => (
                <article
                  key={point.title}
                  className="rounded-[24px] border border-[#E2E8F0] bg-[linear-gradient(180deg,#FBFDFF_0%,#F6F9FD_100%)] p-4 shadow-[0_14px_32px_-28px_rgba(15,23,42,0.42)]"
                >
                  <h2 className="text-base font-semibold text-[#1E3A5F]">{point.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#52657C]">{point.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="flip-ledger-demo" className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[42rem]">
              <h2
                className="text-[26px] font-semibold tracking-tight text-[#1E3A5F] md:text-[34px]"
                id="flip-ledger-demo"
              >
                Демо-вариант
              </h2>
              <p className="mt-2 text-base leading-7 text-[#52657C]">
                Переключайте направления мышью или клавиатурой. На desktop виден мягкий
                folio-open, на mobile остаётся чистый читаемый стек.
              </p>
            </div>
            <p className="inline-flex rounded-full border border-[#D8E4F1] bg-white/80 px-4 py-2 text-sm font-medium text-[#5B7AA3]">
              Отдельный маршрут для визуального сравнения
            </p>
          </div>

          <MissionPatternFlipLedger embedded />
        </section>
      </Container>
    </main>
  );
}
