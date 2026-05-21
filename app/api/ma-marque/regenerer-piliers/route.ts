// Sprint 36.B.2 — Endpoint régénération des 3 piliers narratifs.
// POST {}  → recalcule 3 piliers via Claude Opus, met à jour brands.piliers_narratifs.
//
// Cascade : claude-opus-4-5 → claude-opus-4-1 → claude-sonnet-4-5 (les piliers sont
// la colonne vertébrale narrative, on accepte Sonnet en dernière chance vs propositions).
// Timeout 30s, max_tokens 1024.
//
// Sécurité : auth obligatoire, tenant_id résolu côté serveur.

import { NextResponse } from 'next/server'
import Anthropic, { APIError } from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import {
  SYSTEM_PROMPT_REGENERATION_PILIERS,
  buildUserPromptRegenerationPiliers,
} from '@/lib/ma-marque/prompts'
import { extractJsonFromText } from '@/lib/programme/generation'
import type { BrandData, PilierNarratif } from '@/types/programme'

const MODELS_CASCADE = ['claude-opus-4-5', 'claude-opus-4-1', 'claude-sonnet-4-5'] as const
const MAX_TOKENS = 1024
const TEMPERATURE = 0.7
const TIMEOUT_MS = 30_000

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function callAnthropic(userPrompt: string): Promise<
  | { text: string; modelUsed: string }
  | { error: 'timeout' | 'api_failed' }
> {
  const errors: string[] = []
  for (const model of MODELS_CASCADE) {
    try {
      const response = await anthropicClient.messages.create(
        {
          model,
          max_tokens: MAX_TOKENS,
          temperature: TEMPERATURE,
          system: [
            {
              type: 'text',
              text: SYSTEM_PROMPT_REGENERATION_PILIERS,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: [{ role: 'user', content: userPrompt }],
        },
        { timeout: TIMEOUT_MS },
      )
      const text = response.content
        .filter((b) => b.type === 'text')
        .map((b) => ('text' in b ? b.text : ''))
        .join('')
        .trim()
      if (model !== MODELS_CASCADE[0]) {
        console.warn(`[regenerer-piliers] modèle de repli utilisé : ${model}`)
      }
      return { text, modelUsed: model }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push(`${model}: ${message}`)
      const isTimeout =
        (err instanceof APIError && (err.status === 408 || err.status === 504)) ||
        /timeout|aborted/i.test(message)
      const is404 = err instanceof APIError && err.status === 404
      if (isTimeout) {
        console.warn(`[regenerer-piliers] timeout sur ${model}`)
        return { error: 'timeout' }
      }
      if (!is404) {
        console.warn(`[regenerer-piliers] échec ${model}: ${message}`)
        return { error: 'api_failed' }
      }
    }
  }
  console.warn(`[regenerer-piliers] cascade épuisée: ${errors.join(' | ')}`)
  return { error: 'api_failed' }
}

function validatePiliers(value: unknown): PilierNarratif[] | null {
  if (!value || typeof value !== 'object') return null
  const items = (value as { piliers?: unknown }).piliers
  if (!Array.isArray(items) || items.length !== 3) return null
  const out: PilierNarratif[] = []
  for (const raw of items) {
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

export async function POST() {
  // 1. Auth
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

  // 2. Tenant + brand
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

  const { data: brandRow } = await supabase
    .from('brands')
    .select('id, name, secteur, ton, singularite')
    .eq('tenant_id', tenantId)
    .maybeSingle()
  type BrandRow = {
    id: string
    name: string | null
    secteur: string | null
    ton: string | null
    singularite: string | null
  }
  const brand = brandRow as BrandRow | null
  if (!brand) {
    return NextResponse.json(
      { error: 'no_brand', detail: 'Aucune marque trouvée.' },
      { status: 404 },
    )
  }

  const brandData: BrandData = {
    id: brand.id,
    tenantId,
    nom: brand.name ?? '',
    secteur: brand.secteur ?? '',
    ton: brand.ton ?? '',
    singularite: brand.singularite ?? '',
  }

  // 3. Appel Claude
  const result = await callAnthropic(buildUserPromptRegenerationPiliers(brandData))
  if ('error' in result) {
    return NextResponse.json(
      { error: result.error, detail: 'Génération indisponible.' },
      { status: 503 },
    )
  }

  // 4. Parse + validation
  const cleaned = extractJsonFromText(result.text)
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.warn('[regenerer-piliers] invalid JSON raw:', result.text.slice(0, 300))
    return NextResponse.json(
      { error: 'invalid_response', detail: 'Réponse IA invalide.' },
      { status: 502 },
    )
  }
  const piliers = validatePiliers(parsed)
  if (!piliers) {
    console.warn('[regenerer-piliers] structure invalide:', JSON.stringify(parsed)?.slice(0, 300))
    return NextResponse.json(
      { error: 'invalid_structure', detail: 'Structure piliers invalide.' },
      { status: 502 },
    )
  }

  // 5. Persist via admin — Sprint 41-secu-compte (A) : filtre tenant_id obligatoire.
  const admin = createAdmin()
  const adminTyped = admin as unknown as {
    from: (t: string) => {
      update: (payload: Record<string, unknown>) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => Promise<{
            error: { message: string } | null
          }>
        }
      }
    }
  }
  const { error: updateErr } = await adminTyped
    .from('brands')
    .update({
      piliers_narratifs: piliers,
      updated_at: new Date().toISOString(),
    })
    .eq('id', brand.id)
    .eq('tenant_id', tenantId)

  if (updateErr) {
    return NextResponse.json(
      { error: 'update_failed', detail: updateErr.message },
      { status: 500 },
    )
  }

  return NextResponse.json(
    { success: true, piliers, model: result.modelUsed },
    { status: 200 },
  )
}

export async function GET() {
  return NextResponse.json(
    { error: 'method_not_allowed', detail: 'Utilise POST.' },
    { status: 405 },
  )
}
