import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  GalleryHorizontalEnd,
} from "lucide-react";

import { buildPageMetadata } from "@/shared/lib/metadata";
import { Container } from "@/shared/ui/Container";

export const metadata: Metadata = buildPageMetadata({
  path: "/experiments",
  title: "Эксперименты интерфейса",
  description:
    "Изолированные прототипы интерфейса НЦФГ для проверки структуры, адаптивности и поведения до переноса на основной сайт.",
  robots: {
    index: false,
    follow: false,
  },
});

const EXPERIMENTS = [
  {
    href: "/experiments/seasonal-offer-hero",
    title: "Hero сезонного офера",
    description:
      "Пять motion-концепций первого экрана: люди, финансовая опора, типографика и синтез подходов.",
    icon: GalleryHorizontalEnd,
  },
] as const;

export default function ExperimentsPage() {
  return (
    <main className="min-h-screen bg-[#07111F] text-white">
      <section className="relative isolate min-h-screen overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(88,168,224,0.25),transparent_34%),radial-gradient(circle_at_88%_72%,rgba(59,130,246,0.2),transparent_40%)]"
        />

        <Container className="relative py-8 md:py-12 lg:py-16">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-semibold text-[#D7E6F7] transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            На главную
          </Link>

          <div className="mt-14 max-w-4xl md:mt-20">
            <h1 className="text-balance text-5xl font-bold leading-[0.98] tracking-[-0.035em] text-white md:text-7xl">
              Эксперименты
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#C8D8ED] md:text-xl">
              Изолированные прототипы интерфейса НЦФГ для проверки структуры,
              адаптивности и поведения до переноса на основной сайт.
            </p>
          </div>

          <section className="mt-14 md:mt-20" aria-labelledby="available-experiments">
            <h2
              id="available-experiments"
              className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
            >
              Доступные эксперименты
            </h2>

            <ul className="mt-6 border-t border-white/15">
              {EXPERIMENTS.map(({ description, href, icon: Icon, title }) => (
                <li key={href} className="border-b border-white/15">
                  <Link
                    href={href}
                    className="group grid min-h-24 grid-cols-[auto_1fr_auto] items-center gap-4 py-5 text-left md:gap-6"
                  >
                    <Icon
                      className="h-6 w-6 text-[#7CC4F4]"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white md:text-xl">
                        {title}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#AFC5DE] md:text-base">
                        {description}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="h-5 w-5 text-[#AFC5DE] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-10 max-w-3xl border-t border-white/15 pt-6 text-sm leading-relaxed text-[#AFC5DE] md:text-base">
            Здесь собраны все активные лаборатории. После принятия решения эксперимент
            удаляется из списка, а временные варианты — из кода.
          </p>
        </Container>
      </section>
    </main>
  );
}
