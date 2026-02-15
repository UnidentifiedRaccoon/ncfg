import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Section } from "@/shared/ui/Section";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";
import { makeExcerpt, stripHtmlToText } from "@/shared/lib/excerpt";

import type { NewsArticleData } from "@/shared/api/data-provider";

interface NewsProps {
  title: string;
  lead?: string;
  posts: NewsArticleData[];
  archiveHref?: string;
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
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function BrandedCover({ slug, categoryTitle }: { slug: string; categoryTitle?: string }) {
  const variant = COVER_VARIANTS[hashString(slug) % COVER_VARIANTS.length];
  const label = categoryTitle?.trim();

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
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0" />

      {label && (
        <div className="absolute left-3 top-3 max-w-[85%] truncate rounded-full border border-white/20 bg-white/15 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {label}
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

function Cover({
  post,
  sizes,
}: {
  post: Pick<NewsArticleData, "slug" | "title" | "anonsImage" | "category">;
  sizes: string;
}) {
  const categoryTitle = post.category?.title;
  const hasImage = Boolean(post.anonsImage && post.anonsImage.length > 0);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#F8FAFC]">
      {hasImage ? (
        <>
          <Image
            src={post.anonsImage!}
            alt={post.title}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
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
        <BrandedCover slug={post.slug} categoryTitle={categoryTitle} />
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0"
      />
    </div>
  );
}

export function News({ title, lead, posts, archiveHref = "/blog" }: NewsProps) {
  if (!Array.isArray(posts) || posts.length === 0) return null;

  const featured = posts[0];
  const compact = posts.slice(1, 4);
  const featuredCategoryTitle = featured.category?.title;
  const featuredExcerpt = makeExcerpt(stripHtmlToText(featured.body), 170);

  return (
    <Section
      id="news"
      title={title}
      lead={lead}
      background="gray"
      className="relative isolate overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[360px] before:content-[''] before:[background-image:radial-gradient(640px_circle_at_12%_20%,rgba(88,168,224,0.18),transparent_55%),radial-gradient(560px_circle_at_88%_12%,rgba(59,130,246,0.14),transparent_60%),radial-gradient(760px_circle_at_50%_-10%,rgba(30,58,95,0.10),transparent_65%)] before:[mask-image:linear-gradient(to_bottom,black,transparent_92%)] before:-z-10"
    >
      <div className="grid gap-4 md:gap-5 lg:grid-cols-12 lg:gap-6">
        <Link
          href={`/blog/${featured.slug}`}
          className={cn(
            "group relative overflow-hidden rounded-2xl border border-[#E2E8F0]/70 bg-white shadow-sm",
            "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#3B82F6]/25",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
            "lg:col-span-7"
          )}
          aria-label={featured.title}
        >
          <div className="relative aspect-[4/3] w-full">
            <Cover
              post={featured}
              sizes="(min-width: 1024px) 720px, 100vw"
            />

            <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 lg:p-6">
              <div
                className={cn(
                  "rounded-2xl border border-white/40 bg-white/90 backdrop-blur-sm",
                  "shadow-[0_18px_60px_rgba(15,23,42,0.18)]",
                  "px-5 py-5 md:px-6 md:py-6"
                )}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {featuredCategoryTitle && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/5 px-3 py-1 text-xs font-semibold tracking-wide text-[#3B82F6]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" aria-hidden="true" />
                      {featuredCategoryTitle}
                    </span>
                  )}
                  {featuredCategoryTitle && <span className="text-[#E2E8F0]">•</span>}
                  <time className="whitespace-nowrap text-[#94A3B8]">
                    {formatDate(featured.createdAt)}
                  </time>
                </div>

                <h3 className="mt-3 text-xl md:text-2xl leading-snug font-semibold tracking-tight text-[#1E3A5F] line-clamp-2">
                  {featured.title}
                </h3>

                {featuredExcerpt && (
                  <p className="mt-3 text-sm leading-relaxed text-[#475569] line-clamp-2">
                    {featuredExcerpt}
                  </p>
                )}

                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1E3A5F] transition-colors group-hover:text-[#3B82F6]">
                  Читать
                  <ArrowRight
                    className="h-4 w-4 text-[#94A3B8] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#3B82F6]"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[#58A8E0]/70 via-[#3B82F6]/45 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          />
        </Link>

        <div className="lg:col-span-5 flex flex-col gap-4 md:gap-5 lg:h-full lg:justify-between">
          {compact.map((post) => {
            const categoryTitle = post.category?.title;

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={cn(
                  "group relative flex items-stretch gap-4 overflow-hidden rounded-xl border",
                  "border-[#E2E8F0]/70 bg-white/85 backdrop-blur-sm shadow-sm",
                  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#3B82F6]/25",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                )}
                aria-label={post.title}
              >
                <div className="relative aspect-[4/3] w-[140px] flex-none overflow-hidden bg-[#F8FAFC]">
                  <Cover
                    post={post}
                    sizes="(min-width: 1024px) 140px, 35vw"
                  />
                </div>

                <div className="min-w-0 flex-1 py-4 pr-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {categoryTitle && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/5 px-3 py-1 text-xs font-semibold tracking-wide text-[#3B82F6]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" aria-hidden="true" />
                        {categoryTitle}
                      </span>
                    )}
                    {categoryTitle && <span className="text-[#E2E8F0]">•</span>}
                    <time className="whitespace-nowrap text-[#94A3B8]">
                      {formatDate(post.createdAt)}
                    </time>
                  </div>

                  <h3 className="mt-2 text-[15px] md:text-base leading-snug font-semibold text-[#1E3A5F] transition-colors group-hover:text-[#3B82F6] line-clamp-2">
                    {post.title}
                  </h3>

                  <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#1E3A5F] transition-colors group-hover:text-[#3B82F6]">
                    Читать
                    <ArrowRight
                      className="h-4 w-4 text-[#94A3B8] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#3B82F6]"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[#58A8E0]/55 via-[#3B82F6]/35 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <Button href={archiveHref} variant="secondary" className="group">
          Все новости
          <ArrowRight
            className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Button>
      </div>
    </Section>
  );
}
