import { cn } from "@/shared/lib/cn";
import type { ServiceCatalogVariant } from "./ServiceCatalog";
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
  showBadges: boolean;
  title: string;
  description: string;
  items: ServiceItem[];
  variant: ServiceCatalogVariant;
  idBase: string;
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
  showBadges,
  title,
  description,
  items,
  variant,
  idBase,
}: ServiceBlockProps) {
  const anchorId = `${idBase}-${id}`;
  const number = pad2(index + 1);
  const totalFormatted = pad2(total);

  return (
    <section
      id={anchorId}
      className={cn(
        "scroll-mt-24",
        // Light separation between groups without an extra "stage" wrapper.
        index > 0 && "border-t border-[#E2E8F0] pt-10 md:pt-12"
      )}
      >
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          {showBadges && (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0]/70 bg-white/70 px-3 py-1 text-xs font-semibold text-[#1E3A5F] backdrop-blur">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#58A8E0]"
                aria-hidden="true"
              />
              {number} / {totalFormatted}
            </div>
          )}

          <h3 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-[#1E3A5F] md:text-3xl">
            {title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[#475569] md:text-base">
            {description}
          </p>
        </div>

        {showBadges && (
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[#E2E8F0]/70 bg-white/70 px-3 py-1 text-xs font-semibold text-[#1E3A5F] backdrop-blur">
              {formatServiceCount(items.length)}
            </span>
          </div>
        )}
      </header>

      <div className="mt-6 md:mt-8">{renderGrid(items, variant)}</div>
    </section>
  );
}

function renderGrid(items: ServiceItem[], variant: ServiceCatalogVariant) {
  if (items.length === 6) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5 lg:gap-6">
        <BentoCard
          {...items[0]}
          featured
          variant={variant}
          className="md:col-span-7 md:row-span-2"
        />
        <BentoCard {...items[1]} variant={variant} className="md:col-span-5" />
        <BentoCard {...items[2]} variant={variant} className="md:col-span-5" />
        <BentoCard {...items[3]} variant={variant} className="md:col-span-4" />
        <BentoCard {...items[4]} variant={variant} className="md:col-span-4" />
        <BentoCard {...items[5]} variant={variant} className="md:col-span-4" />
      </div>
    );
  }

  // 5 items: top row (featured spanning 2 cols + 1), bottom row (3 equal)
  if (items.length === 5) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:gap-6">
        <BentoCard
          {...items[0]}
          featured
          variant={variant}
          className="md:col-span-2"
        />
        <BentoCard {...items[1]} variant={variant} />
        <BentoCard {...items[2]} variant={variant} />
        <BentoCard {...items[3]} variant={variant} />
        <BentoCard {...items[4]} variant={variant} />
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
          variant={variant}
          className="md:col-span-2 md:row-span-2"
        />
        <BentoCard {...items[1]} variant={variant} />
        <BentoCard {...items[2]} variant={variant} />
      </div>
    );
  }

  // 2 items: 60/40 split
  if (items.length === 2) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-5 lg:gap-6">
        <BentoCard
          {...items[0]}
          featured
          variant={variant}
          className="md:col-span-3"
        />
        <BentoCard {...items[1]} variant={variant} className="md:col-span-2" />
      </div>
    );
  }

  // Default: responsive grid
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
      {items.map((item) => (
        <BentoCard key={item.href} {...item} variant={variant} />
      ))}
    </div>
  );
}
