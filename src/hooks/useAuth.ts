'use client';

import { useSession, signIn as nextSignIn, signOut as nextSignOut } from 'next-auth/react';
import { useMemo } from 'react';

// Aligning interfaces with previous implementation to minimize breaking changes
interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface User {
  id: string;
  email?: string;
}

interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();

  const user = useMemo(() => {
    if (!session?.user?.email) return null;
    return {
      id: session.user.id || '', // NextAuth users usually have an ID
      email: session.user.email,
    };
  }, [session]);

  const profile = useMemo(() => {
    if (!session?.user) return null;
    return {
      id: session.user.id || '',
      email: session.user.email || '',
      name: session.user.name || null,
      avatar_url: session.user.image || null,
      bio: null, // NextAuth session might not have bio, would need separate fetch if critical
    };
  }, [session]);

  const signIn = async (email: string, password: string) => {
    // Redirects to NextAuth login page or handles credential login
    // For this specific hook usage usually found in this app, we might just redirect
    await nextSignIn();
    return { error: null };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    // Redirect to signup page
    window.location.href = '/signup';
    return { error: null };
  };

  const signOut = async () => {
    await nextSignOut();
  };

  const signInWithGoogle = async () => {
    await nextSignIn('google');
    return { error: null };
  };

  return {
    user,
    profile,
    isLoading: status === 'loading',
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };
}
