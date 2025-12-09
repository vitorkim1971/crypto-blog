'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SubscribePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

  // Real addresses provided by user
  const WALLETS = {
    TRC20: 'TJaYDx3k1DMDU4g3vALqw2hUyu7rYucRpR', // USDT (TRON)
    EVM: '0xe47E72670020e5a1F0943ba5bA6fd8261d932D36', // USDT/USDC (ERC-20 & BEP-20)
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Victor's Alpha 멤버십 후원
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            암호화폐로 후원하고 프리미엄 인사이트를 만나보세요.<br />
            여러분의 후원은 더 좋은 콘텐츠를 만드는 힘이 됩니다.
          </p>
        </div>

        {/* Amount Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Monthly Option */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:border-blue-500 transition-all">
            <h3 className="text-base font-semibold text-gray-500 mb-2">월간 후원</h3>
            <div className="flex items-baseline mb-4">
              <span className="text-3xl font-bold text-gray-900">$1.99</span>
              <span className="text-gray-500 ml-2 text-sm">/월</span>
            </div>
            <p className="text-sm text-gray-600">
              부담 없이 시작하는 가벼운 후원.<br />
              모든 프리미엄 콘텐츠에 접근할 수 있습니다.
            </p>
          </div>

          {/* Yearly Option */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-400 text-blue-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
              BEST
            </div>
            <h3 className="text-base font-semibold text-blue-100 mb-2">연간 후원</h3>
            <div className="flex items-baseline mb-4">
              <span className="text-3xl font-bold text-white">$19.99</span>
              <span className="text-blue-100 ml-2 text-sm">/년</span>
            </div>
            <p className="text-sm text-blue-100 opacity-90">
              16% 비용 절감 혜택.<br />
              1년 동안 끊김 없이 인사이트를 받아보세요.
            </p>
          </div>
        </div>

        {/* Wallet Support Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              후원 주소 (USDT / USDC)
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              원하시는 네트워크의 주소를 복사하여 송금해주세요.
            </p>
          </div>

          <div className="p-8 space-y-10">
            {/* 1. USDT Section */}
            <div>
              <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold">T</span>
                1. USDT (Tether)
              </h4>

              <div className="space-y-4 pl-4 border-l-2 border-green-100">
                {/* USDT - TRC20 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">TRON (TRC-20)</span>
                    {copied === 'USDT_TRC20' && <span className="text-xs text-green-600 font-medium animate-fade-in">복사완료!</span>}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={WALLETS.TRC20}
                      className="flex-1 bg-gray-50 border border-gray-300 text-gray-600 text-sm rounded-lg block w-full p-3 font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(WALLETS.TRC20, 'USDT_TRC20')}
                      className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors min-w-[70px] text-sm"
                    >
                      복사
                    </button>
                  </div>
                </div>

                {/* USDT - BEP20 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">BNB Smart Chain (BEP-20)</span>
                    {copied === 'USDT_BEP20' && <span className="text-xs text-green-600 font-medium animate-fade-in">복사완료!</span>}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={WALLETS.EVM}
                      className="flex-1 bg-gray-50 border border-gray-300 text-gray-600 text-sm rounded-lg block w-full p-3 font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(WALLETS.EVM, 'USDT_BEP20')}
                      className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors min-w-[70px] text-sm"
                    >
                      복사
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. USDC Section */}
            <div>
              <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">C</span>
                2. USDC (USD Coin)
              </h4>

              <div className="space-y-4 pl-4 border-l-2 border-blue-100">
                {/* USDC - BEP20 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">BNB Smart Chain (BEP-20)</span>
                    {copied === 'USDC_BEP20' && <span className="text-xs text-green-600 font-medium animate-fade-in">복사완료!</span>}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={WALLETS.EVM}
                      className="flex-1 bg-gray-50 border border-gray-300 text-gray-600 text-sm rounded-lg block w-full p-3 font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(WALLETS.EVM, 'USDC_BEP20')}
                      className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors min-w-[70px] text-sm"
                    >
                      복사
                    </button>
                  </div>
                </div>

                {/* USDC - ERC20 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Ethereum (ERC-20)</span>
                    {copied === 'USDC_ERC20' && <span className="text-xs text-green-600 font-medium animate-fade-in">복사완료!</span>}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={WALLETS.EVM}
                      className="flex-1 bg-gray-50 border border-gray-300 text-gray-600 text-sm rounded-lg block w-full p-3 font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(WALLETS.EVM, 'USDC_ERC20')}
                      className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors min-w-[70px] text-sm"
                    >
                      복사
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mt-8">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>💡 후원 완료 후</strong><br />
                <span className="text-gray-600">이메일(vitorkim1971@gmail.com)이나 텔레그램으로 <strong>TXID(거래번호)</strong>를 보내주시면 확인 후 즉시 처리해 드립니다.</span>
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 text-center">
          <h3 className="text-base font-bold text-gray-900 mb-4">자주 묻는 질문</h3>
          <div className="grid md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1 text-sm">Q. 자동 결제가 되나요?</h4>
              <p className="text-xs text-gray-600">아니요, 암호화폐 후원은 직접 송금 방식이므로 자동 결제되지 않습니다. 기간 만료 시 다시 후원해 주시면 됩니다.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1 text-sm">Q. 승인까지 얼마나 걸리나요?</h4>
              <p className="text-xs text-gray-600">송금 내역 확인 후 최대 24시간 이내에 멤버십이 활성화됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
