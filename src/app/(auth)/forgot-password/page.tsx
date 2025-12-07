import { Metadata } from 'next'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: "비밀번호 찾기 | Victor's Alpha",
  description: '비밀번호를 잊으셨나요? 이메일을 통해 비밀번호를 재설정하세요.',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Victor's Alpha</h1>
          <p className="mt-2 text-sm text-gray-600">
            전문 암호화폐 투자 인사이트
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
