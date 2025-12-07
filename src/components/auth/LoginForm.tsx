'use client'

import { useState, FormEvent, ChangeEvent, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { validateEmail } from '@/lib/auth/validation'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true, // T031: Default to checked
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Check for error in URL params (from NextAuth)
  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setErrors({ general: '로그인에 실패했습니다. 다시 시도해주세요.' })
    }
  }, [searchParams])

  // T029: Email validation
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

  // T030: Password validation
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value
    setFormData((prev) => ({ ...prev, password }))

    if (password && password.length < 1) {
      setErrors((prev) => ({
        ...prev,
        password: '비밀번호를 입력해주세요.',
      }))
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.password
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!validateEmail(formData.email).valid) {
      newErrors.email = '올바른 이메일을 입력해주세요.'
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // T033: Use NextAuth CredentialsProvider
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        // T034: Error handling with clear messages
        setErrors({
          general: '이메일 또는 비밀번호가 올바르지 않습니다.',
        })
        setIsLoading(false)
        return
      }

      // T037: Redirect to original URL on success
      if (result?.ok) {
        router.push(callbackUrl)
        router.refresh() // Refresh to update session
      }
    } catch (error) {
      setErrors({ general: '로그인 중 오류가 발생했습니다.' })
      setIsLoading(false)
    }
  }

  // Handle Google OAuth login
  const handleGoogleLogin = async () => {
    try {
      await signIn('google', {
        callbackUrl,
      })
    } catch (error) {
      setErrors({ general: 'Google 로그인에 실패했습니다.' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Removed heading - it's in the page component */}

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {errors.general}
        </div>
      )}

      {/* T029: Email field */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          이메일
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleEmailChange}
          required
          autoComplete="email"
          className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="your@email.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* T030: Password field */}
      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          비밀번호
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={handlePasswordChange}
          required
          autoComplete="current-password"
          className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="비밀번호"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      {/* T031: Remember me checkbox */}
      <div className="mb-6 flex items-center justify-between">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={(e) => setFormData((prev) => ({ ...prev, rememberMe: e.target.checked }))}
            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
          />
          <span className="text-sm text-gray-700">로그인 상태 유지</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-sm text-gray-900 hover:underline"
        >
          비밀번호 찾기
        </Link>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6"
      >
        {isLoading ? '로그인 중...' : '로그인'}
      </button>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">또는</span>
        </div>
      </div>

      {/* Google OAuth button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full py-3 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Google로 계속하기
      </button>

      {/* Signup link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="text-gray-900 font-medium hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  )
}
