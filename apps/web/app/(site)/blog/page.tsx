import type { Metadata } from "next";
import { BlogPosts, Footer, mapSiteSettingsToFooterData } from "@/widgets";
import {
  fetchBlogPageData,
  fetchNewsArticles,
  fetchSiteSettings,
} from "@/shared/api/data-provider";
import { isBlogRubricSlug, type BlogRubricSlug } from "@/shared/lib/blog-rubrics";
import { buildPageMetadata } from "@/shared/lib/metadata";
import { buildBreadcrumbList } from "@/shared/lib/structured-data";
import { StructuredDataScript } from "@/shared/ui/StructuredDataScript";

export const metadata: Metadata = buildPageMetadata({
  path: "/blog",
  title: "Блог",
  description:
    "В блоге НЦФГ мы публикуем новости, практические материалы и рекомендации по финансовой грамотности для компаний и частных лиц.",
});

export const revalidate = 0;

type SearchParams = Record<string, string | string[] | undefined>;

interface PageProps {
  searchParams?: SearchParams | Promise<SearchParams>;
}

async function safeFetchNewsArticles(category?: BlogRubricSlug) {
  try {
    return await fetchNewsArticles({ category });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[blog] failed to fetch article list: ${message}`);
    return [];
  }
}

export default async function BlogPage({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams ?? {});
  const rawCategory = sp.category;

  const selectedCategory =
    typeof rawCategory === "string" && isBlogRubricSlug(rawCategory) ? rawCategory : undefined;

  const [siteSetting, blogPage, posts] = await Promise.all([
    fetchSiteSettings(),
    // Blog meta is optional during Strapi setup; avoid failing the whole build on 404.
    fetchBlogPageData().catch(() => null),
    safeFetchNewsArticles(selectedCategory),
  ]);
  const breadcrumbStructuredData = buildBreadcrumbList([
    { name: "Главная", path: "/" },
    { name: "Блог", path: "/blog" },
  ]);

  return (
    <>
      <StructuredDataScript data={breadcrumbStructuredData} />
      <main>
        <BlogPosts
          title={blogPage?.title ?? "Блог"}
          lead={blogPage?.lead ?? undefined}
          posts={posts}
          selectedCategory={selectedCategory}
        />
      </main>
      <Footer data={mapSiteSettingsToFooterData(siteSetting)} />
    </>
  );
}
