import { Section } from "@/shared/ui/Section";
import { cn } from "@/shared/lib/cn";
import { ServiceBlock } from "./ServiceBlock";

interface ServiceItem {
  title: string;
  description: string;
  href: string;
  icon: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  items: ServiceItem[];
}

interface ServiceCatalogProps {
  services: Service[];
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

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function ServicesIndex({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <nav aria-label="Группы услуг" className="relative">
      <ul
        role="list"
        className={cn(
          "flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory",
          "md:grid md:grid-cols-3 md:overflow-visible md:pb-0 md:snap-none"
        )}
      >
        {services.map((service, index) => {
          const number = pad2(index + 1);
          const anchorId = `services-${service.id}`;

          return (
            <li
              key={service.id}
              className="min-w-[260px] snap-start md:min-w-0 md:snap-none"
            >
              <a
                href={`#${anchorId}`}
                className={cn(
                  "group relative block overflow-hidden rounded-xl border border-[#E2E8F0]/70",
                  "bg-white/80 shadow-sm backdrop-blur-sm",
                  "p-5 md:p-6",
                  "transition-all duration-200",
                  "hover:-translate-y-0.5 hover:border-[#3B82F6]/25 hover:shadow-lg hover:shadow-blue-500/10"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="text-xs font-semibold text-[#94A3B8] tracking-[0.16em]">
                    {number}
                  </div>
                  <span className="rounded-full border border-[#E2E8F0]/70 bg-white/70 px-3 py-1 text-[11px] font-semibold text-[#1E3A5F] backdrop-blur">
                    {formatServiceCount(service.items.length)}
                  </span>
                </div>

                <div className="mt-3 text-base font-semibold leading-snug text-[#1E3A5F] line-clamp-2 transition-colors group-hover:text-[#3B82F6] md:text-lg">
                  {service.title}
                </div>

                <div
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute -top-20 -right-28 h-60 w-60 rounded-full bg-[#3B82F6]/10 blur-3xl",
                    "opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  )}
                />
              </a>
            </li>
          );
        })}
      </ul>

      {/* Edge fades hint horizontal scroll on mobile */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent md:hidden" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent md:hidden" />
    </nav>
  );
}

export function ServiceCatalog({ services }: ServiceCatalogProps) {
  return (
    <Section
      id="services"
      title="Наши услуги"
      lead="Комплексные решения для развития финансовой культуры в компании"
    >
      <div className="mx-auto max-w-6xl">
        <ServicesIndex services={services} />

        <div className="mt-10 space-y-6 md:space-y-8">
          {services.map((service, index) => (
            <ServiceBlock
              key={service.id}
              id={service.id}
              index={index}
              total={services.length}
              title={service.title}
              description={service.description}
              items={service.items}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
