/**
 * T015: HomePageSkeleton Component
 * 홈페이지 전체 로딩 스켈레톤
 */

import PostCardSkeleton from './PostCardSkeleton';

interface HomePageSkeletonProps {
  featuredCount?: number;
  recentCount?: number;
}

export default function HomePageSkeleton({
  featuredCount = 3,
  recentCount = 10,
}: HomePageSkeletonProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Topic Bar Skeleton */}
      <section className="border-b border-gray-200 sticky top-[57px] bg-white z-40">
        <div className="max-w-[1336px] mx-auto px-6">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide py-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-7 w-16 bg-gray-200 animate-pulse rounded-full flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Hero Section Skeleton */}
      <section className="border-b border-gray-200 py-16 md:py-24">
        <div className="max-w-[1336px] mx-auto px-6">
          <div className="max-w-[680px] space-y-6">
            {/* Title */}
            <div className="space-y-4">
              <div className="h-14 md:h-20 bg-gray-200 animate-pulse rounded-lg w-full" />
              <div className="h-14 md:h-20 bg-gray-200 animate-pulse rounded-lg w-5/6" />
              <div className="h-14 md:h-20 bg-gray-200 animate-pulse rounded-lg w-3/4" />
            </div>

            {/* Description */}
            <div className="space-y-3 pt-2">
              <div className="h-6 md:h-7 bg-gray-200 animate-pulse rounded w-full" />
              <div className="h-6 md:h-7 bg-gray-200 animate-pulse rounded w-4/5" />
            </div>

            {/* CTA Button */}
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-full" />
          </div>
        </div>
      </section>

      {/* Featured Posts Skeleton */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1336px] mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {Array.from({ length: featuredCount }).map((_, i) => (
              <PostCardSkeleton key={`featured-${i}`} variant="medium" />
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Recent Posts Skeleton */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1336px] mx-auto px-6">
          {/* Section Title */}
          <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-8" />

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {Array.from({ length: recentCount }).map((_, i) => (
              <PostCardSkeleton key={`recent-${i}`} variant="compact" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Skeleton */}
      <section className="py-16 md:py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-[680px] mx-auto px-6 text-center space-y-8">
          {/* Title */}
          <div className="space-y-3 mx-auto">
            <div className="h-12 md:h-14 bg-gray-200 animate-pulse rounded-lg w-64 mx-auto" />
          </div>

          {/* Description */}
          <div className="space-y-2 mx-auto">
            <div className="h-6 bg-gray-200 animate-pulse rounded w-80 mx-auto" />
            <div className="h-6 bg-gray-200 animate-pulse rounded w-72 mx-auto" />
          </div>

          {/* CTA Button */}
          <div className="h-10 w-40 bg-gray-200 animate-pulse rounded-full mx-auto" />
        </div>
      </section>
    </div>
  );
}
