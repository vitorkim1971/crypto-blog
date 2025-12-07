import type { Metadata } from 'next';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: "로그인 | Victor's Alpha",
  description: "Victor's Alpha 블로그에 로그인하고 프리미엄 콘텐츠를 만나보세요.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="container mx-auto max-w-[480px]">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              Victor's Alpha
            </h1>
          </Link>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">
            로그인
          </h2>
          <p className="text-gray-600">
            암호화폐 투자 인사이트에 오신 것을 환영합니다
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
}
