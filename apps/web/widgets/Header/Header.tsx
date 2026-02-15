"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";

import { Button } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { cn } from "@/shared/lib/cn";

const NAV_ITEMS = [
  { label: "Частным лицам", href: "/individuals" },
  { label: "Компаниям", href: "/companies" },
  { label: "О центре", href: "/about" },
  { label: "Блог", href: "/blog" },
] as const;

const HEADER_VARIANTS = ["dock", "rail", "pills"] as const;
export type HeaderVariant = (typeof HEADER_VARIANTS)[number];

type DockTone = "hero" | "surface";

const HERO_END_SENTINEL_SELECTOR = "[data-header-hero-end]";

function getHeaderHeightPx() {
  return window.matchMedia("(min-width: 768px)").matches ? 80 : 64;
}

function computeDockTone(options: {
  variant: HeaderVariant;
  pathname: string | null;
}): DockTone {
  if (typeof window === "undefined") return "hero";
  if (options.variant !== "dock") return "surface";
  if (options.pathname?.startsWith("/blog")) return "surface";

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

function isHeaderVariant(value: unknown): value is HeaderVariant {
  return (
    typeof value === "string" &&
    (HEADER_VARIANTS as readonly string[]).includes(value)
  );
}

function isActiveHref(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function resolveVariant(variant?: HeaderVariant): HeaderVariant {
  if (variant) return variant;
  const env = process.env.NEXT_PUBLIC_HEADER_VARIANT;
  if (isHeaderVariant(env)) return env;
  return "dock";
}

function DesktopNav({
  pathname,
  variant,
  tone,
}: {
  pathname: string | null;
  variant: HeaderVariant;
  tone: DockTone;
}) {
  if (variant === "pills") {
    return (
      <div className="hidden md:flex flex-1 justify-center">
        <div className="relative flex items-center gap-1 rounded-full border border-[#E2E8F0]/70 bg-white/70 px-1.5 py-1 shadow-sm backdrop-blur-sm">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/70 to-transparent"
          />
          {NAV_ITEMS.map((item) => {
            const isActive = isActiveHref(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold tracking-tight transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
                  isActive
                    ? "bg-[#3B82F6]/10 text-[#1E3A5F]"
                    : "text-[#475569] hover:bg-[#3B82F6]/[0.06] hover:text-[#1E3A5F]"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  const isHeroTone = tone === "hero";

  if (variant === "rail") {
    return (
      <div className="hidden md:flex items-center gap-7 ml-8">
        {NAV_ITEMS.map((item) => {
          const isActive = isActiveHref(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative py-2 text-sm font-semibold tracking-tight transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B82F6]",
                isActive
                  ? "text-[#1E3A5F]"
                  : "text-[#475569] hover:text-[#1E3A5F]",
                "after:absolute after:inset-x-0 after:-bottom-3 after:h-[2px] after:rounded-full after:bg-[#3B82F6]",
                isActive
                  ? "after:opacity-100"
                  : "after:opacity-0 hover:after:opacity-60",
                "after:transition-opacity after:duration-150"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-1 ml-4 lg:gap-1.5 lg:ml-5">
      {NAV_ITEMS.map((item) => {
        const isActive = isActiveHref(pathname, item.href);

        return (
          <Link
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
          </Link>
        );
      })}
    </div>
  );
}

export function Header({ variant }: { variant?: HeaderVariant }) {
  const pathname = usePathname();
  const [mobileMenu, setMobileMenu] = useState<{
    open: boolean;
    openedOnPath: string | null;
  }>({ open: false, openedOnPath: null });

  const resolvedVariant = useMemo(() => resolveVariant(variant), [variant]);
  const ctaHref = pathname?.startsWith("/blog") ? "/#lead-form" : "#lead-form";
  const mobileMenuOpen = mobileMenu.open && mobileMenu.openedOnPath === pathname;

  const dockTone = useSyncExternalStore(
    subscribeDockTone,
    () =>
      computeDockTone({
        variant: resolvedVariant,
        pathname,
      }),
    () => {
      if (resolvedVariant !== "dock") return "surface";
      if (pathname?.startsWith("/blog")) return "surface";
      return "hero";
    }
  );

  const isHeroTone = dockTone === "hero";

  const shellClassName =
    resolvedVariant === "dock"
      ? cn(
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
        )
      : cn("relative flex w-full items-center gap-3");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 isolate transition-colors duration-300",
        resolvedVariant === "dock" && "bg-transparent",
        resolvedVariant === "pills" &&
          "border-b border-[#E2E8F0]/70 bg-[#F8FAFC]/80 backdrop-blur-xl",
        resolvedVariant === "rail" &&
          "border-b border-[#E2E8F0]/80 bg-white/90 backdrop-blur-md"
      )}
    >
      <Container>
        <nav className="flex h-16 items-center md:h-20" aria-label="Основная навигация">
          <div className={shellClassName}>
            {resolvedVariant === "dock" && (
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
            )}

            <Link
              href="/"
              className="relative z-10 flex shrink-0 items-center gap-3 pl-3 pr-1"
              aria-label="НЦФГ — на главную"
            >
              <Image
                src="/logo.svg"
                alt="НЦФГ"
                width={40}
                height={40}
                className={cn(
                  "h-9 w-9 md:h-10 md:w-10",
                  isHeroTone && "drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)]"
                )}
                priority
              />
              <span
                className={cn(
                  "text-base font-black tracking-[0.14em] leading-none sm:text-lg lg:text-xl lg:tracking-[0.18em]",
                  isHeroTone ? "text-white" : "text-[#1E3A5F]"
                )}
              >
                НЦФГ
              </span>
            </Link>

            <DesktopNav pathname={pathname} variant={resolvedVariant} tone={dockTone} />

            <div className="relative z-10 ml-auto flex items-center gap-2 pr-2">
              <Button
                href={ctaHref}
                className={cn(
                  "hidden h-10 px-5 text-[15px] sm:inline-flex lg:h-11 lg:px-6 lg:text-base",
                  resolvedVariant === "dock" &&
                    cn(
                      "rounded-full",
                      isHeroTone
                        ? "ring-1 ring-white/35 shadow-[0_16px_44px_rgba(88,168,224,0.22)]"
                        : "shadow-[0_12px_32px_rgba(88,168,224,0.18)]"
                    ),
                  resolvedVariant === "rail" &&
                    "shadow-[0_16px_44px_rgba(88,168,224,0.18)]"
                )}
              >
                Оставить заявку
              </Button>

              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center rounded-full p-2 transition-colors md:hidden",
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
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </nav>
      </Container>

      <div
        aria-hidden={!mobileMenuOpen}
        className={cn(
          "overflow-hidden transition-[max-height,opacity] duration-300 md:hidden",
          mobileMenuOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 pointer-events-none opacity-0"
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
                  <Link
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
                    onClick={() =>
                      setMobileMenu({ open: false, openedOnPath: pathname })
                    }
                    tabIndex={mobileMenuOpen ? 0 : -1}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className="mt-2 px-2 sm:hidden">
                <Button
                  href={ctaHref}
                  className="h-11 w-full rounded-full text-base"
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  onClick={() => setMobileMenu({ open: false, openedOnPath: pathname })}
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

