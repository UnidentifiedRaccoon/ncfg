import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const brandColors = [
  {
    name: "Primary",
    variable: "--color-primary",
    value: "#1E3A5F",
    usage: "Заголовки, навигация, футер",
    swatchClass: "bg-[var(--color-primary)]",
  },
  {
    name: "Secondary",
    variable: "--color-secondary",
    value: "#3B82F6",
    usage: "Ссылки, вторичные действия, иконки",
    swatchClass: "bg-[var(--color-secondary)]",
  },
  {
    name: "Accent",
    variable: "--color-accent",
    value: "#58A8E0",
    usage: "CTA, акцентные элементы, hover",
    swatchClass: "bg-[var(--color-accent)]",
  },
];

const grayColors = [
  ["White", "--color-white", "#FFFFFF", "bg-[var(--color-white)]"],
  ["Gray 50", "--color-gray-50", "#F8FAFC", "bg-[var(--color-gray-50)]"],
  ["Gray 100", "--color-gray-100", "#F1F5F9", "bg-[var(--color-gray-100)]"],
  ["Gray 200", "--color-gray-200", "#E2E8F0", "bg-[var(--color-gray-200)]"],
  ["Gray 400", "--color-gray-400", "#94A3B8", "bg-[var(--color-gray-400)]"],
  ["Gray 600", "--color-gray-600", "#475569", "bg-[var(--color-gray-600)]"],
  ["Gray 900", "--color-gray-900", "#0F172A", "bg-[var(--color-gray-900)]"],
] as const;

const semanticColors = [
  ["Success", "--color-success", "#10B981", "bg-[var(--color-success)]"],
  ["Warning", "--color-warning", "#F59E0B", "bg-[var(--color-warning)]"],
  ["Error", "--color-error", "#EF4444", "bg-[var(--color-error)]"],
] as const;

function ColorCard({
  name,
  variable,
  value,
  usage,
  swatchClass,
}: {
  name: string;
  variable: string;
  value: string;
  usage?: string;
  swatchClass: string;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <div className={`h-24 border-b border-[#E2E8F0] ${swatchClass}`} />
      <div className="p-4">
        <h3 className="font-semibold text-[#1E3A5F]">{name}</h3>
        <dl className="mt-3 space-y-1 text-sm text-[#475569]">
          <div className="flex justify-between gap-4">
            <dt>Variable</dt>
            <dd className="font-mono text-[#0F172A]">{variable}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>HEX</dt>
            <dd className="font-mono text-[#0F172A]">{value}</dd>
          </div>
        </dl>
        {usage ? <p className="mt-3 text-sm leading-6 text-[#475569]">{usage}</p> : null}
      </div>
    </article>
  );
}

function ColorsPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-6 py-12 md:px-10">
      <div className="mx-auto max-w-[1120px]">
        <h1 className="text-4xl font-bold text-[#1E3A5F]">Цвета</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#475569]">
          Палитра берётся из CSS variables в{" "}
          <code className="rounded-sm bg-white px-1.5 py-0.5 text-sm">
            app/globals.css
          </code>
          . Tailwind-классы используют эти же значения через{" "}
          <code className="rounded-sm bg-white px-1.5 py-0.5 text-sm">@theme inline</code>.
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-[#1E3A5F]">Brand colors</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {brandColors.map((color) => (
              <ColorCard key={color.variable} {...color} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-[#1E3A5F]">Gray scale</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {grayColors.map(([name, variable, value, swatchClass]) => (
              <ColorCard
                key={variable}
                name={name}
                variable={variable}
                value={value}
                swatchClass={swatchClass}
              />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-[#1E3A5F]">Semantic colors</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {semanticColors.map(([name, variable, value, swatchClass]) => (
              <ColorCard
                key={variable}
                name={name}
                variable={variable}
                value={value}
                swatchClass={swatchClass}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

const meta = {
  title: "Design System/Colors",
  component: ColorsPage,
} satisfies Meta<typeof ColorsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Docs: Story = {};
