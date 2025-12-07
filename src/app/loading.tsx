/**
 * T018: 홈페이지 로딩 스켈레톤
 * Next.js 14 App Router 컨벤션 - loading.tsx
 */

import HomePageSkeleton from '@/components/skeletons/HomePageSkeleton';

export default function Loading() {
  return <HomePageSkeleton featuredCount={3} recentCount={10} />;
}
