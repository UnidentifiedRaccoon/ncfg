import { Info } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { MarkdownContent, Section } from "@/shared/ui";

interface ServiceMarkdownSectionProps {
  id: string;
  title?: string;
  markdown?: string;
  variant?: "default" | "info-card";
  className?: string;
}

export function ServiceMarkdownSection({
  id,
  title,
  markdown,
  variant = "default",
  className,
}: ServiceMarkdownSectionProps) {
  const normalizedMarkdown = markdown?.trim();

  if (!normalizedMarkdown) {
    return null;
  }

  if (variant === "info-card") {
    return (
      <Section id={id} className={className}>
        <article
          className={cn(
            "group relative isolate overflow-hidden rounded-2xl border p-5 md:p-7",
            "transition-[border-color,box-shadow,background-color] duration-300",
            "border-[#E2E8F0] bg-white shadow-sm",
            "hover:border-[#3B82F6]/25 hover:shadow-md"
          )}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-[#3B82F6]">
              <Info aria-hidden className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-semibold tracking-tight text-[#1E3A5F] md:text-xl">
              {title?.trim() || "Полезная информация"}
            </h3>
          </div>

          <MarkdownContent
            content={normalizedMarkdown}
            className={cn(
              "post-content max-w-none",
              "[&_p]:text-[#334155] [&_p]:leading-relaxed [&_p:last-child]:mb-0",
              "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
              "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
              "[&_li]:text-[#334155] [&_strong]:text-[#1E3A5F]",
              "[&_a]:font-medium [&_a]:text-[#3B82F6] [&_a]:underline-offset-2",
              "[&_a:hover]:text-[#1D4ED8] [&_a:hover]:underline"
            )}
          />
        </article>
      </Section>
    );
  }

  return (
    <Section id={id} className={className}>
      <div className="max-w-3xl">
        {title?.trim() && (
          <h2 className="mb-6 text-[28px] font-bold text-[#1E3A5F] md:text-4xl">
            {title.trim()}
          </h2>
        )}
        <MarkdownContent content={normalizedMarkdown} className="post-content" />
      </div>
    </Section>
  );
}
