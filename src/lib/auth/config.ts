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
          const email = user.email!

          // 1. Check if user exists in profiles (by email) -> implies they have a UUID
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

          let userId = existingProfile?.id;

          // 2. If no profile, check/create in Auth.Users first (Foreign Key Requirement)
          if (!userId) {
            // Check if user exists in Supabase Auth
            const { data: { users } } = await supabase.auth.admin.listUsers();
            const authUser = users.find(u => u.email === email);

            if (authUser) {
              userId = authUser.id;
            } else {
              // Create new Auth User
              const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: email,
                email_confirm: true,
                user_metadata: {
                  name: user.name || profile?.name,
                  avatar_url: user.image || (profile as any)?.picture,
                }
              });

              if (createError) throw createError;
              userId = newUser.user.id;
            }
          }

          // 3. Ensure Profile Exists with correct UUID
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

          if (!currentProfile) {
            await supabase.from('profiles').insert({
              id: userId,
              email: email,
              name: user.name || profile?.name || null,
              avatar_url: user.image || (profile as any)?.picture || null,
            })
          } else {
            // Update existing profile
            await supabase
              .from('profiles')
              .update({
                name: user.name || profile?.name || currentProfile.name,
                avatar_url: user.image || (profile as any)?.picture || currentProfile.avatar_url,
              })
              .eq('id', userId)
          }

          // 4. CRITICAL: Mutate the User object so the UUID flows to the JWT/Session
          user.id = userId!;

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
        token.sub = user.id
      }

      // Auto-heal: If ID is not a UUID (e.g. old Google numeric ID), fetch correct UUID from DB
      // Regex for UUID v4
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (token.email && (!token.sub || !uuidRegex.test(token.sub))) {
        try {
          const supabase = createAdminClient();
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', token.email)
            .single();

          if (profile?.id) {
            token.id = profile.id;
            token.sub = profile.id; // sub is often used as the primary ID in NextAuth
            token.uuid = profile.id; // explicit custom field just in case
          }
        } catch (error) {
          console.error('Failed to auto-heal UUID in JWT:', error);
        }
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
