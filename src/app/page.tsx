import { Metadata } from 'next';
import Hero from '@/components/blog/Hero';
import CategoryLinks from '@/components/home/CategoryLinks';
import RecentPosts from '@/components/home/RecentPosts';

import { getAllPosts, getFeaturedPosts } from '@/lib/sanity/queries';
import { createPageMetadata, SITE_CONFIG } from '@/lib/seo/metadata-helpers';

/**
 * T004: 홈페이지 메타 데이터
 */
export const metadata: Metadata = createPageMetadata({
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  path: '/',
});

export default async function HomePage() {
  const featuredPosts = await getFeaturedPosts(1);
  const recentPosts = await getAllPosts(10);

  const heroPost = featuredPosts[0];
  const otherPosts = recentPosts.filter(post => post.id !== heroPost?.id);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Featured Post or Welcome */}
      <Hero post={heroPost} />

      {/* Category Quick Links */}
      <CategoryLinks />

      {/* Recent Posts */}
      {otherPosts.length > 0 ? (
        <RecentPosts
          posts={otherPosts}
          title="최신 글"
          description="새롭게 업데이트된 콘텐츠를 확인하세요"
        />
      ) : (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif text-gray-900 mb-4">콘텐츠 준비 중</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                곧 새로운 암호화폐 인사이트와 투자 전략이 업데이트됩니다.
                <br />
                뉴스레터를 구독하고 가장 먼저 소식을 받아보세요!
              </p>
            </div>
          </div>
        </section>
      )}


    </div>
  );
}
