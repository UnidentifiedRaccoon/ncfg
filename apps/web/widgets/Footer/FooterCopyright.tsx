import { cn } from "@/shared/lib/cn";
import type { FooterData } from "@/shared/lib/footer-data";
import type { FooterTheme } from "./footer-theme";
import { normalizeCopyrightLine } from "./footer-theme";

interface FooterCopyrightProps {
  organizationShortName: string;
  copyright: FooterData["copyright"];
  theme: FooterTheme;
}

export function FooterCopyright({
  organizationShortName,
  copyright,
  theme,
}: FooterCopyrightProps) {
  const copyrightTitle = copyright.years
    ? `© ${copyright.years} ${organizationShortName}.`
    : `© ${organizationShortName}.`;

  const showCopyrightText =
    Boolean(copyright.text.trim()) &&
    normalizeCopyrightLine(copyright.text) !==
      normalizeCopyrightLine(copyrightTitle);

  return (
    <div className={cn("px-6 py-5 md:px-8 md:py-6 border-t", theme.dividerClassName)}>
      <div
        className={cn(
          "flex flex-col gap-1 text-sm",
          theme.tone === "light" ? "text-[#475569]" : "text-white/50"
        )}
      >
        <p>{copyrightTitle}</p>
        {showCopyrightText && <p>{copyright.text}</p>}
        {copyright.notice && <p>{copyright.notice}</p>}
      </div>
    </div>
  );
}
