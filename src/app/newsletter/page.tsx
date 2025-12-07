import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata-helpers';
import NewsletterForm from '@/components/newsletter/NewsletterForm';

export const metadata: Metadata = createPageMetadata({
  title: '뉴스레터 구독',
  description: '암호화폐 투자 인사이트를 이메일로 받아보세요. 주간 시장 분석, 투자 전략, 독점 콘텐츠를 제공합니다.',
  path: '/newsletter',
});

export default function NewsletterPage() {
  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold text-gray-900 mb-6">
            뉴스레터 구독
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            매주 암호화폐 시장 분석과 투자 인사이트를
            <br />
            이메일로 받아보세요
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            뉴스레터에서 받아보실 내용
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg
                className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  주간 시장 분석
                </h3>
                <p className="text-gray-600">
                  매주 암호화폐 시장 동향과 주요 이슈를 정리해드립니다
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <svg
                className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  투자 전략 및 팁
                </h3>
                <p className="text-gray-600">
                  실전에서 활용할 수 있는 구체적인 투자 전략을 공유합니다
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <svg
                className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  독점 콘텐츠
                </h3>
                <p className="text-gray-600">
                  뉴스레터 구독자만을 위한 특별한 콘텐츠와 인사이트
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <svg
                className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  최신 글 알림
                </h3>
                <p className="text-gray-600">
                  새로운 블로그 포스트가 올라오면 가장 먼저 알려드립니다
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Newsletter Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <NewsletterForm />
        </div>

        {/* Trust Badges */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            구독자의 개인정보는 안전하게 보호됩니다.
            <br />
            언제든지 구독을 취소할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
