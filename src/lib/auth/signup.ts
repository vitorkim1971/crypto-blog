import { createClient } from '@/lib/supabase/client'
import { SignupCredentials, AuthResponse, AuthError } from '@/lib/types/auth'
import { validateSignupCredentials } from './validation'

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  credentials: SignupCredentials
): Promise<AuthResponse> {
  // Validate credentials
  const validation = validateSignupCredentials(credentials)
  if (!validation.valid) {
    return {
      error: {
        message: validation.errors[0]?.message || '잘못된 입력입니다.',
        code: 'validation_error',
      },
    }
  }

  try {
    const supabase = createClient()

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name || null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      // Handle specific Supabase errors
      if (error.message.includes('already registered')) {
        return {
          error: {
            message: '이미 등록된 이메일입니다.',
            code: 'email_exists',
          },
        }
      }

      return {
        error: {
          message: error.message || '회원가입에 실패했습니다.',
          code: error.name || 'signup_error',
        },
      }
    }

    if (!data.user) {
      return {
        error: {
          message: '회원가입에 실패했습니다.',
          code: 'no_user',
        },
      }
    }

    return {
      data: {
        id: data.user.id,
        email: data.user.email!,
        name: credentials.name,
      },
    }
  } catch (error) {
    console.error('Signup error:', error)
    return {
      error: {
        message: '회원가입 중 오류가 발생했습니다.',
        code: 'unknown_error',
      },
    }
  }
}

/**
 * Check if email is already registered
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const supabase = createClient()

    // Try to sign in with a dummy password to check if email exists
    // Note: This is not ideal but Supabase doesn't provide a direct email check API
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy-password-for-check',
    })

    // If error is 'Invalid login credentials', email might exist
    // If error is 'Email not confirmed', email definitely exists
    if (error) {
      return (
        error.message.includes('Email not confirmed') ||
        error.message.includes('Invalid login credentials')
      )
    }

    return false
  } catch (error) {
    console.error('Error checking email:', error)
    return false
  }
}

/**
 * Calculate password strength
 * Returns: 0 (weak), 1 (medium), 2 (strong)
 */
export function calculatePasswordStrength(password: string): number {
  if (!password) return 0

  let strength = 0

  // Length check
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++

  // Contains lowercase
  if (/[a-z]/.test(password)) strength++

  // Contains uppercase
  if (/[A-Z]/.test(password)) strength++

  // Contains numbers
  if (/\d/.test(password)) strength++

  // Contains special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

  // Normalize to 0-2 range
  if (strength <= 2) return 0 // Weak
  if (strength <= 4) return 1 // Medium
  return 2 // Strong
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(strength: number): string {
  switch (strength) {
    case 0:
      return '약함'
    case 1:
      return '보통'
    case 2:
      return '강함'
    default:
      return '약함'
  }
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(strength: number): string {
  switch (strength) {
    case 0:
      return 'text-red-600'
    case 1:
      return 'text-yellow-600'
    case 2:
      return 'text-green-600'
    default:
      return 'text-gray-400'
  }
}
