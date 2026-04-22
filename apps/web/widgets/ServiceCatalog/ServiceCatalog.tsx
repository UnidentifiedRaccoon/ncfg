import { Section } from "@/shared/ui/Section";
import { ServiceBlock } from "./ServiceBlock";

interface ServiceItem {
  title: string;
  description: string;
  href: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  items: ServiceItem[];
}

interface ServiceCatalogBanner {
  serviceId: string;
  title: string;
  ctaLabel: string;
  href: string;
}

interface ServiceCatalogProps {
  services: Service[];
  /**
   * Base for section id and in-page anchors.
   * Default keeps backward-compatible anchors: `#services-{categoryId}`.
   */
  idBase?: string;
  showBadges?: boolean;
  banner?: ServiceCatalogBanner;
}

export function ServiceCatalog({
  services,
  idBase = "services",
  showBadges = true,
  banner,
}: ServiceCatalogProps) {
  return (
    <Section
      id={idBase}
      title="Наши услуги"
      lead="Готовые решения для повышения финансовой грамотности и развития финансовой культуры в компании"
    >
      <div className="mx-auto max-w-6xl">
        <div className="space-y-10 md:space-y-12">
          {services.map((service, index) => (
            <ServiceBlock
              key={service.id}
              id={service.id}
              index={index}
              total={services.length}
              showBadges={showBadges}
              title={service.title}
              description={service.description}
              items={service.items}
              idBase={idBase}
              banner={banner?.serviceId === service.id ? banner : undefined}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
