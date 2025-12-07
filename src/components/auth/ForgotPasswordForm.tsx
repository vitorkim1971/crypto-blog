'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import Link from 'next/link'
import { sendPasswordResetEmail } from '@/lib/auth/reset-password'
import { validateEmail } from '@/lib/auth/validation'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)

    if (newEmail && !validateEmail(newEmail).valid) {
      setError('올바른 이메일 형식이 아닙니다.')
    } else {
      setError('')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateEmail(email).valid) {
      setError('올바른 이메일을 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await sendPasswordResetEmail({ email })

      if (result.error) {
        setError(result.error.message)
        setIsLoading(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('요청 처리 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-md text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-blue-500"
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
        <h2 className="text-2xl font-bold mb-4">이메일을 확인하세요</h2>
        <p className="text-gray-600 mb-6">
          비밀번호 재설정 링크가 <strong>{email}</strong>으로 발송되었습니다.
          <br />
          이메일을 확인하여 비밀번호를 재설정해주세요.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          로그인 페이지로
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-center">비밀번호 찾기</h2>
      <p className="text-sm text-gray-600 text-center mb-6">
        가입하신 이메일 주소를 입력하시면
        <br />
        비밀번호 재설정 링크를 보내드립니다.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          이메일
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={handleEmailChange}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="your@email.com"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mb-4"
      >
        {isLoading ? '발송 중...' : '재설정 링크 발송'}
      </button>

      <p className="text-center text-sm text-gray-600">
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          로그인 페이지로 돌아가기
        </Link>
      </p>
    </form>
  )
}
