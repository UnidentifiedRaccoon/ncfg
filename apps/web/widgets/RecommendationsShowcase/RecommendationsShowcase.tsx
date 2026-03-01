"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface RecommendationItem {
  id: number;
  company: string;
  quote: string;
}

interface RecommendationsShowcaseProps {
  items: RecommendationItem[];
}

const WIDE_CARD_THRESHOLD_RATIO = 1.7;
const URL_PATTERN = /https?:\/\/[^\s)]+/g;

interface RecommendationCardLayoutItem {
  item: RecommendationItem;
  isWide: boolean;
}

function quoteLength(item: RecommendationItem): number {
  return item.quote.trim().length;
}

function isHttpUrl(part: string): boolean {
  return /^https?:\/\/[^\s)]+$/.test(part);
}

function linkifyText(text: string): ReactNode[] {
  const chunks = text.split(URL_PATTERN);
  const urls = text.match(URL_PATTERN) ?? [];

  return chunks.flatMap((chunk, index) => {
    const nodes: ReactNode[] = [];

    if (chunk.length > 0) {
      nodes.push(chunk);
    }

    const url = urls[index];
    if (url && isHttpUrl(url)) {
      nodes.push(
        <a
          key={`url-${index}-${url}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#3B82F6] underline decoration-[#93C5FD] underline-offset-2 hover:text-[#1D4ED8]"
        >
          {url}
        </a>
      );
    }

    return nodes;
  });
}

function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[middle];
  }

  return (sorted[middle - 1] + sorted[middle]) / 2;
}

function buildCardRows(items: RecommendationItem[]): RecommendationCardLayoutItem[][] {
  const lengthMedian = median(items.map(quoteLength));
  const wideThreshold = lengthMedian * WIDE_CARD_THRESHOLD_RATIO;

  const layoutItems = items.map((item) => ({
    item,
    isWide: quoteLength(item) >= wideThreshold,
  }));

  const rows: RecommendationCardLayoutItem[][] = [];

  for (let index = 0; index < layoutItems.length; ) {
    const current = layoutItems[index];
    const next = layoutItems[index + 1];

    if (current.isWide) {
      rows.push([current]);
      index += 1;
      continue;
    }

    if (next && !next.isWide) {
      rows.push([current, next]);
      index += 2;
      continue;
    }

    rows.push([current]);
    index += 1;
  }

  return rows;
}

function companyInitials(company: string): string {
  const letters = company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("");

  return letters || "•";
}

function RecommendationCard({
  item,
  isWide,
  expanded,
  onToggleExpanded,
  className,
}: {
  item: RecommendationItem;
  isWide: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
  className?: string;
}) {
  const quoteId = `recommendation-quote-${item.id}`;
  const showClamp = isWide && !expanded;

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E2E8F0] bg-white/85 p-5 shadow-sm transition-transform duration-300 ease-out will-change-transform md:hover:scale-[1.02] motion-reduce:transform-none",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-sm font-bold text-[#1E3A5F]">
          {companyInitials(item.company)}
        </div>
        <div>
          <div className="text-sm font-semibold text-[#1E3A5F]">{item.company}</div>
          <div className="text-xs uppercase tracking-[0.08em] text-[#94A3B8]">
            Партнер
          </div>
        </div>
      </div>

      <blockquote className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[#475569] md:text-[15px]">
        <div
          id={quoteId}
          className={cn(
            showClamp &&
              "overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:10]"
          )}
        >
          {linkifyText(item.quote)}
        </div>
      </blockquote>

      {isWide && (
        <button
          type="button"
          aria-controls={quoteId}
          aria-expanded={expanded}
          onClick={onToggleExpanded}
          className={cn(
            "mt-4 inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-[#3B82F6]",
            "transition-colors hover:bg-[#3B82F6]/10 hover:text-[#1D4ED8]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
          )}
        >
          {expanded ? "Свернуть" : "Читать дальше"}
        </button>
      )}
    </div>
  );
}

function CapitalGrid({
  rows,
  expandedById,
  onToggleExpanded,
}: {
  rows: RecommendationCardLayoutItem[][];
  expandedById: Record<number, boolean>;
  onToggleExpanded: (id: number) => void;
}) {
  return (
    <article id="capital-grid">
      <div className="space-y-4">
        {rows.map((row) => (
          <div
            key={`row-${row.map((entry) => entry.item.id).join("-")}`}
            className="grid gap-4 md:grid-cols-2"
          >
            {row.map((entry) => (
              <RecommendationCard
                key={`v1-${entry.item.id}`}
                item={entry.item}
                isWide={entry.isWide}
                expanded={Boolean(expandedById[entry.item.id])}
                onToggleExpanded={() => onToggleExpanded(entry.item.id)}
                className={row.length === 1 ? "md:col-span-2" : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    </article>
  );
}

export function RecommendationsShowcase({
  items,
}: RecommendationsShowcaseProps) {
  const [expandedById, setExpandedById] = useState<Record<number, boolean>>({});

  const normalizedItems = items.filter(
    (item) => item.company.trim().length > 0 && item.quote.trim().length > 0
  );
  const rows = buildCardRows(normalizedItems);

  const handleToggleExpanded = (id: number): void => {
    setExpandedById((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (normalizedItems.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 text-[#475569]">
        Данные рекомендаций отсутствуют.
      </div>
    );
  }

  return (
    <CapitalGrid
      rows={rows}
      expandedById={expandedById}
      onToggleExpanded={handleToggleExpanded}
    />
  );
}
