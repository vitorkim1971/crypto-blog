'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { MagnifyingGlassIcon, PencilSquareIcon, BellIcon } from '@heroicons/react/24/outline';
import Logo from '@/components/common/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function TopBar() {
    const { data: session } = useSession();

    return (
        <header className="fixed top-0 left-0 right-0 h-[60px] bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 z-50 transition-colors">
            <div className="flex items-center justify-between h-full px-4 lg:px-6 mx-auto max-w-[1920px]">

                {/* Left: Logo & Search */}
                <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                        <Logo size="sm" showText={true} />
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden lg:block relative w-[240px] xl:w-[300px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-full leading-5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-950 focus:border-gray-200 dark:focus:border-gray-700 focus:ring-0 sm:text-sm transition-colors"
                            placeholder="검색"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const target = e.target as HTMLInputElement;
                                    if (target.value.trim()) {
                                        window.location.href = `/search?q=${encodeURIComponent(target.value.trim())}`;
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4 lg:gap-6">
                    {session ? (
                        <>
                            {/* Admin Link - Only visible to admin user */}
                            {session.user?.email === 'vitorkim1971@gmail.com' && (
                                <Link
                                    href="/admin/users"
                                    className="hidden lg:flex items-center gap-2 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                                    title="Admin Dashboard"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-sm font-bold">Admin</span>
                                </Link>
                            )}

                            {/* Studio Link - specific email only */}
                            {session.user?.email === 'vitorkim1971@gmail.com' && (
                                <Link
                                    href="/studio"
                                    className="hidden lg:flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                                    target="_blank"
                                    title="Sanity Studio"
                                >
                                    <PencilSquareIcon className="w-6 h-6" />
                                    <span className="text-sm font-medium">Studio</span>
                                </Link>
                            )}

                            {/* Profile Dropdown Trigger (Avatar) */}
                            <div className="relative group/profile">
                                <Link href="/profile" className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm ring-2 ring-transparent group-hover/profile:ring-blue-200 dark:group-hover/profile:ring-blue-900 transition-all">
                                        {session.user?.name?.[0] || 'V'}
                                    </div>
                                </Link>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-100 dark:border-gray-800 opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-200 transform origin-top-right z-50">
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                            {session.user?.name || '사용자'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {session.user?.email}
                                        </p>
                                    </div>
                                    <Link
                                        href="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        프로필
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                    >
                                        로그아웃
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                로그인
                            </Link>
                            <Link
                                href="/signup"
                                className="px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                            >
                                시작하기
                            </Link>
                        </div>
                    )}

                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1" />
                    <ThemeToggle />
                </div>
            </div>
        </header >
    );
}
