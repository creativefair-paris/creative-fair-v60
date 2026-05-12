// Sprint 36.B.2 — Endpoint propositions IA pour les blocs Ma Marque.
// POST { bloc: 'calendrier' | 'objectifs' | 'ressources' }
// → 3 propositions sur-mesure générées par Claude Opus.
//
// Doctrine swap silencieux (Q2) : en cas d'erreur ou de timeout, on renvoie
// 200 avec { propositions: [], error: 'timeout' | 'api_failed' | 'invalid_response' }
// pour que le frontend garde ses propositions génériques sans dégrader l'UX.
//
// Cascade modèles : claude-opus-4-5 → claude-opus-4-1 (pas de Sonnet, on préfère
// la fallback silencieuse à un modèle moins fin pour un sujet aussi sensible
// que les propositions sur-mesure).
//
// Timeout 15s (vs 45s pour génération programme initial).
// max_tokens 1024 (réponses courtes).

import { NextResponse } from 'next/server'
import Anthropic, { APIError } from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import {
  SYSTEM_PROMPT_PROPOSITIONS_CALENDRIER,
  SYSTEM_PROMPT_PROPOSITIONS_OBJECTIFS,
  SYSTEM_PROMPT_PROPOSITIONS_RESSOURCES,
  buildUserPromptPropositions,
} from '@/lib/ma-marque/prompts'
import { extractJsonFromText } from '@/lib/programme/generation'
import type { BrandData } from '@/types/programme'
import type {
  MomentBusinessType,
  PropositionCalendrier,
  PropositionObjectif,
  PropositionRessources,
  CapaciteProduction,
} from '@/types/ma-marque'

type Bloc = 'calendrier' | 'objectifs' | 'ressources'
const BLOCS_VALIDES: ReadonlySet<Bloc> = new Set(['calendrier', 'objectifs', 'ressources'])

const MODELS_CASCADE = ['claude-opus-4-5', 'claude-opus-4-1'] as const
const MAX_TOKENS = 1024
const TEMPERATURE = 0.7
const TIMEOUT_MS = 15_000

const TYPES_MOMENT: ReadonlySet<MomentBusinessType> = new Set([
  'lancement',
  'evenement',
  'operation',
  'saison',
])
const CAPACITES: ReadonlySet<CapaciteProduction> = new Set([
  'aucune',
  'occasionnelle',
  'reguliere',
  'soutenue',
])

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

type ErrorCode = 'timeout' | 'api_failed' | 'invalid_response'

function emptyFallback(code: ErrorCode) {
  return NextResponse.json({ propositions: [], error: code }, { status: 200 })
}

function getSystemPrompt(bloc: Bloc): string {
  switch (bloc) {
    case 'calendrier':
      return SYSTEM_PROMPT_PROPOSITIONS_CALENDRIER
    case 'objectifs':
      return SYSTEM_PROMPT_PROPOSITIONS_OBJECTIFS
    case 'ressources':
      return SYSTEM_PROMPT_PROPOSITIONS_RESSOURCES
  }
}

async function callAnthropic(
  systemPrompt: string,
  userPrompt: string,
): Promise<{ text: string; modelUsed: string } | { error: ErrorCode }> {
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
              text: systemPrompt,
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
        console.warn(`[ma-marque/propositions] modèle de repli utilisé : ${model}`)
      }
      return { text, modelUsed: model }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push(`${model}: ${message}`)
      const isTimeout =
        (err instanceof APIError && (err.status === 408 || err.status === 504)) ||
        /timeout|aborted/i.test(message)
      const is404 = err instanceof APIError && err.status === 404
      // 404 = modèle indisponible → on tente le suivant.
      // Timeout réseau → on rend la main au frontend tout de suite (15s déjà long).
      if (isTimeout) {
        console.warn(`[ma-marque/propositions] timeout sur ${model}`)
        return { error: 'timeout' }
      }
      if (!is404) {
        console.warn(`[ma-marque/propositions] échec ${model}: ${message}`)
        return { error: 'api_failed' }
      }
    }
  }
  console.warn(`[ma-marque/propositions] cascade épuisée: ${errors.join(' | ')}`)
  return { error: 'api_failed' }
}

