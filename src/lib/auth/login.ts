import { createClient } from '@/lib/supabase/client'
import { LoginCredentials, AuthResponse } from '@/lib/types/auth'
import { validateLoginCredentials } from './validation'

// T035: In-memory rate limiting for IP addresses (5 attempts per IP)
const ipAttempts = new Map<string, { count: number; resetAt: number }>()

// T036: In-memory rate limiting for accounts (3 attempts per email)
const accountAttempts = new Map<string, { count: number; resetAt: number }>()

const IP_LIMIT = 5
const ACCOUNT_LIMIT = 3
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

/**
 * Get client IP address (browser-side approximation)
 * Note: This is a simplified version. Server-side implementation would be more robust.
 */
function getClientIP(): string {
  // In browser, we can't get real IP, so we use a session-based identifier
  let sessionIP = sessionStorage.getItem('session_id')
  if (!sessionIP) {
    sessionIP = `browser_${Math.random().toString(36).substring(7)}`
    sessionStorage.setItem('session_id', sessionIP)
  }
  return sessionIP
}

/**
 * Check if IP is rate limited
 */
export function checkIPRateLimit(ip?: string): { allowed: boolean; retryAfter?: number } {
  const clientIP = ip || getClientIP()
  const now = Date.now()
  const attempt = ipAttempts.get(clientIP)

  if (!attempt) {
    return { allowed: true }
  }

  // Reset if lockout period has passed
  if (now > attempt.resetAt) {
    ipAttempts.delete(clientIP)
    return { allowed: true }
  }

  // Check if limit exceeded
  if (attempt.count >= IP_LIMIT) {
    const retryAfter = Math.ceil((attempt.resetAt - now) / 1000)
    return { allowed: false, retryAfter }
  }

  return { allowed: true }
}

/**
 * Check if account (email) is rate limited
 */
export function checkAccountRateLimit(email: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const attempt = accountAttempts.get(email.toLowerCase())

  if (!attempt) {
    return { allowed: true }
  }

  // Reset if lockout period has passed
  if (now > attempt.resetAt) {
    accountAttempts.delete(email.toLowerCase())
    return { allowed: true }
  }

  // Check if limit exceeded
  if (attempt.count >= ACCOUNT_LIMIT) {
    const retryAfter = Math.ceil((attempt.resetAt - now) / 1000)
    return { allowed: false, retryAfter }
  }

  return { allowed: true }
}

/**
 * Record failed login attempt
 */
function recordFailedAttempt(email: string, ip?: string) {
  const clientIP = ip || getClientIP()
  const now = Date.now()
  const resetAt = now + LOCKOUT_DURATION

  // Record IP attempt
  const ipAttempt = ipAttempts.get(clientIP)
  if (!ipAttempt || now > ipAttempt.resetAt) {
    ipAttempts.set(clientIP, { count: 1, resetAt })
  } else {
    ipAttempt.count++
  }

  // Record account attempt
  const accountAttempt = accountAttempts.get(email.toLowerCase())
  if (!accountAttempt || now > accountAttempt.resetAt) {
    accountAttempts.set(email.toLowerCase(), { count: 1, resetAt })
  } else {
    accountAttempt.count++
  }
}

/**
 * Clear failed attempts on successful login
 */
function clearAttempts(email: string, ip?: string) {
  const clientIP = ip || getClientIP()
  ipAttempts.delete(clientIP)
  accountAttempts.delete(email.toLowerCase())
}

/**
 * T032: Sign in with email and password using Supabase
 */
export async function signIn(
  credentials: LoginCredentials,
  options?: { ip?: string; rememberMe?: boolean }
): Promise<AuthResponse> {
  // Validate credentials format
  const validation = validateLoginCredentials(credentials)
  if (!validation.valid) {
    return {
      error: {
        message: validation.errors[0]?.message || '잘못된 입력입니다.',
        code: 'validation_error',
      },
    }
  }

  // T035: Check IP rate limit
  const ipCheck = checkIPRateLimit(options?.ip)
  if (!ipCheck.allowed) {
    return {
      error: {
        message: `너무 많은 로그인 시도가 있었습니다. ${ipCheck.retryAfter}초 후에 다시 시도해주세요.`,
        code: 'rate_limit_ip',
      },
    }
  }

  // T036: Check account rate limit
  const accountCheck = checkAccountRateLimit(credentials.email)
  if (!accountCheck.allowed) {
    return {
      error: {
        message: `이 계정에 대한 로그인 시도가 너무 많습니다. ${accountCheck.retryAfter}초 후에 다시 시도해주세요.`,
        code: 'rate_limit_account',
      },
    }
  }

  try {
    const supabase = createClient()

    // Attempt sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error || !data.user) {
      // T034: Record failed attempt
      recordFailedAttempt(credentials.email, options?.ip)

      // Return user-friendly error message
      if (error?.message.includes('Invalid login credentials')) {
        return {
          error: {
            message: '이메일 또는 비밀번호가 올바르지 않습니다.',
            code: 'invalid_credentials',
          },
        }
      }

      if (error?.message.includes('Email not confirmed')) {
        return {
          error: {
            message: '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.',
            code: 'email_not_confirmed',
          },
        }
      }

      return {
        error: {
          message: error?.message || '로그인에 실패했습니다.',
          code: 'login_error',
        },
      }
    }

    // Clear failed attempts on successful login
    clearAttempts(credentials.email, options?.ip)

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    return {
      data: {
        id: data.user.id,
        email: data.user.email!,
        name: profile?.name || null,
        avatar_url: profile?.avatar_url || null,
      },
    }
  } catch (error) {
    console.error('Login error:', error)
    recordFailedAttempt(credentials.email, options?.ip)
    return {
      error: {
        message: '로그인 중 오류가 발생했습니다.',
        code: 'unknown_error',
      },
    }
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

/**
 * Get current session
 */
export async function getSession() {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    return data.session
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}
