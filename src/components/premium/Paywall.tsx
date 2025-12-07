/**
 * T033-T039: Paywall component
 * Feature: Premium Content Protection
 */

import Link from 'next/link';
import PremiumBadge from './PremiumBadge';

interface PaywallProps {
  variant?: 'subscription_required' | 'subscription_expired';
  title?: string;
  description?: string;
}

export default function Paywall({ 
  variant = 'subscription_required',
  title,
  description
}: PaywallProps) {
  const isExpired = variant === 'subscription_expired';

  const defaultTitle = isExpired
    ? '구독이 만료되었습니다'
    : '프리미엄 구독이 필요합니다';

  const defaultDescription = isExpired
    ? '이 콘텐츠를 계속 보시려면 구독을 갱신해주세요.'
    : '이 콘텐츠는 프리미엄 구독자만 볼 수 있습니다.';

  const benefits = [
    '모든 프리미엄 콘텐츠 무제한 액세스',
    '전문가의 심층 분석 및 인사이트',
    '독점 투자 전략 및 시장 분석',
    '광고 없는 깔끔한 읽기 환경',
    '새로운 콘텐츠 우선 공개',
  ];

  return (
    <div className="relative">
      {/* Blurred preview (optional - can be added by parent) */}
      
      {/* Paywall overlay */}
      <div className="relative bg-white border-2 border-gray-200 rounded-lg p-8 md:p-12 text-center max-w-2xl mx-auto my-12">
        {/* Premium Badge */}
        <div className="flex justify-center mb-6">
          <PremiumBadge size="lg" />
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4">
          {title || defaultTitle}
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          {description || defaultDescription}
        </p>

        {/* Benefits list */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            프리미엄 구독 혜택
          </h3>
          <ul className="space-y-3 text-left max-w-md mx-auto">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <Link
          href="/subscribe"
          className="inline-block px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-lg"
        >
          {isExpired ? '구독 갱신하기' : '프리미엄 구독하기'}
        </Link>

        {/* Sub-text */}
        <p className="mt-6 text-sm text-gray-500">
          언제든지 취소 가능 · 암호화폐 결제 지원
        </p>
      </div>
    </div>
  );
}
