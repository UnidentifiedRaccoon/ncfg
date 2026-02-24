"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  GraduationCap,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/shared/ui/Section";
import { cn } from "@/shared/lib/cn";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type ProductIcon = "graduation-cap" | "trending-up" | "zap";
type ProductAudience = "Дети" | "Взрослые" | "Все";

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
  zap: Zap,
};

const products: Product[] = [
  {
    title: "Клуб «ФинЗдоровье»",
    description:
      "Образовательное онлайн пространство для взрослых, где участники учатся управлять личными финансами, планировать бюджет и достигать финансовых целей.",
    href: "https://fgrm.ncfg.ru/wellf_club",
    id: "finzdorovie_club",
    audience: "Взрослые",
    icon: "trending-up",
  },
  {
    id: "dengins_school",
    title: "Школа «Деньгин's» и клуб «Дети в Деле»",
    description:
      "Финансовое развитие детей и подростков с 6 до 17 лет. Интерактивные онлайн программы с наставниками: грамотное управление деньгами и гибкие навыки с детства.",
    href: "https://dengins.ru/",
    audience: "Дети",
    icon: "graduation-cap",
  },
  {
    id: "fin_habit_day",
    title: "День «ФинПривычки»",
    description:
      "Регулярная практика развития здоровых финансовых привычек у взрослых и детей: накопления, инвестиции, разумные траты и другие активности.",
    href: "http://finhabit52.ru/",
    audience: "Все",
    icon: "zap",
  },
];

const PRODUCTS_AUTOPLAY_DELAY_MS = 6200;

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
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
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
        "group relative isolate flex h-full flex-col overflow-hidden rounded-3xl transition-all duration-300 ease-out [will-change:transform]",
        "hover:-translate-y-1.5 hover:shadow-[0_26px_52px_rgba(36,80,154,0.2)] hover:z-10",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] focus-visible:z-10",
        featured
          ? "bg-[linear-gradient(155deg,#F7FBFF,#EDF3FF)] p-6 md:p-8"
          : "bg-[linear-gradient(155deg,#FFFFFF,#F4F8FF)] p-5 md:p-6",
        "after:pointer-events-none after:absolute after:inset-0 after:z-0 after:rounded-2xl after:content-['']",
        "after:bg-[radial-gradient(circle_at_18%_12%,rgba(48,215,255,0.2),transparent_60%)]",
        "after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100"
      )}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-20 z-0 hidden h-64 w-64 rounded-full bg-gradient-to-br from-[#30D7FF]/28 via-[#5B8DFF]/18 to-transparent blur-2xl md:block"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              featured ? "bg-[#3B82F6]/10" : "bg-[#1E3A5F]/10"
            )}
            aria-hidden="true"
          >
            <Icon
              className={cn(
                featured ? "h-4 w-4 text-[#3B82F6]" : "h-4 w-4 text-[#1E3A5F]"
              )}
            />
          </span>

          <span className="inline-flex h-8 w-24 shrink-0 items-center justify-center rounded-full bg-[#3B82F6]/10 px-0 py-1 text-xs font-semibold text-[#1E3A5F] whitespace-nowrap">
            {product.audience}
          </span>
        </div>

        {isExternal && (
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#475569] transition-colors group-hover:text-[#3B82F6]">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>

      <h3
        className={cn(
          "relative z-10 mt-5 leading-tight tracking-tight text-[#1E3A5F]",
          featured ? "text-2xl md:text-3xl font-extrabold" : "text-lg font-bold"
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
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion ?? false;
  const safeActiveIndex = Math.min(activeIndex, Math.max(products.length - 1, 0));
  const activeProduct = products[safeActiveIndex];

  useEffect(() => {
    if (products.length <= 1 || shouldReduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % products.length);
    }, PRODUCTS_AUTOPLAY_DELAY_MS);
    return () => window.clearInterval(timer);
  }, [shouldReduceMotion]);

  if (!activeProduct) return null;

  return (
    <Section
      id="products"
      title="Продукты"
      lead="Программы финансовой грамотности для детей и взрослых — выберите подходящий формат"
    >
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`product-slide-${activeProduct.id}`}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.36, ease: "easeOut" }}
          >
            <ProductTile product={activeProduct} featured />
          </motion.div>
        </AnimatePresence>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {products.map((product, index) => (
            <button
              key={`products-tab-${product.id}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                index === safeActiveIndex
                  ? "bg-[#3B82F6]/10 text-[#1E3A5F]"
                  : "bg-white/85 text-[#5A7297] hover:bg-[#EAF2FF]"
              )}
              aria-label={`Показать продукт: ${product.title}`}
              aria-current={index === safeActiveIndex ? "true" : undefined}
            >
              {product.title}
            </button>
          ))}
        </div>
      </div>
    </Section>
  );
}
