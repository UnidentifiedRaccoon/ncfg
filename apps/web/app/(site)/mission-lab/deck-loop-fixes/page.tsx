import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Copy,
  Gauge,
  Layers3,
  RefreshCcw,
  TriangleAlert,
  Workflow,
} from "lucide-react";

import { buildPageMetadata } from "@/shared/lib/metadata";
import { Container } from "@/shared/ui/Container";

export const metadata: Metadata = buildPageMetadata({
  path: "/mission-lab/deck-loop-fixes",
  title: "Mission Lab — deck loop fixes",
  description:
    "Разбор трёх способов убрать jerk на циклическом переходе в Layered Deck: loop buffer, FLIP/layout animation и exit-clone normalization.",
});

const diagnosisCards = [
  {
    title: "Почему сейчас дёргается",
    text: "При переходе с четвёртого пункта к первому стек мгновенно ремапит карточки по циклу: условно из [3, 0, 1] в [0, 1, 2]. Для React это уже другой набор слоёв, поэтому визуально происходит скачок идентичностей, а не непрерывное движение.",
    tone: "problem",
  },
  {
    title: "Что важно сохранить",
    text: "Три видимых слоя, спокойную editorial-подачу, hover/focus/tap-управление и мобильную деградацию без тяжёлой карусельной механики.",
    tone: "neutral",
  },
  {
    title: "Ограничение проекта",
    text: "Это маркетинговый блок на Next.js + React + Tailwind. Значит, решение должно быть лёгким по JS, не ломать читаемость текста и уважать reduced motion.",
    tone: "good",
  },
] as const;

