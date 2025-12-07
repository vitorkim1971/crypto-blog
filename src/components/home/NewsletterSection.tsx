'use client';

import { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setStatus('loading');

    try {
      // TODO: Implement actual newsletter subscription API
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStatus('success');
      setMessage('구독 신청이 완료되었습니다! 이메일을 확인해주세요.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('구독 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Content */}
          <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4">
            뉴스레터 구독하기
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            매주 엄선된 암호화폐 인사이트와 시장 분석을 이메일로 받아보세요.
            <br />
            구독은 무료이며, 언제든 해지할 수 있습니다.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소 입력"
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              disabled={status === 'loading'}
              required
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {status === 'loading' ? '처리 중...' : '구독하기'}
            </button>
          </form>

          {/* Status Message */}
          {message && (
            <p className={`mt-4 text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          {/* Features */}
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">100+</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">발행된 뉴스레터</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">매주</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">정기 발송</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">무료</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">구독료 없음</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
