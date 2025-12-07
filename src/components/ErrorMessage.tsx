'use client';

import Link from 'next/link';

/**
 * T022, T025: ErrorMessage Component
 * API 에러 등 다양한 에러 상황에서 재사용 가능한 에러 메시지 컴포넌트
 */

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  showHomeButton?: boolean;
}

export default function ErrorMessage({
  title = '오류가 발생했습니다',
  message = '요청을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  onRetry,
  retryLabel = '다시 시도',
  showHomeButton = false,
}: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] px-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6" aria-hidden="true">
          <svg
            className="w-16 h-16 mx-auto text-red-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

        {/* Message */}
        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="touch-target px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
              aria-label={retryLabel}
            >
              {retryLabel}
            </button>
          )}
          {showHomeButton && (
            <Link
              href="/"
              className="touch-target px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
              aria-label="홈 페이지로 이동"
            >
              홈으로 돌아가기
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
