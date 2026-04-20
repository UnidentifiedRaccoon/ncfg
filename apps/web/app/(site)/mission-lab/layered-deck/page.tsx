import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Layers3, MousePointer2 } from "lucide-react";

import { MissionPatternLayeredDeck } from "@/widgets/MissionPatternLayeredDeck";
import { buildPageMetadata } from "@/shared/lib/metadata";
import { Container } from "@/shared/ui/Container";

export const metadata: Metadata = buildPageMetadata({
  path: "/mission-lab/layered-deck",
  title: "Mission Lab — layered deck",
  description:
    "Standalone demo-страница layered deck для блока миссии НЦФГ: три видимых слоя, контролы и mobile fallback.",
  robots: {
    index: false,
    follow: false,
  },
});

const checkpoints = [
  "Колода держит в кадре три направления сразу, но не перегружает чтение.",
  "Активный слой можно выбрать hover, focus, click или tap без лишней анимационной механики.",
  "На мобильном экране паттерн схлопывается в один основной слой с теми же контролами.",
] as const;

const behaviorNotes = [
  {
    title: "Сцена на десктопе",
    text: "Передний слой читабелен как основной манифест, два задних дают ощущение глубины и очереди.",
    icon: Layers3,
  },
  {
    title: "Контролы",
    text: "Слева остаётся спокойная зона управления, где можно быстро сравнить четыре направления без охоты за hotspot-ами.",
    icon: MousePointer2,
  },
  {
    title: "Анимация",
    text: "Только translate, scale и opacity. Этого достаточно, чтобы паттерн ощущался premium, но не выглядел игрушечно.",
    icon: CheckCircle2,
  },
] as const;

export default function LayeredDeckMissionLabPage() {
  return (
    <main className="bg-[linear-gradient(180deg,#F7FBFF_0%,#FFFFFF_18%,#F8FBFF_100%)] pb-20">
      <Container className="pt-12 md:pt-16">
        <Link
          href="/mission-lab"
          className="inline-flex items-center gap-2 rounded-full border border-[#D8E4F2] bg-white/88 px-4 py-2 text-sm font-medium text-[#1E3A5F] transition-colors hover:border-[#BFDBFE] hover:text-[#163B6B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Ко всем вариантам Mission Lab</span>
        </Link>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:items-start">
          <div className="max-w-[34rem]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4C83D5]">
              Mission Lab / вариант 01
            </p>
            <h1 className="mt-4 text-[34px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#153153] md:text-[56px]">
              Layered deck для блока миссии
            </h1>
            <p className="mt-5 max-w-[42ch] text-base leading-7 text-[#52657D] md:text-lg">
              В этом варианте миссия подаётся как управляемая колода: одно направление читается
              полноценно, ещё два остаются в поле зрения и поддерживают ощущение глубины.
            </p>

            <ul className="mt-7 grid gap-3 text-sm leading-6 text-[#34516F] md:text-[15px]">
              {checkpoints.map((item) => (
                <li
                  key={item}
                  className="rounded-[22px] border border-[#D9E5F2] bg-white/90 px-4 py-3 shadow-[0_14px_34px_rgba(18,45,78,0.05)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4">
            {behaviorNotes.map((note) => {
              const Icon = note.icon;

              return (
                <article
                  key={note.title}
                  className="rounded-[28px] border border-[#DCE7F3] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(245,249,255,0.94)_100%)] p-5 shadow-[0_18px_42px_rgba(18,45,78,0.06)] md:p-6"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D7E3F2] bg-white text-[#1E3A5F]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#153153]">
                        {note.title}
                      </h2>
                      <p className="mt-2 max-w-[50ch] text-sm leading-6 text-[#52657D] md:text-[15px]">
                        {note.text}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Container>

      <MissionPatternLayeredDeck />

      <Container className="pt-2">
        <div className="rounded-[30px] border border-[#DCE7F3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,249,255,0.94)_100%)] p-6 shadow-[0_18px_45px_rgba(18,45,78,0.06)] md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[40rem]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7390B2]">
                Почему этот вариант сильный
              </p>
              <p className="mt-3 text-base leading-7 text-[#34516F] md:text-lg">
                Он оставляет секцию выразительной, но не зависит от сложной анимации или тяжёлой
                клиентской логики. Это один из самых реалистичных кандидатов для продового
                внедрения после выбора визуального направления.
              </p>
            </div>

            <Link
              href="/mission-lab"
              className="inline-flex items-center gap-2 self-start rounded-full border border-[#CADBEE] bg-white px-4 py-2.5 text-sm font-semibold text-[#153153] shadow-[0_10px_24px_rgba(18,45,78,0.06)] transition-all duration-200 hover:border-[#93C5FD] hover:text-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            >
              <span>Сравнить с другими вариантами</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
