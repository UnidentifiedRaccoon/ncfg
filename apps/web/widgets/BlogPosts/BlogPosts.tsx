import Link from "next/link";

import { Section } from "@/shared/ui/Section";
import { PostCard, type PostCardPost } from "@/entities/Post";
import { Button } from "@/shared/ui/Button";

import { BLOG_RUBRICS, type BlogLayoutVariant, type BlogRubricSlug } from "@/shared/lib/blog-rubrics";
import { cn } from "@/shared/lib/cn";
import { makeExcerpt, stripHtmlToText } from "@/shared/lib/excerpt";

interface BlogPost extends PostCardPost {
  body: string;
}

interface BlogPostsProps {
  title: string;
  lead?: string;
  posts: BlogPost[];
  selectedCategory?: BlogRubricSlug;
  layout?: BlogLayoutVariant;
}

function buildBlogHref(options: {
  category?: BlogRubricSlug;
  layout?: BlogLayoutVariant;
}): string {
  const params = new URLSearchParams();

  if (options.category) params.set("category", options.category);
  // Keep URLs clean: `rail` is the default layout, so we only persist `layout=pills`.
  if (options.layout === "pills") params.set("layout", "pills");

  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

function PillsNav({
  active,
  layout,
  className,
}: {
  active?: BlogRubricSlug;
  layout?: BlogLayoutVariant;
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
        {/* Glass sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/70 to-transparent"
        />
        <div className="flex gap-2 overflow-x-auto px-3 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const isActive = item.slug ? item.slug === active : !active;
            const href = buildBlogHref({ category: item.slug, layout });

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
  layout,
}: {
  active?: BlogRubricSlug;
  layout?: BlogLayoutVariant;
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
          const href = buildBlogHref({ category: item.slug, layout });

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
  layout = "rail",
}: BlogPostsProps) {
  const isRailLayout = layout === "rail";

  return (
    <Section
      id="blog"
      title={title}
      lead={lead}
      background="gray"
      className="relative isolate"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[340px] content-[''] [background-image:radial-gradient(640px_circle_at_12%_22%,rgba(88,168,224,0.18),transparent_55%),radial-gradient(560px_circle_at_88%_10%,rgba(59,130,246,0.14),transparent_60%),radial-gradient(760px_circle_at_55%_-10%,rgba(30,58,95,0.10),transparent_65%)] [mask-image:linear-gradient(to_bottom,black,transparent_92%)] -z-10"
      />

      {!isRailLayout && (
        <PillsNav active={selectedCategory} layout={layout} className="mb-6" />
      )}

      {isRailLayout ? (
        <>
          <div className="lg:hidden sticky top-[72px] md:top-[88px] z-40 mb-6">
            <PillsNav active={selectedCategory} layout={layout} />
          </div>

          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="hidden lg:block lg:col-span-4">
              <RailNav active={selectedCategory} layout={layout} />
            </div>

            <div className="lg:col-span-8">
            {posts.length === 0 ? (
              <div className="mx-auto w-full max-w-[760px] overflow-hidden rounded-2xl border border-[#E2E8F0]/70 bg-white/80 backdrop-blur-sm shadow-sm">
                <div className="p-6 md:p-8">
                  <p className="text-base md:text-lg font-semibold text-[#1E3A5F]">
                    В этой рубрике пока нет материалов.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                    Попробуйте выбрать другую рубрику или вернитесь ко всем публикациям.
                  </p>
                  <div className="mt-6">
                    <Button href={buildBlogHref({ layout })} variant="secondary" className="w-full">
                      Показать все
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                {posts.map((post) => {
                  const excerpt = makeExcerpt(stripHtmlToText(post.body), 170);

                  return (
                    <PostCard
                      key={post.id}
                      post={{
                        id: post.id,
                        title: post.title,
                        category: post.category,
                        slug: post.slug,
                        anonsImage: post.anonsImage,
                        createdAt: post.createdAt,
                        excerpt,
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </>
      ) : posts.length === 0 ? (
        <div className="mx-auto w-full max-w-[760px] overflow-hidden rounded-2xl border border-[#E2E8F0]/70 bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="p-6 md:p-8 text-center">
            <p className="text-base md:text-lg font-semibold text-[#1E3A5F]">
              В этой рубрике пока нет материалов.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#475569]">
              Попробуйте выбрать другую рубрику или вернитесь ко всем публикациям.
            </p>
            <div className="mt-6">
              <Button href={buildBlogHref({ layout })} variant="secondary" className="w-full">
                Показать все
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          {posts.map((post) => {
            const excerpt = makeExcerpt(stripHtmlToText(post.body), 170);

            return (
              <PostCard
                key={post.id}
                post={{
                  id: post.id,
                  title: post.title,
                  category: post.category,
                  slug: post.slug,
                  anonsImage: post.anonsImage,
                  createdAt: post.createdAt,
                  excerpt,
                }}
              />
            );
          })}
        </div>
      )}
    </Section>
  );
}
