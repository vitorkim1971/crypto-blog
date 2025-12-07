import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton instance for browser client
let client: ReturnType<typeof createClient> | null = null

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createClient()
  }
  return client
}

// Export default client for convenience
export const supabase = getSupabaseBrowserClient()
