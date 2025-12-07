'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ClapButtonProps {
  slug: string;
  className?: string;
}

export default function ClapButton({ slug, className = '' }: ClapButtonProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [totalClaps, setTotalClaps] = useState(0);
  const [userClaps, setUserClaps] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pendingClaps, setPendingClaps] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 박수 정보 가져오기
  const fetchClaps = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${slug}/claps`);
      if (res.ok) {
        const data = await res.json();
        setTotalClaps(data.totalClaps);
        setUserClaps(data.userClaps);
      }
    } catch (error) {
      console.error('Failed to fetch claps:', error);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchClaps();
  }, [fetchClaps]);

  // 박수 전송 (디바운스)
  useEffect(() => {
    if (pendingClaps === 0) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/posts/${slug}/claps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ claps: pendingClaps }),
        });

        if (res.ok) {
          const data = await res.json();
          setUserClaps(data.userClaps);
          fetchClaps();
        }
      } catch (error) {
        console.error('Failed to add claps:', error);
      }
      setPendingClaps(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [pendingClaps, slug, fetchClaps]);

  const handleClap = () => {
    if (!user) {
      // 로그인 필요 알림
      alert('박수를 보내려면 로그인이 필요합니다');
      return;
    }

    if (userClaps + pendingClaps >= 50) {
      return; // 최대 50개
    }

    setIsAnimating(true);
    setPendingClaps((prev) => prev + 1);
    setTotalClaps((prev) => prev + 1);
    setUserClaps((prev) => prev + 1);

    setTimeout(() => setIsAnimating(false), 200);
  };

  const displayClaps = totalClaps;
  const hasClapped = userClaps > 0;

  if (isLoading || authLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
        <span className="w-8 h-4 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleClap}
        disabled={userClaps >= 50}
        className={`
          group relative w-10 h-10 rounded-full border-2 transition-all duration-200
          ${hasClapped
            ? 'border-gray-900 bg-gray-900 text-white'
            : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-900'
          }
          ${isAnimating ? 'scale-110' : 'scale-100'}
          ${userClaps >= 50 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={user ? `박수 ${userClaps}/50` : '로그인이 필요합니다'}
      >
        <svg
          className={`w-5 h-5 mx-auto transition-transform ${isAnimating ? 'scale-125' : ''}`}
          viewBox="0 0 24 24"
          fill={hasClapped ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={hasClapped ? 0 : 1.5}
        >
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>

        {/* 클릭 애니메이션 */}
        {isAnimating && (
          <span className="absolute -top-1 -right-1 text-xs font-bold text-gray-900 animate-bounce">
            +1
          </span>
        )}
      </button>

      <span className="text-sm text-gray-600 font-medium tabular-nums">
        {displayClaps > 0 ? displayClaps.toLocaleString() : ''}
      </span>
    </div>
  );
}
