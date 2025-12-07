import { createClient } from '@/lib/supabase/client'
import { AuthResponse, PasswordResetRequest, PasswordUpdate } from '@/lib/types/auth'
import { validateEmail, validatePasswordUpdate } from './validation'

/**
 * T049: Send password reset email
 */
export async function sendPasswordResetEmail(
  request: PasswordResetRequest
): Promise<AuthResponse<{ message: string }>> {
  // Validate email
  const validation = validateEmail(request.email)
  if (!validation.valid) {
    return {
      error: {
        message: validation.errors[0]?.message || '올바른 이메일을 입력해주세요.',
        code: 'validation_error',
      },
    }
  }

  try {
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(request.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      // Don't reveal if email exists or not (security best practice)
      console.error('Password reset error:', error)
    }

    // Always return success to prevent email enumeration attacks
    return {
      data: {
        message:
          '비밀번호 재설정 링크가 이메일로 발송되었습니다. 이메일을 확인해주세요.',
      },
    }
  } catch (error) {
    console.error('Send reset email error:', error)
    return {
      error: {
        message: '비밀번호 재설정 이메일 발송 중 오류가 발생했습니다.',
        code: 'unknown_error',
      },
    }
  }
}

/**
 * T050: Update password with new password
 */
export async function updatePassword(
  passwords: PasswordUpdate
): Promise<AuthResponse<{ message: string }>> {
  // Validate passwords
  const validation = validatePasswordUpdate(passwords)
  if (!validation.valid) {
    return {
      error: {
        message: validation.errors[0]?.message || '비밀번호가 유효하지 않습니다.',
        code: 'validation_error',
      },
    }
  }

  try {
    const supabase = createClient()

    // Update user password
    const { error } = await supabase.auth.updateUser({
      password: passwords.password,
    })

    if (error) {
      // T051: Handle token validation errors
      if (error.message.includes('invalid') || error.message.includes('expired')) {
        return {
          error: {
            message:
              '비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다. 다시 요청해주세요.',
            code: 'invalid_token',
          },
        }
      }

      return {
        error: {
          message: error.message || '비밀번호 변경에 실패했습니다.',
          code: 'update_error',
        },
      }
    }

    return {
      data: {
        message: '비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.',
      },
    }
  } catch (error) {
    console.error('Update password error:', error)
    return {
      error: {
        message: '비밀번호 변경 중 오류가 발생했습니다.',
        code: 'unknown_error',
      },
    }
  }
}

/**
 * Verify if user has a valid session (for reset password page)
 */
export async function verifyResetToken(): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    return !!data.session
  } catch (error) {
    console.error('Verify reset token error:', error)
    return false
  }
}
