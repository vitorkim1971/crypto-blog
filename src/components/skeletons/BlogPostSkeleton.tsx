/**
 * T013: BlogPostSkeleton Component
 * 블로그 글 상세 페이지 로딩 스켈레톤
 */

export default function BlogPostSkeleton() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      {/* Cover Image Skeleton */}
      <div className="relative h-96 mb-8 bg-gray-200 animate-pulse rounded-lg" />

      {/* Title Skeleton */}
      <div className="mb-6 space-y-3">
        <div className="h-12 bg-gray-200 animate-pulse rounded-lg w-3/4" />
        <div className="h-12 bg-gray-200 animate-pulse rounded-lg w-2/3" />
      </div>

      {/* Author & Meta Skeleton */}
      <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-32" />
          <div className="h-3 bg-gray-200 animate-pulse rounded w-48" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4 mb-8">
        {/* Paragraph 1 */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6" />
        </div>

        {/* Paragraph 2 */}
        <div className="space-y-2 mt-6">
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-4/5" />
        </div>

        {/* Paragraph 3 */}
        <div className="space-y-2 mt-6">
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
        </div>

        {/* Image Placeholder */}
        <div className="h-64 bg-gray-200 animate-pulse rounded-lg mt-8 mb-8" />

        {/* Paragraph 4 */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6" />
        </div>

        {/* Paragraph 5 */}
        <div className="space-y-2 mt-6">
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-4/5" />
        </div>
      </div>

      {/* Tags Skeleton */}
      <div className="flex gap-2 pt-8 border-t border-gray-200">
        <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full" />
        <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full" />
        <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full" />
      </div>
    </article>
  );
}
