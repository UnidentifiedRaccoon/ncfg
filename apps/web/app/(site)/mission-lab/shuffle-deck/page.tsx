import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Eye, MousePointer2, Smartphone } from "lucide-react";

import { buildPageMetadata } from "@/shared/lib/metadata";
import { Container } from "@/shared/ui/Container";
import { MissionPatternShuffleDeck } from "@/widgets/MissionPatternShuffleDeck";

export const metadata: Metadata = buildPageMetadata({
  path: "/mission-lab/shuffle-deck",
  title: "Mission Lab: Shuffle Deck",
  description:
    "Demo-вариант блока миссии НЦФГ с restrained shuffle/fan deck feel, спокойным hover/focus/click-поведением и чистым mobile fallback.",
  robots: {
    index: false,
    follow: false,
  },
});

const checkpoints = [
  {
    title: "Поведение",
    text: "Проверяем, что hover даёт только мягкий preview, а focus и click закрепляют нужную карточку без лишней суеты.",
    icon: MousePointer2,
  },
  {
    title: "Читаемость",
    text: "Колода должна ощущаться как сцена из карточек, но текст остаётся первым слоем, а не декоративным приложением.",
    icon: Eye,
  },
  {
    title: "Mobile fallback",
    text: "На маленьком экране веер уступает место чистому tap-паттерну: никакой перегрузки, только понятный выбор и та же смысловая панель.",
    icon: Smartphone,
  },
] as const;

export default function MissionLabShuffleDeckPage() {
  return (
    <main className="bg-[linear-gradient(180deg,#F5F9FF_0%,#FFFFFF_18%,#FFFFFF_100%)] pb-20">
      <Container className="pt-12 md:pt-16">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/mission-lab"
            className="inline-flex items-center gap-2 rounded-full border border-[#D8E4F2] bg-white/88 px-4 py-2 text-sm font-medium text-[#1E3A5F] transition-colors hover:border-[#BFDBFE] hover:text-[#163B6B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Ко всем вариантам</span>
          </Link>

          <Link
            href="/#mission"
            className="inline-flex items-center gap-2 rounded-full border border-[#D8E4F2] bg-white/72 px-4 py-2 text-sm font-medium text-[#1E3A5F] transition-colors hover:border-[#BFDBFE] hover:text-[#163B6B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
          >
            <span>Сравнить с текущим блоком</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
          <div className="max-w-[560px]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3B82F6]">
              Mission Lab / Shuffle Deck
            </p>
            <h1 className="mt-4 text-[36px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#153153] md:text-[56px]">
              Веерная колода без декоративного шума
            </h1>
            <p className="mt-5 max-w-[48ch] text-base leading-7 text-[#52657D] md:text-lg">
              Этот demo-вариант проверяет card metaphor на более смелой территории, но без
              шоу-эффекта. Карточки ведут себя как спокойная веерная колода: одна выходит
              вперёд, остальные удерживают общий контекст блока миссии.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            {checkpoints.map((checkpoint) => {
              const Icon = checkpoint.icon;

              return (
                <article
                  key={checkpoint.title}
                  className="rounded-[26px] border border-[#DCE7F3] bg-white/88 p-5 shadow-[0_18px_45px_rgba(21,49,83,0.06)]"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-[#E0EBF7] bg-[#F7FAFF] text-[#1D4ED8]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[#183153]">
                    {checkpoint.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#556B84]">{checkpoint.text}</p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-10">
          <MissionPatternShuffleDeck />
        </div>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <article className="rounded-[28px] border border-[#DCE7F3] bg-[linear-gradient(160deg,#F8FBFF_0%,#FFFFFF_100%)] p-6 shadow-[0_16px_40px_rgba(21,49,83,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6E87A2]">
              Зачем смотреть этот вариант
            </p>
            <p className="mt-4 text-[15px] leading-7 text-[#49617C] md:text-base">
              Он показывает верхнюю границу метафоры карточной колоды: насколько можно добавить
              ощущение shuffle/fan без потери делового тона, читаемости и управляемости на
              мобильном.
            </p>
          </article>

          <article className="rounded-[28px] border border-[#DCE7F3] bg-[linear-gradient(160deg,#F3F8FF_0%,#FFFFFF_100%)] p-6 shadow-[0_16px_40px_rgba(21,49,83,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6E87A2]">
              На что смотреть в сравнении
            </p>
            <p className="mt-4 text-[15px] leading-7 text-[#49617C] md:text-base">
              Если в реальном использовании взгляд быстро понимает структуру, а hover/focus/tap
              не требуют расшифровки, значит метафора работает. Если же карта выглядит эффектно,
              но требует привыкания, значит паттерн уже слишком декоративен.
            </p>
          </article>
        </section>
      </Container>
    </main>
  );
}
