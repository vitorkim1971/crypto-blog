'use client';

/**
 * T020, T023: NotFound Page (404)
 * 사용자가 존재하지 않는 페이지에 접근했을 때 표시
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8" aria-hidden="true">
          <svg
            className="w-24 h-24 mx-auto text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* 404 */}
        <h1 className="text-6xl font-serif font-bold text-gray-900 mb-4">404</h1>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          페이지를 찾을 수 없습니다
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          요청하신 페이지가 존재하지 않거나 이동했을 수 있습니다.
          <br />
          URL을 다시 확인해주세요.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="touch-target px-6 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors inline-flex items-center justify-center"
            aria-label="홈 페이지로 이동"
          >
            홈으로 돌아가기
          </Link>
          <button
            onClick={() => window.history.back()}
            className="touch-target px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors"
            aria-label="이전 페이지로 돌아가기"
          >
            이전 페이지
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500">
          문제가 계속되면{' '}
          <Link href="/contact" className="text-gray-900 hover:underline">
            고객 지원
          </Link>
          에 문의해주세요.
        </p>
      </div>
    </div>
  );
}
