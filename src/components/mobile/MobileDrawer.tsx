'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { CATEGORIES } from '@/types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * T003: MobileDrawer Component
 *
 * Features:
 * - Slide-in animation from left
 * - Background overlay with fade
 * - Touch-optimized targets (48px minimum)
 * - ESC key to close
 * - Click outside to close
 * - Expandable subcategories
 */
export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { data: session } = useSession();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // T011: ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset expanded category when drawer closes
  useEffect(() => {
    if (!isOpen && expandedCategory !== null) {
      setExpandedCategory(null);
    }
  }, [isOpen, expandedCategory]);

  if (!isOpen) return null;

  const toggleCategory = (slug: string) => {
    setExpandedCategory(expandedCategory === slug ? null : slug);
  };

  return (
    <>
      {/* T005: Background Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 fade-in md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* T003: Drawer Container */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-xl md:hidden drawer-slide-in gpu-accelerate`}
        role="dialog"
        aria-modal="true"
        aria-label="모바일 메뉴"
      >
        <div className="flex flex-col h-full">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link
              href="/"
              className="flex items-center"
              onClick={onClose}
            >
              {/* Monogram Icon */}
              <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center mr-2.5">
                <span className="text-white font-bold text-base italic">VA</span>
              </div>
              {/* Text */}
              <div className="flex flex-col">
                <span className="text-base font-semibold tracking-tight text-gray-900 leading-tight">
                  Victor's Alpha
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500">
                  Crypto Insights
                </span>
              </div>
            </Link>

            {/* T009: Close Button (X) */}
            <button
              onClick={onClose}
              className="touch-target flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="메뉴 닫기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* T007: Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-4 space-y-1">
              <Link
                href="/"
                className="block touch-target px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                onClick={onClose}
              >
                홈
              </Link>

              {/* Category Links with Expandable Subcategories */}
              <div className="pt-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  카테고리
                </div>
                {CATEGORIES.map((category) => {
                  const hasSubCategories = category.subCategories && category.subCategories.length > 0;
                  const isExpanded = expandedCategory === category.slug;

                  return (
                    <div key={category.slug}>
                      {/* Category Header */}
                      <div className="flex items-center">
                        <Link
                          href={`/${category.slug}`}
                          className="flex-1 touch-target px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                          onClick={onClose}
                        >
                          {category.name}
                        </Link>
                        {hasSubCategories && (
                          <button
                            onClick={() => toggleCategory(category.slug)}
                            className="touch-target p-3 text-gray-500 hover:text-gray-900 transition-colors"
                            aria-label={isExpanded ? '접기' : '펼치기'}
                          >
                            <svg
                              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Subcategories */}
                      {hasSubCategories && isExpanded && (
                        <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-1 pb-2">
                          {category.subCategories?.map((sub) => (
                            <Link
                              key={sub.slug}
                              href={`/${category.slug}/${sub.slug}`}
                              className="block px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                              onClick={onClose}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* T008: Action Buttons */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            {session ? (
              <>
                <Link
                  href="/profile"
                  className="block touch-target w-full text-center px-4 py-3 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={onClose}
                >
                  프로필
                </Link>

                {session.user?.email === 'vitorkim1971@gmail.com' && (
                  <Link
                    href="/admin/users"
                    className="block touch-target w-full text-center px-4 py-3 bg-amber-100 text-amber-900 font-medium rounded-lg hover:bg-amber-200 transition-colors"
                    onClick={onClose}
                  >
                    Admin Dashboard
                  </Link>
                )}

                {!session.user?.isPremium && (
                  <Link
                    href="/subscribe"
                    className="block touch-target w-full text-center px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={onClose}
                  >
                    프리미엄 멤버십 후원
                  </Link>
                )}

                <button
                  onClick={() => {
                    signOut();
                    onClose();
                  }}
                  className="touch-target w-full text-center px-4 py-3 text-gray-700 font-medium hover:text-gray-900 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block touch-target w-full text-center px-4 py-3 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={onClose}
                >
                  로그인
                </Link>

                <Link
                  href="/subscribe"
                  className="block touch-target w-full text-center px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={onClose}
                >
                  멤버십 가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
