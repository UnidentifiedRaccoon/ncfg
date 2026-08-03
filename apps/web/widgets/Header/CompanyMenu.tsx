"use client";

import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { cn } from "@/shared/lib/cn";
import { CmsAwareLink } from "@/shared/ui/CmsAwareLink";

import {
  COMPANY_NAVIGATION,
  SEASONAL_HR_OFFER,
  type CompanyNavigationCategory,
  type CompanyServiceLink,
} from "./companyNavigation";

type CompanyMenuLayout = "desktop" | "tablet" | "mobile";
export type CompanyMenuTheme = "light" | "dark";

interface CompanyMenuThemeSlots {
  canvas: string;
  directionRail: string;
  directionActive: string;
  directionIdle: string;
  selectionPreview: string;
  focus: string;
  surfaceStateLayer: string;
  brandStateLayer: string;
  selectedStateLayer: string;
  servicePanel: string;
  serviceList: string;
  serviceLink: string;
  serviceChevron: string;
  seasonOffer: string;
  seasonOfferEyebrow: string;
  seasonOfferDescription: string;
  seasonOfferAction: string;
  footer: string;
  separator: string;
  allServices: string;
  allServicesArrow: string;
  mobileRoot: string;
  mobileBorder: string;
  mobileButtonOpen: string;
  mobileButtonClosed: string;
  mobileTitle: string;
  mobileChevron: string;
  mobileContent: string;
}

const COMPANY_MENU_THEME = {
  light: {
    canvas: "bg-white",
    directionRail:
      "divide-[#E2E8F0] border-[#E2E8F0] bg-[#F8FAFC]",
    directionActive: "bg-[#EAF1F8] text-[#1E3A5F]",
    directionIdle: "text-[#475569]",
    selectionPreview:
      "hover:bg-[#EAF1F8] hover:text-[#1E3A5F] focus-visible:bg-[#EAF1F8] focus-visible:text-[#1E3A5F]",
    focus: "focus-visible:outline-[#3B82F6]!",
    surfaceStateLayer:
      "hover:shadow-[inset_0_0_0_999px_rgba(59,130,246,0.07)] focus-visible:shadow-[inset_0_0_0_999px_rgba(59,130,246,0.07)]",
    brandStateLayer:
      "hover:bg-[#DCEAF7] focus-visible:bg-[#DCEAF7]",
    selectedStateLayer:
      "hover:shadow-[inset_0_0_0_999px_rgba(59,130,246,0.06)] focus-visible:shadow-[inset_0_0_0_999px_rgba(59,130,246,0.06)]",
    servicePanel: "bg-white",
    serviceList: "divide-[#E2E8F0]",
    serviceLink:
      "text-[#334155] hover:bg-[#3B82F6]/[0.06] hover:text-[#1E3A5F] focus-visible:outline-[#3B82F6]",
    serviceChevron:
      "text-[#94A3B8] group-hover:text-[#3B82F6]",
    seasonOffer: "bg-[#EAF1F8] text-[#1E3A5F]",
    seasonOfferEyebrow: "text-[#2B628F]",
    seasonOfferDescription: "text-[#475569]",
    seasonOfferAction: "text-[#1E3A5F]",
    footer: "border-[#E2E8F0] bg-[#F8FAFC]",
    separator: "border-[#E2E8F0]",
    allServices: "bg-[#F8FAFC] text-[#475569]",
    allServicesArrow: "text-current opacity-70",
    mobileRoot: "bg-white",
    mobileBorder: "border-[#E2E8F0]",
    mobileButtonOpen: "bg-[#EAF1F8]",
    mobileButtonClosed: "bg-white",
    mobileTitle: "text-[#1E3A5F]",
    mobileChevron: "text-[#475569]",
    mobileContent: "divide-[#E2E8F0] bg-white",
  },
  dark: {
    canvas: "bg-[#0B1324]",
    directionRail: "divide-white/10 border-white/10 bg-[#0F1C30]",
    directionActive: "bg-[#1E3A5F] text-white",
    directionIdle: "text-[#B7C3D3]",
    selectionPreview:
      "hover:bg-[#1E3A5F] hover:text-white focus-visible:bg-[#1E3A5F] focus-visible:text-white",
    focus: "focus-visible:outline-[#8FC7EE]!",
    surfaceStateLayer:
      "hover:shadow-[inset_0_0_0_999px_rgba(255,255,255,0.07)] focus-visible:shadow-[inset_0_0_0_999px_rgba(255,255,255,0.07)]",
    brandStateLayer:
      "hover:shadow-[inset_0_0_0_999px_rgba(255,255,255,0.07)] focus-visible:shadow-[inset_0_0_0_999px_rgba(255,255,255,0.07)]",
    selectedStateLayer:
      "hover:shadow-[inset_0_0_0_999px_rgba(255,255,255,0.07)] focus-visible:shadow-[inset_0_0_0_999px_rgba(255,255,255,0.07)]",
    servicePanel: "bg-[#0B1324]",
    serviceList: "divide-white/10",
    serviceLink:
      "text-[#D7E0EA] hover:bg-white/[0.06] hover:text-white focus-visible:outline-[#8FC7EE]",
    serviceChevron:
      "text-[#94A3B8] group-hover:text-[#8FC7EE]",
    seasonOffer: "bg-[#1E3A5F] text-white",
    seasonOfferEyebrow: "text-[#8FC7EE]",
    seasonOfferDescription: "text-white/65",
    seasonOfferAction: "text-white",
    footer: "border-white/10 bg-[#0F1C30]",
    separator: "border-white/10",
    allServices: "bg-[#0F1C30] text-[#B7C3D3]",
    allServicesArrow: "text-current opacity-70",
    mobileRoot: "bg-[#0B1324]",
    mobileBorder: "border-white/10",
    mobileButtonOpen: "bg-white/[0.08]",
    mobileButtonClosed: "bg-[#0B1324]",
    mobileTitle: "text-[#F8FAFC]",
    mobileChevron: "text-[#B7C3D3]",
    mobileContent: "divide-white/10 bg-[#0B1324]",
  },
} satisfies Record<CompanyMenuTheme, CompanyMenuThemeSlots>;

