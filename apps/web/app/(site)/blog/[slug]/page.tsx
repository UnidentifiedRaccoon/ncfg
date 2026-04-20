import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Post, Footer } from "@/widgets";
import {
  fetchNewsArticle,
  fetchNewsArticleSlugs,
  fetchNewsArticles,
  fetchSiteSettings,
} from "@/shared/api/data-provider";
import {
  buildBlogPostDescription,
  buildPageMetadata,
} from "@/shared/lib/metadata";
import {
  buildBlogPostingStructuredData,
  buildBreadcrumbList,
} from "@/shared/lib/structured-data";
import { StructuredDataScript } from "@/shared/ui/StructuredDataScript";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const BLOG_POST_NOT_FOUND_DESCRIPTION = "Материал блога не найден или недоступен.";

export const revalidate = 60; // Revalidate every 60 seconds

async function safeFetchNewsArticles(context: string) {
  try {
    return await fetchNewsArticles();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[blog/[slug]] failed to fetch article list in ${context}: ${message}`);
    return [];
  }
}

async function safeFetchNewsArticleSlugs() {
  try {
    return await fetchNewsArticleSlugs();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[blog/[slug]] failed to fetch article slugs: ${message}`);
    return [];
  }
}

export async function generateStaticParams() {
  const slugs = await safeFetchNewsArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

async function safeFetchNewsArticle(slug: string) {
  try {
    return await fetchNewsArticle(slug);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[blog/${slug}] failed to fetch article from Strapi: ${message}`);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await safeFetchNewsArticle(slug);

  if (!post) {
    return buildPageMetadata({
      path: `/blog/${slug}`,
      title: "Статья не найдена",
      description: BLOG_POST_NOT_FOUND_DESCRIPTION,
      robots: {
        index: false,
        follow: false,
      },
    });
  }

  const description = buildBlogPostDescription(post);

  return buildPageMetadata({
    path: `/blog/${post.slug}`,
    title: post.title,
    description,
    openGraphType: "article",
    publishedTime: post.createdAt,
    imagePath: post.postImage ?? post.anonsImage ?? undefined,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const [siteSetting, allPosts, post] = await Promise.all([
    fetchSiteSettings(),
    safeFetchNewsArticles("BlogPostPage"),
    safeFetchNewsArticle(slug),
  ]);

  if (!post) {
    notFound();
  }

  const breadcrumbStructuredData = buildBreadcrumbList([
    { name: "Главная", path: "/" },
    { name: "Блог", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);
  const description = buildBlogPostDescription(post);
  const blogPostingStructuredData = buildBlogPostingStructuredData({
    title: post.title,
    slug: post.slug,
    category: post.category,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    postImage: post.postImage ?? null,
    anonsImage: post.anonsImage ?? null,
    description,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <StructuredDataScript data={breadcrumbStructuredData} />
      <StructuredDataScript data={blogPostingStructuredData} />
      <main className="flex-1">
        <Post post={post} allPosts={allPosts} />
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
    </div>
  );
}
