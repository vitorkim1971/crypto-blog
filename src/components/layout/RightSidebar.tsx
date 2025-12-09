'use client';

import Link from 'next/link';
import PremiumPromo from '../premium/PremiumPromo';
import MetaMountainBanner from '../ads/MetaMountainBanner';

const RECOMMENDED_TOPICS = [
    { name: '비트코인', slug: 'bitcoin' },
    { name: '이더리움', slug: 'ethereum' },
    { name: '디파이', slug: 'defi' },
    { name: 'AI 코인', slug: 'ai-coins' },
    { name: '규제', slug: 'regulation' },
    { name: 'NFT', slug: 'nft' },
    { name: '거시경제', slug: 'macro' },
];

const FOOTER_LINKS = [
    { name: '소개', href: '/about' },
    { name: '문의하기', href: '/contact' },
    { name: '이용약관', href: '/terms' },
    { name: '개인정보처리방침', href: '/privacy' },
];

interface RightSidebarProps {
    tags?: string[];
}

export default function RightSidebar({ tags = [] }: RightSidebarProps) {
    const displayTopics = tags.length > 0
        ? tags.map(tag => ({ name: tag, slug: tag }))
        : RECOMMENDED_TOPICS;

    return (
        <aside className="w-[320px] hidden lg:block border-l border-gray-100 dark:border-gray-800 min-h-screen px-6 py-8 bg-white dark:bg-gray-950 transition-colors">
            <div className="sticky top-[100px] space-y-10">


                {/* Recommended Topics */}
                <section>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-wide mb-4">
                        추천 토픽
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {displayTopics.slice(0, 15).map((topic) => (
                            <Link
                                key={topic.slug}
                                href={`/topics/${encodeURIComponent(topic.slug)}`}
                                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                {topic.name}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Premium Promo Banner */}
                <section>
                    <PremiumPromo />
                </section>

                {/* MetaMountain Banner */}
                <section>
                    <MetaMountainBanner />
                </section>

                {/* New Feature: Monthly Picks or Newsletter Promo */}
                <section className="p-6 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
                        Victor's Newsletter
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        매주 월요일, 시장을 꿰뚫는 인사이트를 받아보세요. 100% 무료입니다.
                    </p>
                    <Link
                        href="/newsletter"
                        className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-colors"
                    >
                        구독하기
                    </Link>
                </section>

                {/* Footer Links (Simple) */}
                <footer className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                        {FOOTER_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        © 2024 Victor's Alpha. All rights reserved.
                    </p>
                </footer>
            </div>
        </aside>
    );
}
