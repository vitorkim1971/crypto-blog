import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Fetch profile by email (for Google OAuth users)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (error) {
      // If profile doesn't exist, return basic info from session
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          profile: {
            email: session.user.email,
            name: session.user.name || null,
            avatar_url: session.user.image || null,
            bio: null,
          },
        })
      }
      throw error
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, bio } = body

    const supabase = createAdminClient()

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (existingProfile) {
      // Update existing profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .update({
          name: name || null,
          bio: bio || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProfile.id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ profile })
    } else {
      // Create new profile for Google OAuth user
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(),
          email: session.user.email,
          name: name || session.user.name || null,
          bio: bio || null,
          avatar_url: session.user.image || null,
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ profile })
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