// ── Validation par bloc ─────────────────────────────────────────────────────

function validateCalendrier(items: unknown): PropositionCalendrier[] | null {
  if (!Array.isArray(items) || items.length !== 3) return null
  const out: PropositionCalendrier[] = []
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>
    if (typeof r.titre !== 'string' || r.titre.trim().length === 0) return null
    if (typeof r.type !== 'string' || !TYPES_MOMENT.has(r.type as MomentBusinessType)) {
      return null
    }
    out.push({ titre: r.titre.trim().slice(0, 80), type: r.type as MomentBusinessType })
  }
  return out
}

function validateObjectifs(items: unknown): PropositionObjectif[] | null {
  if (!Array.isArray(items) || items.length !== 3) return null
  const out: PropositionObjectif[] = []
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>
    if (typeof r.label !== 'string' || r.label.trim().length === 0) return null
    const p = r.priorite_suggeree
    if (p !== 1 && p !== 2 && p !== 3) return null
    out.push({ label: r.label.trim().slice(0, 120), priorite_suggeree: p })
  }
  return out
}

function validateRessources(items: unknown): PropositionRessources[] | null {
  if (!Array.isArray(items) || items.length !== 3) return null
  const out: PropositionRessources[] = []
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>
    if (typeof r.description !== 'string' || r.description.trim().length === 0) return null
    if (!r.hint || typeof r.hint !== 'object') return null
    const h = r.hint as Record<string, unknown>
    const photo = h.photo
    const video = h.video
    if (
      typeof photo !== 'string' ||
      !CAPACITES.has(photo as CapaciteProduction) ||
      typeof video !== 'string' ||
      !CAPACITES.has(video as CapaciteProduction) ||
      typeof h.terrain !== 'boolean' ||
      typeof h.studio !== 'boolean'
    ) {
      return null
    }
    out.push({
      description: r.description.trim().slice(0, 160),
      hint: {
        photo: photo as CapaciteProduction,
        video: video as CapaciteProduction,
        terrain: h.terrain,
        studio: h.studio,
      },
    })
  }
  return out
}

// ── Handler POST ─────────────────────────────────────────────────────────────

type ReqBody = { bloc?: unknown }

export async function POST(request: Request) {
  // 1. Body
  let body: ReqBody
  try {
    body = (await request.json()) as ReqBody
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', detail: 'Corps de requête invalide.' },
      { status: 400 },
    )
  }
  const bloc = body.bloc
  if (typeof bloc !== 'string' || !BLOCS_VALIDES.has(bloc as Bloc)) {
    return NextResponse.json(
      { error: 'invalid_bloc', detail: 'bloc attendu : calendrier | objectifs | ressources.' },
      { status: 400 },
    )
  }
  const blocTyped = bloc as Bloc

  // 2. Auth
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

  // 3. Tenant + brand
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

  // 4. Appel Claude
  const result = await callAnthropic(
    getSystemPrompt(blocTyped),
    buildUserPromptPropositions(brandData),
  )

  if ('error' in result) {
    return emptyFallback(result.error)
  }

  // 5. Parse + validation
  const cleaned = extractJsonFromText(result.text)
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.warn('[ma-marque/propositions] invalid_response raw:', result.text.slice(0, 300))
    return emptyFallback('invalid_response')
  }

  if (!parsed || typeof parsed !== 'object') {
    return emptyFallback('invalid_response')
  }
  const items = (parsed as { propositions?: unknown }).propositions

  let propositions:
    | PropositionCalendrier[]
    | PropositionObjectif[]
    | PropositionRessources[]
    | null = null
  switch (blocTyped) {
    case 'calendrier':
      propositions = validateCalendrier(items)
      break
    case 'objectifs':
      propositions = validateObjectifs(items)
      break
    case 'ressources':
      propositions = validateRessources(items)
      break
  }
  if (!propositions) {
    console.warn('[ma-marque/propositions] structure invalide:', JSON.stringify(items)?.slice(0, 300))
    return emptyFallback('invalid_response')
  }

  return NextResponse.json({ propositions }, { status: 200 })
}

export async function GET() {
  return NextResponse.json(
    { error: 'method_not_allowed', detail: 'Utilise POST.' },
    { status: 405 },
  )
}
