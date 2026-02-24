export const POST_COVER_VARIANTS = [
  "bg-gradient-to-br from-[#0E1838] via-[#243C7A] to-[#5B8DFF]",
  "bg-gradient-to-br from-[#0D142E] via-[#25366F] to-[#30D7FF]",
  "bg-gradient-to-tr from-[#111E42] via-[#5B8DFF] to-[#8A5CFF]",
  "bg-gradient-to-br from-[#0D1B3E] via-[#1A2B5E] to-[#6C95FF]",
  "bg-gradient-to-r from-[#111F45] via-[#4C7AEB] to-[#1A2B5E]",
] as const;

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getPostCoverVariant(slug: string): string {
  return POST_COVER_VARIANTS[hashString(slug) % POST_COVER_VARIANTS.length];
}
