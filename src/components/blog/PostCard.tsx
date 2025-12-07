'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface PostCardProps {
  post: Post;
  variant?: 'default' | 'featured' | 'compact';
}

export default function PostCard({ post, variant = 'default' }: PostCardProps) {
  // Medium-style default card - horizontal layout with image on right
  if (variant === 'default') {
    return (
      <article className="group py-6 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <Link href={`/blog/${post.slug}`} className="block">
          <div className="flex gap-6">
            {/* Content - Left side */}
            <div className="flex-1 min-w-0">
              {/* Author row */}
              <div className="flex items-center gap-2 mb-2">
                {post.author?.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author?.name || ''}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-[8px] font-medium text-gray-600 dark:text-gray-400">
                      {post.author?.name?.charAt(0) || 'V'}
                    </span>
                  </div>
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {post.author?.name || 'Victor'}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 leading-snug group-hover:text-gray-600 dark:text-gray-400 transition-colors line-clamp-2">
                {post.title}
              </h2>

              {/* Excerpt - Only on larger screens */}
              <p className="hidden sm:block text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-3 line-clamp-2">
                {post.excerpt}
              </p>

              {/* Bottom meta row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Category tag */}
                {post.category?.name && (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                    {post.category.name}
                  </span>
                )}

                {/* Date */}
                {post.publishedAt && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(post.publishedAt), 'M월 d일', { locale: ko })}
                  </span>
                )}

                {/* Reading time */}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  · {post.readingTime || 5}분 읽기
                </span>

                {/* Premium badge */}
                {post.isPremium && (
                  <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Premium
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail - Right side */}
            {post.coverImageUrl && (
              <div className="relative w-32 aspect-video sm:w-48 sm:aspect-video flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={post.coverImageUrl}
                  alt={post.title}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </Link>
      </article>
    );
  }

  // Featured variant - Large card for hero section
  if (variant === 'featured') {
    return (
      <article className="group">
        <Link href={`/blog/${post.slug}`} className="block">
          {/* Large Image */}
          {post.coverImageUrl && (
            <div className="relative w-full aspect-[2/1] mb-6 overflow-hidden rounded-lg">
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {post.isPremium && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Premium
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Author row */}
          <div className="flex items-center gap-2 mb-3">
            {post.author?.avatar ? (
              <Image
                src={post.author.avatar}
                alt={post.author?.name || ''}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                  {post.author?.name?.charAt(0) || 'V'}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {post.author?.name || 'Victor'}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(post.publishedAt), 'M월 d일', { locale: ko })}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 leading-tight group-hover:text-gray-600 dark:text-gray-400 transition-colors">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
            {post.excerpt}
          </p>

          {/* Bottom meta */}
          <div className="flex items-center gap-3">
            {post.category?.name && (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-full">
                {post.category.name}
              </span>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {post.readingTime || 5}분 읽기
            </span>
          </div>
        </Link>
      </article>
    );
  }

  // Compact variant - For sidebar or small lists
  if (variant === 'compact') {
    return (
      <article className="group py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <Link href={`/blog/${post.slug}`} className="flex gap-4">
          {/* Number indicator */}
          <span className="text-2xl font-bold text-gray-200 leading-none">
            {String(post.id).padStart(2, '0').slice(-2)}
          </span>

          <div className="flex-1 min-w-0">
            {/* Author */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-[6px] font-medium text-gray-600 dark:text-gray-400">
                  {post.author?.name?.charAt(0) || 'V'}
                </span>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {post.author?.name || 'Victor'}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-bold text-gray-900 dark:text-gray-100 leading-snug group-hover:text-gray-600 dark:text-gray-400 transition-colors line-clamp-2">
              {post.title}
            </h3>

            {/* Meta */}
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{format(new Date(post.publishedAt), 'M월 d일', { locale: ko })}</span>
              <span>·</span>
              <span>{post.readingTime || 5}분 읽기</span>
              {post.isPremium && (
                <>
                  <span>·</span>
                  <span className="text-blue-600">Premium</span>
                </>
              )}
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return null;
}
