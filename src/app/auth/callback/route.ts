import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * T054: Email verification callback handler
 * Handles the callback after user clicks email verification link
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Email verification error:', error)
      // Redirect to error page
      return NextResponse.redirect(
        new URL('/login?error=verification_failed', requestUrl.origin)
      )
    }
  }

  // Redirect to home page on success
  // User will now be logged in with verified email
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
