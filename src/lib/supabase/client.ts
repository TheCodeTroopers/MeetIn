import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // During SSR/build, env vars may not be set — use safe placeholders
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  return createBrowserClient(url, key)
}
