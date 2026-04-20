import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PanelsTopLeft } from "lucide-react";

import { buildPageMetadata } from "@/shared/lib/metadata";
import { Container } from "@/shared/ui/Container";
import { MissionPatternEditorialStack } from "@/widgets/MissionPatternEditorialStack";

export const metadata: Metadata = buildPageMetadata({
  path: "/mission-lab/editorial-stack",
  title: "Mission Lab: Editorial Stack",
  description:
    "Editorial Stack — demo-вариант блока миссии НЦФГ с последовательными карточками-манифестами и pinned stack подачей.",
  robots: {
    index: false,
    follow: false,
  },
});

const comparisonPoints = [
  "Карточки должны читаться и без эффекта: сначала формулировка, затем пояснение и смысл результата.",
  "На desktop вариант собирается в layered pinned stack, а на mobile распадается в обычную последовательность без поломки ритма.",
  "Якорная навигация и focus-visible позволяют быстро проходить направления клавиатурой и сравнивать их по очереди.",
] as const;

export default function MissionEditorialStackPage() {
  return (
    <main className="bg-[linear-gradient(180deg,#F7FBFF_0%,#FFFFFF_18%,#FFFFFF_100%)] pb-20">
      <Container className="pt-12 md:pt-16">
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

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-start">
          <div className="max-w-[560px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D7E5F2] bg-white/88 px-4 py-2 text-sm font-medium text-[#153153] shadow-[0_10px_30px_rgba(21,49,83,0.05)]">
              <PanelsTopLeft className="h-4 w-4 text-[#1D4ED8]" aria-hidden="true" />
              <span>Editorial Stack</span>
            </div>

            <h1 className="mt-5 text-[36px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#153153] md:text-[56px]">
              Demo-страница для mission/value секции в editorial ритме
            </h1>
            <p className="mt-5 max-w-[48ch] text-base leading-7 text-[#52657D] md:text-lg">
              Здесь миссия подана как серия спокойных манифестов. Вместо одного активного
              состояния на hover пользователь видит четыре самостоятельные карточки и считывает
              их как связанную последовательность.
            </p>
          </div>

          <div className="rounded-[30px] border border-[#D8E5F2] bg-white/90 p-6 shadow-[0_18px_50px_rgba(21,49,83,0.07)] md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D84A0]">
              Что проверяем в варианте
            </p>
            <ul className="mt-5 space-y-4 text-[15px] leading-7 text-[#486079]">
              {comparisonPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#93C5FD]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <Container className="mt-12 md:mt-16">
        <MissionPatternEditorialStack embedded headingAs="h2" />
      </Container>
    </main>
  );
}
