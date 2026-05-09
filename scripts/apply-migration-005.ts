/**
 * Sprint 32.5 — apply migration 005_programmes
 * Usage: npx tsx scripts/apply-migration-005.ts
 *
 * Idempotent : si la table programmes existe déjà, le script log et exit 0.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!url || !key) {
  console.error('Missing env vars NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
})

async function tableExists(): Promise<boolean> {
  const { error } = await supabase.from('programmes').select('id').limit(1)
  if (!error) return true
  const msg = error.message.toLowerCase()
  // PostgREST renvoie un message contenant "relation ... does not exist" ou "could not find the table"
  if (msg.includes('does not exist') || msg.includes('could not find the table')) return false
  // Autre erreur (RLS sans rows = ok = table existe). On considère existante.
  return true
}

async function run() {
  console.log('Applying migration 005 — programmes…\n')

  if (await tableExists()) {
    console.log('Table `programmes` déjà présente — migration considérée appliquée. Exit 0.')
    return
  }

  const sqlPath = resolve(process.cwd(), 'supabase/migrations/005_programmes.sql')
  const sql = readFileSync(sqlPath, 'utf8')

  // Exécution via RPC `exec_sql` si présent, sinon erreur explicite (l'utilisateur appliquera via Supabase Studio)
  const { error } = await supabase.rpc('exec_sql', { sql })

  if (error) {
    console.error('\nÉchec de l\'application via RPC exec_sql :', error.message)
    console.error('\nApplique manuellement le fichier :')
    console.error(`  ${sqlPath}`)
    console.error('via Supabase Studio > SQL Editor, puis relance ce script pour valider.')
    process.exit(1)
  }

  if (!(await tableExists())) {
    console.error('Migration appliquée sans erreur mais la table n\'est pas détectée.')
    process.exit(1)
  }

  console.log('Migration 005 appliquée — table `programmes` présente.')
}

run()
