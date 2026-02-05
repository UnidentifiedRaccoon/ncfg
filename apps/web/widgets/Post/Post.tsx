import Image from "next/image";
import { Container } from "@/shared/ui/Container";
import { PostQuestionForm } from "./PostQuestionForm";
import { OtherPosts } from "./OtherPosts";
import type { PostCardPost } from "@/entities/Post";

interface PostProps {
  post: {
    id: string | number;
    title: string;
    tags: string[];
    body: string;
    anonsImage?: string | null;
    createdAt: string;
  };
  allPosts?: PostCardPost[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function Post({ post, allPosts = [] }: PostProps) {
  const hasImage = Boolean(post.anonsImage);

  const otherPosts = allPosts
    .filter((p) => p.id !== post.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <>
      <article className="py-12 md:py-16">
        <Container className="px-5 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[760px]">
            <header className="text-center">
              {/* Meta: tag and date */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm mb-4">
                {post.tags[0] && (
                  <span className="text-[#3B82F6] font-medium uppercase">
                    {post.tags[0]}
                  </span>
                )}
                {post.tags[0] && <span className="text-[#94A3B8]">•</span>}
                <time className="text-[#94A3B8]">{formatDate(post.createdAt)}</time>
              </div>

              {/* Title */}
              <h1 className="text-[28px] md:text-[36px] lg:text-[42px] leading-tight font-bold text-[#1E3A5F]">
                {post.title}
              </h1>
            </header>

            <figure className="mt-8 mb-10">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
                {hasImage ? (
                  <Image
                    src={post.anonsImage as string}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 760px, 100vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6]">
                    <span className="text-white/30 text-4xl font-bold">НЦФГ</span>
                  </div>
                )}
              </div>
            </figure>

            {/* Body content */}
            <div className="mx-auto max-w-[624px]">
              <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: post.body }}
              />
            </div>
          </div>
        </Container>
      </article>

      <PostQuestionForm postTitle={post.title} />

      {otherPosts.length > 0 && <OtherPosts posts={otherPosts} />}
    </>
  );
}
