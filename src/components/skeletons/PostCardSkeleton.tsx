/**
 * T014: PostCardSkeleton Component
 * PostCard 로딩 스켈레톤 (다양한 variant 지원)
 */

interface PostCardSkeletonProps {
  variant?: 'default' | 'large' | 'medium' | 'compact';
}

export default function PostCardSkeleton({ variant = 'default' }: PostCardSkeletonProps) {
  // Medium variant - Grid card for featured posts
  if (variant === 'medium') {
    return (
      <article className="group">
        {/* Cover Image Skeleton */}
        <div className="relative h-48 mb-4 bg-gray-200 animate-pulse rounded-lg" />

        {/* Meta Skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
          <div className="h-3 w-1 bg-gray-200 animate-pulse rounded" />
          <div className="h-3 w-12 bg-gray-200 animate-pulse rounded" />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-6 bg-gray-200 animate-pulse rounded w-full" />
          <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4" />
        </div>

        {/* Excerpt Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6" />
        </div>

        {/* Reading Time Skeleton */}
        <div className="h-3 w-20 bg-gray-200 animate-pulse rounded" />
      </article>
    );
  }

  // Compact variant - Two column grid layout
  if (variant === 'compact') {
    return (
      <article className="group">
        {/* Meta Skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
          <div className="h-3 w-1 bg-gray-200 animate-pulse rounded" />
          <div className="h-3 w-12 bg-gray-200 animate-pulse rounded" />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-5 bg-gray-200 animate-pulse rounded w-full" />
          <div className="h-5 bg-gray-200 animate-pulse rounded w-2/3" />
        </div>

        {/* Excerpt Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-4/5" />
        </div>

        {/* Reading Time Skeleton */}
        <div className="h-3 w-20 bg-gray-200 animate-pulse rounded" />
      </article>
    );
  }

  // Large variant - Featured post style
  if (variant === 'large') {
    return (
      <article className="group border-b border-gray-200 pb-12 mb-12">
        {/* Cover Image Skeleton */}
        <div className="relative h-96 mb-8 bg-gray-200 animate-pulse rounded-lg" />

        <div className="max-w-3xl">
          {/* Title Skeleton */}
          <div className="space-y-3 mb-4">
            <div className="h-10 bg-gray-200 animate-pulse rounded w-full" />
            <div className="h-10 bg-gray-200 animate-pulse rounded w-3/4" />
          </div>

          {/* Excerpt Skeleton */}
          <div className="space-y-2 mb-6">
            <div className="h-5 bg-gray-200 animate-pulse rounded w-full" />
            <div className="h-5 bg-gray-200 animate-pulse rounded w-5/6" />
            <div className="h-5 bg-gray-200 animate-pulse rounded w-4/5" />
          </div>

          {/* Author Skeleton */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-3 w-40 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Default variant - Horizontal layout
  return (
    <article className="group border-b border-gray-200 py-8">
      <div className="flex gap-8">
        <div className="flex-1">
          {/* Author Skeleton */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-3 w-20 bg-gray-200 animate-pulse rounded" />
          </div>

          {/* Title Skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-6 bg-gray-200 animate-pulse rounded w-full" />
            <div className="h-6 bg-gray-200 animate-pulse rounded w-2/3" />
          </div>

          {/* Excerpt Skeleton (hidden on mobile) */}
          <div className="space-y-2 mb-4 hidden md:block">
            <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6" />
          </div>

          {/* Meta Skeleton */}
          <div className="flex items-center space-x-3">
            <div className="h-3 w-12 bg-gray-200 animate-pulse rounded" />
            <div className="h-3 w-1 bg-gray-200 animate-pulse rounded" />
            <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>

        {/* Thumbnail Skeleton */}
        <div className="flex-shrink-0">
          <div className="w-28 h-28 md:w-32 md:h-32 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    </article>
  );
}
