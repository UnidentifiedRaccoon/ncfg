import { MarkdownContent, Section } from "@/shared/ui";
import { CheckCircle } from "lucide-react";

interface ServiceDescriptionProps {
  descriptionTitle?: string;
  descriptionMarkdown?: string;
  benefitsTitle?: string;
  benefits?: string[];
}

export function ServiceDescription({
  descriptionTitle,
  descriptionMarkdown,
  benefitsTitle,
  benefits,
}: ServiceDescriptionProps) {
  const subsectionTitleClassName =
    "mb-6 text-[28px] font-bold text-[#1E3A5F] md:text-4xl";
  const normalizedDescriptionMarkdown = descriptionMarkdown?.trim();
  const descriptionContent = normalizedDescriptionMarkdown ?? "";
  const normalizedBenefits = (benefits ?? [])
    .map((benefit) => benefit.trim())
    .filter((benefit) => benefit.length > 0);

  const hasDescription = Boolean(normalizedDescriptionMarkdown);
  const hasBenefits = normalizedBenefits.length > 0;
  const hasTwoColumns = hasDescription && hasBenefits;

  if (!hasDescription && !hasBenefits) {
    return null;
  }

  return (
    <Section id="description">
      <div
        className={`grid grid-cols-1 gap-10 lg:gap-12${hasTwoColumns ? " lg:grid-cols-2" : ""}`}
      >
        {hasDescription && (
          <div className="max-w-3xl">
            <h2 className={subsectionTitleClassName}>
              {descriptionTitle?.trim() || "Описание услуги"}
            </h2>
            <MarkdownContent content={descriptionContent} className="post-content" />
          </div>
        )}

        {hasBenefits && (
          <div id="benefits" className="max-w-3xl">
            <h2 className={subsectionTitleClassName}>
              {benefitsTitle?.trim() || "Преимущества"}
            </h2>
            <ul className="space-y-4">
              {normalizedBenefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#10B981]" />
                  <span className="leading-relaxed text-[#475569]">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Section>
  );
}
