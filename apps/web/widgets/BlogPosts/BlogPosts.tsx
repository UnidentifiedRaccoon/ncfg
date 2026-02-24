 "use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Section } from "@/shared/ui/Section";
import { PostCard, type PostCardPost } from "@/entities/Post";
import { Button } from "@/shared/ui/Button";

import { BLOG_RUBRICS, type BlogRubricSlug } from "@/shared/lib/blog-rubrics";
import { cn } from "@/shared/lib/cn";
import { makeExcerpt, stripHtmlToText } from "@/shared/lib/excerpt";
import { EXCERPT_MAX_LENGTH } from "@/shared/config/constants";

interface BlogPost extends PostCardPost {
  body: string;
}

interface BlogPostsProps {
  title: string;
  lead?: string;
  posts: BlogPost[];
  selectedCategory?: BlogRubricSlug;
}

const BLOG_AUTOPLAY_DELAY_MS = 6000;

function buildBlogHref(options: {
  category?: BlogRubricSlug;
}): string {
  const params = new URLSearchParams();

  if (options.category) params.set("category", options.category);

  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

function PillsNav({
  active,
  className,
}: {
  active?: BlogRubricSlug;
  className?: string;
}) {
  const items: Array<{ title: string; slug?: BlogRubricSlug }> = [
    { title: "Все" },
    ...[...BLOG_RUBRICS]
      .sort((a, b) => a.order - b.order)
      .map((r) => ({ title: r.title, slug: r.slug })),
  ];

  return (
    <nav
      className={cn("relative w-full lg:mx-auto lg:max-w-[760px]", className)}
      aria-label="Рубрики"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-none border border-[#E2E8F0]/70 bg-white/80 backdrop-blur-sm shadow-sm lg:rounded-2xl"
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/70 to-transparent"
        />
        <div className="flex gap-2 overflow-x-auto px-3 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const isActive = item.slug ? item.slug === active : !active;
            const href = buildBlogHref({ category: item.slug });

            return (
              <Link
                key={item.slug ?? "all"}
                href={href}
                className={cn(
                  "group inline-flex shrink-0 items-center rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide",
                  "transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]",
                  isActive
                    ? "border-[#3B82F6]/30 bg-[#3B82F6]/5 text-[#3B82F6]"
                    : "border-[#E2E8F0] bg-white/60 text-[#1E3A5F] hover:border-[#3B82F6]/25 hover:bg-[#3B82F6]/[0.03] hover:text-[#3B82F6]"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function RailNav({
  active,
}: {
  active?: BlogRubricSlug;
}) {
  const items: Array<{ title: string; slug?: BlogRubricSlug; order: number }> = [
    { title: "Все", order: 0 },
    ...BLOG_RUBRICS.map((r) => ({ title: r.title, slug: r.slug, order: r.order })),
  ].sort((a, b) => a.order - b.order);

  return (
    <nav aria-label="Рубрики" className="sticky top-24">
      <div className="flex flex-col gap-3 pl-1">
        {items.map((item) => {
          const isActive = item.slug ? item.slug === active : !active;
          const href = buildBlogHref({ category: item.slug });

          return (
            <Link
              key={item.slug ?? "all"}
              href={href}
              className={cn(
                "text-xl font-semibold tracking-tight transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B82F6]",
                isActive ? "text-[#3B82F6]" : "text-[#475569] hover:text-[#3B82F6]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {item.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function BlogPosts({
  title,
  lead,
  posts,
  selectedCategory,
}: BlogPostsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion ?? false;
  const safePosts = Array.isArray(posts) ? posts : [];
  const safeActiveIndex = useMemo(
    () => Math.min(activeIndex, Math.max(safePosts.length - 1, 0)),
    [activeIndex, safePosts.length]
  );
  const activePost = safePosts[safeActiveIndex];

  useEffect(() => {
    if (safePosts.length <= 1 || shouldReduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % safePosts.length);
    }, BLOG_AUTOPLAY_DELAY_MS);
    return () => window.clearInterval(timer);
  }, [safePosts.length, shouldReduceMotion]);

  return (
    <Section
      id="blog"
      title={title}
      lead={lead}
      background="gray"
      className="relative isolate -mt-[84px] pt-[84px] md:-mt-[106px] md:pt-[106px]"
      containerClassName="pt-12 md:pt-16"
    >
      <div className="lg:hidden sticky top-[72px] z-40 mb-6">
        <PillsNav active={selectedCategory} />
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="hidden lg:block lg:col-span-4">
          <RailNav active={selectedCategory} />
        </div>

        <div className="lg:col-span-8">
          {safePosts.length === 0 || !activePost ? (
            <div className="mx-auto w-full max-w-[760px] overflow-hidden rounded-2xl border border-[#E2E8F0]/70 bg-white/80 backdrop-blur-sm shadow-sm">
              <div className="p-6 md:p-8">
                <p className="text-base md:text-lg font-semibold text-[#1E3A5F]">
                  В этой рубрике пока нет материалов.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  Попробуйте выбрать другую рубрику или вернитесь ко всем публикациям.
                </p>
                <div className="mt-6">
                  <Button href="/blog" variant="secondary" className="w-full">
                    Показать все
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`blog-post-${activePost.id}`}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.99 }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.99 }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                >
                  <PostCard
                    post={{
                      id: activePost.id,
                      title: activePost.title,
                      category: activePost.category,
                      slug: activePost.slug,
                      anonsImage: activePost.anonsImage,
                      createdAt: activePost.createdAt,
                      excerpt: makeExcerpt(
                        stripHtmlToText(activePost.body),
                        EXCERPT_MAX_LENGTH
                      ),
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Пагинация новостей">
                {safePosts.map((post, index) => (
                  <button
                    key={`blog-post-dot-${post.id}`}
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
          )}
        </div>
      </div>
    </Section>
  );
}
