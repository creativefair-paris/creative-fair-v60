// Sprint 36.A — Endpoint onboarding flux inversé Marcus (Chantier C.1)
// POST { nom, secteur, ton, singularite }
// → upsert brand + génération initiale Claude Opus → { brandId, programmeId }
//
// Toute autre méthode HTTP renvoie 405.
// Auth obligatoire (cookies session). Sans auth → 401.
// Payload invalide → 400. Erreur génération → 502 (avec code détaillé).

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import { generateProgrammeInitial, GenerationError } from '@/lib/programme/generation'
import type { BrandData } from '@/types/programme'

type CompleteBody = {
  nom: string
  secteur: string
  ton: string
  singularite: string
}

const LIMITS: Record<keyof CompleteBody, number> = {
  nom: 80,
  secteur: 120,
  ton: 280,
  singularite: 400,
}

function validateBody(value: unknown): CompleteBody | string {
  if (!value || typeof value !== 'object') return 'invalid payload'
  const v = value as Record<string, unknown>
  for (const key of Object.keys(LIMITS) as Array<keyof CompleteBody>) {
    const raw = v[key]
    if (typeof raw !== 'string') return `${key} missing or not string`
    const trimmed = raw.trim()
    if (trimmed.length === 0) return `${key} empty`
    if (trimmed.length > LIMITS[key]) return `${key} exceeds max ${LIMITS[key]}`
  }
  return {
    nom: (v.nom as string).trim(),
    secteur: (v.secteur as string).trim(),
    ton: (v.ton as string).trim(),
    singularite: (v.singularite as string).trim(),
  }
}

export async function POST(req: NextRequest) {
  // 1. Auth
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // 2. Tenant
  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId = (rawProfile as { tenant_id?: string } | null)?.tenant_id
  if (!tenantId) {
    return NextResponse.json({ error: 'Aucun tenant associé' }, { status: 401 })
  }

  // 3. Validation payload
  const body = (await req.json().catch(() => null)) as unknown
  const validated = validateBody(body)
  if (typeof validated === 'string') {
    return NextResponse.json({ error: validated }, { status: 400 })
  }

  // 4. Upsert brand via admin (bypass RLS pour init brand_book_status)
  const admin = createAdmin()
  // Cast lâche : le stub types/database.ts est volontairement minimaliste, on
  // contourne avec un type sur-mesure pour les colonnes Sprint 36.A.
  const adminBrands = admin as unknown as {
    from: (t: 'brands') => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{
            data: { id: string } | null
            error: { message: string } | null
          }>
        }
      }
      insert: (row: Record<string, unknown>) => {
        select: (cols: string) => {
          single: () => Promise<{
            data: { id: string } | null
            error: { message: string } | null
          }>
        }
      }
      update: (row: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{
          error: { message: string } | null
        }>
      }
    }
  }

  const { data: existingRaw, error: existingErr } = await adminBrands
    .from('brands')
    .select('id')
    .eq('tenant_id', tenantId)
    .maybeSingle()

  if (existingErr) {
    return NextResponse.json(
      { error: 'lookup brand failed', detail: existingErr.message },
      { status: 500 },
    )
  }

  const brandPayload: Record<string, unknown> = {
    name: validated.nom,
    secteur: validated.secteur,
    ton: validated.ton,
    singularite: validated.singularite,
    brand_book_status: 'complete',
    updated_at: new Date().toISOString(),
  }

  let brandId: string
  if (existingRaw?.id) {
    const { error: updErr } = await adminBrands
      .from('brands')
      .update(brandPayload)
      .eq('id', existingRaw.id)
    if (updErr) {
      return NextResponse.json(
        { error: 'brand update failed', detail: updErr.message },
        { status: 500 },
      )
    }
    brandId = existingRaw.id
  } else {
    const { data: inserted, error: insErr } = await adminBrands
      .from('brands')
      .insert({ tenant_id: tenantId, ...brandPayload })
      .select('id')
      .single()
    if (insErr || !inserted) {
      return NextResponse.json(
        { error: 'brand insert failed', detail: insErr?.message ?? 'no data' },
        { status: 500 },
      )
    }
    brandId = inserted.id
  }

  // 5. Génération IA
  const brand: BrandData = {
    id: brandId,
    tenantId,
    nom: validated.nom,
    secteur: validated.secteur,
    ton: validated.ton,
    singularite: validated.singularite,
  }

  try {
    const { programmeId } = await generateProgrammeInitial(brand, admin)
    return NextResponse.json({ brandId, programmeId }, { status: 201 })
  } catch (err) {
    if (err instanceof GenerationError) {
      return NextResponse.json(
        { error: err.code, detail: err.detail, brandId },
        { status: 502 },
      )
    }
    const message = err instanceof Error ? err.message : 'unknown'
    return NextResponse.json({ error: 'generation failed', detail: message }, { status: 502 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}
