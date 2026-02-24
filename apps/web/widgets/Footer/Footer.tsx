"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/shared/ui/Button";
import { AnimatedGlyph } from "@/shared/ui/AnimatedGlyph";
import { cn } from "@/shared/lib/cn";

interface LegalDocument {
  label: string;
  href: string;
  type: string;
}

interface FooterData {
  organization: {
    fullName: string;
    shortName: string;
  };
  contacts: {
    phone: string;
    email: string;
    legalAddress: string;
  };
  social: Array<{
    label: string;
    href: string;
  }>;
  legalLinks: Array<{
    label: string;
    href: string;
  }>;
  legalDocuments: {
    title: string;
    items: LegalDocument[];
  };
  copyright: {
    years: string;
    text: string;
    notice: string;
  };
}

interface FooterProps {
  data: FooterData;
}

const navigation = [
  { label: "Частным лицам", href: "/individuals" },
  { label: "Компаниям", href: "/companies" },
  { label: "О центре", href: "/about" },
  { label: "Блог", href: "/blog" },
  { label: "Рекомендации", href: "/rekomendacii" },
] as const;

function normalizeCopyrightLine(value: string): string {
  return value
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\.$/, "")
    .trim()
    .toLowerCase();
}

function FooterLink({
  href,
  className,
  external = false,
  children,
}: {
  href: string;
  className?: string;
  external?: boolean;
  children: ReactNode;
}) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
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

