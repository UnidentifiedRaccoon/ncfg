import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const spaces = [
  ["space-1", "--space-1", "4px", "Минимальный gap, padding иконок", "w-[var(--space-1)]"],
  ["space-2", "--space-2", "8px", "Gap внутри компактной группы", "w-[var(--space-2)]"],
  ["space-3", "--space-3", "12px", "Вертикальный padding кнопок", "w-[var(--space-3)]"],
  ["space-4", "--space-4", "16px", "Padding карточек, gap колонок", "w-[var(--space-4)]"],
  ["space-6", "--space-6", "24px", "Отступ между параграфами", "w-[var(--space-6)]"],
  ["space-8", "--space-8", "32px", "Отступ между блоками", "w-[var(--space-8)]"],
  ["space-12", "--space-12", "48px", "Padding секций на mobile", "w-[var(--space-12)]"],
  ["space-16", "--space-16", "64px", "Padding секций на tablet/desktop", "w-[var(--space-16)]"],
  ["space-20", "--space-20", "80px", "Крупный секционный ритм", "w-[var(--space-20)]"],
  ["space-24", "--space-24", "96px", "Большой отступ", "w-[var(--space-24)]"],
] as const;

function SpacingPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 md:px-10">
      <div className="mx-auto max-w-[1040px]">
        <h1 className="text-4xl font-bold text-[#1E3A5F]">Spacing</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#475569]">
          Базовая единица системы — 4px. CSS variables используются как
          документируемая шкала, а Tailwind-классы применяются в компонентах.
        </p>

        <section className="mt-10 divide-y divide-[#E2E8F0] rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
          {spaces.map(([name, variable, value, usage, widthClass]) => (
            <div className="grid gap-4 p-5 md:grid-cols-[180px_1fr_260px]" key={variable}>
              <div>
                <p className="font-mono font-semibold text-[#1E3A5F]">{name}</p>
                <p className="text-sm text-[#475569]">{variable} · {value}</p>
              </div>
              <div className="flex items-center">
                <div className={`h-4 rounded-sm bg-[#3B82F6] ${widthClass}`} />
              </div>
              <p className="text-sm leading-6 text-[#475569]">{usage}</p>
            </div>
          ))}
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1E3A5F]">Section</h2>
            <p className="mt-2 text-sm leading-6 text-[#475569]">
              Реальный `Section`: <span className="font-mono">py-12 md:py-16</span>.
            </p>
          </article>
          <article className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1E3A5F]">Container</h2>
            <p className="mt-2 text-sm leading-6 text-[#475569]">
              Реальный `Container`: <span className="font-mono">px-4 md:px-6 lg:px-8</span>.
            </p>
          </article>
          <article className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1E3A5F]">Content gap</h2>
            <p className="mt-2 text-sm leading-6 text-[#475569]">
              Заголовок секции отделяется от контента через{" "}
              <span className="font-mono">mb-10 md:mb-12</span>.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}

const meta = {
  title: "Design System/Spacing",
  component: SpacingPage,
} satisfies Meta<typeof SpacingPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Docs: Story = {};
