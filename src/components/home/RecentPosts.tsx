import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import PremiumBadge from '@/components/premium/PremiumBadge';
import PostCard from '@/components/blog/PostCard';

interface RecentPostsProps {
  posts: Post[];
  title?: string;
  description?: string;
  showViewAll?: boolean;
  viewAllLink?: string;
}

export default function RecentPosts({
  posts,
  title = '최신 글',
  description = '새롭게 업데이트된 콘텐츠를 확인하세요',
  showViewAll = true,
  viewAllLink,
}: RecentPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  // Medium style: Main posts on left, Trending on right
  const mainPosts = posts.slice(0, 5);
  const trendingPosts = posts.slice(0, 4);

  return (
    <section className="py-8 bg-white dark:bg-transparent">
      <div className="w-full">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          {showViewAll && viewAllLink && (
            <Link
              href={viewAllLink}
              className="text-sm text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
            >
              전체보기
            </Link>
          )}
        </div>

        {/* Post List - Single Column */}
        <div className="space-y-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} variant="default" />
          ))}
        </div>
      </div>
    </section>
  );
}
