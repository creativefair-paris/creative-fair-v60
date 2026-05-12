// Sprint 36.B.1 → 36.B.2 — PATCH /api/brand/update.
// Édite un champ de la brand de l'utilisateur courant.
//
// Champs autorisés :
//   - Texte (Sprint 36.B.1) : name, secteur, ton, singularite
//   - JSONB (Sprint 36.B.2) : calendrier_business, objectifs, ressources
//
// Mapping UI ↔ DB :
//   "Nom"                → name
//   "Secteur"            → secteur
//   "Voix"               → ton
//   "Singularité"        → singularite
//   "Calendrier"         → calendrier_business (array)
//   "Objectifs"          → objectifs (array)
//   "Ressources"         → ressources (object)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import type { MomentBusiness, Objectif, Ressources, CapaciteProduction } from '@/types/ma-marque'
import type { PilierNarratif } from '@/types/programme'

// ── Champs texte ─────────────────────────────────────────────────────────────

const TEXT_FIELD_MAX_LENGTH: Record<string, number> = {
  name: 80,
  secteur: 120,
  ton: 280,
  singularite: 400,
}
const TEXT_FIELDS = new Set(Object.keys(TEXT_FIELD_MAX_LENGTH))

// ── Champs JSONB ─────────────────────────────────────────────────────────────

const JSONB_FIELDS = new Set([
  'calendrier_business',
  'objectifs',
  'ressources',
  'piliers_narratifs',
])

const TYPES_MOMENT = new Set(['lancement', 'evenement', 'operation', 'saison'])
const CAPACITES_PRODUCTION = new Set([
  'aucune',
  'occasionnelle',
  'reguliere',
  'soutenue',
])
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function validateCalendrierBusiness(value: unknown): MomentBusiness[] | null {
  if (!Array.isArray(value)) return null
  if (value.length > 60) return null // garde-fou
  const out: MomentBusiness[] = []
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>
    if (typeof r.id !== 'string' || r.id.trim().length === 0) return null
    if (typeof r.titre !== 'string' || r.titre.trim().length === 0 || r.titre.length > 120) {
      return null
    }
    if (typeof r.date_debut !== 'string' || !ISO_DATE_RE.test(r.date_debut)) return null
    if (
      r.date_fin !== undefined &&
      r.date_fin !== null &&
      (typeof r.date_fin !== 'string' || !ISO_DATE_RE.test(r.date_fin))
    ) {
      return null
    }
    if (typeof r.type !== 'string' || !TYPES_MOMENT.has(r.type)) return null
    out.push({
      id: r.id,
      titre: r.titre.trim(),
      date_debut: r.date_debut,
      ...(r.date_fin ? { date_fin: r.date_fin as string } : {}),
      type: r.type as MomentBusiness['type'],
    })
  }
  return out
}

function validateObjectifs(value: unknown): Objectif[] | null {
  if (!Array.isArray(value)) return null
  if (value.length > 12) return null
  const out: Objectif[] = []
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>
    if (typeof r.id !== 'string' || r.id.trim().length === 0) return null
    if (typeof r.label !== 'string' || r.label.trim().length === 0 || r.label.length > 160) {
      return null
    }
    const p = r.priorite
    if (p !== 1 && p !== 2 && p !== 3) return null
    out.push({ id: r.id, label: r.label.trim(), priorite: p })
  }
  return out
}

function validatePiliersNarratifs(value: unknown): PilierNarratif[] | null {
  if (!Array.isArray(value)) return null
  if (value.length !== 3) return null
  const out: PilierNarratif[] = []
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>
    if (typeof r.nom !== 'string' || r.nom.trim().length === 0) return null
    if (typeof r.description !== 'string' || r.description.trim().length === 0) return null
    if (typeof r.ratio_suggere !== 'number' || !Number.isFinite(r.ratio_suggere)) return null
    if (r.ratio_suggere < 0 || r.ratio_suggere > 1) return null
    out.push({
      nom: r.nom.trim().slice(0, 60),
      description: r.description.trim().slice(0, 200),
      ratio_suggere: Number(r.ratio_suggere.toFixed(3)),
    })
  }
  return out
}

function validateRessources(value: unknown): Ressources | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const r = value as Record<string, unknown>
  if (typeof r.photo !== 'string' || !CAPACITES_PRODUCTION.has(r.photo)) return null
  if (typeof r.video !== 'string' || !CAPACITES_PRODUCTION.has(r.video)) return null
  if (typeof r.terrain !== 'boolean') return null
  if (typeof r.studio !== 'boolean') return null
  return {
    photo: r.photo as CapaciteProduction,
    video: r.video as CapaciteProduction,
    terrain: r.terrain,
    studio: r.studio,
  }
}

// ── Body type ────────────────────────────────────────────────────────────────

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
  if (typeof field !== 'string' || (!TEXT_FIELDS.has(field) && !JSONB_FIELDS.has(field))) {
    return NextResponse.json(
      { error: 'invalid_field', detail: 'Champ non autorisé.' },
      { status: 400 },
    )
  }

  // Validation typée par catégorie
  let normalizedValue:
    | string
    | MomentBusiness[]
    | Objectif[]
    | Ressources
    | PilierNarratif[]

  if (TEXT_FIELDS.has(field)) {
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
    const maxLength = TEXT_FIELD_MAX_LENGTH[field]!
    if (trimmed.length > maxLength) {
      return NextResponse.json(
        {
          error: 'value_too_long',
          detail: `Longueur max ${maxLength} caractères.`,
        },
        { status: 400 },
      )
    }
    normalizedValue = trimmed
  } else {
    // Champ JSONB
    if (field === 'calendrier_business') {
      const v = validateCalendrierBusiness(value)
      if (!v) {
        return NextResponse.json(
          { error: 'invalid_structure', detail: 'Structure calendrier_business invalide.' },
          { status: 400 },
        )
      }
      normalizedValue = v
    } else if (field === 'objectifs') {
      const v = validateObjectifs(value)
      if (!v) {
        return NextResponse.json(
          { error: 'invalid_structure', detail: 'Structure objectifs invalide.' },
          { status: 400 },
        )
      }
      normalizedValue = v
    } else if (field === 'ressources') {
      const v = validateRessources(value)
      if (!v) {
        return NextResponse.json(
          { error: 'invalid_structure', detail: 'Structure ressources invalide.' },
          { status: 400 },
        )
      }
      normalizedValue = v
    } else {
      // piliers_narratifs
      const v = validatePiliersNarratifs(value)
      if (!v) {
        return NextResponse.json(
          { error: 'invalid_structure', detail: 'Structure piliers_narratifs invalide (3 items, nom/description/ratio_suggere).' },
          { status: 400 },
        )
      }
      normalizedValue = v
    }
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
  const updatePayload: Record<string, unknown> = {
    [field]: normalizedValue,
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
    .select('id, name, secteur, ton, singularite, calendrier_business, objectifs, ressources, piliers_narratifs')
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
