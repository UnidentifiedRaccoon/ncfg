import Link from "next/link";
import {
  ArrowUpRight,
  GraduationCap,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/shared/ui/Section";
import { cn } from "@/shared/lib/cn";
import type { ReactNode } from "react";

type ProductIcon = "graduation-cap" | "trending-up";
type ProductAudience = "Дети" | "Взрослые";

interface Product {
  id: string;
  title: string;
  description: string;
  href: string;
  audience: ProductAudience;
  icon: ProductIcon;
}

const iconMap: Record<ProductIcon, LucideIcon> = {
  "graduation-cap": GraduationCap,
  "trending-up": TrendingUp,
};

const products: Product[] = [
  {
    title: "Клуб «ФинЗдоровье»",
    description:
      "Образовательное онлайн пространство для взрослых, где участники учатся управлять личными финансами, планировать бюджет и достигать финансовых целей",
    href: "https://fgrm.ncfg.ru/wellf_club",
    id: "finzdorovie_club",
    audience: "Взрослые",
    icon: "trending-up",
  },
  {
    id: "dengins_school",
    title: "Школа «Деньгин's» и клуб «Дети в Деле»",
    description:
      "Финансовое развитие детей и подростков с 6 до 17 лет. Интерактивные онлайн программы с наставниками: грамотное управление деньгами и гибкие навыки с детства",
    href: "https://dengins.ru/",
    audience: "Дети",
    icon: "graduation-cap",
  },
];

function DecorativeBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute -top-24 right-[-160px] h-80 w-80 rounded-full bg-[#58A8E0]/14 blur-3xl" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(226,232,240,0.55)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.55)_1px,transparent_1px)] bg-[size:28px_28px] opacity-[0.22]" />
    </div>
  );
}

function ProductTileLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  const isExternal = href.startsWith("http");

  if (isExternal) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        data-ym-goal="product_click"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} data-ym-goal="product_click">
      {children}
    </Link>
  );
}

function ProductTile({
  product,
  featured = false,
}: {
  product: Product;
  featured?: boolean;
}) {
  const Icon = iconMap[product.icon];
  const isExternal = product.href.startsWith("http");

  return (
    <ProductTileLink
      href={product.href}
      className={cn(
        "group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 ease-out [will-change:transform]",
        "bg-white border-[#F1F5F9]",
        "hover:-translate-y-1 hover:shadow-lg hover:border-[#3B82F6]/25 hover:z-10",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] focus-visible:z-10",
        featured ? "p-6 md:p-8" : "p-5 md:p-6",
        "before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:z-0 before:h-px before:content-['']",
        "before:bg-gradient-to-r before:from-transparent before:via-[#58A8E0]/70 before:to-transparent",
        "before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
        "after:pointer-events-none after:absolute after:inset-0 after:z-0 after:rounded-2xl after:content-['']",
        "after:bg-[radial-gradient(circle_at_18%_12%,rgba(88,168,224,0.16),transparent_60%)]",
        "after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100"
      )}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-20 z-0 hidden h-64 w-64 rounded-full bg-gradient-to-br from-[#58A8E0]/26 via-[#3B82F6]/16 to-transparent blur-2xl md:block"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E3A5F]/10"
            aria-hidden="true"
          >
            <Icon className="h-4 w-4 text-[#1E3A5F]" />
          </span>

          <span className="inline-flex h-8 w-24 shrink-0 items-center justify-center rounded-full bg-[#3B82F6]/10 px-0 py-1 text-xs font-semibold text-[#1E3A5F] whitespace-nowrap">
            {product.audience}
          </span>
        </div>

        {isExternal && (
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-white/80 text-[#475569] transition-colors group-hover:border-[#3B82F6]/35 group-hover:text-[#3B82F6]">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>

      <h3
        className={cn(
          "relative z-10 mt-5 leading-tight tracking-tight text-[#1E3A5F]",
          featured ? "text-2xl md:text-3xl font-bold" : "text-lg font-semibold"
        )}
      >
        {product.title}
      </h3>

      <p
        className={cn(
          "relative z-10 mt-3 text-[#475569] leading-relaxed",
          featured ? "text-base md:text-lg" : "text-sm line-clamp-3"
        )}
      >
        {product.description}
      </p>

      <div
        className="relative z-10 mt-auto pt-6 flex items-center gap-2 text-[#3B82F6]"
      >
        <span className="text-sm font-medium">Открыть</span>
        <ArrowUpRight
          className={cn(
            featured ? "h-5 w-5" : "h-4 w-4",
            "transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          )}
          aria-hidden="true"
        />
      </div>
    </ProductTileLink>
  );
}

export function Products() {
  return (
    <Section
      id="products"
      title="Продукты"
      lead="Программы финансовой грамотности для детей и взрослых — выберите подходящий формат"
    >
      <div className="relative">
        <DecorativeBackground />

        <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <div className="h-full">
            <ProductTile product={products[0]} featured />
          </div>

          {products.slice(1).map((product) => (
            <ProductTile key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Section>
  );
}
