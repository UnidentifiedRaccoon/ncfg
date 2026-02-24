"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Award,
} from "lucide-react";
import { Section } from "@/shared/ui/Section";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface Logo {
  id: number;
  title: string;
  href: string | null;
  img: string;
}

interface Category {
  id: string;
  name: string;
  logos: Logo[];
  more: {
    display: string;
    value: number;
    unit: string;
  };
}

interface AwardItem {
  id: number;
  title: string;
  year: number | null;
  img?: string;
}

interface Testimonial {
  id: number;
  company: string;
  logoImg: string;
  quote: string;
  sourceLink?: string | null;
}

interface PartnersProps {
  awards: AwardItem[];
  clientsCarousel: {
    title: string;
    categories: Category[];
    archiveCta: {
      label: string;
      href: string;
    };
  };
  testimonials: {
    title: string;
    items: Testimonial[];
    more: {
      labelTop: string;
      labelBottom: string;
      href: string;
      value?: number;
    };
  };
}

const PARTNERS_CATEGORY_AUTOPLAY_DELAY_MS = 6400;

const CategoryTabs = memo(function CategoryTabs({
  categories,
  activeIndex,
  onChange,
  panelId,
  tabsBaseId,
}: {
  categories: Category[];
  activeIndex: number;
  onChange: (nextIndex: number) => void;
  panelId: string;
  tabsBaseId: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Категории партнеров"
      className={cn(
        "flex w-full min-w-0 max-w-full items-center gap-1 rounded-full bg-[#F1F5F9] p-1",
        "overflow-x-auto snap-x snap-mandatory"
      )}
    >
      {categories.map((category, index) => {
        const isActive = activeIndex === index;
        const tabId = `${tabsBaseId}-tab-${category.id}`;

        return (
          <button
            key={category.id}
            id={tabId}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={panelId}
            onClick={() => onChange(index)}
            className={cn(
              "snap-start whitespace-nowrap px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-full",
              "transition-[color,background-color,box-shadow] duration-200 ease-out",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
              isActive
                ? "bg-white text-[#1E3A5F] shadow-sm"
                : "text-[#475569] hover:text-[#1E3A5F] hover:bg-white/60"
            )}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
});

const LogoTile = memo(function LogoTile({ logo }: { logo: Logo }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion ?? false;

  const isLink = !!logo.href;
  const showImage = !!logo.img && !imageFailed;

  const tileClassName = cn(
    "group relative aspect-[3/2] rounded-xl bg-white/92",
    "shadow-sm shadow-[#0F172A]/[0.06]",
    "transition-[transform,box-shadow] duration-200 ease-out hover:scale-[1.03] hover:shadow-[0_14px_28px_rgba(36,80,154,0.14)]"
  );

  const content = (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      className={cn(
        "relative h-full w-full overflow-hidden rounded-xl",
        "flex items-center justify-center p-2 sm:p-3"
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br from-[#4FC3F7]/15 to-[#7C3AED]/10 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {showImage ? (
        <div className="relative h-full w-full">
          <Image
            src={logo.img}
            alt={logo.title}
            fill
            sizes="(min-width: 1024px) 150px, (min-width: 640px) 130px, 44vw"
            className={cn(
              "object-contain transition-all duration-300",
              imageLoaded
                ? "opacity-90 [@media(hover:none)]:opacity-100"
                : "opacity-0",
              "group-hover:opacity-100 group-hover:scale-[1.02]"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
          />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-center">
          <span className="text-[11px] sm:text-xs font-semibold tracking-tight text-[#475569] leading-snug line-clamp-2 transition-colors group-hover:text-[#1E3A5F] group-focus-visible:text-[#1E3A5F]">
            {logo.title}
          </span>
        </div>
      )}
    </motion.div>
  );

  if (isLink && logo.href) {
    return (
      <Link href={logo.href} className={tileClassName} title={logo.title}>
        {content}
      </Link>
    );
  }

  return (
    <div className={tileClassName} title={logo.title} aria-label={logo.title}>
      {content}
    </div>
  );
});

function CompanyMark({ company, logoImg }: { company: string; logoImg?: string }) {
  const [failed, setFailed] = useState(false);

  const initial = company.trim().slice(0, 1).toUpperCase() || "•";

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="relative h-10 w-10 shrink-0 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] overflow-hidden flex items-center justify-center">
        {logoImg && !failed ? (
          <Image
            src={logoImg}
            alt={company}
            fill
            sizes="40px"
            className="object-contain p-1.5"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="text-sm font-bold text-[#1E3A5F]">{initial}</span>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[#1E3A5F] leading-tight truncate">
          {company}
        </div>
        <div className="text-xs text-[#94A3B8]">Партнер</div>
      </div>
    </div>
  );
}

function TestimonialCard({
  title,
  items,
  more,
  activeIndex,
  onPrev,
  onNext,
  onSelect,
}: {
  title: string;
  items: Testimonial[];
  more: PartnersProps["testimonials"]["more"];
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (nextIndex: number) => void;
}) {
  const current = items[activeIndex];

  if (!current) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl lg:h-[500px]">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.55] bg-[radial-gradient(900px_420px_at_20%_0%,rgba(59,130,246,0.12),transparent_55%),radial-gradient(760px_420px_at_100%_40%,rgba(88,168,224,0.10),transparent_60%)]"
      />

      <div className="relative z-10 flex flex-col p-4 sm:p-6 md:p-7 lg:h-full">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#475569] tracking-wide uppercase">
              {title}
            </div>
          </div>

          {items.length > 1 && items.length <= 6 && (
            <div className="flex items-center gap-2">
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "h-2.5 w-2.5 rounded-full transition-colors",
                    idx === activeIndex
                      ? "bg-[#3B82F6]"
                      : "bg-[#E2E8F0] hover:bg-[#94A3B8]"
                  )}
                  aria-label={`Перейти к рекомендации ${idx + 1}`}
                  aria-current={idx === activeIndex ? "true" : undefined}
                  onClick={() => onSelect(idx)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-5">
          <CompanyMark
            key={(current.logoImg || "") + current.company}
            company={current.company}
            logoImg={current.logoImg}
          />
        </div>

        <blockquote
          className={cn(
            "mt-5 pr-1 text-[#475569] text-[15px] leading-relaxed",
            "overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:10]",
            "md:[-webkit-line-clamp:11]"
          )}
        >
          {current.quote}
        </blockquote>

        <div
          className={cn(
            "mt-auto pt-6 flex items-center gap-4",
            items.length > 1 ? "justify-between" : "justify-end"
          )}
        >
          {items.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPrev}
                className={cn(
                  "h-10 w-10 inline-flex items-center justify-center rounded-full",
                  "bg-white/80 backdrop-blur-sm",
                  "text-[#475569] hover:text-[#3B82F6]",
                  "transition-colors"
                )}
                aria-label="Предыдущая рекомендация"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={onNext}
                className={cn(
                  "h-10 w-10 inline-flex items-center justify-center rounded-full",
                  "bg-white/80 backdrop-blur-sm",
                  "text-[#475569] hover:text-[#3B82F6]",
                  "transition-colors"
                )}
                aria-label="Следующая рекомендация"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          <Button href={more.href} variant="ghost" size="sm">
            Все рекомендации
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function AwardsStrip({ awards }: { awards: AwardItem[] }) {
  if (!awards || awards.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="relative z-10 p-6 md:p-7">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#3B82F6]" aria-hidden="true" />
            <h3 className="text-base font-semibold text-[#1E3A5F]">
              Награды
            </h3>
          </div>
          <div className="text-xs text-[#94A3B8]">Подтверждение качества</div>
        </div>

        <div
          className={cn(
            "mt-4 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory",
            "sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0",
            "lg:grid-cols-4"
          )}
        >
          {awards.slice(0, 8).map((award) => (
            <div
              key={award.id}
              className={cn(
                "snap-start min-w-[260px] sm:min-w-0",
                "rounded-xl bg-white/55 backdrop-blur-sm p-4"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-mono font-semibold text-[#1E3A5F]">
                    {award.year ?? "—"}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#1E3A5F] leading-snug line-clamp-2">
                    {award.title}
                  </div>
                </div>
                <div className="h-9 w-9 rounded-full bg-[#F8FAFC] flex items-center justify-center shrink-0">
                  <Award className="h-4 w-4 text-[#58A8E0]" aria-hidden="true" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Partners({ awards, clientsCarousel, testimonials }: PartnersProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion ?? false;

  const tabsBaseId = "partners-tabs";
  const panelId = `${tabsBaseId}-panel`;

  const categories = useMemo(
    () => clientsCarousel.categories ?? [],
    [clientsCarousel.categories]
  );
  const safeActiveCategory = useMemo(
    () => Math.min(activeCategory, Math.max(categories.length - 1, 0)),
    [activeCategory, categories.length]
  );
  const currentCategory = useMemo(
    () => categories[safeActiveCategory],
    [categories, safeActiveCategory]
  );

  const testimonialItems = useMemo(() => testimonials.items ?? [], [testimonials.items]);
  const safeActiveTestimonial = useMemo(
    () => Math.min(activeTestimonial, Math.max(testimonialItems.length - 1, 0)),
    [activeTestimonial, testimonialItems.length]
  );
  const visibleLogos = useMemo(
    () => (currentCategory?.logos ?? []).slice(0, 12),
    [currentCategory]
  );

  const handleCategoryChange = useCallback((nextIndex: number) => {
    setActiveCategory(nextIndex);
  }, []);
  const handlePrevTestimonial = useCallback(() => {
    setActiveTestimonial((prev) => (prev - 1 + testimonialItems.length) % testimonialItems.length);
  }, [testimonialItems.length]);
  const handleNextTestimonial = useCallback(() => {
    setActiveTestimonial((prev) => (prev + 1) % testimonialItems.length);
  }, [testimonialItems.length]);
  const handleSelectTestimonial = useCallback((nextIndex: number) => {
    setActiveTestimonial(nextIndex);
  }, []);

  const activeTabId = `${tabsBaseId}-tab-${currentCategory?.id ?? "unknown"}`;

  useEffect(() => {
    if (categories.length <= 1 || shouldReduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % categories.length);
    }, PARTNERS_CATEGORY_AUTOPLAY_DELAY_MS);
    return () => window.clearInterval(timer);
  }, [categories.length, shouldReduceMotion]);

  return (
    <Section id="partners" title={clientsCarousel.title}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <div className="relative overflow-hidden rounded-2xl lg:h-[500px]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.55] bg-[radial-gradient(920px_460px_at_0%_0%,rgba(59,130,246,0.12),transparent_58%),radial-gradient(760px_420px_at_100%_45%,rgba(88,168,224,0.10),transparent_62%)]"
            />

            <div className="relative z-10 flex min-w-0 flex-col p-4 sm:p-6 md:p-7 lg:h-full">
              <div className="flex min-w-0 flex-col gap-4 lg:min-h-0 lg:flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-[#1E3A5F] tracking-tight">
                      Клиенты и партнеры
                    </h3>
                  </div>
                </div>

                <CategoryTabs
                  categories={categories}
                  activeIndex={safeActiveCategory}
                  onChange={handleCategoryChange}
                  panelId={panelId}
                  tabsBaseId={tabsBaseId}
                />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCategory?.id ?? "empty-category"}
                    id={panelId}
                    role="tabpanel"
                    aria-label="Партнеры по выбранной категории"
                    aria-labelledby={activeTabId}
                    className="mt-1 flex min-w-0 flex-col lg:min-h-0 lg:flex-1"
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 26, scale: 0.99 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -26, scale: 0.99 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <div className="min-w-0 flex-1 overflow-visible lg:min-h-0 lg:overflow-auto lg:pr-1">
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-4 md:gap-4">
                        {visibleLogos.map((logo) => (
                          <LogoTile key={logo.id} logo={logo} />
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                      <Button
                        href={clientsCarousel.archiveCta.href}
                        variant="ghost"
                        size="sm"
                      >
                        Все клиенты
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {categories.map((category, index) => (
                    <button
                      key={`partners-slide-pill-${category.id}`}
                      type="button"
                      onClick={() => handleCategoryChange(index)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                        index === safeActiveCategory
                          ? "bg-[#3B82F6]/10 text-[#1E3A5F]"
                          : "bg-white/85 text-[#5A7297] hover:bg-[#EAF2FF]"
                      )}
                      aria-label={`Показать категорию: ${category.name}`}
                      aria-current={index === safeActiveCategory ? "true" : undefined}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-4">
          <TestimonialCard
            title={testimonials.title}
            items={testimonialItems}
            more={testimonials.more}
            activeIndex={safeActiveTestimonial}
            onPrev={handlePrevTestimonial}
            onNext={handleNextTestimonial}
            onSelect={handleSelectTestimonial}
          />
        </div>

        <div className="min-w-0 lg:col-span-12">
          <AwardsStrip awards={awards} />
        </div>
      </div>
    </Section>
  );
}
