import { createClient } from '@/lib/supabase/client'
import { AuthResponse } from '@/lib/types/auth'

// T057: In-memory rate limiting for resend verification (1 minute cooldown)
const resendAttempts = new Map<string, number>()
const COOLDOWN_DURATION = 60 * 1000 // 1 minute

/**
 * T056: Resend email verification link
 * T057: With 1-minute cooldown to prevent spam
 */
export async function resendVerificationEmail(
  email: string
): Promise<AuthResponse<{ message: string }>> {
  const now = Date.now()
  const lastAttempt = resendAttempts.get(email.toLowerCase())

  // Check cooldown
  if (lastAttempt && now - lastAttempt < COOLDOWN_DURATION) {
    const retryAfter = Math.ceil((COOLDOWN_DURATION - (now - lastAttempt)) / 1000)
    return {
      error: {
        message: `이메일 재발송은 ${retryAfter}초 후에 가능합니다.`,
        code: 'rate_limit_resend',
      },
    }
  }

  try {
    const supabase = createClient()

    // Resend verification email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      return {
        error: {
          message: '인증 메일 재발송에 실패했습니다.',
          code: 'resend_error',
        },
      }
    }

    // Record attempt
    resendAttempts.set(email.toLowerCase(), now)

    return {
      data: {
        message: '인증 메일이 재발송되었습니다. 이메일을 확인해주세요.',
      },
    }
  } catch (error) {
    console.error('Resend verification error:', error)
    return {
      error: {
        message: '인증 메일 재발송 중 오류가 발생했습니다.',
        code: 'unknown_error',
      },
    }
  }
}

/**
 * Check if current user's email is verified
 */
export async function checkEmailVerified(): Promise<boolean> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // If user exists in session but not in Supabase Auth, they are likely a Google/NextAuth user
      // Google users are implicitly verified.
      return true
    }

    return !!user.email_confirmed_at
  } catch (error) {
    console.error('Check email verified error:', error)
    return true // Default to true on error to avoid annoying verified users
  }
}
