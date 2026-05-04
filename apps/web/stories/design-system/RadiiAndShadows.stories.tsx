import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const radii = [
  ["radius-sm", "--radius-sm", "4px", "Badges, chips", "rounded-[var(--radius-sm)]"],
  ["radius", "--radius", "6px", "Базовое скругление", "rounded-[var(--radius)]"],
  ["radius-md", "--radius-md", "8px", "Inputs", "rounded-[var(--radius-md)]"],
  ["radius-lg", "--radius-lg", "12px", "Buttons", "rounded-[var(--radius-lg)]"],
  ["radius-xl", "--radius-xl", "16px", "Cards", "rounded-[var(--radius-xl)]"],
  ["radius-2xl", "--radius-2xl", "24px", "Sections, hero blocks", "rounded-[var(--radius-2xl)]"],
] as const;

const shadows = [
  ["shadow-sm", "--shadow-sm", "Subtle lift", "shadow-[var(--shadow-sm)]"],
  ["shadow", "--shadow", "Cards default", "shadow-[var(--shadow)]"],
  ["shadow-md", "--shadow-md", "Cards hover", "shadow-[var(--shadow-md)]"],
  ["shadow-lg", "--shadow-lg", "Dropdowns, modals", "shadow-[var(--shadow-lg)]"],
  ["shadow-xl", "--shadow-xl", "Large modals", "shadow-[var(--shadow-xl)]"],
] as const;

function RadiiAndShadowsPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-6 py-12 md:px-10">
      <div className="mx-auto max-w-[1040px]">
        <h1 className="text-4xl font-bold text-[#1E3A5F]">Radii & Shadows</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#475569]">
          Скругления и тени берутся из CSS variables. В компонентах они задают
          иерархию: buttons → cards → sections.
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-[#1E3A5F]">Border radius</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {radii.map(([name, variable, value, usage, radiusClass]) => (
              <article className="rounded-xl border border-[#E2E8F0] bg-white p-5" key={variable}>
                <div className={`h-24 bg-[#3B82F6]/10 ring-1 ring-[#3B82F6]/20 ${radiusClass}`} />
                <h3 className="mt-4 font-mono font-semibold text-[#1E3A5F]">{name}</h3>
                <p className="mt-1 text-sm text-[#475569]">{variable} · {value}</p>
                <p className="mt-2 text-sm leading-6 text-[#475569]">{usage}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-[#1E3A5F]">Shadows</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shadows.map(([name, variable, usage, shadowClass]) => (
              <article className={`rounded-xl border border-[#E2E8F0] bg-white p-6 ${shadowClass}`} key={variable}>
                <h3 className="font-mono font-semibold text-[#1E3A5F]">{name}</h3>
                <p className="mt-1 text-sm text-[#475569]">{variable}</p>
                <p className="mt-4 text-sm leading-6 text-[#475569]">{usage}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

const meta = {
  title: "Design System/Radii & Shadows",
  component: RadiiAndShadowsPage,
} satisfies Meta<typeof RadiiAndShadowsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Docs: Story = {};
