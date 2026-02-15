import { Section } from "@/shared/ui/Section";
import { PostCard, type PostCardPost } from "@/entities/Post";
import { makeExcerpt, stripHtmlToText } from "@/shared/lib/excerpt";

interface BlogPost extends PostCardPost {
  body: string;
}

interface BlogPostsProps {
  title: string;
  lead?: string;
  posts: BlogPost[];
}

export function BlogPosts({ title, lead, posts }: BlogPostsProps) {
  return (
    <Section
      id="blog"
      title={title}
      lead={lead}
      background="gray"
      className="relative isolate overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[340px] before:content-[''] before:[background-image:radial-gradient(640px_circle_at_12%_22%,rgba(88,168,224,0.18),transparent_55%),radial-gradient(560px_circle_at_88%_10%,rgba(59,130,246,0.14),transparent_60%),radial-gradient(760px_circle_at_55%_-10%,rgba(30,58,95,0.10),transparent_65%)] before:[mask-image:linear-gradient(to_bottom,black,transparent_92%)] before:-z-10"
    >
      <div className="flex flex-col items-center gap-6">
        {posts.map((post) => {
          const excerpt = makeExcerpt(stripHtmlToText(post.body), 170);

          return (
            <PostCard
              key={post.id}
              post={{
                id: post.id,
                title: post.title,
                tags: post.tags,
                slug: post.slug,
                anonsImage: post.anonsImage,
                createdAt: post.createdAt,
                excerpt,
              }}
            />
          );
        })}
      </div>
    </Section>
  );
}
