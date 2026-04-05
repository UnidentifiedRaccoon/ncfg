import { PostCard, type PostCardPost } from "@/entities/Post";
import { Button } from "@/shared/ui/Button";

interface OtherPostsProps {
  posts: PostCardPost[];
}

export function OtherPosts({ posts }: OtherPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section data-scroll-reveal="" className="py-12 md:py-16 bg-[#F8FAFC]">
      <div className="mx-auto max-w-[760px] px-5 md:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] text-center mb-8">
          Другие статьи
        </h2>
        <div className="flex flex-col items-center gap-6">
          {posts.map((post) => (
            <div key={post.id} data-ym-goal="related_article_click">
              <PostCard post={post} />
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Button href="/blog" variant="secondary" className="w-full">
            На главную блога
          </Button>
        </div>
      </div>
    </section>
  );
}
