import type { StructuredDataSchema } from "@/shared/lib/structured-data";

interface StructuredDataScriptProps {
  data: StructuredDataSchema | StructuredDataSchema[];
}

export function StructuredDataScript({ data }: StructuredDataScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
