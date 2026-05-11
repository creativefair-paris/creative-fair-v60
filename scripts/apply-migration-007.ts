/**
 * Sprint 36.A — apply migration 007 (brands extension)
 *
 * Usage :
 *   set -a && source .env.local && set +a
 *   npx tsx scripts/apply-migration-007.ts
 *
 * Ajoute secteur, ton, singularite, piliers_narratifs à la table brands.
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

const MIGRATION_PATH = resolve(__dirname, '../supabase/migrations/007_brands_extension.sql')

async function run() {
  console.log('Applying migration 007 — brands extension (secteur, ton, singularite, piliers_narratifs)…\n')

  // 1. Vérifier si les colonnes existent déjà
  const { data: existingBrand, error: brandError } = await supabase
    .from('brands')
    .select('id, secteur, ton, singularite, piliers_narratifs')
    .limit(1)

  if (!brandError) {
    console.log('Colonnes déjà présentes — migration 007 déjà appliquée.')
    if (existingBrand && existingBrand.length > 0) {
      console.log('Sample row:', JSON.stringify(existingBrand[0], null, 2))
    }
    return
  }

  // 2. Lire le SQL
  const sql = readFileSync(MIGRATION_PATH, 'utf8')
  console.log('SQL chargé depuis supabase/migrations/007_brands_extension.sql')

  // 3. Tentative via RPC exec_sql
  const { error: rpcError } = await supabase.rpc('exec_sql', { sql })

  if (rpcError) {
    console.log('\n— RPC `exec_sql` indisponible (normal sur Supabase managé).')
    console.log('\nAction Lead requise — Supabase Studio SQL Editor :')
    console.log('  https://supabase.com/dashboard/project/ugfnokdxdqaqapylafeq/sql/new')
    console.log('\nCopier-coller le contenu de supabase/migrations/007_brands_extension.sql puis Run.')
    console.log('\nVérification post-application :')
    console.log('  select column_name from information_schema.columns')
    console.log('   where table_name = \'brands\'')
    console.log('     and column_name in (\'secteur\',\'ton\',\'singularite\',\'piliers_narratifs\');')
    console.log('  -- doit retourner 4 lignes')
    process.exit(1)
  }

  // 4. Smoke test
  const { error: smokeError } = await supabase
    .from('brands')
    .select('id, secteur, ton, singularite, piliers_narratifs')
    .limit(1)

  if (smokeError) {
    console.error('Smoke test FAILED:', smokeError.message)
    process.exit(1)
  }

  console.log('\nMigration 007 applied successfully — 4 nouvelles colonnes accessibles.')
}

run().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