const methods = [
  {
    id: "loop-buffer",
    title: "Loop Buffer + Ghost Slot",
    subtitle: "Классический бесшовный цикл без резкого remap в момент wrap.",
    icon: RefreshCcw,
    badge: "Лучший fit для текущего блока",
    verdict: "Рекомендую как основной продовый путь.",
    mechanics: [
      "Вводим отдельный `visualIndex`, который может временно выходить за диапазон реальных карточек.",
      "Рядом с реальными карточками рендерим призрачный дубликат первого/последнего слоя, как это делают loop-carousels.",
      "На wrap-переходе сначала анимируем движение к ghost-card, а уже после завершения transition мгновенно нормализуем индекс обратно в реальный диапазон.",
    ],
    pros: [
      "Лучше всего совпадает с текущей архитектурой stacked deck и CSS-transform сценой.",
      "Минимум новой зависимости: можно остаться на React state + Tailwind + `transitionend`.",
      "Сохраняет ощущение физической колоды: верхний слой действительно уходит назад, а не просто перескакивает.",
    ],
    cons: [
      "Появляется двухфазная логика индексов: `realIndex` и `visualIndex`.",
      "Нужно аккуратно нормализовать focus/hover, чтобы ghost-card не читалась как отдельная сущность для assistive tech.",
    ],
    fit: "Оптимально для текущего `MissionLedgerAlliance`, если цель — исправить jerk без смены всего паттерна.",
    sources: [
      {
        label: "Swiper loop mode",
        href: "https://swiperjs.com/swiper-api",
      },
      {
        label: "Splide clones",
        href: "https://splidejs.com/guides/options/",
      },
      {
        label: "web.dev animations guide",
        href: "https://web.dev/articles/animations-guide",
      },
    ],
  },
  {
    id: "flip-layout",
    title: "Stable DOM + FLIP / Layout Animation",
    subtitle: "Не переставлять карточки мгновенно, а анимировать их новое layout-положение.",
    icon: Workflow,
    badge: "Самый «шелковистый» путь",
    verdict: "Подходит, если допустим чуть больший JS-слой.",
    mechanics: [
      "Держим стабильный набор DOM-узлов и меняем только их позицию/роль в стеке.",
      "Переход между состояниями анимируется через layout-aware систему, например Motion `layout`/`layoutId`.",
      "Библиотека сама рассчитывает промежуточную геометрию и визуально склеивает старое и новое состояние.",
    ],
    pros: [
      "Очень плавно работает на сложных перестановках и direction changes.",
      "Меньше ручной математики для ghost-слотов и нормализации wrap.",
      "В проекте уже есть `framer-motion`, поэтому новый runtime добавлять не нужно.",
    ],
    cons: [
      "Это уже более «JS-driven» анимация, что для маркетингового блока не всегда желательно.",
      "Потребует аккуратной настройки, чтобы текст внутри карточек не ощущался «желейным» при layout interpolation.",
    ],
    fit: "Сильный вариант, если приоритет — максимально мягкий motion, а не минимальный runtime.",
    sources: [
      {
        label: "Motion layout animations",
        href: "https://motion.dev/docs/react-layout-animations",
      },
      {
        label: "Motion AnimatePresence",
        href: "https://motion.dev/motion/animate-presence/",
      },
    ],
  },
  {
    id: "exit-clone",
    title: "Outgoing Clone + Post-Transition Normalize",
    subtitle: "Оставить старый верхний слой жить ещё один кадр, чтобы не ломать непрерывность.",
    icon: Copy,
    badge: "Точный хирургический фикс",
    verdict: "Полезно как лёгкий layer поверх текущей схемы.",
    mechanics: [
      "На смене активной карточки сохраняем предыдущий front-card как временный exiting-layer.",
      "Новый стек рендерится сразу в нужном состоянии, а старая карточка отдельно доигрывает выход: смещение, fade и снижение масштаба.",
      "После `transitionend` временный слой удаляется, а состояние считается полностью нормализованным.",
    ],
    pros: [
      "Можно внедрить без полной перестройки всей модели слоёв.",
      "Особенно хорошо скрывает момент, когда старая карточка должна «уйти назад» при резком обратном движении.",
      "Позволяет локально усилить ощущение deck shuffle без тяжёлой библиотеки.",
    ],
    cons: [
      "Сам по себе не решает всю геометрию loop-wrap, если задние слои тоже резко меняют идентичность.",
      "Появляется дополнительное состояние для временного слоя и синхронизация по событию завершения анимации.",
    ],
    fit: "Лучше всего работает как дополнение к loop buffer, а не как единственная мера.",
    sources: [
      {
        label: "MDN transitionend",
        href: "https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event",
      },
      {
        label: "Motion AnimatePresence",
        href: "https://motion.dev/motion/animate-presence/",
      },
    ],
  },
] as const;

const comparisonRows = [
  {
    criterion: "Гладкость на wrap",
    values: ["Высокая", "Очень высокая", "Средняя без loop buffer"],
  },
  {
    criterion: "Лишний JS",
    values: ["Низкий", "Средний", "Низкий"],
  },
  {
    criterion: "Сложность внедрения",
    values: ["Средняя", "Средняя", "Низкая / средняя"],
  },
  {
    criterion: "Насколько близко к текущему коду",
    values: ["Очень близко", "Потребует частичной переработки", "Близко"],
  },
  {
    criterion: "Когда выбирать",
    values: [
      "Нужен продовый фикс без смены визуального языка",
      "Нужен максимально polished motion и приемлем Motion",
      "Нужно быстро приглушить jerk поверх существующего стека",
    ],
  },
] as const;

const implementationSteps = [
  "Разделить индекс на `realIndex` и `visualIndex`, чтобы анимация могла временно проходить через ghost-состояние.",
  "Рендерить три видимых слоя плюс один служебный loop-layer только на десктопе; для mobile оставить нынешний single-card fallback.",
  "Слушать завершение только transform/opacity transition и после этого нормализовать `visualIndex` обратно в реальный диапазон.",
  "Исключить ghost-card из tab order и aria-потока, чтобы клавиатурная навигация и screen reader продолжали работать по четырём реальным направлениям.",
] as const;

