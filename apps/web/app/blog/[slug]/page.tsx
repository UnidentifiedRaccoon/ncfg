import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Post, Footer } from "@/widgets";
import {
  fetchNewsArticle,
  fetchNewsArticles,
  fetchSiteSettings,
} from "@/shared/api/data-provider";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateStaticParams() {
  const posts = await fetchNewsArticles();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchNewsArticle(slug);

  if (!post) {
    return {
      title: "Статья не найдена — НЦФГ",
    };
  }

  const description = post.body
    .replace(/<[^>]*>/g, "")
    .slice(0, 160)
    .trim();

  return {
    title: `${post.title} — НЦФГ`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.createdAt,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const [siteSetting, post, allPosts] = await Promise.all([
    fetchSiteSettings(),
    fetchNewsArticle(slug),
    fetchNewsArticles(),
  ]);

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
    </div>
  );
}
