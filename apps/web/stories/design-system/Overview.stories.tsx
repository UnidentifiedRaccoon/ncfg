import type { Meta, StoryObj } from "@storybook/nextjs-vite";

function OverviewPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-[#0F172A] md:px-10">
      <div className="mx-auto max-w-[1040px]">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#3B82F6]">
          NCFG design system
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight text-[#1E3A5F] md:text-5xl">
          Единая визуальная система для сайта НЦФГ
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#475569]">
          Storybook фиксирует текущие токены, типографику, layout primitives и
          контентные стили из проекта. Источники истины:{" "}
          <code className="rounded-sm bg-[#F1F5F9] px-1.5 py-0.5 text-sm">
            DESIGN.md
          </code>
          ,{" "}
          <code className="rounded-sm bg-[#F1F5F9] px-1.5 py-0.5 text-sm">
            POST_DESIGN.md
          </code>{" "}
          и{" "}
          <code className="rounded-sm bg-[#F1F5F9] px-1.5 py-0.5 text-sm">
            app/globals.css
          </code>
          .
        </p>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Простота",
              text: "Минимум декоративного шума. Интерфейс помогает быстро понять смысл блока.",
            },
            {
              title: "Иерархия",
              text: "Цвет, размер, отступ и контраст показывают, что главное, а что вторично.",
            },
            {
              title: "Доверие",
              text: "Сдержанная банковская эстетика поддерживает экспертный и деловой тон.",
            },
          ].map((item) => (
            <article
              className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 shadow-sm"
              key={item.title}
            >
              <h2 className="text-xl font-semibold text-[#1E3A5F]">
                {item.title}
              </h2>
              <p className="mt-3 leading-7 text-[#475569]">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-2xl bg-[#0B1324] p-6 text-white md:p-8">
          <h2 className="text-2xl font-bold">Что здесь документировано</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Цвета: primary, secondary, accent, gray scale, semantic colors.",
              "Типографика: font stack, Tailwind scale, русские примеры.",
              "Отступы, радиусы и тени из CSS variables.",
              "Реальные primitives: Button, Container, Section, MarkdownContent.",
            ].map((item) => (
              <div
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/80"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

const meta = {
  title: "Design System/Overview",
  component: OverviewPage,
  parameters: {
    docs: {
      description: {
        component:
          "Обзор текущей дизайн-системы NCFG на основе DESIGN.md, POST_DESIGN.md и app/globals.css.",
      },
    },
  },
} satisfies Meta<typeof OverviewPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Docs: Story = {};
