import { Header, BlogPosts, Footer } from "@/widgets";
import homeData from "@/public/content/home.json";
import blogData from "@/public/content/blog.json";
import { fetchNewsArticles } from "@/shared/api/data-provider";

export const metadata = {
  title: "Блог — НЦФГ",
  description: "Полезные материалы о финансовой грамотности от Национального центра финансовой грамотности",
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function BlogPage() {
  const { sections } = homeData;
  const { meta } = blogData;
  const posts = await fetchNewsArticles();

  return (
    <>
      <Header />
      <main>
        <BlogPosts title={meta.title} lead={meta.lead} posts={posts} />
      </main>
      <Footer data={sections.Footer.data} />
    </>
  );
}
