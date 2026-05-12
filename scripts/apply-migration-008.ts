/**
 * Sprint 36.B.2 — apply migration 008 (brands enrichissement)
 *
 * Usage :
 *   set -a && source .env.local && set +a
 *   npx tsx scripts/apply-migration-008.ts
 *
 * Ajoute calendrier_business, objectifs, ressources à la table brands.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!url || !key) {
  console.error('Missing env vars. Run: set -a && source .env.local && set +a')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
})

const MIGRATION_PATH = resolve(
  __dirname,
  '../supabase/migrations/008_brands_enrichissement.sql',
)

async function run() {
  console.log(
    'Applying migration 008 — brands enrichissement (calendrier_business, objectifs, ressources)…\n',
  )

  // 1. Vérifier si les colonnes existent déjà
  const { error: probeError } = await supabase
    .from('brands')
    .select('id, calendrier_business, objectifs, ressources')
    .limit(1)

  if (!probeError) {
    console.log('Colonnes déjà présentes — migration 008 déjà appliquée.')
    return
  }

  // 2. Lire le SQL
  const sql = readFileSync(MIGRATION_PATH, 'utf8')
  console.log('SQL chargé depuis supabase/migrations/008_brands_enrichissement.sql')

  // 3. Tentative via RPC exec_sql
  const { error: rpcError } = await supabase.rpc('exec_sql', { sql })

  if (rpcError) {
    console.log('\n— RPC `exec_sql` indisponible (normal sur Supabase managé).')
    console.log('\nAction Lead requise — Supabase Studio SQL Editor :')
    console.log('  https://supabase.com/dashboard/project/ugfnokdxdqaqapylafeq/sql/new')
    console.log(
      '\nCopier-coller le contenu de supabase/migrations/008_brands_enrichissement.sql puis Run.',
    )
    console.log('\nVérification post-application :')
    console.log("  select column_name from information_schema.columns")
    console.log("   where table_name = 'brands'")
    console.log("     and column_name in ('calendrier_business','objectifs','ressources');")
    console.log('  -- doit retourner 3 lignes')
    process.exit(1)
  }

  // 4. Smoke test
  const { error: smokeError } = await supabase
    .from('brands')
    .select('id, calendrier_business, objectifs, ressources')
    .limit(1)

  if (smokeError) {
    console.error('Smoke test FAILED:', smokeError.message)
    process.exit(1)
  }

  console.log('\nMigration 008 applied successfully — 3 nouvelles colonnes accessibles.')
}

run().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
