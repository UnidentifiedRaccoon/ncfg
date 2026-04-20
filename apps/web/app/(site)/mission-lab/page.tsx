import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Layers3,
  MousePointer2,
  PanelsTopLeft,
  Sparkles,
} from "lucide-react";

import { buildPageMetadata } from "@/shared/lib/metadata";
import { Container } from "@/shared/ui/Container";

export const metadata: Metadata = buildPageMetadata({
  path: "/mission-lab",
  title: "Mission Lab",
  description:
    "Демо-страницы с разными UX-подходами для переработки блока миссии НЦФГ.",
  robots: {
    index: false,
    follow: false,
  },
});

const variants = [
  {
    slug: "layered-deck",
    title: "Layered Deck",
    summary: "Контролируемая колода с тремя видимыми слоями и самым практичным балансом между motion и читаемостью.",
    fit: "Наиболее близкий кандидат для реальной замены текущего hover-swap.",
    icon: Layers3,
    accent: "from-[#DCEBFF] via-[#F5F9FF] to-white",
  },
  {
    slug: "editorial-stack",
    title: "Editorial Stack",
    summary: "Редакционный паттерн с ощущением последовательных манифестов и более архитектурной подачей смыслов.",
    fit: "Подходит, если хочется чуть более «журнального» ритма в секции.",
    icon: PanelsTopLeft,
    accent: "from-[#EAF4FF] via-[#F8FBFF] to-white",
  },
  {
    slug: "shuffle-deck",
    title: "Shuffle Deck",
    summary: "Сдержанная веерная колода с ощущением перелистывания, но без агрессивного декоративного шума.",
    fit: "Полезно для проверки, насколько далеко можно зайти в card metaphor.",
    icon: Sparkles,
    accent: "from-[#F0F7FF] via-[#F8FBFF] to-white",
  },
  {
    slug: "accordion-reveal",
    title: "Accordion Reveal",
    summary: "Практичный reveal-паттерн: слоистая карточная подача, которая хорошо работает и для hover, и для tap.",
    fit: "Самый продовый вариант после layered deck, если нужна предельная ясность.",
    icon: MousePointer2,
    accent: "from-[#EEF6FF] via-[#FAFCFF] to-white",
  },
  {
    slug: "flip-ledger",
    title: "Flip Ledger",
    summary: "Осторожная folio-интерпретация: не шоу-3D, а тест идеи cover-lift / partial flip для смысловой карточки.",
    fit: "Скорее исследовательский вариант, чтобы быстро проверить предел допустимого motion.",
    icon: ArrowRight,
    accent: "from-[#E8F2FF] via-[#F7FAFF] to-white",
  },
] as const;

export default function MissionLabPage() {
  return (
    <main className="bg-[linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_18%,#FFFFFF_100%)] pb-20">
      <Container className="pt-12 md:pt-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[#D8E4F2] bg-white/85 px-4 py-2 text-sm font-medium text-[#1E3A5F] transition-colors hover:border-[#BFDBFE] hover:text-[#163B6B]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Вернуться на главную</span>
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
          <div className="max-w-[520px]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3B82F6]">
              Mission Lab
            </p>
            <h1 className="mt-4 text-[34px] font-semibold leading-[1.02] tracking-[-0.04em] text-[#153153] md:text-[52px]">
              Варианты и технический разбор для нового блока миссии
            </h1>
            <p className="mt-5 max-w-[46ch] text-base leading-7 text-[#52657D] md:text-lg">
              Здесь собраны отдельные demo-страницы с разными card-based паттернами. Все они
              тестируют одну и ту же задачу: как заменить нынешнюю простую подмену текста на
              более выразительную, но всё ещё читабельную подачу. Отдельная страница со stable
              mission deck показывает уже выбранный продовый rollout для главной.
            </p>

            <div className="mt-8 rounded-[28px] border border-[#DCE7F3] bg-white/88 p-6 shadow-[0_18px_50px_rgba(21,49,83,0.07)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6D84A0]">
                Как смотреть варианты
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#4E627B] md:text-[15px]">
                <li>Сначала сравнить, как ощущается сама карточная сцена.</li>
                <li>Потом проверить hover, focus и tap-поведение.</li>
                <li>Отдельно посмотреть mobile fallback и спокойствие анимации.</li>
              </ul>
            </div>
          </div>

          <ol className="grid gap-4">
            {variants.map((variant) => {
              const Icon = variant.icon;

              return (
                <li key={variant.slug}>
                  <article
                    className={`group relative overflow-hidden rounded-[28px] border border-[#DCE7F3] bg-gradient-to-br ${variant.accent} p-5 shadow-[0_16px_45px_rgba(21,49,83,0.06)] transition-transform duration-300 ease-out hover:-translate-y-1 md:p-6`}
                  >
                    <div className="absolute inset-y-0 right-0 w-[34%] bg-[radial-gradient(circle_at_center,rgba(88,168,224,0.12),transparent_62%)]" />

                    <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="max-w-[44rem]">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-[#1E3A5F] shadow-[0_10px_25px_rgba(21,49,83,0.08)]">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div>
                            <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#153153] md:text-2xl">
                              {variant.title}
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-[#5A708A]">{variant.fit}</p>
                          </div>
                        </div>

                        <p className="mt-5 max-w-[56ch] text-[15px] leading-7 text-[#294765] md:text-base">
                          {variant.summary}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center">
                        <Link
                          href={`/mission-lab/${variant.slug}`}
                          className="inline-flex items-center gap-2 rounded-full border border-[#C8DAEE] bg-white px-4 py-2.5 text-sm font-semibold text-[#153153] shadow-[0_8px_20px_rgba(21,49,83,0.06)] transition-all duration-200 hover:border-[#93C5FD] hover:text-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                        >
                          <span>Открыть демо</span>
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </main>
  );
}
