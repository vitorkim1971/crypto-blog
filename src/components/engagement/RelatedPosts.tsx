import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface RelatedPostsProps {
  posts: Post[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="py-10 border-t border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">관련 글</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group block"
          >
            {/* Thumbnail */}
            {post.coverImageUrl && (
              <div className="relative w-full aspect-[16/10] mb-3 overflow-hidden rounded-lg">
                <Image
                  src={post.coverImageUrl}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {post.isPremium && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded-full">
                      Premium
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div>
              {/* Author */}
              <div className="flex items-center gap-2 mb-2">
                {post.author?.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name || ''}
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-[6px] font-medium text-gray-600">
                      {post.author?.name?.charAt(0) || 'V'}
                    </span>
                  </div>
                )}
                <span className="text-xs text-gray-600">
                  {post.author?.name || 'Victor'}
                </span>
              </div>

              {/* Title */}
              <h4 className="font-bold text-gray-900 leading-snug group-hover:text-gray-600 transition-colors line-clamp-2 [word-break:keep-all]">
                {post.title}
              </h4>

              {/* Meta */}
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span>
                  {format(new Date(post.publishedAt), 'M월 d일', { locale: ko })}
                </span>
                <span>·</span>
                <span>{post.readingTime || 5}분 읽기</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
