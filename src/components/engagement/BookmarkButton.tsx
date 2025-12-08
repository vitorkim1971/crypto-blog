'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface BookmarkButtonProps {
  slug: string;
  className?: string;
}

export default function BookmarkButton({ slug, className = '' }: BookmarkButtonProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBookmark = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${slug}/bookmark`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.isBookmarked);
      }
    } catch (error) {
      console.error('Failed to fetch bookmark status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (user) {
      fetchBookmark();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchBookmark]);

  const handleToggle = async () => {
    if (!user) {
      alert('북마크하려면 로그인이 필요합니다');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${slug}/bookmark`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.isBookmarked);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <button className={`p-2 rounded-full bg-gray-100 animate-pulse ${className}`}>
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isSubmitting}
      className={`
        p-2 rounded-full transition-all duration-200
        ${isBookmarked
          ? 'text-gray-900 bg-gray-100'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
        }
        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      title={isBookmarked ? '북마크 해제' : '북마크'}
    >
      <svg
        className="w-5 h-5"
        fill={isBookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
        />
      </svg>
    </button>
  );
}
