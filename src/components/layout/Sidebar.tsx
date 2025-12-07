import Link from 'next/link';

const RECOMMENDED_TOPICS = [
  { name: 'Bitcoin', slug: 'bitcoin' },
  { name: 'Ethereum', slug: 'ethereum' },
  { name: 'DeFi', slug: 'defi' },
  { name: 'AI Coins', slug: 'ai-coins' },
  { name: 'Regulation', slug: 'regulation' },
  { name: 'NFT', slug: 'nft' },
];

const FOOTER_LINKS = [
  { name: 'Help', href: '/help' },
  { name: 'Status', href: '/status' },
  { name: 'Writers', href: '/writers' },
  { name: 'Blog', href: '/blog' },
  { name: 'Privacy', href: '/privacy' },
  { name: 'Terms', href: '/terms' },
  { name: 'About', href: '/about' },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:block w-[368px] pl-12 border-l border-gray-200 dark:border-gray-800">
      <div className="sticky top-[80px]">
        {/* About Section */}
        <section className="mb-10">
          <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 tracking-wider uppercase mb-4">
            About Victor's Alpha
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            수익화에 초점을 맞춘 프리미엄 암호화폐 투자 인사이트. 데이터 기반 분석과 실전 전략을 제공합니다.
          </p>
          <Link
            href="/about"
            className="text-sm text-gray-900 dark:text-gray-100 hover:underline"
          >
            More information
          </Link>
        </section>

        {/* Recommended Topics */}
        <section className="mb-10">
          <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 tracking-wider uppercase mb-4">
            Recommended Topics
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
