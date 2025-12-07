import { Database } from './database'

// Profile type from Supabase
export type Profile = Database['public']['Tables']['profiles']['Row']

// User type combining Supabase Auth User and Profile
export interface User {
  id: string
  email: string
  name?: string | null
  avatar_url?: string | null
  bio?: string | null
  created_at?: string | null
  updated_at?: string | null
}

// Auth credentials for login
export interface LoginCredentials {
  email: string
  password: string
}

// Auth credentials for signup
export interface SignupCredentials {
  email: string
  password: string
  name?: string
}

// Password reset request
export interface PasswordResetRequest {
  email: string
}

// Password update
export interface PasswordUpdate {
  password: string
  confirmPassword: string
}

// Profile update
export interface ProfileUpdate {
  name?: string
  bio?: string
  avatar_url?: string
}

// Auth error types
export interface AuthError {
  message: string
  code?: string
}

// Auth response
export interface AuthResponse<T = User> {
  data?: T
  error?: AuthError
}
