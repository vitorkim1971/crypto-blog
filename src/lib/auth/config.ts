import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createAdminClient } from '@/lib/supabase/server'
import { validateLoginCredentials } from './validation'

interface GoogleProfile {
  picture?: string;
  name?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.')
        }

        // Validate credentials format
        const validation = validateLoginCredentials({
          email: credentials.email,
          password: credentials.password,
        })

        if (!validation.valid) {
          throw new Error(validation.errors[0]?.message || '잘못된 입력입니다.')
        }

        try {
          // Use Supabase admin client to sign in
          const supabase = createAdminClient()

          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error || !data.user) {
            throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
          }

          // Fetch user profile from profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profileError || !profile) {
            // If profile doesn't exist, create one
            const { data: newProfile } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email!,
                name: data.user.user_metadata?.name || null,
                avatar_url: data.user.user_metadata?.avatar_url || null,
              })
              .select()
              .single()

            return {
              id: data.user.id,
              email: data.user.email!,
              name: newProfile?.name || null,
              image: newProfile?.avatar_url || null,
            }
          }

          return {
            id: data.user.id,
            email: profile.email,
            name: profile.name || null,
            image: profile.avatar_url || null,
          }
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message)
          }
          throw new Error('로그인에 실패했습니다.')
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign-in
      if (account?.provider === 'google') {
        try {
          const supabase = createAdminClient()

          // Check if profile exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email!)
            .single()

          if (!existingProfile) {
            // Create profile for new Google OAuth user
            await supabase.from('profiles').insert({
              id: user.id,
              email: user.email!,
              name: user.name || profile?.name || null,
              avatar_url: user.image || (profile as GoogleProfile)?.picture || null,
            })
          } else {
            // Update existing profile with latest Google data
            await supabase
              .from('profiles')
              .update({
                name: user.name || profile?.name || existingProfile.name,
                avatar_url: user.image || (profile as GoogleProfile)?.picture || existingProfile.avatar_url,
              })
              .eq('id', existingProfile.id)
          }
        } catch (error) {
          console.error('Error syncing Google OAuth profile:', error)
          return false
        }
      }

      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // T060: 30 days
    updateAge: 24 * 60 * 60, // T067: Update session every 24 hours for auto-renewal
  },
  secret: process.env.NEXTAUTH_SECRET,
}
