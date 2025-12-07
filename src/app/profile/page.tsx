import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getCompleteProfile } from '@/lib/auth/get-profile'
import ProfileCard from '@/components/profile/ProfileCard'

export const metadata: Metadata = {
  title: "프로필 | Victor's Alpha",
  description: '내 프로필 정보를 확인하고 관리하세요.',
}

/**
 * T068: Profile page
 * Shows user profile information and subscription status
 * Redirects to login if not authenticated
 */
export default async function ProfilePage() {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    // Redirect to login with return URL
    redirect('/login?callbackUrl=/profile')
  }

  // Fetch complete profile data (pass email as fallback for Google OAuth users)
  const { profile, subscription } = await getCompleteProfile(session.user.id, session.user.email || undefined)

  // Fallback to session data if profile not found in DB
  const displayProfile = profile || {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name || '사용자',
    bio: null,
    avatar_url: session.user.image || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const daysSinceJoined = Math.floor((Date.now() - new Date(displayProfile.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">내 프로필</h1>
          <p className="mt-2 text-gray-600">
            계정 정보와 구독 상태를 관리하세요.
          </p>
        </div>

        <ProfileCard profile={displayProfile} subscription={subscription} />

        {/* Recent activity or stats could go here */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 통계</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-md">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">읽은 아티클</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-md">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">저장한 아티클</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-md">
              <div className="text-2xl font-bold text-blue-600">
                {daysSinceJoined}
              </div>
              <div className="text-sm text-gray-600">가입 일수</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