export function Footer({ data }: FooterProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const legalDocuments = data.legalDocuments?.items ?? [];
  const hasLegalDocuments = legalDocuments.length > 0;
  const mapId = "footer-address-map";

  const panelClassName =
    "overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#08162D_0%,#10274D_52%,#143360_100%)]";
  const sectionTitleClassName =
    "text-[11px] font-semibold uppercase tracking-[0.12em] text-white/62";
  const linkClassName = "text-sm text-white/78 transition-colors hover:text-white";
  const mutedTextClassName = "text-sm text-white/64";
  const iconAccentClassName = "text-[#30D7FF]";
  const ctaButtonClassName =
    "h-10 rounded-full !bg-white !text-[#0B1B36] border border-white hover:!bg-white/90";

  const phoneSanitized = data.contacts.phone.replace(/\s/g, "");
  const ctaHref = "/#lead-form";
  const mapSrc = useMemo(() => {
    const encoded = encodeURIComponent(data.contacts.legalAddress);
    return `https://yandex.ru/map-widget/v1/?mode=search&text=${encoded}&z=18&l=map`;
  }, [data.contacts.legalAddress]);

  const copyrightTitle = data.copyright.years
    ? `© ${data.copyright.years} ${data.organization.shortName}.`
    : `© ${data.organization.shortName}.`;

  const showCopyrightText =
    Boolean(data.copyright.text.trim()) &&
    normalizeCopyrightLine(data.copyright.text) !==
      normalizeCopyrightLine(copyrightTitle);

  return (
    <footer id="contacts" className="relative -mt-px overflow-hidden bg-transparent text-white">
      <div className="relative z-10 w-full px-4 md:px-6 lg:px-8">
        <div className="py-0">
          <div className={cn("relative", panelClassName)}>
            <div className="relative p-6 md:p-8">
              <div className="flex flex-col gap-6 pb-6 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <motion.p
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="text-xs font-semibold uppercase tracking-[0.1em] text-white/64"
                  >
                    Национальный центр финансовой грамотности
                  </motion.p>
                  <motion.h2
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
                    className="mt-1 text-2xl font-semibold leading-tight tracking-tight text-white md:text-3xl"
                  >
                    Развиваем финансовую культуру людей и компаний
                  </motion.h2>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                  <a
                    href={`tel:${phoneSanitized}`}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 text-sm font-medium text-white transition-colors hover:bg-white/15"
                  >
                    <AnimatedGlyph
                      icon="phone"
                      size={14}
                      className={iconAccentClassName}
                    />
                    {data.contacts.phone}
                  </a>
                  <Button href={ctaHref} variant="secondary" size="sm" className={ctaButtonClassName}>
                    Оставить заявку
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-12">
                <div className="md:col-span-5">
                  <Link href="/" className="inline-flex items-center gap-3">
                    <Image
                      src="/logo.svg"
                      alt="НЦФГ"
                      width={40}
                      height={40}
                      className="h-10 w-10 brightness-0 invert"
                    />
                    <span className="text-base font-extrabold tracking-[0.14em] text-white">
                      {data.organization.shortName}
                    </span>
                  </Link>
                  <p className={cn("mt-3 max-w-[56ch] leading-relaxed", mutedTextClassName)}>
                    {data.organization.fullName}
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-white/80">
                    <a
                      href={`mailto:${data.contacts.email}`}
                      className="inline-flex items-center gap-2 transition-colors hover:text-white"
                    >
                      <AnimatedGlyph
                        icon="mail"
                        size={14}
                        className={iconAccentClassName}
                      />
                      {data.contacts.email}
                    </a>
                    <button
                      type="button"
                      className="group inline-flex items-start gap-2 text-left text-white/70 transition-colors hover:text-white"
                      onClick={() => setIsMapOpen((current) => !current)}
                      aria-expanded={isMapOpen}
                      aria-controls={mapId}
                    >
                      <AnimatedGlyph
                        icon="map-pin"
                        size={14}
                        className={cn(iconAccentClassName, "mt-0.5 shrink-0")}
                      />
                      <span>
                        {data.contacts.legalAddress}
                        <span className="ml-2 text-xs text-[#8FC5FF] group-hover:text-[#B9DBFF]">
                          {isMapOpen ? "Скрыть карту" : "Показать карту"}
                        </span>
                      </span>
                    </button>
                  </div>

                  <motion.div
                    id={mapId}
                    initial={false}
                    animate={
                      isMapOpen
                        ? { height: "auto", opacity: 1, marginTop: 12 }
                        : { height: 0, opacity: 0, marginTop: 0 }
                    }
                    transition={{ duration: 0.32, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-white/16 bg-[#0A1D3A]/70">
                      <iframe
                        title={`Карта: ${data.contacts.legalAddress}`}
                        src={mapSrc}
                        className="h-[220px] w-full md:h-[250px]"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                      <div
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full"
                        aria-hidden="true"
                      >
                        <span className="absolute -inset-2 rounded-full bg-[#F97316]/35 blur-sm" />
                        <span className="relative block h-4 w-4 rounded-full border-2 border-white bg-[#F97316] shadow-[0_0_16px_rgba(249,115,22,0.75)]" />
                        <span className="absolute left-1/2 top-[12px] h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-white/90 bg-[#F97316]" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="md:col-span-3">
                  <h3 className={sectionTitleClassName}>Навигация</h3>
                  <ul className="mt-3 space-y-2">
                    {navigation.map((item, index) => (
                      <motion.li
                        key={item.href}
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.65 }}
                        transition={{
                          duration: 0.28,
                          ease: "easeOut",
                          delay: 0.04 * index,
                        }}
                      >
                        <Link href={item.href} className={cn(linkClassName, "hover:translate-x-0.5 inline-block transition-transform")}>
                          {item.label}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                  {data.legalLinks.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {data.legalLinks.map((item) => {
                        const isInternal = item.href.startsWith("/");
                        return (
                          <li key={item.href}>
                            <FooterLink
                              href={item.href}
                              external={!isInternal}
                              className={linkClassName}
                            >
                              {item.label}
                            </FooterLink>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="md:col-span-4">
                  <h3 className={sectionTitleClassName}>Ресурсы</h3>
                  <ul className="mt-3 space-y-2">
                    {data.social.map((item, index) => (
                      <motion.li
                        key={item.href}
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.65 }}
                        transition={{
                          duration: 0.28,
                          ease: "easeOut",
                          delay: 0.04 * index,
                        }}
                      >
                        <a
                          href={item.href}
                          className={linkClassName}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.label}
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                  {hasLegalDocuments && (
                    <>
                      <h4 className={cn(sectionTitleClassName, "mt-4")}>
                        {data.legalDocuments.title}
                      </h4>
                      <ul className="mt-3 space-y-2">
                        {legalDocuments.map((doc) => (
                          <li key={doc.href}>
                            <a
                              href={doc.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn("inline-flex items-center gap-2", linkClassName)}
                            >
                              <AnimatedGlyph
                                icon="file-text"
                                size={14}
                                className={iconAccentClassName}
                              />
                              <span>{doc.label}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 text-xs text-white/52 md:flex md:flex-wrap md:items-center md:gap-x-5">
                <p>{copyrightTitle}</p>
                {showCopyrightText && <p className="mt-1 md:mt-0">{data.copyright.text}</p>}
                {data.copyright.notice && <p className="mt-1 md:mt-0">{data.copyright.notice}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