interface CompanyMenuProps {
  categories: readonly CompanyNavigationCategory[];
  layout: CompanyMenuLayout;
  theme: CompanyMenuTheme;
  onNavigate?: () => void;
}

function ServiceLink({
  service,
  theme,
  onNavigate,
}: {
  service: CompanyServiceLink;
  theme: CompanyMenuTheme;
  onNavigate?: () => void;
}) {
  const styles = COMPANY_MENU_THEME[theme];

  return (
    <CmsAwareLink
      href={service.href}
      onClick={() => onNavigate?.()}
      className={cn(
        "group flex min-h-11 items-start justify-between gap-3 rounded-lg px-2.5 py-2 text-sm font-semibold leading-5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        styles.serviceLink
      )}
    >
      <span className="min-w-0">{service.title}</span>
      <ChevronRight
        aria-hidden="true"
        size={16}
        className={cn(
          "shrink-0 self-center transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none",
          styles.serviceChevron
        )}
      />
    </CmsAwareLink>
  );
}

function SeasonOffer({
  theme,
  onNavigate,
}: {
  theme: CompanyMenuTheme;
  onNavigate?: () => void;
}) {
  const styles = COMPANY_MENU_THEME[theme];

  return (
    <CmsAwareLink
      href={SEASONAL_HR_OFFER.href}
      onClick={() => onNavigate?.()}
      className={cn(
        "group block w-full px-4 py-5 transition-[background-color,box-shadow] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px]!",
        styles.focus,
        styles.seasonOffer,
        styles.brandStateLayer
      )}
    >
      <span
        className={cn(
          "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]",
          styles.seasonOfferEyebrow
        )}
      >
        <Sparkles aria-hidden="true" size={15} />
        Для HR
      </span>
      <span className="mt-3 block text-lg font-bold tracking-tight">
        {SEASONAL_HR_OFFER.title}
      </span>
      <span
        className={cn(
          "mt-2 block text-sm leading-5",
          styles.seasonOfferDescription
        )}
      >
        {SEASONAL_HR_OFFER.description}
      </span>
      <span
        className={cn(
          "mt-5 inline-flex items-center gap-1.5 text-sm font-semibold",
          styles.seasonOfferAction
        )}
      >
        Смотреть программу
        <ArrowRight
          aria-hidden="true"
          size={16}
          className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
        />
      </span>
    </CmsAwareLink>
  );
}

