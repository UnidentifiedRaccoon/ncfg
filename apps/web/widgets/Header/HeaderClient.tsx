"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type RefObject,
} from "react";

import { cn } from "@/shared/lib/cn";
import { reachGoal, YM_GOALS } from "@/shared/lib/ym";
import { Button } from "@/shared/ui/Button";
import { CmsAwareLink } from "@/shared/ui/CmsAwareLink";
import { Container } from "@/shared/ui/Container";

import { CompanyMenu, type CompanyMenuTheme } from "./CompanyMenu";
import type { CompanyNavigationCategory } from "./companyNavigation";

const NAV_ITEMS = [
  { label: "Частным лицам", href: "/individuals" },
  { label: "Компаниям", href: "/companies" },
  { label: "О центре", href: "/about" },
  { label: "Блог", href: "/blog" },
] as const;

type DockTone = "hero" | "surface";

interface HeaderClientProps {
  companyNavigation: readonly CompanyNavigationCategory[];
}

interface MenuState {
  open: boolean;
  openedOnPath: string | null;
}

const HERO_END_SENTINEL_SELECTOR = "[data-header-hero-end]";
const MOBILE_MENU_PANEL_ID = "site-mobile-menu";
const DESKTOP_COMPANY_PANEL_ID = "desktop-company-menu";
const MOBILE_COMPANY_PANEL_ID = "mobile-company-menu";
const TABLET_COMPANY_PANEL_ID = "tablet-company-menu";

function getHeaderHeightPx() {
  return window.matchMedia("(min-width: 1024px)").matches ? 80 : 64;
}

function isVacanciesPath(pathname: string | null): boolean {
  return pathname?.startsWith("/vacancies") || false;
}

function computeDockTone(pathname: string | null): DockTone {
  if (typeof window === "undefined") return "hero";
  if (
    pathname?.startsWith("/blog") ||
    isVacanciesPath(pathname) ||
    pathname?.startsWith("/diagnostika")
  ) {
    return "surface";
  }

  if (typeof document === "undefined") return "hero";
  const sentinel = document.querySelector(HERO_END_SENTINEL_SELECTOR);
  if (!sentinel) return "surface";

  const sentinelTop = sentinel.getBoundingClientRect().top;
  const headerHeightPx = getHeaderHeightPx();
  return sentinelTop > headerHeightPx + 1 ? "hero" : "surface";
}

function subscribeDockTone(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  let rafId = 0;

  const notify = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      onStoreChange();
    });
  };

  window.addEventListener("scroll", notify, { passive: true });
  window.addEventListener("resize", notify);

  return () => {
    window.removeEventListener("scroll", notify);
    window.removeEventListener("resize", notify);
    if (rafId) window.cancelAnimationFrame(rafId);
  };
}

