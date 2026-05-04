import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MarkdownContent } from "@/shared/ui";

const sampleMarkdown = `
## Как мы объясняем финансовые решения

НЦФГ пишет материалы так, чтобы человек быстро понял **смысл, риск и следующий шаг**.

### Основные правила

- короткие предложения;
- один тезис в одном абзаце;
- понятные примеры без канцелярита.

> Хороший материал помогает принять решение, а не создаёт ощущение давления.

| Формат | Задача |
| --- | --- |
| Статья | Объяснить тему |
| Чек-лист | Помочь проверить себя |
| Вебинар | Разобрать вопросы |

Подробнее можно оформить как [текстовую ссылку](/blog).

\`post-content\` задаёт стили для inline code.
`;

const meta = {
  title: "Content/MarkdownContent",
  component: MarkdownContent,
  args: {
    content: sampleMarkdown,
    className: "post-content",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Реальный MarkdownContent с react-markdown и remark-gfm. В stories используется mock markdown без live-запросов к Strapi.",
      },
    },
  },
} satisfies Meta<typeof MarkdownContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PostContent: Story = {
  render: (args) => (
    <main className="min-h-screen bg-white px-6 py-12 md:px-10">
      <article className="mx-auto max-w-[760px]">
        <header className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#3B82F6]">
            Markdown content
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-[#1E3A5F]">
            Контентная колонка статьи
          </h1>
        </header>
        <MarkdownContent {...args} />
      </article>
    </main>
  ),
};
