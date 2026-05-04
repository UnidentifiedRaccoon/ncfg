import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Section } from "@/shared/ui";

const meta = {
  title: "Layout/Section",
  component: Section,
  args: {
    children: null,
    title: "Финансовое благополучие без сложных терминов",
    lead: "Секция держит стандартный ритм сайта: заголовок, lead и контент в Container.",
    background: "white",
    reveal: false,
  },
  argTypes: {
    background: {
      control: "select",
      options: ["white", "gray"],
    },
  },
} satisfies Meta<typeof Section>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <main className="min-h-screen bg-white">
      <Section {...args}>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            "Диагностика текущего состояния",
            "Обучение понятным финансовым решениям",
            "Поддержка после внедрения программы",
          ].map((item) => (
            <article
              className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
              key={item}
            >
              <h3 className="text-lg font-semibold text-[#1E3A5F]">{item}</h3>
              <p className="mt-2 text-sm leading-6 text-[#475569]">
                Mock content для Storybook без запросов к Strapi.
              </p>
            </article>
          ))}
        </div>
      </Section>
    </main>
  ),
};

export const GrayWithDivider: Story = {
  args: {
    background: "gray",
    dividerTop: true,
    title: "Секция на сером фоне",
    lead: "Divider применяется между соседними секциями с одинаковым фоном.",
  },
  render: (args) => (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Section {...args} reveal={false}>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <p className="leading-7 text-[#475569]">
            Реальный компонент сохраняет общий секционный ритм и вложенный Container.
          </p>
        </div>
      </Section>
    </main>
  ),
};