function AllServicesLink({
  theme,
  appearance,
  onNavigate,
}: {
  theme: CompanyMenuTheme;
  appearance: "rail" | "accordion";
  onNavigate?: () => void;
}) {
  const styles = COMPANY_MENU_THEME[theme];
  const matchesAccordion = appearance === "accordion";

  return (
    <CmsAwareLink
      href="/companies"
      onClick={() => onNavigate?.()}
      className={cn(
        "group flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px]!",
        styles.focus,
        matchesAccordion
          ? [
              styles.mobileButtonClosed,
              styles.mobileTitle,
              styles.surfaceStateLayer,
            ]
          : [
              styles.allServices,
              styles.selectionPreview,
              styles.selectedStateLayer,
            ]
      )}
    >
      Все услуги
      <ArrowRight
        aria-hidden="true"
        size={17}
        className={cn(
          "shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none",
          styles.allServicesArrow
        )}
      />
    </CmsAwareLink>
  );
}

function DirectionButton({
  category,
  active,
  controlsId,
  id,
  buttonRef,
  theme,
  onSelect,
  onKeyDown,
}: {
  category: CompanyNavigationCategory;
  active: boolean;
  controlsId: string;
  id: string;
  buttonRef: (node: HTMLButtonElement | null) => void;
  theme: CompanyMenuTheme;
  onSelect: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}) {
  const styles = COMPANY_MENU_THEME[theme];

  return (
    <button
      ref={buttonRef}
      id={id}
      type="button"
      role="tab"
      aria-controls={controlsId}
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      onClick={onSelect}
      onFocus={onSelect}
      onKeyDown={onKeyDown}
      onPointerEnter={onSelect}
      className={cn(
        "flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px]!",
        styles.focus,
        active ? styles.directionActive : styles.directionIdle,
        styles.selectionPreview,
        styles.selectedStateLayer
      )}
    >
      <span className="min-w-0 text-sm font-bold leading-5">
        {category.title}
      </span>
      <ChevronRight aria-hidden="true" size={17} className="shrink-0 opacity-70" />
    </button>
  );
}

