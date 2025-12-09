import Link from 'next/link';

export default function MetaMountainBanner() {
    return (
        <div className="relative overflow-hidden rounded-2xl group border border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 opacity-100" />

            <div className="relative p-6 z-10">
                {/* Header / Icon */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Partner
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                    메타마운틴<br />
                    <span className="text-indigo-600 dark:text-indigo-400">AI 트레이딩 플랫폼</span>
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                    수익이 났을 때만 쉐어하세요.<br />
                    검증된 알고리즘 트레이딩 봇으로<br />
                    투자의 새로운 기준을 경험해보세요.
                </p>

                {/* CTA Button */}
                <a
                    href="https://metamountain.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold text-center rounded-xl transition-colors shadow-lg shadow-indigo-200/50 dark:shadow-none"
                >
                    메타마운틴 방문하기
                </a>
            </div>
        </div>
    );
}
