import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "이메일 인증 | Victor's Alpha",
  description: '이메일 인증을 완료해주세요.',
}

/**
 * T053: Email verification notice page
 * Displayed after signup to guide users to check their email
 */
export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Victor's Alpha</h1>
          <p className="mt-2 text-sm text-gray-600">
            전문 암호화폐 투자 인사이트
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* Success icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            이메일을 확인해주세요
          </h2>
          <p className="text-gray-600 mb-2">
            회원가입이 거의 완료되었습니다!
          </p>
          <p className="text-gray-600 mb-6">
            가입하신 이메일로 인증 링크를 발송했습니다.
            <br />
            이메일의 링크를 클릭하여 인증을 완료해주세요.
          </p>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 text-left">
            <p className="text-sm text-blue-800 font-medium mb-2">
              이메일이 오지 않았나요?
            </p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>스팸 또는 프로모션 폴더를 확인해보세요</li>
              <li>이메일 주소가 올바른지 확인해보세요</li>
              <li>몇 분 후에 다시 확인해보세요</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              로그인 페이지로 이동
            </Link>
            <Link
              href="/"
              className="block w-full py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition-colors"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
