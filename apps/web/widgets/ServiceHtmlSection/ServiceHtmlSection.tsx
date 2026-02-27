import { Section } from "@/shared/ui/Section";

interface ServiceHtmlSectionProps {
  id: string;
  html?: string;
}

export function ServiceHtmlSection({ id, html }: ServiceHtmlSectionProps) {
  const normalizedHtml = html?.trim();

  if (!normalizedHtml) {
    return null;
  }

  return (
    <Section id={id}>
      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: normalizedHtml }}
      />
    </Section>
  );
}
