import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/lib/types/auth'

/**
 * T070: Get user profile data
 * Fetches complete profile information including subscription status
 */
export async function getProfile(userId: string, email?: string): Promise<Profile | null> {
  try {
    const supabase = await createClient()

    // Check if userId is a valid UUID format
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)

    let profile = null
    let error = null

    // Only try to fetch by user ID if it's a valid UUID
    if (isValidUUID) {
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      profile = result.data
      error = result.error
    }

    // If not found by ID (or ID wasn't valid) and email is provided, try by email
    if (!profile && email) {
      const emailResult = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()

      profile = emailResult.data
      error = emailResult.error
    }

    if (error) {
      // Ignore "Row not found" error (PGRST116) as it's expected for new users
      if (error.code !== 'PGRST116') {
        console.error('Error fetching profile:', JSON.stringify(error, null, 2))
      }
      if (!profile) return null
    }

    if (!profile) {
      return null
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    }
  } catch (error) {
    console.error('Get profile error:', error)
    return null
  }
}

/**
 * T071: Get user subscription status
 * Returns subscription info or null if no active subscription
 * Note: This requires subscriptions table which will be created in Feature #1
 */
export async function getSubscriptionStatus(userId: string): Promise<{
  isActive: boolean
  plan?: string
  expiresAt?: string
} | null> {
  try {
    const supabase = await createClient()

    // Check if subscriptions table exists and query
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (subscription) {
      return {
        isActive: true,
        plan: subscription.plan_type,
        expiresAt: subscription.current_period_end,
      }
    }

    return { isActive: false }
  } catch (_) {
    // Subscriptions table might not exist yet
    console.log('Subscription check skipped (table may not exist yet)')
    return { isActive: false }
  }
}

/**
 * Get complete profile with subscription info
 */
export async function getCompleteProfile(userId: string, email?: string) {
  const profile = await getProfile(userId, email)
  const subscription = await getSubscriptionStatus(profile?.id || userId)

  return {
    profile,
    subscription,
  }
}
