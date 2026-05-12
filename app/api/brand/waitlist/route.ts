// Sprint 36.B.5 — Liste d'attente pour les canaux Bientôt.
//
// GET    : retourne les channels pour lesquels l'utilisateur courant
//          a une inscription active (par brand).
// POST   : { channel, email } → upsert (unique brand_id+channel+email).
// DELETE : { channel, email } → retrait.
//
// Si la migration 010 n'est pas appliquée, Supabase renvoie une erreur
// `relation "channel_waitlist" does not exist` qu'on traduit en 503.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'

const CHANNELS_AUTORISES = new Set(['tiktok', 'x', 'youtube', 'facebook'])
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Ctx = {
  ok: true
  tenantId: string
  brandId: string
  userEmail: string
}

async function getContext(): Promise<
  | Ctx
  | { ok: false; status: number; body: { error: string; detail: string } }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, status: 401, body: { error: 'unauthorized', detail: 'Session requise.' } }
  }
  const { data: profileData } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId = (profileData as { tenant_id: string | null } | null)?.tenant_id ?? null
  if (!tenantId) {
    return { ok: false, status: 404, body: { error: 'no_tenant', detail: 'Aucun tenant associé.' } }
  }
  const { data: brandRow } = await supabase
    .from('brands')
    .select('id')
    .eq('tenant_id', tenantId)
    .maybeSingle()
  const brandId = (brandRow as { id: string } | null)?.id ?? null
  if (!brandId) {
    return { ok: false, status: 404, body: { error: 'no_brand', detail: 'Aucune marque trouvée.' } }
  }
  return { ok: true, tenantId, brandId, userEmail: user.email ?? '' }
}

type WaitlistRow = { channel: string; email: string }

export async function GET() {
  const ctx = await getContext()
  if (!ctx.ok) return NextResponse.json(ctx.body, { status: ctx.status })

  const admin = createAdmin()
  const adminTyped = admin as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => Promise<{
          data: WaitlistRow[] | null
          error: { message: string; code?: string } | null
        }>
      }
    }
  }
  const { data, error } = await adminTyped
    .from('channel_waitlist')
    .select('channel, email')
    .eq('brand_id', ctx.brandId)

  if (error) {
    // Migration 010 non appliquée → 503 propre.
    if (error.message.toLowerCase().includes('does not exist')) {
      return NextResponse.json(
        { error: 'migration_pending', detail: 'Table channel_waitlist absente — migration 010 à appliquer.' },
        { status: 503 },
      )
    }
    return NextResponse.json(
      { error: 'fetch_failed', detail: error.message },
      { status: 500 },
    )
  }

  return NextResponse.json({ entries: data ?? [] }, { status: 200 })
}

type BodyCommon = {
  channel?: unknown
  email?: unknown
}

function valider(body: BodyCommon): { channel: string; email: string } | { error: string; detail: string } {
  if (typeof body.channel !== 'string' || !CHANNELS_AUTORISES.has(body.channel)) {
    return { error: 'invalid_channel', detail: 'Canal inconnu.' }
  }
  if (typeof body.email !== 'string' || !EMAIL_RE.test(body.email.trim())) {
    return { error: 'invalid_email', detail: 'Adresse email invalide.' }
  }
  return { channel: body.channel, email: body.email.trim().toLowerCase() }
}

export async function POST(request: Request) {
  let raw: BodyCommon
  try {
    raw = (await request.json()) as BodyCommon
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', detail: 'Corps de requête invalide.' },
      { status: 400 },
    )
  }
  const v = valider(raw)
  if ('error' in v) return NextResponse.json(v, { status: 400 })

  const ctx = await getContext()
  if (!ctx.ok) return NextResponse.json(ctx.body, { status: ctx.status })

  const admin = createAdmin()
  const adminTyped = admin as unknown as {
    from: (t: string) => {
      upsert: (
        payload: Record<string, unknown>,
        opts: { onConflict: string },
      ) => {
        select: (cols: string) => {
          maybeSingle: () => Promise<{
            data: WaitlistRow | null
            error: { message: string } | null
          }>
        }
      }
    }
  }
  const { data, error } = await adminTyped
    .from('channel_waitlist')
    .upsert(
      {
        tenant_id: ctx.tenantId,
        brand_id: ctx.brandId,
        channel: v.channel,
        email: v.email,
      },
      { onConflict: 'brand_id,channel,email' },
    )
    .select('channel, email')
    .maybeSingle()

  if (error) {
    if (error.message.toLowerCase().includes('does not exist')) {
      return NextResponse.json(
        { error: 'migration_pending', detail: 'Table channel_waitlist absente — migration 010 à appliquer.' },
        { status: 503 },
      )
    }
    return NextResponse.json(
      { error: 'insert_failed', detail: error.message },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true, entry: data }, { status: 200 })
}

export async function DELETE(request: Request) {
  let raw: BodyCommon
  try {
    raw = (await request.json()) as BodyCommon
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', detail: 'Corps de requête invalide.' },
      { status: 400 },
    )
  }
  const v = valider(raw)
  if ('error' in v) return NextResponse.json(v, { status: 400 })

  const ctx = await getContext()
  if (!ctx.ok) return NextResponse.json(ctx.body, { status: ctx.status })

  const admin = createAdmin()
  const delAdmin = admin as unknown as {
    from: (t: string) => {
      delete: () => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: string) => Promise<{
              error: { message: string } | null
            }>
          }
        }
      }
    }
  }
  const { error } = await delAdmin
    .from('channel_waitlist')
    .delete()
    .eq('brand_id', ctx.brandId)
    .eq('channel', v.channel)
    .eq('email', v.email)

  if (error) {
    if (error.message.toLowerCase().includes('does not exist')) {
      return NextResponse.json(
        { error: 'migration_pending', detail: 'Table channel_waitlist absente — migration 010 à appliquer.' },
        { status: 503 },
      )
    }
    return NextResponse.json(
      { error: 'delete_failed', detail: error.message },
      { status: 500 },
    )
  }
  return NextResponse.json({ success: true }, { status: 200 })
}