function isActiveHref(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DesktopCompanyTrigger({
  active,
  expanded,
  tone,
  controls,
  disclosureRef,
  onPointerFocusEnd,
  onPointerFocusStart,
  onNavigate,
  onToggle,
}: {
  active: boolean;
  expanded: boolean;
  tone: DockTone;
  controls: string;
  disclosureRef: RefObject<HTMLButtonElement | null>;
  onPointerFocusEnd: () => void;
  onPointerFocusStart: () => void;
  onNavigate: () => void;
  onToggle: () => void;
}) {
  const isHeroTone = tone === "hero";

  return (
    <div
      className={cn(
        "flex min-h-11 items-stretch overflow-hidden rounded-full transition-[background-color,color,box-shadow] duration-150",
        isHeroTone
          ? active || expanded
            ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(88,168,224,0.22)]"
            : "text-white/72 hover:bg-white/10 hover:text-white"
          : active || expanded
            ? "bg-transparent text-[#1E3A5F] shadow-[inset_0_0_0_2px_#1E3A5F]"
            : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#1E3A5F]"
      )}
    >
      <CmsAwareLink
        href="/companies"
        aria-current={active ? "page" : undefined}
        onClick={onNavigate}
        className={cn(
          "inline-flex items-center py-2.5 pl-5 pr-3 text-base font-semibold tracking-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#3B82F6]",
          isHeroTone
            ? "hover:bg-white/10"
            : active || expanded
              ? "hover:bg-[#1E3A5F]/[0.06] focus-visible:bg-[#1E3A5F]/[0.06] active:bg-[#1E3A5F]/[0.10]"
              : "hover:bg-[#3B82F6]/[0.06] focus-visible:bg-[#3B82F6]/[0.06]"
        )}
      >
        Компаниям
      </CmsAwareLink>
      <button
        ref={disclosureRef}
        type="button"
        aria-label={
          expanded
            ? "Скрыть услуги для компаний"
            : "Показать услуги для компаний"
        }
        aria-expanded={expanded}
        aria-controls={controls}
        onPointerDown={onPointerFocusStart}
        onPointerUp={onPointerFocusEnd}
        onPointerCancel={onPointerFocusEnd}
        onClick={onToggle}
        className={cn(
          "inline-flex w-11 shrink-0 items-center justify-center border-l transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#3B82F6]",
          isHeroTone
            ? "border-white/10 text-white/70 hover:bg-white/15 hover:text-white focus-visible:bg-white/15 focus-visible:text-white"
            : active || expanded
              ? "border-[#1E3A5F]/20 text-[#1E3A5F] hover:bg-[#1E3A5F]/[0.06] focus-visible:bg-[#1E3A5F]/[0.06] active:bg-[#1E3A5F]/[0.10]"
              : "border-[#1E3A5F]/10 text-[#64748B] hover:bg-[#3B82F6]/[0.06] hover:text-[#1E3A5F] focus-visible:bg-[#3B82F6]/[0.06] focus-visible:text-[#1E3A5F]"
        )}
      >
        <ChevronDown
          aria-hidden="true"
          size={18}
          className={cn(
            "transition-transform duration-200 motion-reduce:transition-none",
            expanded && "rotate-180"
          )}
        />
      </button>
    </div>
  );
}

function DesktopNav({
  pathname,
  tone,
  companyMenuOpen,
  disclosureRef,
  onCancelClose,
  onDisclosureFocus,
  onNavigate,
  onOpenCompanyMenu,
  onPointerFocusEnd,
  onPointerFocusStart,
  onScheduleClose,
  onToggleCompanyMenu,
}: {
  pathname: string | null;
  tone: DockTone;
  companyMenuOpen: boolean;
  disclosureRef: RefObject<HTMLButtonElement | null>;
  onCancelClose: () => void;
  onDisclosureFocus: () => void;
  onNavigate: () => void;
  onOpenCompanyMenu: () => void;
  onPointerFocusEnd: () => void;
  onPointerFocusStart: () => void;
  onScheduleClose: () => void;
  onToggleCompanyMenu: () => void;
}) {
  const isHeroTone = tone === "hero";

  return (
    <div className="ml-5 hidden min-w-0 items-center gap-1.5 xl:flex">
      {NAV_ITEMS.map((item) => {
        const isActive = isActiveHref(pathname, item.href);

        if (item.href === "/companies") {
          return (
            <div
              key={item.href}
              onMouseEnter={() => {
                onCancelClose();
                onOpenCompanyMenu();
              }}
              onMouseLeave={onScheduleClose}
              onFocus={onDisclosureFocus}
            >
              <DesktopCompanyTrigger
                active={isActive}
                expanded={companyMenuOpen}
                tone={tone}
                controls={DESKTOP_COMPANY_PANEL_ID}
                disclosureRef={disclosureRef}
                onPointerFocusEnd={onPointerFocusEnd}
                onPointerFocusStart={onPointerFocusStart}
                onNavigate={onNavigate}
                onToggle={onToggleCompanyMenu}
              />
            </div>
          );
        }

        return (
          <CmsAwareLink
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "inline-flex items-center rounded-full px-5 py-2.5 text-base font-semibold tracking-tight transition-[background-color,color,box-shadow] duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
              isHeroTone
                ? isActive
                  ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(88,168,224,0.22)]"
                  : "text-white/72 hover:bg-white/10 hover:text-white"
                : isActive
                  ? "bg-transparent text-[#1E3A5F] shadow-[inset_0_0_0_2px_#1E3A5F] hover:bg-[#1E3A5F]/[0.06] focus-visible:bg-[#1E3A5F]/[0.06] active:bg-[#1E3A5F]/[0.10]"
                  : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#1E3A5F]"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </CmsAwareLink>
        );
      })}
    </div>
  );
}

