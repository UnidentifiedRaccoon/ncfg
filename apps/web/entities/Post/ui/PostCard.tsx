import Link from "next/link";
import Image from "next/image";

export interface PostCardPost {
  id: string | number;
  title: string;
  tags: string[];
  slug: string;
  anonsImage: string | null;
  createdAt: string;
}

interface PostCardProps {
  post: PostCardPost;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PostCard({ post }: PostCardProps) {
  const hasImage = post.anonsImage && post.anonsImage.length > 0;

  return (
    <article className="group w-full max-w-[624px] bg-white rounded-xl overflow-hidden border border-[#F1F5F9] hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2 text-sm mb-3">
            {post.tags[0] && (
              <span className="text-[#3B82F6] font-medium uppercase">{post.tags[0]}</span>
            )}
            {post.tags[0] && <span className="text-[#94A3B8]">•</span>}
            <time className="text-[#94A3B8]">{formatDate(post.createdAt)}</time>
          </div>
          <h3 className="text-[28px] leading-tight font-semibold text-[#1E3A5F] group-hover:text-[#3B82F6] transition-colors line-clamp-2">
            {post.title}
          </h3>
        </div>
        <div className="aspect-[16/9] relative">
          {hasImage ? (
            <Image
              src={post.anonsImage!}
              alt={post.title}
              fill
              className="object-cover rounded-b-xl"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] rounded-b-xl flex items-center justify-center">
              <span className="text-white/20 text-5xl font-bold">НЦФГ</span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
