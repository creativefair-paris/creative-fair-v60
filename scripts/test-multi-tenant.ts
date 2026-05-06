/**
 * Sprint 1 — Test d'isolation multi-tenant
 *
 * Crée 2 tenants A et B, 1 user et 1 brand chacun, puis vérifie
 * qu'un user ne peut PAS lire les données de l'autre tenant.
 *
 * Lancement :
 *   npx tsx scripts/test-multi-tenant.ts
 *
 * Prérequis :
 *   - Migrations 001 et 002 appliquées sur Supabase.
 *   - .env.local rempli (URL, anon, service_role).
 *
 * Cleanup automatique en fin de script (delete des 2 tenants test).
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// --- Load env from .env.local ---------------------------------------------

function loadEnv() {
  const envPath = join(process.cwd(), '.env.local')
  const raw = readFileSync(envPath, 'utf-8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.error('Missing Supabase env vars in .env.local')
  process.exit(1)
}

// --- Helpers ---------------------------------------------------------------

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function userClient(accessToken: string) {
  return createClient(SUPABASE_URL!, ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
}

const stamp = Date.now()
const SUFFIX = `${stamp}`

type Created = {
  tenantId: string
  userId: string
  brandId: string
  email: string
  password: string
  accessToken: string
}

async function provisionTenant(slug: string): Promise<Created> {
  // 1. Create tenant via service_role (bypasses RLS).
  const { data: tenant, error: tenantErr } = await admin
    .from('tenants')
    .insert({ slug: `${slug}-${SUFFIX}`, name: `Test ${slug}`, plan: 'b2b_custom' })
    .select()
    .single()
  if (tenantErr || !tenant) throw new Error(`tenant create: ${tenantErr?.message}`)

  // 2. Create auth user.
  const email = `${slug}-${SUFFIX}@test.creative-fair.local`
  const password = `Test_${SUFFIX}_${slug}!`
  const { data: userData, error: userErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (userErr || !userData.user) throw new Error(`user create: ${userErr?.message}`)

  // 3. Create profile linking user to tenant.
  const { error: profileErr } = await admin.from('profiles').insert({
    id: userData.user.id,
    tenant_id: tenant.id,
    email,
    role: 'owner',
  })
  if (profileErr) throw new Error(`profile create: ${profileErr.message}`)

  // 4. Create a brand in the tenant.
  const { data: brand, error: brandErr } = await admin
    .from('brands')
    .insert({ tenant_id: tenant.id, name: `Brand ${slug}` })
    .select()
    .single()
  if (brandErr || !brand) throw new Error(`brand create: ${brandErr?.message}`)

  // 5. Sign in as the user to get an access token.
  const anon = createClient(SUPABASE_URL!, ANON_KEY!)
  const { data: session, error: signErr } = await anon.auth.signInWithPassword({
    email,
    password,
  })
  if (signErr || !session.session) throw new Error(`signin: ${signErr?.message}`)

  return {
    tenantId: tenant.id,
    userId: userData.user.id,
    brandId: brand.id,
    email,
    password,
    accessToken: session.session.access_token,
  }
}

async function cleanup(tenantIds: string[]) {
  await admin.from('tenants').delete().in('id', tenantIds)
  // auth.users with profiles cascade-deleted via tenant cascade — but
  // auth.users themselves are not cascaded. We delete by email pattern.
  const { data: users } = await admin.auth.admin.listUsers()
  for (const u of users?.users ?? []) {
    if (u.email?.includes(SUFFIX)) {
      await admin.auth.admin.deleteUser(u.id)
    }
  }
}

// --- Main ------------------------------------------------------------------

async function main() {
  console.log('Sprint 1 — Multi-tenant isolation test')
  console.log(`Suffix: ${SUFFIX}`)
  console.log()

  let a: Created | null = null
  let b: Created | null = null
  let pass = 0
  let fail = 0

  try {
    console.log('→ Provisioning tenant A…')
    a = await provisionTenant('test_a')
    console.log(`  ✓ tenant ${a.tenantId}, user ${a.userId}, brand ${a.brandId}`)

    console.log('→ Provisioning tenant B…')
    b = await provisionTenant('test_b')
    console.log(`  ✓ tenant ${b.tenantId}, user ${b.userId}, brand ${b.brandId}`)

    console.log()
    console.log('=== Test 1: user A reads ONLY their own brand ===')
    const aClient = userClient(a.accessToken)
    const { data: aBrands, error: aErr } = await aClient.from('brands').select('id, tenant_id')
    if (aErr) throw new Error(`A select brands: ${aErr.message}`)
    const aIds = (aBrands ?? []).map((r) => r.id)
    if (aIds.length === 1 && aIds[0] === a.brandId) {
      console.log(`  ✓ user A sees exactly their brand`)
      pass++
    } else {
      console.log(`  ✗ user A sees ${aIds.length} brands: ${aIds.join(', ')}`)
      fail++
    }

    console.log()
    console.log('=== Test 2: user A CANNOT read brand B ===')
    const { data: leaked, error: leakErr } = await aClient
      .from('brands')
      .select('id')
      .eq('id', b.brandId)
    if (leakErr) throw new Error(`A select B brand: ${leakErr.message}`)
    if (!leaked || leaked.length === 0) {
      console.log(`  ✓ user A cannot see brand B`)
      pass++
    } else {
      console.log(`  ✗ LEAK — user A sees brand B: ${JSON.stringify(leaked)}`)
      fail++
    }

    console.log()
    console.log('=== Test 3: user B reads ONLY their own brand ===')
    const bClient = userClient(b.accessToken)
    const { data: bBrands, error: bErr } = await bClient.from('brands').select('id')
    if (bErr) throw new Error(`B select brands: ${bErr.message}`)
    const bIds = (bBrands ?? []).map((r) => r.id)
    if (bIds.length === 1 && bIds[0] === b.brandId) {
      console.log(`  ✓ user B sees exactly their brand`)
      pass++
    } else {
      console.log(`  ✗ user B sees ${bIds.length} brands: ${bIds.join(', ')}`)
      fail++
    }

    console.log()
    console.log('=== Test 4: user B CANNOT read brand A ===')
    const { data: leakedB, error: leakErrB } = await bClient
      .from('brands')
      .select('id')
      .eq('id', a.brandId)
    if (leakErrB) throw new Error(`B select A brand: ${leakErrB.message}`)
    if (!leakedB || leakedB.length === 0) {
      console.log(`  ✓ user B cannot see brand A`)
      pass++
    } else {
      console.log(`  ✗ LEAK — user B sees brand A: ${JSON.stringify(leakedB)}`)
      fail++
    }

    console.log()
    console.log('=== Test 5: user A CANNOT insert brand into tenant B ===')
    const { error: insertErr } = await aClient
      .from('brands')
      .insert({ tenant_id: b.tenantId, name: 'Malicious' })
    if (insertErr) {
      console.log(`  ✓ insert blocked: ${insertErr.message}`)
      pass++
    } else {
      console.log(`  ✗ LEAK — user A inserted into tenant B`)
      fail++
    }
  } catch (e) {
    console.error('Unexpected error:', e)
    fail++
  } finally {
    console.log()
    console.log('→ Cleaning up…')
    const ids = [a?.tenantId, b?.tenantId].filter((x): x is string => Boolean(x))
    if (ids.length > 0) await cleanup(ids)
    console.log('  ✓ cleaned')
  }

  console.log()
  console.log(`Result: ${pass} passed, ${fail} failed`)
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
