import { Section } from "@/shared/ui/Section";
import { ProductShowcaseItem } from "./ProductShowcaseItem";

interface Product {
  title: string;
  description: string;
  href: string;
  image?: string;
  icon?: "graduation-cap" | "trending-up" | "zap";
  audience?: string;
}

interface ProductShowcaseProps {
  title?: string;
  lead?: string;
  products: Product[];
}

function DecorativeBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute -top-24 right-[-160px] h-80 w-80 rounded-full bg-[#58A8E0]/14 blur-3xl" />
      <div className="absolute -bottom-24 left-[-160px] h-80 w-80 rounded-full bg-[#3B82F6]/12 blur-3xl" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,232,240,0.55)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.55)_1px,transparent_1px)] bg-[size:28px_28px] opacity-[0.22]" />
    </div>
  );
}

export function ProductShowcase({
  title,
  lead,
  products,
}: ProductShowcaseProps) {
  return (
    <Section id="services" title={title} lead={lead}>
      <div className="relative">
        <DecorativeBackground />

        <div className="relative z-10 space-y-6 md:space-y-8">
          {products.map((product, index) => (
            <div key={product.title}>
              <ProductShowcaseItem
                title={product.title}
                description={product.description}
                href={product.href}
                image={product.image}
                icon={product.icon}
                audience={product.audience}
                reversed={index % 2 === 1}
              />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
