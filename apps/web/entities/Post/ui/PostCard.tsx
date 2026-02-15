import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/shared/lib/cn";

export interface PostCardPost {
  id: string | number;
  title: string;
  tags: string[];
  slug: string;
  anonsImage: string | null;
  createdAt: string;
  excerpt?: string;
}

interface PostCardProps {
  post: PostCardPost;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const COVER_VARIANTS = [
  "bg-gradient-to-br from-[#1E3A5F] via-[#1E3A5F] to-[#3B82F6]",
  "bg-gradient-to-br from-[#0F172A] via-[#1E3A5F] to-[#58A8E0]",
  "bg-gradient-to-tr from-[#1E3A5F] via-[#3B82F6] to-[#58A8E0]",
  "bg-gradient-to-br from-[#1E3A5F] via-[#0F172A] to-[#3B82F6]",
  "bg-gradient-to-r from-[#1E3A5F] via-[#3B82F6] to-[#1E3A5F]",
] as const;

function hashString(input: string): number {
  // Deterministic, fast, good enough for picking a cover variant.
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function BrandedCover({ slug, primaryTag }: { slug: string; primaryTag?: string }) {
  const variant = COVER_VARIANTS[hashString(slug) % COVER_VARIANTS.length];
  const tag = primaryTag?.trim();

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-end overflow-hidden",
        variant,
        "transition-transform duration-300 group-hover:scale-[1.02]",
        "before:absolute before:inset-0 before:content-[''] before:opacity-80 before:[background-image:radial-gradient(circle_at_18%_28%,rgba(255,255,255,0.20),transparent_55%),radial-gradient(circle_at_85%_75%,rgba(88,168,224,0.35),transparent_60%)]",
        "after:absolute after:inset-0 after:content-[''] after:opacity-20 after:[background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.14)_0,rgba(255,255,255,0.14)_1px,transparent_1px,transparent_12px)]"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />

      {tag && (
        <div className="absolute left-3 top-3 max-w-[85%] truncate rounded-full border border-white/20 bg-white/15 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {tag}
        </div>
      )}

      <div
        className="absolute bottom-3 right-3 select-none text-4xl font-bold tracking-tight text-white/25"
        aria-hidden="true"
      >
        НЦФГ
      </div>
    </div>
  );
}

export function PostCard({ post }: PostCardProps) {
  const tags = post.tags.filter((t) => t && t.trim().length > 0).slice(0, 3);
  const primaryTag = tags[0];
  const hasImage = Boolean(post.anonsImage && post.anonsImage.length > 0);
  const hasExcerpt = Boolean(post.excerpt && post.excerpt.trim().length > 0);

  return (
    <article className="group relative w-full max-w-[624px] overflow-hidden rounded-xl border border-[#E2E8F0]/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3B82F6]/25 hover:shadow-md lg:max-w-[760px] after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-[#58A8E0]/70 after:via-[#3B82F6]/45 after:to-transparent after:opacity-0 after:transition-opacity after:duration-200 group-hover:after:opacity-100">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="flex flex-col md:flex-row">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F8FAFC] md:w-[240px] md:flex-none md:border-r md:border-[#E2E8F0]/70 lg:w-[280px]">
            {hasImage ? (
              <>
                <Image
                  src={post.anonsImage!}
                  alt={post.title}
                  fill
                  sizes="(min-width: 1024px) 280px, (min-width: 768px) 240px, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                {/* Normalize covers from different sources: subtle tint + inner frame */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#58A8E0]/12 via-transparent to-[#3B82F6]/10"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5"
                  aria-hidden="true"
                />
              </>
            ) : (
              <BrandedCover slug={post.slug} primaryTag={primaryTag} />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {tags.map((tag, idx) => (
                <span
                  key={`${tag}-${idx}`}
                  className={cn(
                    "inline-flex max-w-full items-center truncate rounded-full border px-2 py-0.5 font-medium",
                    idx === 0
                      ? "border-[#3B82F6]/30 bg-[#3B82F6]/5 text-[#3B82F6]"
                      : "border-[#E2E8F0] bg-[#F8FAFC] text-[#1E3A5F]"
                  )}
                >
                  {tag}
                </span>
              ))}
              {tags.length > 0 && <span className="text-[#E2E8F0]">•</span>}
              <time className="whitespace-nowrap text-[#94A3B8]">
                {formatDate(post.createdAt)}
              </time>
            </div>

            <h3 className="mt-3 text-[20px] md:text-[22px] leading-snug font-semibold text-[#1E3A5F] transition-colors group-hover:text-[#3B82F6] line-clamp-2">
              {post.title}
            </h3>

            {hasExcerpt && (
              <p className="mt-3 text-sm leading-relaxed text-[#475569] line-clamp-2">
                {post.excerpt}
              </p>
            )}

            <div className={cn("mt-auto flex justify-end pt-4", !hasExcerpt && "pt-3")}>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[#1E3A5F] transition-colors group-hover:text-[#3B82F6]">
                Читать
                <ArrowRight className="h-4 w-4 text-[#94A3B8] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#3B82F6]" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
