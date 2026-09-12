"use client";

import {
  useRef,
  useId,
  useState,
  useLayoutEffect,
  type ReactNode,
  type FocusEvent as ReactFocusEvent,
} from "react";
import Image from "next/image";
import { m, useAnimate, useInView, type MotionValue } from "motion/react";
import { motionTokens, useAutoplay, useDocumentVisible, useReducedMotion } from "@/shared/lib/motion";
import { ContentTransition } from "@/shared/ui/ContentTransition";
import { Reveal } from "@/shared/ui/Reveal";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Award,
  Pause,
  Play,
} from "lucide-react";
import { Section } from "@/shared/ui/Section";
import { Button } from "@/shared/ui/Button";
import { CmsAwareLink } from "@/shared/ui/CmsAwareLink";
import { cn } from "@/shared/lib/cn";
import { reachGoal, YM_GOALS } from "@/shared/lib/ym";

interface Logo {
  id: number;
  title: string;
  href: string | null;
  img: string | null;
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
}

interface Testimonial {
  id: number;
  company: string;
  logoImg: string;
  quote: string;
}

interface PartnersProps {
  awards: AwardItem[];
  clientsCarousel: {
    title: string;
    categories: Category[];
  };
  testimonials: {
    title: string;
    items: Testimonial[];
    more: {
      href: string;
    };
  };
}

