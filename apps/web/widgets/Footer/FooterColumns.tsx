import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import type { FooterData, FooterLegalDocument } from "@/shared/lib/footer-data";
import { FOOTER_NAVIGATION } from "./navigation";
import type { FooterTheme } from "./footer-theme";

interface FooterColumnsProps {
  data: FooterData;
  phoneSanitized: string;
  hasLegalDocuments: boolean;
  theme: FooterTheme;
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

interface FooterBrandColumnProps {
  organization: FooterData["organization"];
  contacts: FooterData["contacts"];
  phoneSanitized: string;
  theme: FooterTheme;
  className: string;
}

function FooterBrandColumn({
  organization,
  contacts,
  phoneSanitized,
  theme,
  className,
}: FooterBrandColumnProps) {
  return (
    <div className={className}>
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/logo.svg"
          alt="НЦФГ"
          width={40}
          height={40}
          className={cn("h-10 w-10", theme.tone === "light" ? "" : "brightness-0 invert")}
        />
        <span
          className={cn(
            "text-base sm:text-lg font-black tracking-[0.14em] leading-none",
            theme.tone === "light" ? "text-[#1E3A5F]" : "text-white"
          )}
        >
          {organization.shortName}
        </span>
      </Link>

      <p className={cn("mt-4 leading-relaxed", theme.mutedTextClassName)}>
        {organization.fullName}
      </p>

      <div className={cn("mt-5 space-y-2", theme.mutedTextClassName)}>
        <a
          href={`tel:${phoneSanitized}`}
          className={cn(
            "flex items-center gap-2 transition-colors",
            theme.tone === "light"
              ? "text-[#475569] hover:text-[#1E3A5F]"
              : "text-white/70 hover:text-white"
          )}
        >
          <Phone size={14} className={theme.iconAccentClassName} />
          {contacts.phone}
        </a>
        <a
          href={`mailto:${contacts.email}`}
          className={cn(
            "flex items-center gap-2 transition-colors",
            theme.tone === "light"
              ? "text-[#475569] hover:text-[#1E3A5F]"
              : "text-white/70 hover:text-white"
          )}
        >
          <Mail size={14} className={theme.iconAccentClassName} />
          {contacts.email}
        </a>
        <div
          className={cn(
            "flex items-start gap-2",
            theme.tone === "light" ? "text-[#475569]" : "text-white/70"
          )}
        >
          <MapPin size={14} className={cn(theme.iconAccentClassName, "shrink-0 mt-0.5")} />
          <span>{contacts.legalAddress}</span>
        </div>
      </div>
    </div>
  );
}

interface FooterNavigationColumnProps {
  theme: FooterTheme;
  className: string;
}

function FooterNavigationColumn({ theme, className }: FooterNavigationColumnProps) {
  return (
    <div className={className}>
      <h3 className={theme.sectionTitleClassName}>Навигация</h3>
      <ul className="mt-4 space-y-3">
        {FOOTER_NAVIGATION.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={theme.linkClassName}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface FooterSocialColumnProps {
  social: FooterData["social"];
  legalLinks: FooterData["legalLinks"];
  theme: FooterTheme;
  className: string;
}

function FooterSocialColumn({
  social,
  legalLinks,
  theme,
  className,
}: FooterSocialColumnProps) {
  return (
    <div className={className}>
      <h3 className={theme.sectionTitleClassName}>Социальные сети</h3>
      <ul className="mt-4 space-y-3">
        {social.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className={theme.linkClassName}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      {legalLinks.length > 0 && (
        <div className="mt-7">
          <h4 className={cn(theme.sectionTitleClassName, "text-sm")}>
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
                    className={theme.linkClassName}
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
  );
}

interface FooterLegalDocumentsColumnProps {
  legalDocuments: FooterData["legalDocuments"];
  theme: FooterTheme;
  className: string;
}

function getLegalDocBadge(type: FooterLegalDocument["type"]) {
  if (type === "pdf" || type === "docx") return type.toUpperCase();
  return null;
}

function FooterLegalDocumentsColumn({
  legalDocuments,
  theme,
  className,
}: FooterLegalDocumentsColumnProps) {
  return (
    <div className={className}>
      <h3 className={theme.sectionTitleClassName}>{legalDocuments.title}</h3>
      <ul className="mt-4 space-y-3">
        {legalDocuments.items.map((doc) => {
          const badge = getLegalDocBadge(doc.type);

          return (
            <li key={doc.href} className="flex items-start gap-3">
              <FileText
                size={16}
                className={cn(theme.iconAccentClassName, "shrink-0 mt-0.5")}
              />
              <a
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(theme.linkClassName, "flex-1")}
              >
                {doc.label}
              </a>
              {badge && <span className={theme.badgeClassName}>{badge}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function FooterColumns({
  data,
  phoneSanitized,
  hasLegalDocuments,
  theme,
}: FooterColumnsProps) {
  const columnClassName = cn(
    "px-6 py-6 md:px-8 md:py-7 border-t first:border-t-0 md:border-t-0",
    theme.dividerClassName
  );

  return (
    <div
      className={cn(
        "grid gap-0 md:grid-cols-2",
        hasLegalDocuments ? "lg:grid-cols-4" : "lg:grid-cols-3",
        "md:[&>*:nth-child(even)]:border-l lg:[&>*:nth-child(n+2)]:border-l"
      )}
    >
      <FooterBrandColumn
        organization={data.organization}
        contacts={data.contacts}
        phoneSanitized={phoneSanitized}
        theme={theme}
        className={columnClassName}
      />
      <FooterNavigationColumn theme={theme} className={columnClassName} />
      <FooterSocialColumn
        social={data.social}
        legalLinks={data.legalLinks}
        theme={theme}
        className={columnClassName}
      />
      {hasLegalDocuments && (
        <FooterLegalDocumentsColumn
          legalDocuments={data.legalDocuments}
          theme={theme}
          className={columnClassName}
        />
      )}
    </div>
  );
}
