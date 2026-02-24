"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { memo, useCallback, useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Button } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
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
              duration: 0.28,
              ease: "easeOut",
              delay: index * 0.04,
            }}
            whileHover={prefersReducedMotion ? undefined : { y: -1, scale: 1.02 }}
          >
            <Link
              href={item.href}
              className={cn(
                "relative inline-flex items-center rounded-full px-5 py-2.5 text-[15px] font-semibold tracking-tight transition-[color,transform] duration-200 lg:px-6 lg:py-3 lg:text-base",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
                isActive ? "text-[#123055]" : "text-[#35537C] hover:text-[#183A67]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="header-active-pill"
                  className="absolute inset-0 rounded-full bg-white/78 shadow-[0_8px_24px_rgba(17,39,73,0.16)] ring-1 ring-[#3B82F6]/20"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
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
      initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-50 isolate bg-transparent"
    >
      <Container>
        <nav className="flex h-[74px] items-center lg:h-[92px]" aria-label="Основная навигация">
          <motion.div
            className="relative flex w-full items-center gap-3 overflow-hidden rounded-[999px] border border-[#CFE0FF]/80 bg-white/74 px-2.5 py-2.5 shadow-[0_22px_62px_rgba(26,66,132,0.2)] ring-1 ring-white/70 backdrop-blur-2xl backdrop-saturate-150"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    boxShadow: [
                      "0 22px 62px rgba(26,66,132,0.20)",
                      "0 28px 78px rgba(52,106,198,0.22)",
                      "0 22px 62px rgba(26,66,132,0.20)",
                    ],
                  }
            }
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(95deg,#EAF6FF 0%,#DCEEFF 32%,#D7F5FF 62%,#EFE7FF 100%)",
                backgroundSize: "220% 100%",
              }}
              animate={
                shouldReduceMotion
                  ? undefined
                  : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
              }
              transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_20%_0%,rgba(91,141,255,0.18),transparent_60%),radial-gradient(700px_circle_at_85%_-20%,rgba(138,92,255,0.14),transparent_64%)]"
            />
            <Link
              href="/"
              className="relative z-10 flex shrink-0 items-center gap-2 pl-3.5 pr-1.5"
              aria-label="НЦФГ — на главную"
            >
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { scale: 1.08, rotate: -3 }}
                animate={shouldReduceMotion ? undefined : { y: [0, -2, 0] }}
                transition={
                  shouldReduceMotion
                    ? undefined
                    : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                }
              >
                <Image
                  src="/logo.svg"
                  alt="НЦФГ"
                  width={40}
                  height={40}
                  className="h-10 w-10 lg:h-11 lg:w-11"
                  priority
                />
              </motion.div>
              <motion.span
                className="text-base font-semibold leading-none tracking-[0.11em] text-[#132B4A] sm:text-xl lg:text-[22px] lg:tracking-[0.14em]"
                animate={shouldReduceMotion ? undefined : { opacity: [1, 0.92, 1] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              >
                НЦФГ
              </motion.span>
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
      </Container>

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
              <Container className="pb-4">
                <div className="relative mt-2 overflow-hidden rounded-2xl border border-[#CFE0FF]/80 bg-white/84 shadow-[0_18px_60px_rgba(26,66,132,0.2)] ring-1 ring-white/70 backdrop-blur-2xl">
                  <div className="relative p-2">
                    {NAV_ITEMS.map((item) => {
                      const isActive = isActiveHref(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "block rounded-xl px-4 py-3.5 text-base font-semibold tracking-tight transition-colors",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
                            isActive
                              ? "bg-[#3B82F6]/10 text-[#1E3A5F]"
                              : "text-[#475569] hover:bg-[#3B82F6]/[0.06] hover:text-[#1E3A5F]"
                          )}
                          aria-current={isActive ? "page" : undefined}
                          onClick={closeMobileMenu}
                        >
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
              </Container>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
