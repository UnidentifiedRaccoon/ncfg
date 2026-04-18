import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mail, Phone, FileText, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { Container } from "@/shared/ui/Container";
import { Button } from "@/shared/ui/Button";
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
  { label: "Диагностика", href: "/diagnostika/financial-wellbeing" },
  { label: "Портфолио", href: "/portfolio" },
  { label: "О центре", href: "/about" },
  { label: "Вакансии", href: "/vacancies" },
  { label: "История", href: "/history" },
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

function normalizeLegalLinkHref({
  label,
  href,
}: {
  label: string;
  href: string;
}): string {
  const normalizedLabel = label.trim().toLowerCase();

  if (normalizedLabel.includes("политика конфиденциальности")) {
    return "/politika-konfidencialnosti";
  }

  if (normalizedLabel.includes("пользовательское соглашение")) {
    return "/polzovatelskoe-soglashenie";
  }

  return href;
}

function FooterBackdrop() {
  return (
    <>
      <div aria-hidden="true" className="absolute inset-0 bg-[#050B16]" />

      <div
        aria-hidden="true"
        className="absolute -top-48 -left-48 h-[520px] w-[520px] rounded-full bg-[#3B82F6]/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-56 left-1/4 h-[640px] w-[640px] rounded-full bg-[#58A8E0]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -top-56 -right-40 h-[620px] w-[620px] rounded-full bg-[#1E3A5F]/55 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:48px_48px]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/55"
      />
    </>
  );
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
  const hasLegalDocuments =
    Boolean(data.legalDocuments) && data.legalDocuments.items.length > 0;
  const legalLinks = data.legalLinks.map((item) => ({
    ...item,
    href: normalizeLegalLinkHref(item),
  }));

  const panelClassName =
    "rounded-2xl border border-white/12 bg-[#0B1324] shadow-[0_28px_90px_rgba(0,0,0,0.55)] overflow-hidden";

  const dividerClassName = "border-white/10";

  const sectionTitleClassName = "text-sm font-semibold text-white";

  const linkClassName =
    "text-sm text-white/65 hover:text-white transition-colors hover:underline underline-offset-4 decoration-white/25";

  const mutedTextClassName = "text-sm text-white/65";

  const iconAccentClassName = "text-[#58A8E0]";

  const badgeClassName =
    "rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/60";

  const ctaButtonClassName =
    "rounded-full !bg-white/10 !text-white border border-white/20 hover:!bg-white/15 hover:shadow-[0_16px_44px_rgba(88,168,224,0.16)]";

  const phoneSanitized = data.contacts.phone.replace(/\s/g, "");
  const ctaHref = "/#lead-form";
  const officeAddress = "Бульвар Матроса Железняка, 13";
  const officeAddressHref =
    "https://yandex.ru/maps/?text=%D0%91%D1%83%D0%BB%D1%8C%D0%B2%D0%B0%D1%80%20%D0%9C%D0%B0%D1%82%D1%80%D0%BE%D1%81%D0%B0%20%D0%96%D0%B5%D0%BB%D0%B5%D0%B7%D0%BD%D1%8F%D0%BA%D0%B0%2C%2013";

  const copyrightTitle = data.copyright.years
    ? `© ${data.copyright.years} ${data.organization.shortName}.`
    : `© ${data.organization.shortName}.`;

  const showCopyrightText =
    Boolean(data.copyright.text.trim()) &&
    normalizeCopyrightLine(data.copyright.text) !==
      normalizeCopyrightLine(copyrightTitle);

  return (
    <footer id="contacts" className="relative overflow-hidden bg-[#050B16] text-white">
      <FooterBackdrop />

      <Container className="relative z-10">
        <div className="py-12 md:py-16">
          <div className={cn("relative", panelClassName)}>
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-12",
                "bg-gradient-to-b from-white/[0.06] to-transparent"
              )}
            />

            <div
              className={cn(
                "relative flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8 md:py-7",
                "border-b",
                dividerClassName
              )}
            >
              <div className="min-w-0">
                <div
                  className="text-xs font-semibold text-white/60"
                >
                  Консультация бесплатно
                </div>
                <div
                  className="mt-1 text-lg md:text-xl font-semibold tracking-tight text-white"
                >
                  Поможем выбрать формат программы
                </div>
                <div
                  className="mt-1 text-sm text-white/65"
                >
                  Ответим в течение 1 дня
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  href={ctaHref}
                  variant="secondary"
                  size="md"
                  data-ym-goal="cta_click"
                  className={ctaButtonClassName}
                >
                  Оставить заявку
                  <ArrowRight
                    className="ml-2 h-4 w-4 opacity-80"
                    aria-hidden="true"
                  />
                </Button>

                <a
                  href={`tel:${phoneSanitized}`}
                  data-ym-goal="phone_click"
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-full border px-6 text-base font-semibold transition-colors",
                    "border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Phone size={14} className={iconAccentClassName} />
                  {data.contacts.phone}
                </a>

                <a
                  href={`mailto:${data.contacts.email}`}
                  data-ym-goal="email_click"
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-full border px-6 text-base font-semibold transition-colors",
                    "border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Mail size={14} className={iconAccentClassName} />
                  {data.contacts.email}
                </a>
              </div>
            </div>

            <div
              className={cn(
                "grid gap-0 md:grid-cols-2",
                hasLegalDocuments ? "lg:grid-cols-4" : "lg:grid-cols-3",
                "md:[&>*:nth-child(even)]:border-l lg:[&>*:nth-child(n+2)]:border-l"
              )}
            >
              <div
                className={cn(
                  "px-6 py-6 md:px-8 md:py-7 border-t first:border-t-0 md:border-t-0",
                  dividerClassName
                )}
              >
                <Link
                  href="/"
                  className="flex shrink-0 items-center gap-1"
                  aria-label="НЦФГ — на главную"
                >
                  <Image
                    src="/logo.svg"
                    alt="НЦФГ"
                    width={40}
                    height={40}
                    className="h-9 w-9 md:h-10 md:w-10 brightness-0 invert"
                  />
                  <span
                    className="text-base font-semibold leading-none tracking-[0.11em] text-white sm:text-xl lg:text-xl lg:tracking-[0.14em]"
                  >
                    {data.organization.shortName}
                  </span>
                </Link>

                <p className={cn("mt-4 leading-relaxed", mutedTextClassName)}>
                  {data.organization.fullName}
                </p>

                <div className={cn("mt-5 space-y-2", mutedTextClassName)}>
                  <a
                    href={`tel:${phoneSanitized}`}
                    data-ym-goal="phone_click"
                    className={cn(
                      "flex items-center gap-2 transition-colors",
                      "text-white/70 hover:text-white"
                    )}
                  >
                    <Phone size={14} className={iconAccentClassName} />
                    {data.contacts.phone}
                  </a>
                  <a
                    href={`mailto:${data.contacts.email}`}
                    data-ym-goal="email_click"
                    className={cn(
                      "flex items-center gap-2 transition-colors",
                      "text-white/70 hover:text-white"
                    )}
                  >
                    <Mail size={14} className={iconAccentClassName} />
                    {data.contacts.email}
                  </a>
                  <a
                    href={officeAddressHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-ym-goal="map_click"
                    className={cn(
                      "flex items-start gap-2 transition-colors",
                      "text-white/70 hover:text-white"
                    )}
                  >
                    <MapPin size={14} className={cn(iconAccentClassName, "mt-0.5 shrink-0")} />
                    <span>{officeAddress}</span>
                  </a>
                </div>
              </div>

              <div
                className={cn(
                  "px-6 py-6 md:px-8 md:py-7 border-t first:border-t-0 md:border-t-0",
                  dividerClassName
                )}
              >
                <h3 className={sectionTitleClassName}>Навигация</h3>
                <ul className="mt-4 space-y-3">
                  {navigation.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={linkClassName}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className={cn(
                  "px-6 py-6 md:px-8 md:py-7 border-t first:border-t-0 md:border-t-0",
                  dividerClassName
                )}
              >
                <h3 className={sectionTitleClassName}>Социальные сети</h3>
                <ul className="mt-4 space-y-3">
                  {data.social.map((item) => (
                    <li key={item.href}>
                      <a href={item.href} className={linkClassName} target="_blank" rel="noopener noreferrer" data-ym-goal="social_click">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>

                {legalLinks.length > 0 && (
                  <div className="mt-7">
                    <h4 className={cn(sectionTitleClassName, "text-sm")}>
                      Юридическая информация
                    </h4>
                    <ul className="mt-3 space-y-2">
                      {legalLinks.map((item) => {
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
                  </div>
                )}
              </div>

              {hasLegalDocuments && (
                <div
                  className={cn(
                    "px-6 py-6 md:px-8 md:py-7 border-t first:border-t-0 md:border-t-0",
                    dividerClassName
                  )}
                >
                  <h3 className={sectionTitleClassName}>{data.legalDocuments.title}</h3>
                  <ul className="mt-4 space-y-3">
                    {data.legalDocuments.items.map((doc) => {
                      const badge =
                        doc.type === "pdf" || doc.type === "docx"
                          ? doc.type.toUpperCase()
                          : null;

                      return (
                        <li key={doc.href} className="flex items-start gap-3">
                          <FileText
                            size={16}
                            className={cn(iconAccentClassName, "shrink-0 mt-0.5")}
                          />
                          <a
                            href={doc.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-ym-goal="document_download"
                            className={cn(linkClassName, "flex-1")}
                          >
                            {doc.label}
                          </a>
                          {badge && <span className={badgeClassName}>{badge}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className={cn("px-6 py-5 md:px-8 md:py-6 border-t", dividerClassName)}>
              <div
                className="flex flex-col gap-1 text-sm text-white/50"
              >
                <p>{copyrightTitle}</p>
                {showCopyrightText && <p>{data.copyright.text}</p>}
                {data.copyright.notice && <p>{data.copyright.notice}</p>}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
