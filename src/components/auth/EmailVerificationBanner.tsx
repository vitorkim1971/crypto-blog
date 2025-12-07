'use client'

import { useState, useEffect } from 'react'
import { resendVerificationEmail } from '@/lib/auth/resend-verification'
import { useSession } from 'next-auth/react'

/**
 * T055: Email verification banner for unverified users
 * T059: Display banner when email is not verified
 */
export default function EmailVerificationBanner() {
  const { data: session } = useSession()
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isDismissed, setIsDismissed] = useState(true) // Start dismissed to avoid flicker, then check storage

  useEffect(() => {
    // Check session storage on mount
    const dismissed = sessionStorage.getItem('email_banner_dismissed') === 'true'
    if (dismissed !== isDismissed) {
      setIsDismissed(dismissed)
    }

    // Check actual verification status
    // T059: Auto-hide if already verified (e.g. Google Login)
    import('@/lib/auth/resend-verification').then(({ checkEmailVerified }) => {
      checkEmailVerified().then((isVerified) => {
        if (isVerified) {
          setIsDismissed(true)
        }
      })
    })
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem('email_banner_dismissed', 'true')
  }

  const handleResend = async () => {
    if (!session?.user?.email) return

    setIsResending(true)
    setMessage(null)

    const result = await resendVerificationEmail(session.user.email)

    if (result.error) {
      setMessage({ type: 'error', text: result.error.message })
    } else {
      setMessage({ type: 'success', text: result.data?.message || '이메일이 발송되었습니다.' })
    }

    setIsResending(false)
  }

  // Bypass verification for admin
  if (session?.user?.email === 'vitorkim1971@gmail.com') return null

  if (isDismissed) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full animate-slide-up px-4 sm:px-0">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 p-4 ring-1 ring-black/5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 pt-0.5">
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-amber-500"
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
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              이메일 인증이 필요합니다
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              안전한 서비스 이용을 위해 인증을 완료해주세요.
            </p>
            {message && (
              <p
                className={`mt-2 text-xs font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}
              >
                {message.text}
              </p>
            )}
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-xs font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors disabled:opacity-50"
              >
                {isResending ? '발송 중...' : '인증 메일 재발송'}
              </button>
              <button
                onClick={handleDismiss}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                나중에 하기
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