function DesktopTabletMenu({
  categories,
  theme,
  onNavigate,
}: {
  categories: readonly CompanyNavigationCategory[];
  theme: CompanyMenuTheme;
  onNavigate?: () => void;
}) {
  const styles = COMPANY_MENU_THEME[theme];
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0].id);
  const tabsId = useId();
  const panelId = `${tabsId}-panel`;
  const directionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ??
    categories[0];

  const focusDirection = (index: number) => {
    const category = categories[index];

    if (!category) return;

    setSelectedCategoryId(category.id);
    directionRefs.current[index]?.focus();
  };

  const handleDirectionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowDown") {
      nextIndex = (index + 1) % categories.length;
    } else if (event.key === "ArrowUp") {
      nextIndex = (index - 1 + categories.length) % categories.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = categories.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    focusDirection(nextIndex);
  };

  return (
    <div
      className={cn(
        "grid min-h-[390px] grid-cols-[0.82fr_1.38fr] grid-rows-[auto_1fr] transition-colors",
        styles.canvas
      )}
    >
      <div
        role="tablist"
        aria-label="Направления услуг для компаний"
        aria-orientation="vertical"
        className={cn(
          "min-w-0 divide-y border-r transition-colors",
          styles.directionRail
        )}
      >
        {categories.map((category, index) => (
          <DirectionButton
            key={category.id}
            category={category}
            active={category.id === selectedCategory.id}
            controlsId={panelId}
            id={`${tabsId}-tab-${index}`}
            theme={theme}
            buttonRef={(node) => {
              directionRefs.current[index] = node;
            }}
            onSelect={() => setSelectedCategoryId(category.id)}
            onKeyDown={(event) => handleDirectionKeyDown(event, index)}
          />
        ))}
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${tabsId}-tab-${categories.indexOf(selectedCategory)}`}
        className={cn(
          "col-start-2 row-span-2 row-start-1 min-w-0 transition-colors",
          styles.servicePanel
        )}
      >
        <div className={cn("divide-y px-3 py-2", styles.serviceList)}>
          {selectedCategory.services.map((service) => (
            <div key={service.href} className="py-1">
              <ServiceLink
                service={service}
                theme={theme}
                onNavigate={onNavigate}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "col-start-1 row-start-2 self-end border-r border-t transition-colors",
          styles.footer
        )}
      >
        <SeasonOffer theme={theme} onNavigate={onNavigate} />
        <div className={cn("border-t", styles.separator)}>
          <AllServicesLink
            theme={theme}
            appearance="rail"
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
}

function MobileAccordion({
  category,
  open,
  theme,
  onToggle,
  onNavigate,
}: {
  category: CompanyNavigationCategory;
  open: boolean;
  theme: CompanyMenuTheme;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const styles = COMPANY_MENU_THEME[theme];
  const generatedId = useId();
  const triggerId = `company-category-trigger-${generatedId}`;
  const contentId = `company-category-${generatedId}`;

  return (
    <div className={cn("border-b last:border-0", styles.mobileBorder)}>
      <button
        id={triggerId}
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={onToggle}
        className={cn(
          "flex min-h-16 w-full items-center justify-between gap-4 px-4 py-3 text-left transition-[background-color,color,box-shadow] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]!",
          styles.focus,
          open ? styles.mobileButtonOpen : styles.mobileButtonClosed,
          open && theme === "dark"
            ? styles.selectedStateLayer
            : styles.surfaceStateLayer
        )}
      >
        <span className={cn("min-w-0 font-bold leading-5", styles.mobileTitle)}>
          {category.title}
        </span>
        <ChevronDown
          aria-hidden="true"
          size={18}
          className={cn(
            "shrink-0 transition-transform duration-200 motion-reduce:transition-none",
            styles.mobileChevron,
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div
          id={contentId}
          role="region"
          aria-labelledby={triggerId}
          className={cn("divide-y px-3 py-2", styles.mobileContent)}
        >
          {category.services.map((service) => (
            <div key={service.href} className="py-1">
              <ServiceLink
                service={service}
                theme={theme}
                onNavigate={onNavigate}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MobileMenu({
  categories,
  theme,
  onNavigate,
}: {
  categories: readonly CompanyNavigationCategory[];
  theme: CompanyMenuTheme;
  onNavigate?: () => void;
}) {
  const styles = COMPANY_MENU_THEME[theme];
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  return (
    <div className={cn("transition-colors", styles.mobileRoot)}>
      <div>
        {categories.map((category) => (
          <MobileAccordion
            key={category.id}
            category={category}
            open={openCategoryId === category.id}
            theme={theme}
            onToggle={() =>
              setOpenCategoryId((current) =>
                current === category.id ? null : category.id
              )
            }
            onNavigate={onNavigate}
          />
        ))}
      </div>
      <div className={cn("border-t", styles.separator)}>
        <SeasonOffer theme={theme} onNavigate={onNavigate} />
        <div className={cn("border-t", styles.separator)}>
          <AllServicesLink
            theme={theme}
            appearance="accordion"
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
}

export function CompanyMenu({
  categories,
  layout,
  theme,
  onNavigate,
}: CompanyMenuProps) {
  const safeCategories =
    categories.length > 0 ? categories : COMPANY_NAVIGATION;

  if (layout === "mobile") {
    return (
      <MobileMenu
        categories={safeCategories}
        theme={theme}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <DesktopTabletMenu
      categories={safeCategories}
      theme={theme}
      onNavigate={onNavigate}
    />
  );
}
