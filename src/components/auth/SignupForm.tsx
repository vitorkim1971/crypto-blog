'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import {
  signUp,
  calculatePasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
} from '@/lib/auth/signup'
import { validateEmail, validatePassword } from '@/lib/auth/validation'

export default function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    agreedToTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Password strength calculation
  const passwordStrength = calculatePasswordStrength(formData.password)
  const strengthLabel = getPasswordStrengthLabel(passwordStrength)
  const strengthColor = getPasswordStrengthColor(passwordStrength)

  // T019: Real-time email validation
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    setFormData((prev) => ({ ...prev, email }))

    if (email && !validateEmail(email).valid) {
      setErrors((prev) => ({
        ...prev,
        email: '올바른 이메일 형식이 아닙니다.',
      }))
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.email
        return newErrors
      })
    }
  }

  // T020: Real-time password validation
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

    // T021: Check password confirmation match
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

  // T021: Password confirmation validation
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

    // T023: Validate terms agreement
    if (!formData.agreedToTerms) {
      setErrors((prev) => ({
        ...prev,
        terms: '이용약관에 동의해주세요.',
      }))
      return
    }

    // Final validation
    const newErrors: Record<string, string> = {}

    if (!validateEmail(formData.email).valid) {
      newErrors.email = '올바른 이메일을 입력해주세요.'
    }

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
      // T024: Call Supabase signUp function
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined,
      })

      if (result.error) {
        // T025: Handle duplicate email error
        if (result.error.code === 'email_exists') {
          setErrors({ email: result.error.message })
        } else {
          setErrors({ general: result.error.message })
        }
        setIsLoading(false)
        return
      }

      // T026: Show success message
      setShowSuccess(true)
    } catch (error) {
      setErrors({ general: '회원가입 중 오류가 발생했습니다.' })
      setIsLoading(false)
    }
  }

  // T026: Success screen
  if (showSuccess) {
    return (
      <div className="w-full text-center py-12">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-serif font-bold mb-4">회원가입 완료!</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          가입하신 이메일로 인증 링크를 발송했습니다.
          <br />
          이메일을 확인하여 계정을 활성화해주세요.
        </p>
        <Link
          href="/login"
          className="inline-block px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          로그인하러 가기
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Removed heading - it's in the page component */}

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {errors.general}
        </div>
      )}

      {/* Name field (optional) */}
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          이름 (선택)
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="홍길동"
        />
      </div>

      {/* T019: Email field with validation */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          이메일 *
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleEmailChange}
          required
          className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="your@email.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* T020: Password field with validation */}
      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          비밀번호 *
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={handlePasswordChange}
          required
          className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="최소 8자, 영문+숫자"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}

        {/* T022: Password strength indicator */}
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

      {/* T021: Password confirmation field */}
      <div className="mb-4">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          비밀번호 확인 *
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleConfirmPasswordChange}
          required
          className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="비밀번호를 다시 입력하세요"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      {/* T023: Terms checkbox */}
      <div className="mb-6">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, agreedToTerms: e.target.checked }))
              if (e.target.checked) {
                setErrors((prev) => {
                  const newErrors = { ...prev }
                  delete newErrors.terms
                  return newErrors
                })
              }
            }}
            className="mt-1 w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
          />
          <span className="text-sm text-gray-700">
            <Link href="/terms" className="text-gray-900 underline hover:text-gray-600">
              이용약관
            </Link>
            과{' '}
            <Link href="/privacy" className="text-gray-900 underline hover:text-gray-600">
              개인정보처리방침
            </Link>
            에 동의합니다. *
          </span>
        </label>
        {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms}</p>}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '가입 중...' : '회원가입'}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">또는</span>
        </div>
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Google로 계속하기
      </button>

      {/* Login link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-gray-900 font-medium hover:underline">
          로그인
        </Link>
      </p>
    </form>
  )
}
