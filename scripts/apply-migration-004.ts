/**
 * Sprint 30 — apply migration 004_neutralize_tenant_themes
 * Usage: npx tsx scripts/apply-migration-004.ts
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!url || !key) {
  console.error('Missing env vars. Run: source .env.local or set them in your shell.')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
})

const SLUGS = ['angelina', 'tousentete', 'comptoir'] as const

async function run() {
  console.log('Applying migration 004 — neutralize tenant themes…\n')

  const { error } = await supabase
    .from('tenants')
    .update({ theme: {} })
    .in('slug', SLUGS)

  if (error) {
    console.error('Update failed:', error.message)
    process.exit(1)
  }

  // Smoke test
  const { data, error: fetchError } = await supabase
    .from('tenants')
    .select('slug, theme')
    .in('slug', SLUGS)

  if (fetchError) {
    console.error('Smoke test fetch failed:', fetchError.message)
    process.exit(1)
  }

  console.log('Smoke test — select slug, theme from tenants:\n')
  for (const row of data ?? []) {
    const isNeutral = Object.keys(row.theme ?? {}).length === 0
    console.log(` ${isNeutral ? '✓' : '✗'} ${row.slug} → theme = ${JSON.stringify(row.theme)}`)
  }

  const allNeutral = (data ?? []).every(r => Object.keys(r.theme ?? {}).length === 0)
  if (!allNeutral) {
    console.error('\nSmoke test FAILED — at least one tenant still has a custom theme.')
    process.exit(1)
  }

  console.log('\nMigration 004 applied successfully.')
}

run()