function CategoryTabs({
  categories,
  activeIndex,
  onChange,
  panelId,
  tabsBaseId,
  canShowProgress,
  progress,
}: {
  categories: Category[];
  activeIndex: number;
  onChange: (nextIndex: number) => void;
  panelId: string;
  tabsBaseId: string;
  canShowProgress: boolean;
  progress: MotionValue<number>;
}) {
  return (
    <div
      role="tablist"
      aria-label="Категории партнеров"
      className={cn(
        "flex w-full min-w-0 max-w-full items-center gap-1 rounded-full border border-[#E2E8F0] bg-[#F1F5F9] p-1",
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
              // Keep geometry stable: constant border width prevents "jumping" when active tab changes.
              "relative shrink-0 overflow-hidden snap-start whitespace-nowrap px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-full border border-transparent",
              "transition-[color,background-color,border-color,box-shadow] duration-200 ease-out",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
              isActive
                ? "bg-white text-[#1E3A5F] shadow-sm border-[#E2E8F0]"
                : "text-[#475569] hover:text-[#1E3A5F] hover:bg-white/60 hover:border-[#E2E8F0]/60"
            )}
          >
            {isActive && canShowProgress && (
              <m.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 origin-left rounded-full bg-[#3B82F6]/[0.08]"
                style={{ scaleX: progress }}
              />
            )}
            <span className="relative z-[1]">{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function LogoGrid({ category, children }: { category: string | number; children: ReactNode }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const previous = useRef(category);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const node = scope.current;
    if (!node) return;
    const changed = previous.current !== category;
    previous.current = category;
    const tiles = Array.from(node.children);
    if (!tiles.length) return;
    // Prepare before paint so a new category cannot flash at full opacity.
    // A single mounted grid preserves tab order; text keeps its own hover scale.
    const moving = changed && !reduced && !node.contains(document.activeElement);
    const playback = animate(tiles, moving
      ? { opacity: [0, 1], y: [motionTokens.logoDistance, 0] }
      : { opacity: 1, y: 0 }, {
      duration: moving ? motionTokens.logoReveal : 0,
      ease: motionTokens.ease,
      delay: moving ? (index) => Math.min(index * motionTokens.logoStagger, motionTokens.maxStagger) : 0,
    });
    if (!moving) playback.complete();
    const finish = () => playback.complete();
    node.addEventListener("focusin", finish);
    return () => {
      node.removeEventListener("focusin", finish);
      playback.stop();
    };
  }, [animate, category, reduced, scope]);

  return <div ref={scope} data-partner-logos className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-4 md:gap-4 motion-reduce:[&>div]:!opacity-100 motion-reduce:[&>div]:!transform-none">{children}</div>;
}

function LogoTile({ logo }: { logo: Logo }) {
  const isLink = !!logo.href;

  const tileClassName = cn(
    "group relative block aspect-[3/2] rounded-xl border border-[#E2E8F0]/70 bg-white",
    "shadow-sm shadow-[#0F172A]/[0.03]"
  );

  const content = (
    <div
      className={cn(
        "relative h-full w-full rounded-xl",
        "flex items-center justify-center p-2 sm:p-3"
      )}
    >
      {/* Lay out at the final size: scaling never reflows letters or line breaks. */}
      <span className="w-full text-center text-[13px] sm:text-sm font-semibold tracking-tight text-[#64748B] leading-[1.25] line-clamp-2 [overflow-wrap:anywhere] origin-center scale-100 motion-safe:scale-[0.85] sm:motion-safe:scale-[0.86] transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-focus-visible:scale-100 motion-reduce:transition-none">
        {logo.title}
      </span>
    </div>
  );

  if (isLink && logo.href) {
    return (
      <CmsAwareLink
        href={logo.href}
        className={tileClassName}
        title={logo.title}
        onClick={() => reachGoal(YM_GOALS.PARTNER_CLICK)}
      >
        {content}
      </CmsAwareLink>
    );
  }

  return (
    <div className={tileClassName} title={logo.title} aria-label={logo.title}>
      {content}
    </div>
  );
}

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
  direction,
}: {
  title: string;
  items: Testimonial[];
  more: PartnersProps["testimonials"]["more"];
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (nextIndex: number) => void;
  direction: "forward" | "backward";
}) {
  const current = items[activeIndex];

  if (!current) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm lg:h-[500px]">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.55] bg-[radial-gradient(900px_420px_at_20%_0%,rgba(59,130,246,0.12),transparent_55%),radial-gradient(760px_420px_at_100%_40%,rgba(88,168,224,0.10),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.22] bg-[linear-gradient(to_right,rgba(226,232,240,0.55)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.55)_1px,transparent_1px)] bg-[size:24px_24px]"
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
                  aria-label={`Перейти к рекомендации ${idx + 1}`}
                  aria-current={idx === activeIndex ? "true" : undefined}
                  onClick={() => onSelect(idx)}
                />
              ))}
            </div>
          )}
        </div>

        <ContentTransition stateKey={current.id} direction={direction}>
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
              // Clean multi-line truncation with ellipsis.
              "overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:10]",
              "md:[-webkit-line-clamp:11]"
            )}
          >
            {current.quote}
          </blockquote>
        </ContentTransition>

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
                  "border border-[#E2E8F0] bg-white/80 backdrop-blur-sm",
                  "text-[#475569] hover:text-[#3B82F6] hover:border-[#3B82F6]/35",
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
                  "border border-[#E2E8F0] bg-white/80 backdrop-blur-sm",
                  "text-[#475569] hover:text-[#3B82F6] hover:border-[#3B82F6]/35",
                  "transition-colors"
                )}
                aria-label="Следующая рекомендация"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          <Button href={more.href} variant="ghost" size="sm" data-ym-goal="recommendations_click">
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
    <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.22] bg-[linear-gradient(to_right,rgba(226,232,240,0.55)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.55)_1px,transparent_1px)] bg-[size:24px_24px]"
      />
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
                "rounded-xl border border-[#E2E8F0] bg-white/70 backdrop-blur-sm p-4",
                "shadow-sm shadow-[#0F172A]/[0.03]"
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
                <div className="h-9 w-9 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center shrink-0">
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
  const [testimonialDirection, setTestimonialDirection] = useState<"forward" | "backward">("forward");
  const [progressKey, setProgressKey] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(regionRef, { amount: 0.15 });
  const prefersReducedMotion = useReducedMotion();
  const isDocumentVisible = useDocumentVisible();

  const tabsBaseId = useId();
  const panelId = `${tabsBaseId}-panel`;

  const categories = clientsCarousel.categories ?? [];
  const shouldRenderProgress = categories.length > 1 && !prefersReducedMotion;
  const canAutoplay = shouldRenderProgress && isDocumentVisible && inView && !isHovered && !hasFocusWithin && !manuallyPaused;
  const progress = useAutoplay({
    enabled: canAutoplay,
    cycle: progressKey,
    duration: motionTokens.partnerInterval,
    onAdvance: () => {
      setActiveCategory((current) => (current + 1) % categories.length);
      setProgressKey((current) => current + 1);
    },
  });
  const safeActiveCategory = Math.min(activeCategory, Math.max(categories.length - 1, 0));
  const currentCategory = categories[safeActiveCategory];

  const testimonialItems = testimonials.items ?? [];
  const safeActiveTestimonial = Math.min(
    activeTestimonial,
    Math.max(testimonialItems.length - 1, 0)
  );
  const activeTabId = `${tabsBaseId}-tab-${currentCategory?.id ?? "unknown"}`;

  const handleAutoplayBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
    const nextFocused = event.relatedTarget;

    if (nextFocused instanceof Node && event.currentTarget.contains(nextFocused)) {
      return;
    }

    setHasFocusWithin(false);
  };

  return (
    <Section id="partners" title={clientsCarousel.title}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Reveal viewport="inset" className="min-w-0 lg:col-span-8">
          <div
            className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm lg:h-[500px]"
            ref={regionRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocusCapture={() => setHasFocusWithin(true)}
            onBlurCapture={handleAutoplayBlur}
          >
            {/* Decorative background */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.55] bg-[radial-gradient(920px_460px_at_0%_0%,rgba(59,130,246,0.12),transparent_58%),radial-gradient(760px_420px_at_100%_45%,rgba(88,168,224,0.10),transparent_62%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[linear-gradient(to_right,rgba(226,232,240,0.55)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.55)_1px,transparent_1px)] bg-[size:24px_24px]"
            />

            <div className="relative z-10 flex min-w-0 flex-col p-4 sm:p-6 md:p-7 lg:h-full">
              <div className="flex min-w-0 flex-col gap-4 lg:min-h-0 lg:flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-[#1E3A5F] tracking-tight">
                      Клиенты и партнеры
                    </h3>
                  </div>
                  {categories.length > 1 && !prefersReducedMotion && (
                    <button type="button" aria-pressed={manuallyPaused} onClick={() => setManuallyPaused((paused) => !paused)} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-[#475569] hover:bg-[#F1F5F9]">
                      {manuallyPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
                      {manuallyPaused ? "Продолжить смену" : "Приостановить смену"}
                    </button>
                  )}
                </div>

                <CategoryTabs
                  categories={categories}
                  activeIndex={safeActiveCategory}
                  onChange={(nextIndex) => {
                    setActiveCategory(nextIndex);
                    setProgressKey((k) => k + 1);
                  }}
                  panelId={panelId}
                  tabsBaseId={tabsBaseId}
                  canShowProgress={shouldRenderProgress}
                  progress={progress}
                />

                <div
                  id={panelId}
                  role="tabpanel"
                  aria-label="Партнеры по выбранной категории"
                  aria-labelledby={activeTabId}
                  className="mt-1 flex min-w-0 flex-col lg:min-h-0 lg:flex-1"
                >
                  <div className="min-w-0 flex-1 overflow-visible lg:min-h-0 lg:overflow-auto lg:pr-1">
                    <LogoGrid category={currentCategory?.id ?? safeActiveCategory}>
                      {(currentCategory?.logos ?? []).slice(0, 12).map((logo) => (
                        <div key={logo.id} className="min-w-0"><LogoTile logo={logo} /></div>
                      ))}
                    </LogoGrid>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal viewport="inset" delay={motionTokens.stagger} className="min-w-0 lg:col-span-4">
          <TestimonialCard
            title={testimonials.title}
            items={testimonialItems}
            more={testimonials.more}
            activeIndex={safeActiveTestimonial}
            direction={testimonialDirection}
            onPrev={() => {
              setTestimonialDirection("backward");
              setActiveTestimonial(
                (prev) => (prev - 1 + testimonialItems.length) % testimonialItems.length
              );
              reachGoal(YM_GOALS.TESTIMONIAL_NAV);
            }}
            onNext={() => {
              setTestimonialDirection("forward");
              setActiveTestimonial((prev) => (prev + 1) % testimonialItems.length);
              reachGoal(YM_GOALS.TESTIMONIAL_NAV);
            }}
            onSelect={(nextIndex) => {
              setTestimonialDirection(nextIndex < safeActiveTestimonial ? "backward" : "forward");
              setActiveTestimonial(nextIndex);
              reachGoal(YM_GOALS.TESTIMONIAL_NAV);
            }}
          />
        </Reveal>

        <Reveal viewport="inset" className="min-w-0 lg:col-span-12">
          <AwardsStrip awards={awards} />
        </Reveal>
      </div>
    </Section>
  );
}
