import { BlogPosts, Footer } from "@/widgets";
import {
  fetchBlogPageData,
  fetchNewsArticles,
  fetchSiteSettings,
} from "@/shared/api/data-provider";
import { isBlogLayoutVariant, isBlogRubricSlug } from "@/shared/lib/blog-rubrics";

export const metadata = {
  title: "Блог — НЦФГ",
  description: "Полезные материалы о финансовой грамотности от Национального центра финансовой грамотности",
};

export const revalidate = 60; // Revalidate every 60 seconds

type SearchParams = Record<string, string | string[] | undefined>;

interface PageProps {
  searchParams?: SearchParams | Promise<SearchParams>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams ?? {});
  const rawCategory = sp.category;
  const rawLayout = sp.layout;

  const selectedCategory =
    typeof rawCategory === "string" && isBlogRubricSlug(rawCategory) ? rawCategory : undefined;

  const layout =
    typeof rawLayout === "string" && isBlogLayoutVariant(rawLayout) ? rawLayout : "rail";

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
          layout={layout}
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
            legalAddress: siteSetting.contactsLegalAddress ?? "",
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
