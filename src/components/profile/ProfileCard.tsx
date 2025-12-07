'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Profile } from '@/lib/types/auth'

interface ProfileCardProps {
  profile: Profile
  subscription?: {
    isActive: boolean
    plan?: string
    expiresAt?: string
  } | null
}

/**
 * T069: Profile card component
 * T071: Display subscription status
 * T072: "Manage subscription" button (only if active)
 * T073: Default avatar image with placeholder
 */
export default function ProfileCard({ profile, subscription }: ProfileCardProps) {
  // T073: Generate default avatar with initial
  const getAvatarPlaceholder = () => {
    if (profile.avatar_url) {
      return profile.avatar_url
    }
    // Use first letter of name or email
    const initial = (profile.name || profile.email).charAt(0).toUpperCase()
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <rect width="100" height="100" fill="#3B82F6"/>
        <text x="50" y="50" font-size="48" fill="white" text-anchor="middle" dy=".35em" font-family="Arial, sans-serif">${initial}</text>
      </svg>
    `)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with background */}
      <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600"></div>

      {/* Profile content */}
      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-12 mb-4">
          <img
            src={getAvatarPlaceholder()}
            alt={profile.name || profile.email}
            className="w-24 h-24 rounded-full border-4 border-white object-cover"
          />
        </div>

        {/* User info */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {profile.name || '사용자'}
          </h2>
          <p className="text-gray-600 mb-2">{profile.email}</p>
          <p className="text-sm text-gray-500">
            가입일: {profile.created_at ? formatDate(profile.created_at) : 'N/A'}
          </p>
        </div>

        {/* Subscription status */}
        {subscription && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">멤버십 상태</h3>
            {subscription.isActive ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    활성
                  </span>
                  <span className="text-sm text-gray-700">{subscription.plan}</span>
                </div>
                {subscription.expiresAt && (
                  <p className="text-xs text-gray-600">
                    갱신일: {formatDate(subscription.expiresAt)}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-2">
                  무료 플랜
                </span>
                <p className="text-sm text-gray-600 mt-2">
                  프리미엄 후원으로 모든 콘텐츠를 이용하세요.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2">
          {/* T072: Manage subscription button (only if active) */}
          {subscription?.isActive ? (
            <Link
              href="/subscription/manage"
              className="block w-full text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              멤버십 관리
            </Link>
          ) : (
            <Link
              href="/subscribe"
              className="block w-full text-center py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-md transition-all"
            >
              프리미엄 후원하기
            </Link>
          )}

          <Link
            href="/profile/edit"
            className="block w-full text-center py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition-colors"
          >
            프로필 수정
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="block w-full text-center py-2 px-4 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium rounded-md transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}
