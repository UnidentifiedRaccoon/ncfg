import { Section } from "@/shared/ui/Section";
import type { ExpertsLabItem } from "./ExpertsLab.types";
import { VariantAdvisoryPrime } from "./VariantAdvisoryPrime";
import { VariantCapitalRibbon } from "./VariantCapitalRibbon";
import { VariantTrustLedger } from "./VariantTrustLedger";

interface ExpertsLabProps {
  items: ExpertsLabItem[];
}

const variantAnchors = [
  { id: "variant-signal-rail", label: "Signal Rail (Base)" },
  { id: "variant-signal-panel", label: "Signal Panel" },
  { id: "variant-dossier-board", label: "Dossier Board" },
] as const;

export function ExpertsLab({ items }: ExpertsLabProps) {
  const hasItems = items.length > 0;

  return (
    <>
      <Section
        id="experts-lab"
        title="Лаборатория блока «Наши эксперты» v2"
        lead="Signal Rail принят за основу. Остальные концепты построены на этом же карточном языке."
      >
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Навигация по концептам" className="flex flex-wrap justify-center gap-2">
            {variantAnchors.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="inline-flex items-center rounded-full border border-[#E2E8F0]/80 bg-white px-4 py-2 text-sm font-semibold text-[#1E3A5F] transition-colors hover:border-[#3B82F6]/30 hover:text-[#3B82F6]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <p className="mt-5 text-center text-sm leading-relaxed text-[#475569] md:text-base">
            Во всех блоках один и тот же набор экспертов, чтобы сравнение отражало именно визуальную архитектуру.
          </p>
        </div>
      </Section>

      {!hasItems ? (
        <Section title="Эксперты временно недоступны" background="gray">
          <div className="mx-auto max-w-3xl rounded-2xl border border-[#E2E8F0]/80 bg-white p-6 text-center shadow-sm md:p-8">
            <p className="text-base leading-relaxed text-[#475569]">
              Не удалось получить список внешних экспертов. Когда данные появятся, здесь автоматически отрисуются все 3 варианта.
            </p>
          </div>
        </Section>
      ) : (
        <>
          <Section
            id="variant-signal-rail"
            title="1. Signal Rail (Base)"
            lead="Базовая версия: простые карточки в горизонтальной прокрутке с ярким акцентом на годах опыта."
            background="gray"
          >
            <VariantCapitalRibbon items={items} />
          </Section>

          <Section
            id="variant-signal-panel"
            title="2. Signal Panel"
            lead="Сетка на базе Signal-стиля: ведущий профиль + компактные карточки остальных."
          >
            <VariantAdvisoryPrime items={items} />
          </Section>

          <Section
            id="variant-dossier-board"
            title="3. Dossier Board"
            lead="Формальный B2B-подход: модульное досье, строгая структура и минимальный визуальный шум."
            background="gray"
          >
            <VariantTrustLedger items={items} />
          </Section>

          <Section title="Когда какой вариант выбирать">
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-[#1E3A5F]">Signal Rail (Base)</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  Базовый паттерн для дальнейшей разработки: простая лента, читаемые лейблы и чёткий акцент на стаже.
                </p>
              </article>

              <article className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-[#1E3A5F]">Signal Panel</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  Производная от базового стиля для разделов, где нужна большая вертикальная структура без отказа от простых карточек.
                </p>
              </article>

              <article className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-[#1E3A5F]">Dossier Board</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  Для B2B и формальных разделов, где приоритетом являются доверие, строгий формат и простота сравнения экспертов.
                </p>
              </article>
            </div>
          </Section>
        </>
      )}
    </>
  );
}
