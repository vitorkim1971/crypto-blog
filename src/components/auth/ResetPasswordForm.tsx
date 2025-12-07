'use client'

import { useState, FormEvent, ChangeEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updatePassword, verifyResetToken } from '@/lib/auth/reset-password'
import {
  calculatePasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
} from '@/lib/auth/signup'
import { validatePassword } from '@/lib/auth/validation'

export default function ResetPasswordForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  // Password strength
  const passwordStrength = calculatePasswordStrength(formData.password)
  const strengthLabel = getPasswordStrengthLabel(passwordStrength)
  const strengthColor = getPasswordStrengthColor(passwordStrength)

  // T051: Verify token on mount
  useEffect(() => {
    const checkToken = async () => {
      const valid = await verifyResetToken()
      setIsValidToken(valid)
    }
    checkToken()
  }, [])

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value
    setFormData((prev) => ({ ...prev, password }))

    if (password && !validatePassword(password).valid) {
      const validation = validatePassword(password)
      setErrors((prev) => ({
        ...prev,
        password: validation.errors[0]?.message || '비밀번호가 유효하지 않습니다.',
      }))
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.password
        return newErrors
      })
    }

    // Check confirmation match
    if (formData.confirmPassword && password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: '비밀번호가 일치하지 않습니다.',
      }))
    } else if (formData.confirmPassword) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.confirmPassword
        return newErrors
      })
    }
  }

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = e.target.value
    setFormData((prev) => ({ ...prev, confirmPassword }))

    if (confirmPassword && confirmPassword !== formData.password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: '비밀번호가 일치하지 않습니다.',
      }))
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.confirmPassword
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}

    if (!validatePassword(formData.password).valid) {
      newErrors.password = '비밀번호는 최소 8자, 영문과 숫자를 포함해야 합니다.'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const result = await updatePassword(formData)

      if (result.error) {
        setErrors({ general: result.error.message })
        setIsLoading(false)
        return
      }

      // T052: Redirect to login on success
      router.push('/login?reset=success')
    } catch (error) {
      setErrors({ general: '비밀번호 변경 중 오류가 발생했습니다.' })
      setIsLoading(false)
    }
  }

  // Show loading while verifying token
  if (isValidToken === null) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">링크를 확인하고 있습니다...</p>
      </div>
    )
  }

  // Show error if token is invalid
  if (!isValidToken) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-md text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-red-600">유효하지 않은 링크</h2>
        <p className="text-gray-600 mb-6">
          비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다.
          <br />
          다시 요청해주세요.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          다시 요청하기
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-center">새 비밀번호 설정</h2>
      <p className="text-sm text-gray-600 text-center mb-6">
        새로운 비밀번호를 입력해주세요.
      </p>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {errors.general}
        </div>
      )}

      {/* Password field */}
      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          새 비밀번호
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={handlePasswordChange}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="최소 8자, 영문+숫자"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}

        {/* Password strength indicator */}
        {formData.password && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    passwordStrength === 0
                      ? 'w-1/3 bg-red-500'
                      : passwordStrength === 1
                        ? 'w-2/3 bg-yellow-500'
                        : 'w-full bg-green-500'
                  }`}
                />
              </div>
              <span className={`text-sm font-medium ${strengthColor}`}>{strengthLabel}</span>
            </div>
          </div>
        )}
      </div>

      {/* Confirm password field */}
      <div className="mb-6">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          비밀번호 확인
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleConfirmPasswordChange}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="비밀번호를 다시 입력하세요"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isLoading ? '변경 중...' : '비밀번호 변경'}
      </button>
    </form>
  )
}