function CompactCompanyDisclosure({
  active,
  expanded,
  controls,
  theme,
  disclosureRef,
  onToggle,
}: {
  active: boolean;
  expanded: boolean;
  controls: string;
  theme: CompanyMenuTheme;
  disclosureRef: RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
}) {
  const isDark = theme === "dark";

  return (
    <button
      ref={disclosureRef}
      type="button"
      aria-label={
        expanded
          ? "Скрыть услуги для компаний"
          : "Показать услуги для компаний"
      }
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onToggle}
      className={cn(
        "order-2 flex min-h-12 w-full items-center justify-between gap-4 px-4 text-left font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] md:rounded-xl md:focus-visible:outline-offset-2",
        isDark
          ? expanded
            ? "bg-white/[0.08] text-[#F8FAFC] hover:bg-white/[0.10] focus-visible:outline-[#8FC7EE]"
            : "bg-[#0F1C30] text-[#F8FAFC] hover:bg-white/[0.06] focus-visible:outline-[#8FC7EE]"
          : expanded
            ? "bg-[#DCEAF7] text-[#1E3A5F] shadow-[inset_0_0_0_1px_rgba(59,130,246,0.20)] hover:shadow-[inset_0_0_0_1px_rgba(59,130,246,0.20),inset_0_0_0_999px_rgba(59,130,246,0.06)] focus-visible:outline-[#3B82F6]"
            : active
              ? "bg-[#DCEAF7] text-[#1E3A5F] shadow-[inset_0_0_0_1px_rgba(59,130,246,0.20)] focus-visible:outline-[#3B82F6]"
              : "bg-[#F8FAFC] text-[#1E3A5F] hover:bg-[#F1F5F9] focus-visible:outline-[#3B82F6]"
      )}
    >
      <span>Компаниям</span>
      <ChevronDown
        aria-hidden="true"
        size={18}
        className={cn(
          "shrink-0 transition-transform duration-200 motion-reduce:transition-none",
          isDark ? "text-[#B7C3D3]" : "text-[#475569]",
          expanded && "rotate-180"
        )}
      />
    </button>
  );
}

function CompactNavLink({
  href,
  label,
  pathname,
  theme,
  orderClassName,
  onNavigate,
}: {
  href: string;
  label: string;
  pathname: string | null;
  theme: CompanyMenuTheme;
  orderClassName: string;
  onNavigate: () => void;
}) {
  const isActive = isActiveHref(pathname, href);
  const isDark = theme === "dark";

  return (
    <CmsAwareLink
      href={href}
      aria-current={isActive ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "flex min-h-12 items-center rounded-xl px-4 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
        isDark
          ? isActive
            ? "bg-white/[0.10] text-white shadow-[inset_3px_0_0_#8FC7EE] focus-visible:outline-[#8FC7EE]"
            : "bg-[#0F1C30] text-[#D7E0EA] hover:bg-white/[0.06] hover:text-white focus-visible:outline-[#8FC7EE]"
          : isActive
            ? "bg-[#DCEAF7] text-[#1E3A5F] shadow-[inset_0_0_0_1px_rgba(59,130,246,0.20)] focus-visible:outline-[#3B82F6]"
            : "bg-[#F8FAFC] text-[#1E3A5F] hover:bg-[#F1F5F9] focus-visible:outline-[#3B82F6]",
        orderClassName
      )}
    >
      {label}
    </CmsAwareLink>
  );
}

