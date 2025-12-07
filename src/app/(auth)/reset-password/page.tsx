import { Metadata } from 'next'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: "비밀번호 재설정 | Victor's Alpha",
  description: '새로운 비밀번호를 설정하세요.',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Victor's Alpha</h1>
          <p className="mt-2 text-sm text-gray-600">
            전문 암호화폐 투자 인사이트
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
