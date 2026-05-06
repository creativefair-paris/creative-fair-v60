import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Admin client — bypasses RLS. Use ONLY for:
// 1. Tenant provisioning (before user has a profile)
// 2. Migrations / seeds
// 3. Server-side cron jobs / webhooks
// NEVER for serving a user-originated request.
export function createAdmin() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
