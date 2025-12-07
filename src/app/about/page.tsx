import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata-helpers';
import Link from 'next/link';

export const metadata: Metadata = createPageMetadata({
  title: '소개',
  description: "Victor's Alpha는 실패와 성공에서 배우는 암호화폐 투자 인사이트를 제공합니다. 진솔한 투자 경험과 분석을 공유합니다.",
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-transparent">
      {/* Hero Section */}
      <section className="border-b border-gray-200 dark:border-gray-800 py-12 px-0">
        <div className="container mx-auto max-w-[680px]">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4 px-4 sm:px-0">
            Victor's Alpha 소개
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed px-4 sm:px-0">
            실패와 성공에서 배우는 암호화폐 투자 전략.
            <br />
            진솔한 경험과 분석을 공유합니다.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-10">
        <div className="container mx-auto max-w-[680px] px-4 sm:px-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">우리의 미션</h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-base">
              Victor's Alpha는 암호화폐 투자자들이 성공적인 투자 결정을 내릴 수
              있도록 돕기 위해 만들어졌습니다. 우리는 화려한 성공담만이 아닌,
              실패한 투자 경험도 솔직하게 공유함으로써 다른 투자자들이 같은
              실수를 반복하지 않도록 합니다.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-base">
              암호화폐 시장은 변동성이 크고 복잡합니다. 그렇기에 우리는
              기초부터 고급 전략까지, 모든 수준의 투자자를 위한 콘텐츠를
              제공합니다.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-10 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto max-w-[680px] px-4 sm:px-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            제공하는 콘텐츠
          </h2>
          <div className="grid gap-4">
            {[
              { title: '📚 입문자 라운지', desc: '암호화폐 투자가 처음이신 분들을 위한 기초 가이드와 용어 설명' },
              { title: '💼 실전 투자관', desc: '실제 투자에 활용할 수 있는 중급 전략과 기술적 분석' },
              { title: '🚀 고급 전략실', desc: 'DeFi, NFT, 레이어2 등 심화 주제와 고급 투자 전략' },
              { title: '📊 인사이트 라운지', desc: '시장 분석, 트렌드 예측, 거시경제와 암호화폐의 관계' },
              { title: '⚠️ 실패 투자 아카이브', desc: '실패한 투자 사례 분석과 교훈 - 우리의 차별화 콘텐츠' },
              { title: '🌟 Victor\'s 이야기', desc: '투자 철학과 비하인드 스토리' },
            ].map((item) => (
              <div key={item.title} className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-10">
        <div className="container mx-auto max-w-[680px] px-4 sm:px-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">핵심 가치</h2>
          <div className="space-y-6">
            {[
              { title: '💎 진정성 (Authenticity)', desc: '성공만이 아닌 실패도 솔직하게 공유합니다. 과장되지 않은 진솔한 경험을 전달합니다.' },
              { title: '📖 교육 (Education)', desc: '단순한 정보 전달을 넘어, 독자들이 스스로 판단하고 결정할 수 있는 능력을 키우도록 돕습니다.' },
              { title: '🔍 깊이 (Depth)', desc: '표면적인 뉴스가 아닌, 깊이 있는 분석과 통찰을 제공합니다.' },
              { title: '🤝 커뮤니티 (Community)', desc: '독자들과 함께 배우고 성장하는 커뮤니티를 만들어갑니다.' },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto max-w-[680px] px-4 sm:px-0 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            함께 성장하세요
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
            프리미엄 멤버십으로 더 깊이 있는 분석과 독점 콘텐츠를 받아보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/subscribe"
              className="inline-block px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-full hover:opacity-90 transition-opacity text-sm"
            >
              프리미엄 구독하기
            </Link>
            <Link
              href="/newsletter"
              className="inline-block px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              뉴스레터 구독하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