export function HeaderClient({ companyNavigation }: HeaderClientProps) {
  const pathname = usePathname();
  const [mobileMenu, setMobileMenu] = useState<MenuState>({
    open: false,
    openedOnPath: null,
  });
  const [companyMenu, setCompanyMenu] = useState<MenuState>({
    open: false,
    openedOnPath: null,
  });
  const desktopDisclosureRef = useRef<HTMLButtonElement>(null);
  const compactMobileDisclosureRef = useRef<HTMLButtonElement>(null);
  const compactTabletDisclosureRef = useRef<HTMLButtonElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressDesktopFocusOpenRef = useRef(false);

  const ctaHref =
    pathname?.startsWith("/blog") ||
    isVacanciesPath(pathname) ||
    pathname?.startsWith("/diagnostika")
      ? "/#lead-form"
      : "#lead-form";
  const mobileMenuOpen = mobileMenu.open && mobileMenu.openedOnPath === pathname;
  const companyMenuOpen =
    companyMenu.open && companyMenu.openedOnPath === pathname;

  const cancelCompanyClose = () => {
    if (closeTimerRef.current === null) return;
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const closeCompanyMenu = () => {
    cancelCompanyClose();
    setCompanyMenu({ open: false, openedOnPath: pathname });
  };

  const openCompanyMenu = () => {
    cancelCompanyClose();
    setCompanyMenu({ open: true, openedOnPath: pathname });
  };

  const toggleCompanyMenu = () => {
    if (companyMenuOpen) {
      closeCompanyMenu();
      return;
    }

    openCompanyMenu();
  };

  const scheduleCompanyClose = () => {
    if (
      typeof window === "undefined" ||
      !window.matchMedia("(min-width: 1280px)").matches
    ) {
      return;
    }

    cancelCompanyClose();
    closeTimerRef.current = setTimeout(() => {
      setCompanyMenu({ open: false, openedOnPath: pathname });
      closeTimerRef.current = null;
    }, 280);
  };

  const handleHeaderFocusLeave = (event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    scheduleCompanyClose();
  };

  const handleDesktopDisclosureFocus = () => {
    if (suppressDesktopFocusOpenRef.current) {
      suppressDesktopFocusOpenRef.current = false;
      return;
    }

    openCompanyMenu();
  };

  const closeMobileMenu = () => {
    setMobileMenu({ open: false, openedOnPath: pathname });
    closeCompanyMenu();
  };

  const closeAllMenus = () => {
    closeMobileMenu();
  };

  const toggleMobileMenu = () => {
    const nextOpen = !mobileMenuOpen;
    setMobileMenu({ open: nextOpen, openedOnPath: pathname });
    closeCompanyMenu();
  };

  useEffect(() => {
    if (!companyMenuOpen && !mobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (companyMenuOpen) {
        event.preventDefault();
        if (closeTimerRef.current !== null) {
          clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
        }
        setCompanyMenu({ open: false, openedOnPath: pathname });

        const desktop = window.matchMedia("(min-width: 1280px)").matches;
        if (desktop) {
          suppressDesktopFocusOpenRef.current = true;
          desktopDisclosureRef.current?.focus({ preventScroll: true });
          queueMicrotask(() => {
            suppressDesktopFocusOpenRef.current = false;
          });
        } else {
          const mobileDisclosure = compactMobileDisclosureRef.current;
          const disclosure =
            mobileDisclosure && mobileDisclosure.getClientRects().length > 0
              ? mobileDisclosure
              : compactTabletDisclosureRef.current;
          disclosure?.focus({ preventScroll: true });
        }
        return;
      }

      if (mobileMenuOpen) {
        event.preventDefault();
        setMobileMenu({ open: false, openedOnPath: pathname });
        mobileMenuButtonRef.current?.focus({ preventScroll: true });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [companyMenuOpen, mobileMenuOpen, pathname]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const dockTone = useSyncExternalStore(
    subscribeDockTone,
    () => computeDockTone(pathname),
    () => {
      if (
        pathname?.startsWith("/blog") ||
        isVacanciesPath(pathname) ||
        pathname?.startsWith("/diagnostika")
      ) {
        return "surface";
      }
      return "hero";
    }
  );

  const isHeroTone = dockTone === "hero";
  const companyMenuTheme: CompanyMenuTheme = isHeroTone ? "dark" : "light";
  const shellClassName = cn(
    "relative flex w-full items-center gap-3 overflow-hidden rounded-full lg:pr-3 xl:rounded-[36px]",
    isHeroTone
      ? cn(
          "border border-white/12 bg-white/[0.08] ring-1 ring-white/10",
          "shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        )
      : cn(
          "border border-white/60 bg-white/80 ring-1 ring-[#0F172A]/[0.04]",
          "shadow-[0_18px_60px_rgba(15,23,42,0.14)]"
        ),
    "backdrop-blur-2xl backdrop-saturate-150 px-2 py-2",
    "transition-[background-color,border-color,box-shadow] duration-300 ease-out"
  );

  return (
    <header
      className="sticky top-0 z-50 isolate bg-transparent transition-colors duration-300"
      onFocus={cancelCompanyClose}
      onBlur={handleHeaderFocusLeave}
    >
      <Container>
        <nav
          className="flex h-16 items-center lg:h-20"
          aria-label="Основная навигация"
        >
          <div className={shellClassName}>
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b to-transparent",
                isHeroTone ? "from-white/20" : "from-white/90"
              )}
            />
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_18%_0%,rgba(88,168,224,0.10),transparent_58%),radial-gradient(700px_circle_at_86%_-10%,rgba(59,130,246,0.08),transparent_62%)]",
                isHeroTone ? "opacity-[0.20]" : "opacity-[0.22]"
              )}
            />

            <CmsAwareLink
              href="/"
              onClick={closeAllMenus}
              className="relative z-10 flex shrink-0 items-center gap-1 pl-3 pr-1"
              aria-label="НЦФГ"
            >
              <Image
                src="/logo.svg"
                alt="НЦФГ"
                width={40}
                height={40}
                className={cn(
                  "h-9 w-9 md:h-10 md:w-10",
                  isHeroTone && "brightness-0 invert",
                  isHeroTone &&
                    "drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)]"
                )}
                priority
              />
              <span
                className={cn(
                  "text-base font-semibold leading-none tracking-[0.11em] sm:text-xl lg:text-xl lg:tracking-[0.14em]",
                  isHeroTone ? "text-white" : "text-[#1E3A5F]"
                )}
              >
                НЦФГ
              </span>
            </CmsAwareLink>

            <DesktopNav
              pathname={pathname}
              tone={dockTone}
              companyMenuOpen={companyMenuOpen}
              disclosureRef={desktopDisclosureRef}
              onCancelClose={cancelCompanyClose}
              onDisclosureFocus={handleDesktopDisclosureFocus}
              onNavigate={closeAllMenus}
              onOpenCompanyMenu={openCompanyMenu}
              onPointerFocusEnd={() => {
                suppressDesktopFocusOpenRef.current = false;
              }}
              onPointerFocusStart={() => {
                suppressDesktopFocusOpenRef.current = true;
              }}
              onScheduleClose={scheduleCompanyClose}
              onToggleCompanyMenu={toggleCompanyMenu}
            />

            <div className="relative z-10 ml-auto flex items-center gap-2">
              <Button
                href={ctaHref}
                onClick={() => {
                  closeAllMenus();
                  reachGoal(YM_GOALS.CTA_CLICK);
                }}
                className={cn(
                  "hidden h-10 rounded-full px-5 text-[15px] sm:inline-flex lg:h-11 lg:px-6 lg:text-base",
                  isHeroTone
                    ? "ring-1 ring-white/35 shadow-[0_16px_44px_rgba(88,168,224,0.22)]"
                    : "shadow-[0_12px_32px_rgba(88,168,224,0.18)]"
                )}
              >
                Оставить заявку
              </Button>

              <button
                ref={mobileMenuButtonRef}
                type="button"
                className={cn(
                  "mr-1 inline-flex items-center justify-center rounded-full p-2 transition-colors xl:hidden",
                  isHeroTone
                    ? "text-white/75 hover:bg-white/10 hover:text-white"
                    : "text-[#475569] hover:bg-[#3B82F6]/[0.06] hover:text-[#1E3A5F]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                )}
                onClick={toggleMobileMenu}
                aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
                aria-expanded={mobileMenuOpen}
                aria-controls={MOBILE_MENU_PANEL_ID}
              >
                {mobileMenuOpen ? (
                  <X aria-hidden="true" size={22} />
                ) : (
                  <Menu aria-hidden="true" size={22} />
                )}
              </button>
            </div>
          </div>
        </nav>
      </Container>

      {companyMenuOpen ? (
        <div className="absolute inset-x-0 top-full z-50 hidden xl:block">
          <Container>
            <section
              id={DESKTOP_COMPANY_PANEL_ID}
              aria-label="Услуги для компаний"
              onMouseEnter={cancelCompanyClose}
              onMouseLeave={scheduleCompanyClose}
              className={cn(
                "mt-2 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-[22px] border transition-colors",
                isHeroTone
                  ? "border-white/12 bg-[#0B1324] shadow-[0_24px_80px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.10)]"
                  : "border-white/70 bg-white shadow-[0_22px_60px_rgba(6,20,35,0.35)]"
              )}
            >
              <CompanyMenu
                categories={companyNavigation}
                layout="desktop"
                theme={companyMenuTheme}
                onNavigate={closeAllMenus}
              />
            </section>
          </Container>
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Закрыть меню"
        aria-hidden={!mobileMenuOpen}
        tabIndex={mobileMenuOpen ? 0 : -1}
        className={cn(
          "fixed inset-x-0 bottom-0 top-16 z-40 bg-transparent transition-opacity duration-200 lg:top-20 xl:hidden",
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
        onClick={closeMobileMenu}
      />

      <div
        id={MOBILE_MENU_PANEL_ID}
        aria-hidden={!mobileMenuOpen}
        className={cn(
          "absolute inset-x-0 top-full z-50 overflow-hidden transition-[max-height] duration-300 xl:hidden",
          mobileMenuOpen
            ? "max-h-[calc(100dvh-4rem)]"
            : "pointer-events-none max-h-0"
        )}
      >
        {mobileMenuOpen ? (
          <Container className="pb-4">
            <div
              className={cn(
                "relative mt-2 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-[22px] border p-3 transition-colors",
                isHeroTone
                  ? "border-white/12 bg-[#0B1324] shadow-[0_24px_80px_rgba(0,0,0,0.50),inset_0_1px_0_rgba(255,255,255,0.10)]"
                  : "border-white/70 bg-white shadow-[0_22px_60px_rgba(6,20,35,0.28)]"
              )}
            >
              <div className="grid gap-2 md:grid-cols-2">
                <CompactNavLink
                  href={NAV_ITEMS[0].href}
                  label={NAV_ITEMS[0].label}
                  pathname={pathname}
                  theme={companyMenuTheme}
                  orderClassName="order-1"
                  onNavigate={closeAllMenus}
                />

                <div
                  className={cn(
                    "order-2 overflow-hidden rounded-2xl border transition-colors md:hidden",
                    isHeroTone
                      ? "border-white/10 bg-[#0B1324]"
                      : "border-[#E2E8F0] bg-white"
                  )}
                >
                  <CompactCompanyDisclosure
                    active={isActiveHref(pathname, "/companies")}
                    expanded={companyMenuOpen}
                    controls={MOBILE_COMPANY_PANEL_ID}
                    theme={companyMenuTheme}
                    disclosureRef={compactMobileDisclosureRef}
                    onToggle={toggleCompanyMenu}
                  />

                  {companyMenuOpen ? (
                    <div
                      id={MOBILE_COMPANY_PANEL_ID}
                      className={cn(
                        "border-t",
                        isHeroTone ? "border-white/10" : "border-[#E2E8F0]"
                      )}
                    >
                      <CompanyMenu
                        categories={companyNavigation}
                        layout="mobile"
                        theme={companyMenuTheme}
                        onNavigate={closeAllMenus}
                      />
                    </div>
                  ) : null}
                </div>

                <div className="hidden md:contents">
                  <CompactCompanyDisclosure
                    active={isActiveHref(pathname, "/companies")}
                    expanded={companyMenuOpen}
                    controls={TABLET_COMPANY_PANEL_ID}
                    theme={companyMenuTheme}
                    disclosureRef={compactTabletDisclosureRef}
                    onToggle={toggleCompanyMenu}
                  />
                </div>

                <CompactNavLink
                  href={NAV_ITEMS[2].href}
                  label={NAV_ITEMS[2].label}
                  pathname={pathname}
                  theme={companyMenuTheme}
                  orderClassName="order-3"
                  onNavigate={closeAllMenus}
                />
                <CompactNavLink
                  href={NAV_ITEMS[3].href}
                  label={NAV_ITEMS[3].label}
                  pathname={pathname}
                  theme={companyMenuTheme}
                  orderClassName="order-4"
                  onNavigate={closeAllMenus}
                />

                {companyMenuOpen ? (
                  <div
                    id={TABLET_COMPANY_PANEL_ID}
                    className={cn(
                      "hidden md:order-5 md:col-span-2 md:mt-1 md:block md:overflow-hidden md:rounded-2xl md:border",
                      isHeroTone ? "md:border-white/10" : "md:border-[#E2E8F0]"
                    )}
                  >
                    <CompanyMenu
                      categories={companyNavigation}
                      layout="tablet"
                      theme={companyMenuTheme}
                      onNavigate={closeAllMenus}
                    />
                  </div>
                ) : null}

                <div className="order-6 mt-1 px-2 sm:hidden md:col-span-2">
                  <Button
                    href={ctaHref}
                    className="h-11 w-full rounded-full text-base"
                    onClick={() => {
                      closeAllMenus();
                      reachGoal(YM_GOALS.CTA_CLICK);
                    }}
                  >
                    Оставить заявку
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        ) : null}
      </div>
    </header>
  );
}
