import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Container } from "@/shared/ui";

function ContainerDemo() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12">
      <Container>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#3B82F6]">
            Container
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[#1E3A5F]">
            Реальный max-width и responsive padding
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-[#475569]">
            Компонент задаёт <span className="font-mono">max-w-[1200px]</span>,{" "}
            <span className="font-mono">mx-auto</span> и padding{" "}
            <span className="font-mono">px-4 md:px-6 lg:px-8</span>.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["Левый край", "Центральный контент", "Правый край"].map((item) => (
              <div
                className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm text-[#475569]"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}

const meta = {
  title: "Layout/Container",
  component: Container,
  args: {
    children: null,
  },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ContainerDemo />,
};
