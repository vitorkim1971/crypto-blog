import Link from 'next/link';

const RECOMMENDED_TOPICS = [
  { name: '비트코인', slug: 'bitcoin' },
  { name: '이더리움', slug: 'ethereum' },
  { name: '디파이', slug: 'defi' },
  { name: 'AI 코인', slug: 'ai-coins' },
  { name: '규제', slug: 'regulation' },
  { name: 'NFT', slug: 'nft' },
];

const FOOTER_LINKS = [
  { name: '도움말', href: '/help' },
  { name: '상태', href: '/status' },
  { name: '작가', href: '/writers' },
  { name: '블로그', href: '/blog' },
  { name: '개인정보처리방침', href: '/privacy' },
  { name: '이용약관', href: '/terms' },
  { name: '소개', href: '/about' },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:block w-[368px] pl-12 border-l border-gray-200 dark:border-gray-800">
      <div className="sticky top-[80px]">
        {/* About Section */}
        <section className="mb-10">
          <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 tracking-wider uppercase mb-4">
            Victor's Alpha 소개
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            수익화에 초점을 맞춘 프리미엄 암호화폐 투자 인사이트. 데이터 기반 분석과 실전 전략을 제공합니다.
          </p>
          <Link
            href="/about"
            className="text-sm text-gray-900 dark:text-gray-100 hover:underline"
          >
            더 알아보기
          </Link>
        </section>

        {/* Recommended Topics */}
        <section className="mb-10">
          <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 tracking-wider uppercase mb-4">
            추천 토픽
          </h3>
          <div className="flex flex-wrap gap-2">
            {RECOMMENDED_TOPICS.map((topic) => (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {topic.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Footer Links */}
        <footer className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </footer>
      </div>
    </aside>
  );
}
