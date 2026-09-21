import { useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Returns a stable Supabase client reference.
 * Defers creation to first render so it is safe during static prerendering.
 */
export function useSupabase(): SupabaseClient {
  const ref = useRef<SupabaseClient | null>(null)
  if (!ref.current) {
    // Will only execute in the browser where env vars are available
    try {
      ref.current = createClient()
    } catch {
      // During SSR/static prerendering env vars may not be set
      // Return a no-op proxy to avoid crashes
      ref.current = new Proxy({} as SupabaseClient, {
        get: () => new Proxy(() => {}, {
          get: () => () => Promise.resolve({ data: null, error: null, count: null }),
          apply: () => Promise.resolve({ data: null, error: null, count: null }),
        }),
      })
    }
  }
  return ref.current
}
