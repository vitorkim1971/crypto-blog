'use client';

import { useEffect, useState } from 'react';

interface PostInteractionsProps {
    slug: string;
    className?: string;
}

export default function PostInteractions({ slug, className = '' }: PostInteractionsProps) {
    const [stats, setStats] = useState({ clapCount: 0, commentCount: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchStats() {
            try {
                const res = await fetch(`/api/posts/${slug}/stats`, {
                    cache: 'no-store',
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) {
                        setStats(data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch post stats:', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchStats();

        return () => {
            isMounted = false;
        };
    }, [slug]);

    if (isLoading) {
        // Skeleton loading
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                <div className="w-8 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                <div className="w-8 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 ${className}`}>
            {/* Claps (Likes) */}
            <div className="flex items-center gap-1">
                <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="none"
                >
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
                <span>{stats.clapCount.toLocaleString()}</span>
            </div>

            {/* Comments */}
            <div className="flex items-center gap-1">
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                    />
                </svg>
                <span>{stats.commentCount.toLocaleString()}</span>
            </div>
        </div>
    );
}
