/**
 * Sprint 36.A — apply migration 006 (posts table)
 *
 * Usage :
 *   set -a && source .env.local && set +a
 *   npx tsx scripts/apply-migration-006.ts
 *
 * Le script tente d'appliquer la migration via la RPC `exec_sql` si elle existe.
 * Si elle n'existe pas (cas Supabase managé sans extension custom), il affiche
 * les instructions pour copier-coller le SQL dans Supabase Studio.
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

const MIGRATION_PATH = resolve(__dirname, '../supabase/migrations/006_posts.sql')

async function run() {
  console.log('Applying migration 006 — posts table…\n')

  // 1. Vérifier si la table existe déjà
  const { error: existsError } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })

  if (!existsError) {
    console.log('Table `posts` already exists — migration 006 déjà appliquée.')
    return
  }

  // 2. Lire le SQL
  const sql = readFileSync(MIGRATION_PATH, 'utf8')
  console.log('SQL chargé depuis supabase/migrations/006_posts.sql')

  // 3. Tentative via RPC exec_sql (peut ne pas exister)
  const { error: rpcError } = await supabase.rpc('exec_sql', { sql })

  if (rpcError) {
    console.log('\n— RPC `exec_sql` indisponible (normal sur Supabase managé).')
    console.log('\nAction Lead requise — Supabase Studio SQL Editor :')
    console.log('  https://supabase.com/dashboard/project/ugfnokdxdqaqapylafeq/sql/new')
    console.log('\nCopier-coller le contenu de supabase/migrations/006_posts.sql puis Run.')
    console.log('\nVérification post-application :')
    console.log('  select count(*) from posts;  -- doit retourner 0')
    process.exit(1)
  }

  // 4. Smoke test
  const { error: smokeError } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })

  if (smokeError) {
    console.error('Smoke test FAILED:', smokeError.message)
    process.exit(1)
  }

  console.log('\nMigration 006 applied successfully — table `posts` accessible.')
}

run().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
