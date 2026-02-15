const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  "#39": "'",
};

function decodeHtmlEntities(input: string): string {
  return input.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (match, entity) => {
    if (typeof entity !== "string") return match;

    // Numeric: decimal
    if (entity.startsWith("#") && !entity.startsWith("#x")) {
      const num = Number(entity.slice(1));
      if (!Number.isFinite(num)) return match;
      try {
        return String.fromCodePoint(num);
      } catch {
        return match;
      }
    }

    // Numeric: hex
    if (entity.startsWith("#x")) {
      const num = Number.parseInt(entity.slice(2), 16);
      if (!Number.isFinite(num)) return match;
      try {
        return String.fromCodePoint(num);
      } catch {
        return match;
      }
    }

    return NAMED_ENTITIES[entity] ?? match;
  });
}

export function stripHtmlToText(html: string): string {
  if (!html) return "";

  // Remove scripts/styles completely.
  const withoutDangerous = html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    // Preserve some breaks to avoid word gluing.
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6)>/gi, "\n");

  const withoutTags = withoutDangerous.replace(/<[^>]+>/g, " ");
  const decoded = decodeHtmlEntities(withoutTags);

  return decoded.replace(/\s+/g, " ").trim();
}

export function makeExcerpt(text: string, maxLen: number): string {
  const cleaned = (text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  if (cleaned.length <= maxLen) return cleaned;

  const hardCut = Math.max(0, maxLen - 3);
  const sliced = cleaned.slice(0, hardCut);
  const lastSpace = sliced.lastIndexOf(" ");
  const cut = lastSpace >= 60 ? lastSpace : sliced.length;

  return `${sliced.slice(0, cut).trimEnd()}...`;
}

