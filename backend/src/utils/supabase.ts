import { createClient } from '@supabase/supabase-js'

const supabaseUrl: string = process.env.SUPABASE_URL || ''
const supabaseServiceRoleKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars missing: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

// Service role key is used on the server only. Never expose it to the client.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
  },
})


