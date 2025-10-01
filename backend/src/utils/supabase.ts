import { createClient } from '@supabase/supabase-js'

const supabaseUrl: string = process.env.SUPABASE_URL || ''
const supabaseAnonKey: string = process.env.SUPABASE_ANON_KEY || ''
const supabaseServiceRoleKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env var missing: SUPABASE_URL')
}
if (!supabaseServiceRoleKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env var missing: SUPABASE_SERVICE_ROLE_KEY')
}
if (!supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env var missing: SUPABASE_ANON_KEY')
}

// Service role key is used on the server only. Never expose it to the client.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
  },
})

// Anon client is safe for server-side email/password auth endpoints
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
  },
})


