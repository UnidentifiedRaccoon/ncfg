import { Section } from "@/shared/ui/Section";
import { type ServiceExample } from "@/shared/api/types/service";
import { ExternalLink, FileText, Lightbulb, Presentation } from "lucide-react";
import Link from "next/link";

interface ServiceExamplesProps {
  examples: ServiceExample[];
  title?: string;
}

interface ExampleCardProps {
  example: ServiceExample;
}

function getTypeIcon(type?: string) {
  switch (type) {
    case "link":
      return <ExternalLink className="w-4 h-4" />;
    case "presentation":
      return <Presentation className="w-4 h-4" />;
    case "fact":
      return <Lightbulb className="w-4 h-4" />;
    case "material":
      return <FileText className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
}

function getTypeLabel(type?: string) {
  switch (type) {
    case "link":
      return "Ссылка";
    case "presentation":
      return "Презентация";
    case "fact":
      return "Факт";
    case "material":
      return "Материал";
    default:
      return "Материал";
  }
}

function ExampleCard({ example }: ExampleCardProps) {
  const hasType = Boolean(example.type);

  const CardContent = (
    <>
      {hasType && (
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full 
                       bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-medium"
          >
            {getTypeIcon(example.type)}
            {getTypeLabel(example.type)}
          </span>
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2 group-hover:text-[#3B82F6] transition-colors">
        {example.title}
      </h3>
      {example.description && (
        <p className="text-sm text-[#475569] leading-relaxed">
          {example.description}
        </p>
      )}
      {example.notes && (
        <p className="mt-2 text-xs text-[#94A3B8] italic">{example.notes}</p>
      )}
      {example.link && (
        <div className="mt-4 flex items-center gap-1.5 text-sm text-[#3B82F6] font-medium">
          Перейти
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      )}
    </>
  );

  const cardClasses = `bg-white rounded-xl border border-[#F1F5F9] p-6
                       hover:border-[#3B82F6]/30 hover:shadow-lg hover:-translate-y-1
                       transition-all duration-200 h-full group`;

  if (example.link) {
    return (
      <Link
        href={example.link}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClasses}
      >
        {CardContent}
      </Link>
    );
  }

  return <div className={cardClasses}>{CardContent}</div>;
}

export function ServiceExamples({
  examples,
  title = "Примеры работ",
}: ServiceExamplesProps) {
  if (!examples || examples.length === 0) {
    return null;
  }

  return (
    <Section id="examples" title={title}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {examples.map((example) => (
          <ExampleCard key={example.id} example={example} />
        ))}
      </div>
    </Section>
  );
}
