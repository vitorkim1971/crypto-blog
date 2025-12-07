import Link from 'next/link';

export default function PremiumPromo() {
    return (
        <div className="relative p-6 rounded-2xl overflow-hidden group bg-white dark:bg-gray-900 border-2 border-amber-200 dark:border-amber-700/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 mb-3">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tracking-wide">Premium</span>
                </div>

                {/* Content */}
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                    Victor's Alpha<br />
                    프리미엄 후원
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 leading-relaxed">
                    더 나은 콘텐츠를 위한<br />
                    여러분의 후원이 필요합니다.<br />
                    특별한 혜택으로 보답하겠습니다.
                </p>

                {/* CTA Button */}
                <Link
                    href="/subscribe"
                    className="block w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-500 text-white text-sm font-bold text-center rounded-xl transition-colors shadow-sm shadow-amber-200 dark:shadow-none"
                >
                    프리미엄 후원하기
                </Link>
            </div>
        </div>
    );
}
