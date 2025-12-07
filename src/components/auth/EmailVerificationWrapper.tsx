'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { checkEmailVerified } from '@/lib/auth/resend-verification'
import EmailVerificationBanner from './EmailVerificationBanner'

/**
 * T058-T059: Check email verification status and show banner if not verified
 * Wraps the app to display email verification banner for unverified users
 */
export default function EmailVerificationWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null)

  useEffect(() => {
    const checkVerification = async () => {
      if (status === 'authenticated') {
        const verified = await checkEmailVerified()
        setIsEmailVerified(verified)
      } else {
        setIsEmailVerified(null)
      }
    }

    checkVerification()
  }, [status, session])

  // Show banner only if user is logged in and email is not verified
  const showBanner = status === 'authenticated' && isEmailVerified === false

  return (
    <>
      {showBanner && <EmailVerificationBanner />}
      {children}
    </>
  )
}
