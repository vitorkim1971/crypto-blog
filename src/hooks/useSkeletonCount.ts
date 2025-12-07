/**
 * T016: useSkeletonCount Hook
 * 반응형 스켈레톤 개수 제공 (3/4/6)
 */

'use client';

import { useState, useEffect } from 'react';

interface SkeletonCounts {
  featured: number;
  recent: number;
}

/**
 * 화면 크기에 따라 스켈레톤 개수를 반환
 * - Mobile (<768px): featured 1개, recent 3개
 * - Tablet (768px-1024px): featured 2개, recent 4개
 * - Desktop (>1024px): featured 3개, recent 6개
 */
export function useSkeletonCount(): SkeletonCounts {
  const [counts, setCounts] = useState<SkeletonCounts>({
    featured: 3,
    recent: 6,
  });

  useEffect(() => {
    const updateCounts = () => {
      const width = window.innerWidth;

      if (width < 768) {
        // Mobile
        setCounts({ featured: 1, recent: 3 });
      } else if (width < 1024) {
        // Tablet
        setCounts({ featured: 2, recent: 4 });
      } else {
        // Desktop
        setCounts({ featured: 3, recent: 6 });
      }
    };

    // Initial update
    updateCounts();

    // Listen for resize
    window.addEventListener('resize', updateCounts);

    return () => {
      window.removeEventListener('resize', updateCounts);
    };
  }, []);

  return counts;
}
