import { BentoCard } from "./BentoCard";

interface ServiceItem {
  title: string;
  description: string;
  href: string;
  icon: string;
}

interface ServiceBlockProps {
  id: string;
  index: number;
  total: number;
  title: string;
  description: string;
  items: ServiceItem[];
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatServiceCount(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  const word =
    mod10 === 1 && mod100 !== 11
      ? "услуга"
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? "услуги"
        : "услуг";

  return `${count} ${word}`;
}

export function ServiceBlock({
  id,
  index,
  total,
  title,
  description,
  items,
}: ServiceBlockProps) {
  const anchorId = `services-${id}`;
  const number = pad2(index + 1);
  const totalFormatted = pad2(total);

  return (
    <section id={anchorId} className="scroll-mt-24">
      <div className="rounded-2xl bg-gradient-to-br from-[#58A8E0]/35 via-[#3B82F6]/15 to-[#1E3A5F]/10 p-px">
        <div className="relative overflow-hidden rounded-2xl bg-[#F8FAFC] p-4 md:p-6">
          {/* Background atmosphere (subtle) */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,rgba(30,58,95,0.20)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,58,95,0.20)_1px,transparent_1px)] bg-[size:64px_64px]" />
            <div className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-[#3B82F6]/12 blur-3xl" />
            <div className="absolute -bottom-44 left-1/4 h-[560px] w-[560px] rounded-full bg-[#58A8E0]/10 blur-3xl" />
          </div>

          <div className="relative">
            <header className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-start md:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0]/70 bg-white/70 px-3 py-1 text-xs font-semibold text-[#1E3A5F] backdrop-blur">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[#58A8E0]"
                    aria-hidden="true"
                  />
                  {number} / {totalFormatted}
                </div>

                <h3 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-[#1E3A5F] md:text-3xl">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#475569] md:text-base">
                  {description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-[#E2E8F0]/70 bg-white/70 px-3 py-1 text-xs font-semibold text-[#1E3A5F] backdrop-blur">
                  {formatServiceCount(items.length)}
                </span>
              </div>
            </header>

            {renderGrid(items)}
          </div>
        </div>
      </div>
    </section>
  );
}

function renderGrid(items: ServiceItem[]) {
  // 5 items: top row (featured spanning 2 cols + 1), bottom row (3 equal)
  if (items.length === 5) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:gap-6">
        <BentoCard {...items[0]} featured className="md:col-span-2" />
        <BentoCard {...items[1]} />
        <BentoCard {...items[2]} />
        <BentoCard {...items[3]} />
        <BentoCard {...items[4]} />
      </div>
    );
  }

  // 3 items: featured left (2 cols, 2 rows), stacked right
  if (items.length === 3) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2 md:gap-5 lg:gap-6">
        <BentoCard
          {...items[0]}
          featured
          className="md:col-span-2 md:row-span-2"
        />
        <BentoCard {...items[1]} />
        <BentoCard {...items[2]} />
      </div>
    );
  }

  // 2 items: 60/40 split
  if (items.length === 2) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-5 lg:gap-6">
        <BentoCard {...items[0]} featured className="md:col-span-3" />
        <BentoCard {...items[1]} className="md:col-span-2" />
      </div>
    );
  }

  // Default: responsive grid
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
      {items.map((item) => (
        <BentoCard key={item.href} {...item} />
      ))}
    </div>
  );
}
