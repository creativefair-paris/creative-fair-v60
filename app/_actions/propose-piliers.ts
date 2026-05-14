// Sprint 37.F (F46) — Server action : propose 3 piliers narratifs depuis
// le contexte de la marque (brand + brand book + retombées récentes).
//
// Appelé par Step5DefinirPiliers du wizard programme quand
// brand.piliers_narratifs est vide.

'use server'

import Anthropic, { APIError } from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'
import { extractJsonFromText } from '@/lib/programme/generation'
import {
  SYSTEM_PROMPT_PROPOSE_PILIERS,
  buildProposePiliersUserPrompt,
} from '@/lib/brand/propose-piliers-prompt'

const MODELS_CASCADE = ['claude-opus-4-5', 'claude-opus-4-1', 'claude-sonnet-4-5'] as const
const MAX_TOKENS = 512
const TEMPERATURE = 0.7
const TIMEOUT_MS = 30_000

export type ProposePiliersResult =
  | { ok: true; piliers: ReadonlyArray<string> }
  | { ok: false; reason: string }

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function callAnthropic(userPrompt: string): Promise<string> {
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
              text: SYSTEM_PROMPT_PROPOSE_PILIERS,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: [{ role: 'user', content: userPrompt }],
        },
        { timeout: TIMEOUT_MS },
      )
      return response.content
        .filter((b) => b.type === 'text')
        .map((b) => ('text' in b ? b.text : ''))
        .join('')
        .trim()
    } catch (err) {
      const is404 = err instanceof APIError && err.status === 404
      if (!is404) throw err instanceof Error ? err : new Error(String(err))
    }
  }
  throw new Error('cascade modèles épuisée')
}

function validatePiliers(json: unknown): ReadonlyArray<string> {
  if (!json || typeof json !== 'object') return []
  const obj = json as Record<string, unknown>
  if (!Array.isArray(obj.piliers)) return []
  const out: string[] = []
  for (const p of obj.piliers) {
    if (typeof p === 'string' && p.trim().length > 0) {
      out.push(p.trim().slice(0, 60))
    }
  }
  return out.slice(0, 3)
}

export async function proposePiliers(): Promise<ProposePiliersResult> {
  const t0 = Date.now()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId = (rawProfile as { tenant_id?: string | null } | null)?.tenant_id ?? null
  if (!tenantId) return { ok: false, reason: 'Tenant non provisionné' }

  const admin = createAdmin() as unknown as SupabaseClient

  // Charge la marque + brand_book + retombées récentes.
  const { data: rawBrand } = await admin
    .from('brands')
    .select('id, name, secteur, ton, singularite, brand_book')
    .eq('tenant_id', tenantId)
    .maybeSingle()
  const brand = rawBrand as {
    id: string
    name: string | null
    secteur: string | null
    ton: string | null
    singularite: string | null
    brand_book: unknown
  } | null
  if (!brand) return { ok: false, reason: 'Marque introuvable' }

  // Brand book (depuis library_documents si présent)
  const { data: rawBrandBook } = await admin
    .from('library_documents')
    .select('content')
    .eq('tenant_id', tenantId)
    .eq('category', 'brief')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const brandBook = rawBrandBook as { content?: string | null } | null

  // Posts récents avec retombées
  const { data: rawRecentPosts } = await admin
    .from('posts')
    .select('format, objectif_editorial, retombees')
    .eq('brand_id', brand.id)
    .not('retombees', 'is', null)
    .order('date_prevue', { ascending: false })
    .limit(10)
  const recentPosts = (rawRecentPosts as Array<{
    format: string | null
    objectif_editorial: string | null
    retombees: string | null
  }> | null) ?? []

  console.info('[propose-piliers] start', { tenantId, brandId: brand.id })

  const userPrompt = buildProposePiliersUserPrompt({
    brand: {
      name: brand.name,
      secteur: brand.secteur,
      ton: brand.ton,
      singularite: brand.singularite,
    },
    brandBook,
    recentPosts,
  })

  let rawText: string
  try {
    rawText = await callAnthropic(userPrompt)
    console.info('[propose-piliers] anthropic_response', { ms: Date.now() - t0 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'API Anthropic injoignable'
    console.error('[propose-piliers] anthropic_failed', { message })
    return { ok: false, reason: message }
  }

  const cleaned = extractJsonFromText(rawText)
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('[propose-piliers] invalid_json', { raw: rawText.slice(0, 300) })
    return { ok: false, reason: 'Réponse mal formée' }
  }
  const piliers = validatePiliers(parsed)
  if (piliers.length !== 3) {
    console.error('[propose-piliers] wrong_count', { count: piliers.length })
    return { ok: false, reason: `Attendu 3 piliers, reçu ${piliers.length}` }
  }
  console.info('[propose-piliers] done', { ms: Date.now() - t0, piliers })
  return { ok: true, piliers }
}

// Sprint 37.F (F46) — Persiste les 3 piliers validés dans brands.piliers_narratifs.
export async function updateBrandPiliers(
  piliers: ReadonlyArray<string>,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'Non authentifié' }

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId = (rawProfile as { tenant_id?: string | null } | null)?.tenant_id ?? null
  if (!tenantId) return { ok: false, reason: 'Tenant non provisionné' }

  const cleaned = piliers
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .slice(0, 3)
  if (cleaned.length !== 3) {
    return { ok: false, reason: 'Il faut exactement 3 piliers non vides' }
  }

  // Format aligné avec le schéma existant brand.piliers_narratifs (array d'objets).
  const piliersJson = cleaned.map((nom) => ({ nom }))

  const admin = createAdmin() as unknown as SupabaseClient
  const { error } = await admin
    .from('brands')
    .update({ piliers_narratifs: piliersJson })
    .eq('tenant_id', tenantId)
  if (error) return { ok: false, reason: error.message }
  return { ok: true }
}
