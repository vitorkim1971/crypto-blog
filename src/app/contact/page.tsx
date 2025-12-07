import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata-helpers';
import ContactForm from '@/components/contact/ContactForm';

export const metadata: Metadata = createPageMetadata({
  title: '문의하기',
  description: "Victor's Alpha에 문의사항이 있으신가요? 언제든지 연락주세요. 파트너십, 광고, 기타 문의사항을 환영합니다.",
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-12 px-4 transition-colors">
      <div className="container mx-auto max-w-3xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4">
            문의하기
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
            궁금한 점이 있으시거나 협업 제안이 있으신가요?
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8 md:gap-12">
          {/* Contact Information (Sidebar on Desktop, Top on Mobile) */}
          <div className="md:col-span-4 space-y-8 order-2 md:order-1">
            <section>
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                연락처 정보
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">이메일</h3>
                  <a href="mailto:contact@victorsalpha.com" className="text-sm text-gray-900 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                    contact@victorsalpha.com
                  </a>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                문의 가이드
              </h2>
              <ul className="space-y-3 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span> 일반 문의: 1-2 영업일
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span> 파트너십: 3-5 영업일
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span> 기술 지원: 24시간 내
                </li>
              </ul>
            </section>

            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-100 dark:border-blue-900/20">
              <p className="text-xs text-blue-800 dark:text-blue-200 font-medium leading-relaxed">
                💡 자주 묻는 질문은 FAQ 페이지에서 빠르게 확인하실 수 있습니다.
              </p>
            </div>
          </div>

          {/* Contact Form (Main Content) */}
          <div className="md:col-span-8 order-1 md:order-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              메시지 보내기
            </h2>
            <div className="bg-white dark:bg-gray-900 p-1">
              <ContactForm />
            </div>
          </div>
        </div>

        {/* Compact Partnership Section */}
        <div className="mt-20 pt-10 border-t border-gray-100 dark:border-gray-800">
          <h2 className="text-center text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-8">
            협업 및 파트너십
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { title: '광고 및 스폰서', desc: '브랜드 협업과 광고 기회' },
              { title: '게스트 포스팅', desc: '전문가 기고 및 콘텐츠 협업' },
              { title: '미디어 문의', desc: '인터뷰 및 미디어 협력' },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group cursor-default">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-200 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
