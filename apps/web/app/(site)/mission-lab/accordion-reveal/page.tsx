import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MousePointer2 } from "lucide-react";

import { buildPageMetadata } from "@/shared/lib/metadata";
import { Container } from "@/shared/ui/Container";
import { MissionPatternAccordionReveal } from "@/widgets/MissionPatternAccordionReveal";

export const metadata: Metadata = buildPageMetadata({
  path: "/mission-lab/accordion-reveal",
  title: "Mission Lab: вариант accordion-reveal",
  description:
    "Accordion Reveal — demo-вариант mission-блока со слоистой карточной подачей, hover/focus/tap reveal и практичным mobile UX.",
  robots: {
    index: false,
    follow: false,
  },
});

const comparisonPoints = [
  {
    title: "Продовый потенциал",
    text: "Карточки держат ясную иерархию даже без наведения: вёрстка подходит для реальной главной, а не только для лабораторного эффекта.",
  },
  {
    title: "Tap-first mobile",
    text: "На мобильных tap раскрывает тот же внутренний лист прямо внутри карточки. Нет отдельного режима и нет потери смысла.",
  },
  {
    title: "Доступность и motion",
    text: "Фокусные состояния видимы, интерактивные элементы остаются кнопками, а reduced motion убирает лишнее декоративное движение.",
  },
  {
    title: "Карточная метафора",
    text: "Reveal ощущается как приоткрытие слоистой карточки, а не как FAQ-accordion. Это даёт более премиальную и редакционную подачу.",
  },
] as const;

export default function MissionLabAccordionRevealPage() {
  return (
    <main className="bg-[linear-gradient(180deg,#F5F9FF_0%,#F8FBFF_24%,#FFFFFF_100%)] pb-20 pt-8 md:pb-24 md:pt-12">
      <Container className="space-y-8 md:space-y-10">
        <section className="overflow-hidden rounded-[34px] border border-[#D8E5F2] bg-white/90 p-6 shadow-[0_28px_70px_-50px_rgba(15,23,42,0.38)] md:p-10">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/mission-lab"
              className="inline-flex items-center gap-2 rounded-full border border-[#D8E4F2] bg-white/88 px-4 py-2 text-sm font-medium text-[#1E3A5F] transition-colors hover:border-[#BFDBFE] hover:text-[#163B6B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>К списку вариантов</span>
            </Link>
            <Link
              href="/#mission"
              className="inline-flex items-center gap-2 rounded-full border border-[#D8E4F2] bg-white/88 px-4 py-2 text-sm font-medium text-[#1E3A5F] transition-colors hover:border-[#BFDBFE] hover:text-[#163B6B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            >
              <span>Сравнить с текущим блоком</span>
            </Link>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-start">
            <div className="max-w-[42rem]">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#D7E5F2] bg-[#F8FBFF] px-4 py-2 text-sm font-medium text-[#153153] shadow-[0_10px_30px_rgba(21,49,83,0.05)]">
                <MousePointer2 className="h-4 w-4 text-[#1D4ED8]" aria-hidden="true" />
                <span>Accordion Reveal</span>
              </p>

              <h1 className="mt-5 text-[34px] font-semibold leading-[1.01] tracking-[-0.048em] text-[#153153] md:text-[54px]">
                Demo-страница со слоистыми reveal-карточками для mission-секции
              </h1>
              <p className="mt-5 max-w-[48ch] text-base leading-7 text-[#52657D] md:text-lg">
                Это отдельный вариант для сравнения подходов. Здесь миссия раскрывается через
                карточки с внутренним листом: hover, focus и tap показывают больше смысла, но
                ритм секции остаётся спокойным и пригодным для реальной продовой главной.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {comparisonPoints.map((point) => (
                <article
                  key={point.title}
                  className="rounded-[24px] border border-[#E0E9F4] bg-[linear-gradient(180deg,#FBFDFF_0%,#F6F9FD_100%)] p-4 shadow-[0_14px_36px_-30px_rgba(15,23,42,0.35)]"
                >
                  <h2 className="text-base font-semibold text-[#153153]">{point.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#52657C]">{point.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="accordion-reveal-demo" className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[44rem]">
              <h2
                className="text-[26px] font-semibold tracking-tight text-[#1E3A5F] md:text-[34px]"
                id="accordion-reveal-demo"
              >
                Демо-вариант
              </h2>
              <p className="mt-2 text-base leading-7 text-[#52657C]">
                Проверьте карточки мышью, клавиатурой и на tap. Активное направление раскрывает
                внутренний лист внутри карточки и синхронно обновляет левую summary-панель.
              </p>
            </div>
            <p className="inline-flex rounded-full border border-[#D8E4F1] bg-white/80 px-4 py-2 text-sm font-medium text-[#5B7AA3]">
              Отдельный маршрут для визуального и UX-сравнения
            </p>
          </div>

          <MissionPatternAccordionReveal embedded headingAs="h2" />
        </section>
      </Container>
    </main>
  );
}
