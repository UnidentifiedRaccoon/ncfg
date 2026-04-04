import type { Metadata } from "next";
import { BlogPosts, Footer } from "@/widgets";
import {
  fetchBlogPageData,
  fetchNewsArticles,
  fetchSiteSettings,
} from "@/shared/api/data-provider";
import { isBlogRubricSlug } from "@/shared/lib/blog-rubrics";
import { buildPageMetadata } from "@/shared/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  path: "/blog",
  title: "Блог",
  description:
    "В блоге НЦФГ мы публикуем новости, практические материалы и рекомендации по финансовой грамотности для компаний и частных лиц.",
});

export const revalidate = 60; // Revalidate every 60 seconds

type SearchParams = Record<string, string | string[] | undefined>;

interface PageProps {
  searchParams?: SearchParams | Promise<SearchParams>;
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
    fetchNewsArticles({ category: selectedCategory }),
  ]);

  return (
    <>
      <main>
        <BlogPosts
          title={blogPage?.title ?? "Блог"}
          lead={blogPage?.lead ?? undefined}
          posts={posts}
          selectedCategory={selectedCategory}
        />
      </main>
      <Footer
        data={{
          organization: {
            fullName: siteSetting.organizationFullName,
            shortName: siteSetting.organizationShortName,
          },
          contacts: {
            phone: siteSetting.contactsPhone,
            email: siteSetting.contactsEmail,
          },
          social: siteSetting.socialLinks.map((l) => ({ label: l.label, href: l.href })),
          legalLinks: siteSetting.legalLinks.map((l) => ({ label: l.label, href: l.href })),
          legalDocuments: {
            title: siteSetting.legalDocumentsTitle ?? "Юридические документы",
            items: siteSetting.legalDocuments.map((d) => ({
              label: d.label,
              href: d.href,
              type: d.type,
            })),
          },
          copyright: {
            years: siteSetting.copyrightYears ?? "",
            text: siteSetting.copyrightText ?? "",
            notice: siteSetting.copyrightNotice ?? "",
          },
        }}
      />
    </>
  );
}
