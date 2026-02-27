import { Section } from "@/shared/ui";
import { CheckCircle } from "lucide-react";

interface ServiceDescriptionProps {
  benefitsTitle?: string;
  benefits?: string[];
}

export function ServiceDescription({
  benefitsTitle,
  benefits,
}: ServiceDescriptionProps) {
  const normalizedBenefits = (benefits ?? [])
    .map((benefit) => benefit.trim())
    .filter((benefit) => benefit.length > 0);

  if (normalizedBenefits.length === 0) {
    return null;
  }

  return (
    <Section id="benefits">
      <div className="max-w-3xl">
        <h2 className="mb-6 text-xl font-bold text-[#1E3A5F] md:text-2xl">
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
    </Section>
  );
}
