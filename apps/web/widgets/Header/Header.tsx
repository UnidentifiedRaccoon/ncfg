"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

import { Button } from "@/shared/ui/Button";
import { CmsAwareLink } from "@/shared/ui/CmsAwareLink";
import { Container } from "@/shared/ui/Container";
import { cn } from "@/shared/lib/cn";
import { reachGoal, YM_GOALS } from "@/shared/lib/ym";

const NAV_ITEMS = [
  { label: "Частным лицам", href: "/individuals" },
  { label: "Компаниям", href: "/companies" },
  { label: "О центре", href: "/about" },
  { label: "Блог", href: "/blog" },
] as const;

type DockTone = "hero" | "surface";

const HERO_END_SENTINEL_SELECTOR = "[data-header-hero-end]";
const MOBILE_MENU_PANEL_ID = "site-mobile-menu";

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

function DesktopNav({
  pathname,
  tone,
}: {
  pathname: string | null;
  tone: DockTone;
}) {
  const isHeroTone = tone === "hero";

  return (
    <div className="hidden lg:flex items-center gap-1 ml-4 lg:gap-1.5 lg:ml-5">
      {NAV_ITEMS.map((item) => {
        const isActive = isActiveHref(pathname, item.href);

        return (
          <CmsAwareLink
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center rounded-full px-4 py-2 text-[15px] font-semibold tracking-tight transition-[background-color,color,box-shadow] duration-150 lg:px-5 lg:py-2.5 lg:text-base",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
              isHeroTone
                ? isActive
                  ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(88,168,224,0.22)]"
                  : "text-white/72 hover:bg-white/10 hover:text-white"
                : isActive
                  ? "bg-white/70 text-[#1E3A5F] shadow-[inset_0_0_0_1px_rgba(59,130,246,0.22)]"
                  : "text-[#475569] hover:bg-white/60 hover:text-[#1E3A5F]"
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

export function Header() {
  const pathname = usePathname();
  const [mobileMenu, setMobileMenu] = useState<{
    open: boolean;
    openedOnPath: string | null;
  }>({ open: false, openedOnPath: null });

  const ctaHref =
    pathname?.startsWith("/blog") ||
    isVacanciesPath(pathname) ||
    pathname?.startsWith("/diagnostika")
      ? "/#lead-form"
      : "#lead-form";
  const mobileMenuOpen = mobileMenu.open && mobileMenu.openedOnPath === pathname;

  const closeMobileMenu = () =>
    setMobileMenu({ open: false, openedOnPath: pathname });

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileMenu({ open: false, openedOnPath: pathname });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen, pathname]);

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

  const shellClassName = cn(
    "relative flex w-full items-center gap-3 overflow-hidden rounded-full",
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
    <header className="sticky top-0 z-50 isolate bg-transparent transition-colors duration-300">
      <Container>
        <nav className="flex h-16 items-center lg:h-20" aria-label="Основная навигация">
          <div className={shellClassName}>
            <>
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
            </>

            <CmsAwareLink
              href="/"
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
                  isHeroTone && "drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)]"
                )}
                priority
              />
              <span
                className={cn(
                  "text-base font-semibold tracking-[0.11em] leading-none sm:text-xl lg:text-xl lg:tracking-[0.14em]",
                  isHeroTone ? "text-white" : "text-[#1E3A5F]"
                )}
              >
                НЦФГ
              </span>
            </CmsAwareLink>

            <DesktopNav pathname={pathname} tone={dockTone} />

            <div className="relative z-10 ml-auto flex items-center gap-2">
              <Button
                href={ctaHref}
                onClick={() => reachGoal(YM_GOALS.CTA_CLICK)}
                className={cn(
                  "hidden h-10 px-5 text-[15px] sm:inline-flex lg:h-11 lg:px-6 lg:text-base rounded-full",
                  isHeroTone
                    ? "ring-1 ring-white/35 shadow-[0_16px_44px_rgba(88,168,224,0.22)]"
                    : "shadow-[0_12px_32px_rgba(88,168,224,0.18)]"
                )}
              >
                Оставить заявку
              </Button>

              <button
                type="button"
                className={cn(
                  "mr-1 inline-flex items-center justify-center rounded-full p-2 transition-colors lg:hidden",
                  isHeroTone
                    ? "text-white/75 hover:bg-white/10 hover:text-white"
                    : "text-[#475569] hover:bg-[#3B82F6]/[0.06] hover:text-[#1E3A5F]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                )}
                onClick={() =>
                  setMobileMenu((state) => {
                    const isCurrentlyOpen =
                      state.open && state.openedOnPath === pathname;
                    return {
                      open: !isCurrentlyOpen,
                      openedOnPath: pathname,
                    };
                  })
                }
                aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
                aria-expanded={mobileMenuOpen}
                aria-controls={MOBILE_MENU_PANEL_ID}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </nav>
      </Container>

      <button
        type="button"
        aria-label="Закрыть меню"
        aria-hidden={!mobileMenuOpen}
        tabIndex={mobileMenuOpen ? 0 : -1}
        className={cn(
          "lg:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-transparent transition-opacity duration-200",
          mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeMobileMenu}
      />

      <div
        id={MOBILE_MENU_PANEL_ID}
        aria-hidden={!mobileMenuOpen}
        className={cn(
          "lg:hidden absolute inset-x-0 top-full z-50 overflow-hidden transition-[max-height] duration-300",
          mobileMenuOpen
            ? "max-h-96"
            : "max-h-0 pointer-events-none"
        )}
      >
        <Container className="pb-4">
          <div
            className={cn(
              "relative mt-2 overflow-hidden rounded-2xl backdrop-blur-2xl",
              isHeroTone
                ? cn(
                    "border border-white/12 bg-white/[0.06] ring-1 ring-white/10",
                    "shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
                  )
                : cn(
                    "border border-white/70 bg-white/85 ring-1 ring-[#0F172A]/[0.04]",
                    "shadow-[0_18px_60px_rgba(15,23,42,0.12)]"
                  ),
              "transition-[background-color,border-color,box-shadow] duration-300 ease-out"
            )}
          >
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b to-transparent",
                isHeroTone ? "from-white/12" : "from-white/80"
              )}
            />

            <div className="relative p-2">
              {NAV_ITEMS.map((item) => {
                const isActive = isActiveHref(pathname, item.href);
                return (
                  <CmsAwareLink
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-base font-semibold tracking-tight transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
                      isHeroTone
                        ? isActive
                          ? "bg-white/12 text-white"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                        : isActive
                          ? "bg-[#3B82F6]/10 text-[#1E3A5F]"
                          : "text-[#475569] hover:bg-[#3B82F6]/[0.06] hover:text-[#1E3A5F]"
                    )}
                    aria-current={isActive ? "page" : undefined}
                    onClick={closeMobileMenu}
                    tabIndex={mobileMenuOpen ? 0 : -1}
                  >
                    {item.label}
                  </CmsAwareLink>
                );
              })}

              <div className="mt-2 px-2 sm:hidden">
                <Button
                  href={ctaHref}
                  className="h-11 w-full rounded-full text-base"
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  onClick={() => { closeMobileMenu(); reachGoal(YM_GOALS.CTA_CLICK); }}
                >
                  Оставить заявку
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
}
