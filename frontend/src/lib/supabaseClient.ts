import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton to avoid throwing during module import when envs are not yet configured
let cachedClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

  if (!supabaseUrl || !supabaseAnonKey) {
    // eslint-disable-next-line no-console
    console.error('❌ Supabase environment variables are missing!')
    console.error('🔧 Please create frontend/.env.local with the following content:')
    console.error('NEXT_PUBLIC_SUPABASE_URL=https://cicpspeczacdnykbqljm.supabase.co')
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY3BzcGVjemFjZG55a2JxbGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDQ2NTcsImV4cCI6MjA3NDg4MDY1N30.fp5PmQ3oyt1O5j7IqPJNIgS6G29e_-Hk6osjM979va4')
    throw new Error('Supabase configuration missing. Please check your .env.local file.')
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return cachedClient
}


