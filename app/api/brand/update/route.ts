// Sprint 36.B.1 — PATCH /api/brand/update.
// Édite un champ de la brand de l'utilisateur courant.
// Champs autorisés : name, secteur, ton, singularite.
// Mapping UI ↔ DB :
//   "Nom"         → name
//   "Secteur"     → secteur
//   "Voix"        → ton
//   "Singularité" → singularite

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'

const FIELD_MAX_LENGTH: Record<string, number> = {
  name: 80,
  secteur: 120,
  ton: 280,
  singularite: 400,
}

const ALLOWED_FIELDS = new Set(Object.keys(FIELD_MAX_LENGTH))

type UpdateBody = {
  field?: unknown
  value?: unknown
}

export async function PATCH(request: Request) {
  let body: UpdateBody
  try {
    body = (await request.json()) as UpdateBody
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', detail: 'Corps de requête invalide.' },
      { status: 400 },
    )
  }

  const { field, value } = body
  if (typeof field !== 'string' || !ALLOWED_FIELDS.has(field)) {
    return NextResponse.json(
      { error: 'invalid_field', detail: 'Champ non autorisé.' },
      { status: 400 },
    )
  }
  if (typeof value !== 'string') {
    return NextResponse.json(
      { error: 'invalid_value', detail: 'Valeur attendue : chaîne.' },
      { status: 400 },
    )
  }
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return NextResponse.json(
      { error: 'empty_value', detail: 'La valeur ne peut pas être vide.' },
      { status: 400 },
    )
  }
  const maxLength = FIELD_MAX_LENGTH[field]!
  if (trimmed.length > maxLength) {
    return NextResponse.json(
      {
        error: 'value_too_long',
        detail: `Longueur max ${maxLength} caractères.`,
      },
      { status: 400 },
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'unauthorized', detail: 'Session requise.' },
      { status: 401 },
    )
  }

  // Récupère tenant_id depuis profiles
  const { data: profileData } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId = (profileData as { tenant_id: string | null } | null)?.tenant_id ?? null
  if (!tenantId) {
    return NextResponse.json(
      { error: 'no_tenant', detail: 'Aucun tenant associé.' },
      { status: 404 },
    )
  }

  // Récupère brand
  const { data: brandRow } = await supabase
    .from('brands')
    .select('id')
    .eq('tenant_id', tenantId)
    .maybeSingle()
  const brandId = (brandRow as { id: string } | null)?.id ?? null
  if (!brandId) {
    return NextResponse.json(
      { error: 'no_brand', detail: 'Aucune marque trouvée.' },
      { status: 404 },
    )
  }

  // Update via admin client (RLS bypass — l'auth + l'appartenance ont
  // déjà été vérifiées côté server avec le user authentifié).
  const admin = createAdmin()
  const updatePayload: Record<string, string | unknown> = {
    [field]: trimmed,
    updated_at: new Date().toISOString(),
  }
  const adminTyped = admin as unknown as {
    from: (t: string) => {
      update: (payload: Record<string, unknown>) => {
        eq: (col: string, val: string) => {
          select: (cols: string) => {
            maybeSingle: () => Promise<{
              data: Record<string, unknown> | null
              error: { message: string } | null
            }>
          }
        }
      }
    }
  }
  const { data: updated, error: updateErr } = await adminTyped
    .from('brands')
    .update(updatePayload)
    .eq('id', brandId)
    .select('id, name, secteur, ton, singularite')
    .maybeSingle()

  if (updateErr) {
    return NextResponse.json(
      { error: 'update_failed', detail: updateErr.message },
      { status: 500 },
    )
  }

  return NextResponse.json(
    { success: true, brand: updated ?? null },
    { status: 200 },
  )
}

export async function GET() {
  return NextResponse.json(
    { error: 'method_not_allowed', detail: 'Utilise PATCH.' },
    { status: 405 },
  )
}