function SourcePill({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-[#D7E4F1] bg-white/86 px-3 py-1.5 text-xs font-semibold text-[#274566] transition-colors hover:border-[#A6C6EA] hover:text-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
    >
      <span>{label}</span>
      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}

function MethodPreview({ variant }: { variant: (typeof methods)[number]["id"] }) {
  if (variant === "loop-buffer") {
    return (
      <div className="relative h-44 overflow-hidden rounded-[28px] border border-[#D8E4F2] bg-[linear-gradient(180deg,rgba(248,251,255,0.98)_0%,rgba(239,246,255,0.92)_100%)]">
        <div className="absolute left-5 top-4 rounded-full border border-[#CFE0F3] bg-white/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6A84A1]">
          ghost slot
        </div>
        <div className="absolute left-5 top-16 h-24 w-[56%] rounded-[22px] border border-dashed border-[#B7D0EA] bg-white/58" />
        <div className="absolute left-10 top-[4.9rem] h-24 w-[56%] rounded-[22px] border border-[#D8E4F2] bg-white/88 shadow-[0_12px_32px_rgba(18,45,78,0.08)]" />
        <div className="absolute left-14 top-[4rem] h-24 w-[56%] rounded-[22px] border border-[#C8DBF0] bg-[linear-gradient(180deg,#FFFFFF_0%,#F3F8FF_100%)] shadow-[0_18px_38px_rgba(18,45,78,0.10)]" />
        <div className="absolute right-5 top-[5.4rem] rounded-full border border-[#CFE0F3] bg-white/92 px-3 py-1 text-[11px] font-semibold text-[#4B83D4]">
          normalize after wrap
        </div>
      </div>
    );
  }

  if (variant === "flip-layout") {
    return (
      <div className="relative h-44 overflow-hidden rounded-[28px] border border-[#D8E4F2] bg-[linear-gradient(180deg,rgba(250,252,255,0.98)_0%,rgba(240,247,255,0.92)_100%)]">
        <div className="absolute left-5 top-5 h-24 w-[48%] rounded-[22px] border border-[#D5E2F0] bg-white/84" />
        <div className="absolute right-6 top-8 h-24 w-[48%] rounded-[22px] border border-[#C7DAEE] bg-[linear-gradient(180deg,#FFFFFF_0%,#F4F8FF_100%)] shadow-[0_18px_38px_rgba(18,45,78,0.10)]" />
        <div className="absolute left-[44%] top-[4.4rem] h-9 w-20 -translate-x-1/2 rounded-full border border-[#BFD5EE] bg-white/92 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4B83D4]">
          layout
        </div>
        <div className="absolute left-[39%] top-[4.7rem] h-px w-14 rotate-[-12deg] bg-[#8FB6E3]" />
        <div className="absolute left-[49%] top-[4.9rem] h-px w-14 rotate-[18deg] bg-[#8FB6E3]" />
      </div>
    );
  }

  return (
    <div className="relative h-44 overflow-hidden rounded-[28px] border border-[#D8E4F2] bg-[linear-gradient(180deg,rgba(250,252,255,0.98)_0%,rgba(239,246,255,0.92)_100%)]">
      <div className="absolute left-8 top-12 h-24 w-[56%] rounded-[22px] border border-[#C7DAEE] bg-[linear-gradient(180deg,#FFFFFF_0%,#F4F8FF_100%)] shadow-[0_18px_38px_rgba(18,45,78,0.10)]" />
      <div className="absolute left-14 top-[4.8rem] h-24 w-[56%] rounded-[22px] border border-[#D8E4F2] bg-white/78 opacity-55" />
      <div className="absolute right-5 top-5 rounded-full border border-[#CFE0F3] bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6A84A1]">
        exiting clone
      </div>
      <div className="absolute right-6 top-[5.1rem] h-px w-16 rotate-[24deg] bg-[#8FB6E3]" />
      <div className="absolute right-8 top-[4.5rem] text-[11px] font-semibold text-[#4B83D4]">transitionend</div>
    </div>
  );
}

export default function DeckLoopFixesMissionLabPage() {
  return (
    <main className="bg-[linear-gradient(180deg,#F7FBFF_0%,#FFFFFF_16%,#F8FBFF_100%)] pb-20">
      <Container className="pt-12 md:pt-16">
        <Link
          href="/mission-lab"
          className="inline-flex items-center gap-2 rounded-full border border-[#D8E4F2] bg-white/88 px-4 py-2 text-sm font-medium text-[#1E3A5F] transition-colors hover:border-[#BFDBFE] hover:text-[#163B6B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Ко всем вариантам Mission Lab</span>
        </Link>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] xl:items-start">
          <div className="max-w-[36rem]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4C83D5]">
              Mission Lab / research note
            </p>
            <h1 className="mt-4 text-[34px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#153153] md:text-[56px]">
              Как убрать jerk на loop-переходе в Layered Deck
            </h1>
            <p className="mt-5 max-w-[44ch] text-base leading-7 text-[#52657D] md:text-lg">
              Исследование именно по текущей проблеме: почему переход с четвёртого пункта к
              первому ощущается рваным и какие реальные UI-техники обычно используют, чтобы
              сделать карточную сцену бесшовной.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            {diagnosisCards.map((card) => {
              const icon =
                card.tone === "problem"
                  ? TriangleAlert
                  : card.tone === "good"
                    ? CheckCircle2
                    : Gauge;
              const Icon = icon;

              return (
                <article
                  key={card.title}
                  className="rounded-[28px] border border-[#DCE7F3] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(245,249,255,0.94)_100%)] p-5 shadow-[0_18px_42px_rgba(18,45,78,0.06)] md:p-6"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D7E3F2] bg-white text-[#1E3A5F]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#153153]">
                        {card.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[#52657D] md:text-[15px]">
                        {card.text}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Container>

      <Container className="pt-10">
        <div className="grid gap-6">
          {methods.map((method) => {
            const Icon = method.icon;

            return (
              <article
                key={method.id}
                className="overflow-hidden rounded-[32px] border border-[#DCE7F3] bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(245,249,255,0.94)_100%)] shadow-[0_22px_60px_rgba(18,45,78,0.06)]"
              >
                <div className="grid gap-0 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
                  <div className="border-b border-[#E2EBF5] p-6 xl:border-r xl:border-b-0 xl:p-7">
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D6E3F1] bg-white text-[#1E3A5F]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="inline-flex rounded-full border border-[#CFE0F3] bg-[#F5FAFF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4B83D4]">
                          {method.badge}
                        </div>
                        <h2 className="mt-3 text-[28px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#153153]">
                          {method.title}
                        </h2>
                        <p className="mt-3 max-w-[42ch] text-sm leading-6 text-[#52657D] md:text-[15px]">
                          {method.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <MethodPreview variant={method.id} />
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {method.sources.map((source) => (
                        <SourcePill key={source.href} href={source.href} label={source.label} />
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-6 p-6 xl:grid-cols-3 xl:p-7">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7089A7]">
                        Как работает
                      </p>
                      <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#36516F] md:text-[15px]">
                        {method.mechanics.map((item) => (
                          <li
                            key={item}
                            className="rounded-[20px] border border-[#E0E9F3] bg-white/82 px-4 py-3"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7089A7]">
                        Плюсы
                      </p>
                      <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#36516F] md:text-[15px]">
                        {method.pros.map((item) => (
                          <li
                            key={item}
                            className="rounded-[20px] border border-[#E0E9F3] bg-white/82 px-4 py-3"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7089A7]">
                        Ограничения
                      </p>
                      <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#36516F] md:text-[15px]">
                        {method.cons.map((item) => (
                          <li
                            key={item}
                            className="rounded-[20px] border border-[#E0E9F3] bg-white/82 px-4 py-3"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 rounded-[22px] border border-[#D3E2F1] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)] px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4B83D4]">
                          Вывод
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#35516F] md:text-[15px]">
                          {method.verdict} {method.fit}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>

      <Container className="pt-10">
        <div className="overflow-hidden rounded-[32px] border border-[#DCE7F3] bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(244,249,255,0.94)_100%)] shadow-[0_22px_60px_rgba(18,45,78,0.06)]">
          <div className="border-b border-[#E2EBF5] px-6 py-6 md:px-7">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D6E3F1] bg-white text-[#1E3A5F]">
                <Gauge className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4C83D5]">
                  Быстрое сравнение
                </p>
                <h2 className="mt-3 text-[28px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#153153]">
                  Как методы ведут себя по motion, сложности и близости к текущему коду
                </h2>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto px-6 py-6 md:px-7">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="min-w-[220px] border-b border-[#DCE7F3] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7089A7]">
                    Критерий
                  </th>
                  <th className="min-w-[240px] border-b border-[#DCE7F3] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7089A7]">
                    Loop buffer
                  </th>
                  <th className="min-w-[240px] border-b border-[#DCE7F3] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7089A7]">
                    FLIP / layout
                  </th>
                  <th className="min-w-[240px] border-b border-[#DCE7F3] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7089A7]">
                    Exit-clone
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.criterion}>
                    <th className="border-b border-[#E6EEF6] px-4 py-4 text-left text-sm font-semibold text-[#153153] md:text-[15px]">
                      {row.criterion}
                    </th>
                    {row.values.map((value) => (
                      <td
                        key={`${row.criterion}-${value}`}
                        className="border-b border-[#E6EEF6] px-4 py-4 text-sm leading-6 text-[#45607D] md:text-[15px]"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Container>

      <Container className="pt-10">
        <div className="overflow-hidden rounded-[32px] border border-[#DCE7F3] bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(244,249,255,0.94)_100%)] shadow-[0_22px_60px_rgba(18,45,78,0.06)]">
          <div className="border-b border-[#E2EBF5] px-6 py-6 md:px-7">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D6E3F1] bg-white text-[#1E3A5F]">
                <Layers3 className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4C83D5]">
                  Recommendation
                </p>
                <h2 className="mt-3 text-[28px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#153153]">
                  Для текущего блока я бы выбрал loop buffer с мягкой post-transition
                  нормализацией
                </h2>
                <p className="mt-3 max-w-[56ch] text-sm leading-6 text-[#52657D] md:text-[15px]">
                  Это самый прагматичный вариант: он лечит именно источник jerk при wrap, не
                  превращая спокойный editorial-блок в полноформатную JS-карусель. Если после
                  внедрения захочется ещё мягче «доигрывать» уходящий слой, сверху можно добавить
                  тонкий exit-clone, но уже как вторую итерацию.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 md:px-7 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7089A7]">
                Черновой implementation plan
              </p>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#35516F] md:text-[15px]">
                {implementationSteps.map((step) => (
                  <li
                    key={step}
                    className="rounded-[20px] border border-[#E0E9F3] bg-white/82 px-4 py-3"
                  >
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4">
              <article className="rounded-[24px] border border-[#D8E4F2] bg-white/86 px-5 py-5">
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#4B83D4]" aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#153153]">
                      Mobile fallback
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#52657D] md:text-[15px]">
                      На мобильном экране проблему лучше не «симулировать» колодой. Достаточно
                      сохранить один крупный content-card и тот же список направлений как trigger
                      group.
                    </p>
                  </div>
                </div>
              </article>

              <article className="rounded-[24px] border border-[#D8E4F2] bg-white/86 px-5 py-5">
                <div className="flex items-start gap-3">
                  <Gauge className="mt-0.5 h-5 w-5 shrink-0 text-[#4B83D4]" aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#153153]">
                      Motion budget
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#52657D] md:text-[15px]">
                      Как и рекомендует web.dev, лучше ограничиться `transform` и `opacity`, а
                      декоративные blur/shadow не делать главными участниками анимации.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
