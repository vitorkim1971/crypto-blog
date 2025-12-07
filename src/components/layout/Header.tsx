'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import MobileDrawer from '@/components/mobile/MobileDrawer';
import Logo from '@/components/common/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { CATEGORIES } from '@/types';

export default function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <>
      {/* Main Header - CSS variable based theme */}
      <header className="w-full bg-header-bg border-b border-card-border transition-colors">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Logo size="md" />

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-8">
              {session ? (
                <div className="flex items-center gap-6">
                  <Link
                    href="/admin/users"
                    className="text-xs uppercase tracking-wider text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors font-bold"
                  >
                    Admin
                  </Link>
                  <Link
                    href="/profile"
                    className="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    회원가입
                  </Link>
                  <Link
                    href="/subscribe"
                    className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors font-medium"
                  >
                    구독하기
                  </Link>
                </>
              )}
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden touch-target flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="메뉴 열기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Category Navigation with Dropdowns - Dark mode support */}
      <nav className="w-full bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 hidden md:block transition-colors">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-center gap-8 lg:gap-10">
            {CATEGORIES.map((category) => {
              const categoryPath = `/${category.slug}`;
              const isActive = pathname === categoryPath || pathname?.startsWith(categoryPath);
              const hasSubCategories = category.subCategories && category.subCategories.length > 0;

              return (
                <div
                  key={category.slug}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(category.slug)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {/* Main Category Link */}
                  <Link
                    href={categoryPath}
                    className={`
                      flex items-center gap-1 py-4 text-sm tracking-wide whitespace-nowrap transition-colors
                      ${isActive
                        ? 'text-amber-600 dark:text-amber-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    {category.name}
                    {hasSubCategories && (
                      <svg
                        className={`w-3.5 h-3.5 transition-transform ${activeDropdown === category.slug ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {hasSubCategories && activeDropdown === category.slug && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 min-w-[180px]">
                        {/* Category Header */}
                        <div className="px-4 py-2 border-b border-gray-100">
                          <span className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            {category.name}
                          </span>
                        </div>
                        {/* Sub Categories */}
                        {category.subCategories?.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/${category.slug}/${sub.slug}`}
                            className="block px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Category Navigation - Dark mode support */}
      <nav className="w-full bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 md:hidden transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 py-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((category) => {
              const categoryPath = `/${category.slug}`;
              const isActive = pathname === categoryPath || pathname?.startsWith(categoryPath);
              return (
                <Link
                  key={category.slug}
                  href={categoryPath}
                  className={`
                    text-sm tracking-wide whitespace-nowrap transition-colors
                    ${isActive
                      ? 'text-amber-600 dark:text-amber-400 font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <MobileDrawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
