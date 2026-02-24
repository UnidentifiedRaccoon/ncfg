"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Section } from "@/shared/ui/Section";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";
import { makeExcerpt, stripHtmlToText } from "@/shared/lib/excerpt";
import { EXCERPT_MAX_LENGTH } from "@/shared/config/constants";
import { getPostCoverVariant } from "@/entities/Post";

import type { NewsArticleData } from "@/shared/api/data-provider";

interface NewsProps {
  title: string;
  lead?: string;
  posts: NewsArticleData[];
  archiveHref?: string;
}

const NEWS_AUTOPLAY_DELAY_MS = 6000;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function BrandedCover({ slug, categoryTitle }: { slug: string; categoryTitle?: string }) {
  const variant = getPostCoverVariant(slug);
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
  const safePosts = Array.isArray(posts) ? posts : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion ?? false;
  const safeActiveIndex = useMemo(
    () => Math.min(activeIndex, Math.max(safePosts.length - 1, 0)),
    [activeIndex, safePosts.length]
  );
  useEffect(() => {
    if (safePosts.length <= 1) return;
    if (shouldReduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % safePosts.length);
    }, NEWS_AUTOPLAY_DELAY_MS);

    return () => window.clearInterval(timer);
  }, [safePosts.length, shouldReduceMotion]);

  const featured = safePosts[safeActiveIndex];
  const compact = safePosts.filter((_, index) => index !== safeActiveIndex).slice(0, 3);

  if (safePosts.length === 0 || !featured) return null;
  const featuredCategoryTitle = featured.category?.title;
  const featuredExcerpt = makeExcerpt(stripHtmlToText(featured.body), EXCERPT_MAX_LENGTH);

  return (
    <Section
      id="news"
      title={title}
      lead={lead}
      panel={false}
    >
      <div className="grid gap-4 md:gap-5 lg:grid-cols-12 lg:gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`news-main-${featured.id}`}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 32 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -32 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="lg:col-span-7"
          >
            <Link
              href={`/blog/${featured.slug}`}
              className={cn(
                "group relative block overflow-hidden rounded-3xl border border-[#CFE0FF]/80 bg-[linear-gradient(145deg,#FFFFFF,#F5F9FF)] shadow-sm",
                "transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_24px_58px_rgba(42,92,182,0.22)] hover:border-[#3B82F6]/45",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
              )}
              aria-label={featured.title}
            >
              <div className="relative aspect-[4/3] w-full">
                <Cover post={featured} sizes="(min-width: 1024px) 720px, 100vw" />

                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 lg:p-6">
                  <div
                    className={cn(
                      "rounded-2xl border border-white/55 bg-white/92 backdrop-blur-sm",
                      "shadow-[0_18px_60px_rgba(25,57,114,0.22)]",
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
            </Link>
          </motion.div>
        </AnimatePresence>

        <div className="lg:col-span-5 flex flex-col gap-4 md:gap-5 lg:h-full lg:justify-between">
          {compact.map((post, index) => {
            const categoryTitle = post.category?.title;

            return (
              <motion.button
                key={post.id}
                type="button"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut", delay: index * 0.05 }}
                onClick={() => setActiveIndex(posts.findIndex((entry) => entry.id === post.id))}
                className={cn(
                  "group relative flex items-stretch gap-4 overflow-hidden rounded-2xl border text-left",
                  "border-[#CFE0FF]/80 bg-[linear-gradient(145deg,#FFFFFF,#F4F9FF)] backdrop-blur-sm shadow-sm",
                  "transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_46px_rgba(42,92,182,0.18)] hover:border-[#3B82F6]/45",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                )}
                aria-label={`Показать новость: ${post.title}`}
              >
                <div className="relative aspect-[4/3] w-[140px] flex-none overflow-hidden bg-[#F8FAFC]">
                  <Cover post={post} sizes="(min-width: 1024px) 140px, 35vw" />
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
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setActiveIndex((prev) => (prev - 1 + safePosts.length) % safePosts.length)
            }
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#CFE0FF] bg-white text-[#3B82F6] transition-colors hover:bg-[#EFF6FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            aria-label="Предыдущая новость"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % safePosts.length)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#CFE0FF] bg-white text-[#3B82F6] transition-colors hover:bg-[#EFF6FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            aria-label="Следующая новость"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2" aria-label="Пагинация новостей">
          {safePosts.map((post, index) => (
            <button
              key={`news-dot-${post.id}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-2.5 rounded-full transition-all",
                index === safeActiveIndex
                  ? "w-7 bg-[#3B82F6]"
                  : "w-2.5 bg-[#BFDBFE] hover:bg-[#93C5FD]"
              )}
              aria-label={`Перейти к новости ${index + 1}`}
              aria-current={index === safeActiveIndex ? "true" : undefined}
            />
          ))}
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <Button href={archiveHref} variant="secondary" size="sm" className="group">
          Все новости
          <ArrowRight
            className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Button>
      </div>
    </Section>
  );
}
