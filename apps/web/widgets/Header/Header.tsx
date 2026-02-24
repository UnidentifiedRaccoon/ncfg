"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { memo, useCallback, useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";

const NAV_ITEMS = [
  { label: "Частным лицам", href: "/individuals" },
  { label: "Компаниям", href: "/companies" },
  { label: "О центре", href: "/about" },
  { label: "Блог", href: "/blog" },
] as const;

function isActiveHref(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const DesktopNav = memo(function DesktopNav({
  pathname,
  prefersReducedMotion,
}: {
  pathname: string | null;
  prefersReducedMotion: boolean;
}) {
  return (
    <div className="ml-5 hidden items-center gap-2 lg:ml-6 lg:flex">
      {NAV_ITEMS.map((item, index) => {
        const isActive = isActiveHref(pathname, item.href);

        return (
          <motion.div
            key={item.href}
            initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{
              duration: 0.42,
              ease: [0.22, 1, 0.36, 1],
              delay: index * 0.04,
            }}
            whileHover={prefersReducedMotion ? undefined : { y: -1.5 }}
          >
            <Link
              href={item.href}
              className={cn(
                "group relative inline-flex items-center overflow-hidden rounded-full px-5 py-2.5 text-[15px] font-semibold tracking-tight transition-[color,transform] duration-500 lg:px-6 lg:py-3 lg:text-base",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
                isActive
                  ? "text-[#123055]"
                  : "text-[#35537C] hover:text-[#183A67] hover:scale-[1.02]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(91,141,255,0.24),transparent_70%)]"
              />
              {isActive && (
                <motion.span
                  layoutId="header-active-pill"
                  className="absolute inset-0 rounded-full border border-[#8DB5FF]/65 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(236,246,255,0.88))] shadow-[0_14px_36px_rgba(28,72,145,0.2)]"
                  transition={{ type: "spring", stiffness: 280, damping: 30, mass: 0.9 }}
                />
              )}
              {isActive && (
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    backgroundImage:
                      "linear-gradient(110deg, transparent 10%, rgba(59,130,246,0.18) 45%, transparent 80%)",
                    backgroundSize: "190% 100%",
                  }}
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : {
                          backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
                          opacity: [0.35, 0.75, 0.35],
                        }
                  }
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
});

export function Header() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion ?? false;
  const mobileMenuPanelId = useId();
  const [mobileMenu, setMobileMenu] = useState<{
    open: boolean;
    openedOnPath: string | null;
  }>({ open: false, openedOnPath: null });

  const ctaHref = pathname?.startsWith("/blog") ? "/#lead-form" : "#lead-form";
  const mobileMenuOpen = mobileMenu.open && mobileMenu.openedOnPath === pathname;

  const closeMobileMenu = useCallback(
    () => setMobileMenu({ open: false, openedOnPath: pathname }),
    [pathname]
  );
  const toggleMobileMenu = useCallback(() => {
    setMobileMenu((state) => {
      const isCurrentlyOpen = state.open && state.openedOnPath === pathname;
      return {
        open: !isCurrentlyOpen,
        openedOnPath: pathname,
      };
    });
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileMenu({ open: false, openedOnPath: pathname });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen, pathname]);

  return (
    <motion.header
      initial={false}
      className="sticky top-0 z-50 isolate bg-transparent"
    >
      <div className="w-full px-4 md:px-6 lg:px-8">
        <nav className="-mt-6 flex h-[84px] items-center lg:h-[106px]" aria-label="Основная навигация">
          <motion.div
            className="relative flex w-full items-center gap-3 overflow-hidden rounded-[999px] border border-[#D8E4FF]/70 bg-[linear-gradient(140deg,rgba(243,248,255,0.78),rgba(234,244,255,0.68))] px-3 py-3 shadow-[0_18px_44px_rgba(20,45,84,0.14)] ring-1 ring-white/35 backdrop-blur-xl backdrop-saturate-150"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    boxShadow: [
                      "0 18px 44px rgba(20,45,84,0.14)",
                      "0 22px 54px rgba(20,45,84,0.17)",
                      "0 18px 44px rgba(20,45,84,0.14)",
                    ],
                  }
            }
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(560px circle at 0% -10%, rgba(48,215,255,0.18), transparent 58%), radial-gradient(640px circle at 100% 0%, rgba(138,92,255,0.14), transparent 62%), radial-gradient(520px circle at 50% 130%, rgba(91,141,255,0.14), transparent 60%)",
                backgroundSize: "140% 140%",
              }}
              animate={
                shouldReduceMotion
                  ? undefined
                  : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
              }
              transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
            />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(115deg, transparent 14%, rgba(255,255,255,0.24) 45%, transparent 76%)",
                backgroundSize: "220% 100%",
                mixBlendMode: "screen",
              }}
              animate={
                shouldReduceMotion
                  ? undefined
                  : { backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"], opacity: [0.12, 0.24, 0.12] }
              }
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            />
            <Link
              href="/"
              className="relative z-10 flex shrink-0 items-center gap-2 pl-4 pr-2"
              aria-label="НЦФГ — на главную"
            >
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                animate={shouldReduceMotion ? undefined : { y: [0, -2, 0] }}
                transition={
                  shouldReduceMotion
                    ? undefined
                    : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
                }
                className="relative p-[2px]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    border: "1px solid transparent",
                    borderImage:
                      "linear-gradient(90deg, rgba(22,194,255,0.12) 0%, rgba(22,194,255,0.85) 20%, rgba(129,229,255,0.95) 50%, rgba(22,194,255,0.85) 80%, rgba(22,194,255,0.12) 100%) 1",
                    boxShadow:
                      "0 0 10px rgba(22,194,255,0.34), 0 0 24px rgba(22,194,255,0.22)",
                  }}
                />
                <div className="relative z-10 inline-flex items-center gap-2 px-2.5 py-1.5">
                  <Image
                    src="/logo.svg"
                    alt="НЦФГ"
                    width={40}
                    height={40}
                    className="h-10 w-10 lg:h-11 lg:w-11"
                    priority
                  />
                  <motion.span
                    className="text-base font-semibold leading-none tracking-[0.11em] text-[#132B4A] sm:text-xl lg:text-[24px] lg:tracking-[0.14em]"
                    animate={shouldReduceMotion ? undefined : { opacity: [1, 0.92, 1] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    НЦФГ
                  </motion.span>
                </div>
              </motion.div>
            </Link>

            <DesktopNav pathname={pathname} prefersReducedMotion={shouldReduceMotion} />

            <div className="relative z-10 ml-auto flex items-center gap-2">
              <motion.div
                className="hidden sm:block"
                whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { y: 0, scale: 0.99 }}
              >
                <Button
                  href={ctaHref}
                  className="h-11 rounded-full px-6 text-[15px] shadow-[0_14px_34px_rgba(48,215,255,0.28)] lg:h-12 lg:px-7 lg:text-base"
                >
                  Оставить заявку
                </Button>
              </motion.div>

              <button
                type="button"
                className={cn(
                  "mr-1 inline-flex items-center justify-center rounded-full p-2.5 transition-colors lg:hidden",
                  "text-[#3D557A] hover:bg-[#3B82F6]/[0.10] hover:text-[#1E3A5F]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                )}
                onClick={toggleMobileMenu}
                aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
                aria-expanded={mobileMenuOpen}
                aria-controls={mobileMenuPanelId}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </motion.div>
        </nav>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Закрыть меню"
              className="fixed inset-x-0 top-16 bottom-0 z-40 bg-transparent lg:hidden"
              onClick={closeMobileMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            <motion.div
              id={mobileMenuPanelId}
              className="absolute inset-x-0 top-full z-50 overflow-hidden lg:hidden"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="w-full px-4 pb-4 md:px-6 lg:px-8">
                <div className="relative mt-2 overflow-hidden rounded-2xl border border-[#D8E4FF]/70 bg-[linear-gradient(140deg,rgba(243,248,255,0.86),rgba(234,244,255,0.78))] shadow-[0_18px_40px_rgba(20,45,84,0.16)] ring-1 ring-white/35 backdrop-blur-xl">
                  <div className="relative p-2">
                    {NAV_ITEMS.map((item) => {
                      const isActive = isActiveHref(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "group relative block overflow-hidden rounded-xl px-4 py-3.5 text-base font-semibold tracking-tight transition-[color,transform,background-color] duration-200",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
                            isActive
                              ? "bg-[linear-gradient(135deg,rgba(59,130,246,0.14),rgba(88,168,224,0.16))] text-[#1E3A5F]"
                              : "text-[#475569] hover:bg-[#3B82F6]/[0.06] hover:text-[#1E3A5F] hover:translate-x-0.5"
                          )}
                          aria-current={isActive ? "page" : undefined}
                          onClick={closeMobileMenu}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "pointer-events-none absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full transition-all duration-200",
                              isActive
                                ? "bg-[#3B82F6] opacity-100"
                                : "bg-[#3B82F6]/70 opacity-0 group-hover:opacity-100"
                            )}
                          />
                          {item.label}
                        </Link>
                      );
                    })}

                    <div className="mt-2 px-2 sm:hidden">
                      <motion.div whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}>
                        <Button
                          href={ctaHref}
                          className="h-11 w-full rounded-full text-base"
                          onClick={closeMobileMenu}
                        >
                          Оставить заявку
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
