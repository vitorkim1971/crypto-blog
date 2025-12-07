import type { Metadata } from 'next';
import Link from 'next/link';
import SignupForm from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: "회원가입 | Victor's Alpha",
  description: "Victor's Alpha 블로그에 가입하고 프리미엄 콘텐츠를 만나보세요.",
};

export default function SignupPage() {
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
            회원가입
          </h2>
          <p className="text-gray-600">
            암호화폐 투자 인사이트를 시작하세요
          </p>
        </div>

        {/* Signup Form */}
        <SignupForm />
      </div>
    </div>
  );
}
