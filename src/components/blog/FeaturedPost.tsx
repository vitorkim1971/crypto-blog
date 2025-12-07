import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface FeaturedPostProps {
  post: Post;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <article className="pb-10 mb-8 border-b border-gray-200">
      {/* Author & Category */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          {post.author.avatar ? (
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={20}
              height={20}
              className="rounded-full"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
              <span className="text-[10px] text-white font-medium">
                {post.author.name[0]}
              </span>
            </div>
          )}
          <span className="text-sm text-gray-900 font-medium">{post.author.name}</span>
        </div>
        <span className="text-sm text-gray-500">in</span>
        <Link
          href={`/category/${post.category?.slug || 'uncategorized'}`}
          className="text-sm text-gray-500 hover:text-gray-900 underline"
        >
          {post.category?.name || '인사이트 리뷰지'}
        </Link>
      </div>

      {/* Title with highlight */}
      <Link href={`/blog/${post.slug}`}>
        <h2 className="text-[28px] md:text-[32px] font-serif font-bold text-gray-900 leading-tight mb-3 hover:text-gray-700 transition-colors">
          {post.title.split(':').map((part, i) =>
            i === 0 ? (
              <span key={i}>{part}:</span>
            ) : (
              <span key={i} className="text-blue-600"> {part}</span>
            )
          )}
        </h2>
      </Link>

      {/* Excerpt */}
      <p className="text-base text-gray-600 mb-4 leading-relaxed">
        {post.excerpt}
      </p>

      {/* Cover Image */}
      {post.coverImageUrl && (
        <Link href={`/blog/${post.slug}`} className="block mb-4">
          <div className="relative w-full aspect-[16/9] rounded-sm overflow-hidden">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </Link>
      )}

      {/* Meta */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <time>{format(new Date(post.publishedAt), 'yyyy년 M월 d일', { locale: ko })}</time>
        <span>·</span>
        <span>{post.readingTime}분 read</span>
        {post.isPremium && (
          <>
            <span>·</span>
            <span className="flex items-center gap-1 text-blue-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Member-only
            </span>
          </>
        )}
      </div>
    </article>
  );
}
