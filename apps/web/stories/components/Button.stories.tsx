import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/shared/ui";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Реальный shared/ui Button: variants primary, secondary, ghost; sizes sm, md, lg; button и link modes.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
  args: {
    children: "Оставить заявку",
    variant: "primary",
    size: "md",
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex min-h-screen items-start bg-white p-8">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="primary">Оставить заявку</Button>
        <Button variant="secondary">Смотреть услуги</Button>
        <Button variant="ghost">Подробнее</Button>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex min-h-screen items-start bg-white p-8">
      <div className="flex flex-wrap items-center gap-4">
        <Button size="sm">Малая</Button>
        <Button size="md">Средняя</Button>
        <Button size="lg">Большая</Button>
      </div>
    </div>
  ),
};

export const LinkAndDisabled: Story = {
  render: () => (
    <div className="flex min-h-screen items-start bg-white p-8">
      <div className="flex flex-wrap items-center gap-4">
        <Button href="#lead-form">Ссылка на форму</Button>
        <Button disabled>Недоступно</Button>
      </div>
    </div>
  ),
};
