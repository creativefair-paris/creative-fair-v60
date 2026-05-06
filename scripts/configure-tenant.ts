/**
 * Provisionne ou met à jour un tenant à partir des seeds JSON.
 *
 * Usage :
 *   npx tsx scripts/configure-tenant.ts <slug>
 *
 * Lit :
 *   seeds/<slug>-theme.json
 *   seeds/<slug>-brand-book.json
 *   seeds/<slug>-business-calendar.json
 *   seeds/<slug>-tenant.json   (optionnel, pour création initiale)
 *
 * Si le tenant existe déjà, met à jour theme + brand_book + business_calendar.
 * Si non, attend seeds/<slug>-tenant.json avec { name, plan, ownerEmail }
 * et le provisionne (insert tenants + brands + invite owner).
 *
 * Variables d'environnement requises :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

type TenantSeed = {
  name: string
  slug: string
  plan: 'b2b_custom' | 'b2c'
  ownerEmail: string
}

async function main() {
  const slug = process.argv[2]
  if (!slug) {
    console.error('Usage : tsx scripts/configure-tenant.ts <slug>')
    process.exit(1)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises.')
    process.exit(1)
  }

  const seedsDir = resolve(process.cwd(), 'seeds')
  const readJson = <T>(name: string): T =>
    JSON.parse(readFileSync(resolve(seedsDir, `${slug}-${name}.json`), 'utf-8')) as T

  const theme = readJson<unknown>('theme')
  const brandBook = readJson<unknown>('brand-book')
  const businessCalendar = readJson<unknown>('business-calendar')

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  type TenantRow = { id: string; slug: string; name: string }
  const { data: existing, error: tenantErr } = await supabase
    .from('tenants')
    .select('id, slug, name')
    .eq('slug', slug)
    .maybeSingle()
  if (tenantErr) {
    console.error('Erreur lecture tenants :', tenantErr.message)
    process.exit(1)
  }

  let tenantId: string
  if (existing) {
    console.log(`Tenant ${slug} existe déjà. Mise à jour theme/brand_book/calendar.`)
    tenantId = (existing as TenantRow).id
  } else {
    let seed: TenantSeed
    try {
      seed = readJson<TenantSeed>('tenant')
    } catch {
      console.error(
        `Tenant ${slug} introuvable et seeds/${slug}-tenant.json manquant.\n` +
          `Créez-le avec { "name", "slug", "plan", "ownerEmail" }.`,
      )
      process.exit(1)
    }
    console.log(`Création du tenant ${slug}…`)
    const { data: newTenant, error: insertErr } = await supabase
      .from('tenants')
      .insert([
        {
          slug: seed.slug,
          name: seed.name,
          plan: seed.plan,
          theme,
          enabled_channels: ['instagram'],
        },
      ])
      .select('id')
      .single()
    if (insertErr || !newTenant) {
      console.error('Échec insert tenants :', insertErr?.message)
      process.exit(1)
    }
    tenantId = (newTenant as { id: string }).id

    const { error: brandErr } = await supabase
      .from('brands')
      .insert([{ tenant_id: tenantId, name: seed.name }])
    if (brandErr) {
      console.error('Échec insert brands :', brandErr.message)
      process.exit(1)
    }

    const { data: invited, error: inviteErr } =
      await supabase.auth.admin.inviteUserByEmail(seed.ownerEmail.toLowerCase())
    if (inviteErr) {
      console.error('Échec invitation owner :', inviteErr.message)
      process.exit(1)
    }
    if (invited?.user) {
      const { error: profileErr } = await supabase.from('profiles').insert([
        {
          id: invited.user.id,
          tenant_id: tenantId,
          email: seed.ownerEmail.toLowerCase(),
          role: 'owner',
        },
      ])
      if (profileErr) {
        console.error('Échec insert profile owner :', profileErr.message)
        process.exit(1)
      }
    }
    console.log(`Tenant ${slug} créé. Invitation envoyée à ${seed.ownerEmail}.`)
  }

  const { error: themeErr } = await supabase
    .from('tenants')
    .update({ theme, updated_at: new Date().toISOString() })
    .eq('id', tenantId)
  if (themeErr) {
    console.error('Échec update theme :', themeErr.message)
    process.exit(1)
  }

  const { error: bookErr } = await supabase
    .from('brands')
    .update({
      brand_book: brandBook,
      brand_book_status: 'complete',
      business_calendar: businessCalendar,
      updated_at: new Date().toISOString(),
    })
    .eq('tenant_id', tenantId)
  if (bookErr) {
    console.error('Échec update brand :', bookErr.message)
    process.exit(1)
  }

  console.log(`Configuration ${slug} appliquée.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
