import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Post, Footer } from "@/widgets";
import {
  fetchNewsArticle,
  fetchNewsArticles,
  fetchSiteSettings,
} from "@/shared/api/data-provider";
import { makeExcerpt, stripHtmlToText } from "@/shared/lib/excerpt";
import { buildPageMetadata } from "@/shared/lib/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const BLOG_POST_NOT_FOUND_DESCRIPTION = "Материал блога не найден или недоступен.";
const BLOG_POST_FALLBACK_DESCRIPTION =
  "Материал НЦФГ о финансовой грамотности для сотрудников и частных лиц.";

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateStaticParams() {
  const posts = await fetchNewsArticles();
  return posts.map((post) => ({ slug: post.slug }));
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

function getBlogDescription(body: string): string {
  const plainText = stripHtmlToText(body);
  return makeExcerpt(plainText, 170) || BLOG_POST_FALLBACK_DESCRIPTION;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await safeFetchNewsArticle(slug);

  if (!post) {
    return buildPageMetadata({
      path: `/blog/${slug}`,
      title: "Статья не найдена — НЦФГ",
      description: BLOG_POST_NOT_FOUND_DESCRIPTION,
      robots: {
        index: false,
        follow: false,
      },
    });
  }

  const description = getBlogDescription(post.body);

  return buildPageMetadata({
    path: `/blog/${post.slug}`,
    title: `${post.title} — НЦФГ`,
    description,
    openGraphTitle: post.title,
    openGraphType: "article",
    publishedTime: post.createdAt,
    imagePath: post.postImage ?? undefined,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const [siteSetting, allPosts] = await Promise.all([
    fetchSiteSettings(),
    fetchNewsArticles(),
  ]);
  const post = await safeFetchNewsArticle(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
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
