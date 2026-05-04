import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const typeScale = [
  ["text-xs", "12px", "16px", "Подпись: финансовая ясность начинается с простых слов."],
  ["text-sm", "14px", "20px", "Мета-текст: обновлено сегодня, 10:30."],
  ["text-base", "16px", "24px", "Основной текст: НЦФГ помогает людям и компаниям принимать взвешенные финансовые решения."],
  ["text-lg", "18px", "28px", "Lead: команда объясняет сложные продукты коротко, спокойно и по делу."],
  ["text-xl", "20px", "28px", "Подзаголовок: персональные рекомендации без лишнего давления."],
  ["text-2xl", "24px", "32px", "Карточный заголовок: финансовое благополучие"],
  ["text-3xl", "30px", "36px", "Раздел: решения для сотрудников"],
  ["text-4xl", "36px", "40px", "Крупный заголовок секции"],
  ["text-5xl", "48px", "52px", "Главный экран сайта"],
  ["text-6xl", "60px", "64px", "Hero сообщение"],
] as const;

function TypographyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 md:px-10">
      <div className="mx-auto max-w-[1120px]">
        <h1 className="text-4xl font-bold text-[#1E3A5F]">Типографика</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#475569]">
          Сайт использует Inter через{" "}
          <code className="rounded-sm bg-[#F1F5F9] px-1.5 py-0.5 text-sm">next/font/google</code>{" "}
          и CSS variables из Tailwind theme.
        </p>

        <section className="mt-10 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
          <h2 className="text-2xl font-semibold text-[#1E3A5F]">Font stack</h2>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="font-semibold text-[#1E3A5F]">Sans</p>
              <p className="mt-2 font-mono leading-6 text-[#475569]">
                &quot;Inter&quot;, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto,
                &quot;Helvetica Neue&quot;, Arial, sans-serif
              </p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="font-semibold text-[#1E3A5F]">Mono</p>
              <p className="mt-2 font-mono leading-6 text-[#475569]">
                &quot;JetBrains Mono&quot;, &quot;Fira Code&quot;, Consolas, monospace
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-[#1E3A5F]">Tailwind scale</h2>
          <div className="mt-5 divide-y divide-[#E2E8F0] rounded-2xl border border-[#E2E8F0] bg-white">
            {typeScale.map(([token, size, lineHeight, sample]) => (
              <div className="grid gap-4 p-5 lg:grid-cols-[160px_1fr]" key={token}>
                <div className="text-sm text-[#475569]">
                  <p className="font-mono font-semibold text-[#1E3A5F]">{token}</p>
                  <p>{size} / {lineHeight}</p>
                </div>
                <p className={`${token} leading-tight text-[#0F172A]`}>{sample}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl bg-[#F8FAFC] p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-[#1E3A5F]">Semantic examples</h2>
          <div className="mt-6 space-y-6">
            <div>
              <p className="text-sm font-semibold text-[#3B82F6]">H1</p>
              <p className="mt-1 text-[32px] font-bold leading-tight text-[#1E3A5F] md:text-[42px]">
                Финансовое благополучие сотрудников
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3B82F6]">H2</p>
              <p className="mt-1 text-[28px] font-bold leading-tight text-[#1E3A5F] md:text-4xl lg:text-[48px]">
                Программы для компаний
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3B82F6]">H3</p>
              <p className="mt-1 text-3xl font-bold leading-tight text-[#1E3A5F]">
                Обучение и консультации
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3B82F6]">H4</p>
              <p className="mt-1 text-lg font-semibold text-[#1E3A5F]">
                Диагностика финансового стресса
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3B82F6]">Body</p>
              <p className="mt-1 max-w-2xl text-base leading-6 text-[#0F172A]">
                Мы помогаем разобраться в финансовых вопросах без сложных терминов и
                давления. Каждый материал должен быть понятен после первого чтения.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3B82F6]">Lead</p>
              <p className="mt-1 max-w-2xl text-lg leading-8 text-[#475569] md:text-xl">
                Короткое объяснение ценности блока: что человек получит и почему это важно.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3B82F6]">Caption</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.02em] text-[#94A3B8]">
                Данные обновляются после проверки редактором
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

const meta = {
  title: "Design System/Typography",
  component: TypographyPage,
} satisfies Meta<typeof TypographyPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Docs: Story = {};
