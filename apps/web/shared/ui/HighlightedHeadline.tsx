export function HighlightedHeadline({
  text,
  accentWord,
  accentClassName = "text-[#3B82F6] animate-[textGlow_3s_ease-in-out_infinite]",
}: {
  text: string;
  accentWord?: string | string[];
  accentClassName?: string;
}) {
  if (!accentWord) return <>{text}</>;

  const words = Array.isArray(accentWord) ? accentWord : [accentWord];

  // Build a regex that matches any of the accent words
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`);
  const parts = text.split(re);

  if (parts.length === 1) return <>{text}</>;

  const wordSet = new Set(words);

  return (
    <>
      {parts.map((part, i) =>
        wordSet.has(part) ? (
          <span key={i} className={accentClassName}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
