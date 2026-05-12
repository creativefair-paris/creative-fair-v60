// Sprint 36.C — Endpoint génération de 3 propositions de posts pour un pilier.
//
// POST body : { pilier: { nom, description, mots_cles? } }
//   → calcule brand context côté serveur (auth + tenant + brand)
//   → appelle Claude Opus cascade
//   → retourne { propositions: [...] }
//
// Rate-limit naturel : Claude latency ~ 4-10s par appel.

import { NextResponse } from 'next/server'
import Anthropic, { APIError } from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import {
  SYSTEM_PROMPT_PILIER_PROPOSITIONS,
  buildUserPromptPilierPropositions,
} from '@/lib/ma-marque/prompts-pilier-propositions'
import { extractJsonFromText } from '@/lib/programme/generation'

const MODELS_CASCADE = ['claude-opus-4-5', 'claude-opus-4-1', 'claude-sonnet-4-5'] as const
const MAX_TOKENS = 768
const TEMPERATURE = 0.85
const TIMEOUT_MS = 30_000

const TYPES_VALIDES = new Set(['photo', 'carrousel', 'reel', 'video'])

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

type Proposition = {
  titre_court: string
  teaser: string
  type_contenu: 'photo' | 'carrousel' | 'reel' | 'video'
}

async function callAnthropic(userPrompt: string): Promise<
  | { text: string; modelUsed: string }
  | { error: 'timeout' | 'api_failed' }
> {
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
              text: SYSTEM_PROMPT_PILIER_PROPOSITIONS,
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
        console.warn(`[pilier-propositions] modèle de repli : ${model}`)
      }
      return { text, modelUsed: model }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      const isTimeout =
        (err instanceof APIError && (err.status === 408 || err.status === 504)) ||
        /timeout|aborted/i.test(message)
      const is404 = err instanceof APIError && err.status === 404
      if (isTimeout) {
        console.warn(`[pilier-propositions] timeout sur ${model}`)
        return { error: 'timeout' }
      }
      if (!is404) {
        console.warn(`[pilier-propositions] échec ${model}: ${message}`)
        return { error: 'api_failed' }
      }
    }
  }
  return { error: 'api_failed' }
}

function validatePropositions(raw: unknown): Proposition[] | null {
  if (!raw || typeof raw !== 'object') return null
  const items = (raw as { propositions?: unknown }).propositions
  if (!Array.isArray(items) || items.length !== 3) return null
  const out: Proposition[] = []
  for (const r of items) {
    if (!r || typeof r !== 'object') return null
    const o = r as Record<string, unknown>
    if (typeof o.titre_court !== 'string' || o.titre_court.trim().length === 0) return null
    if (typeof o.teaser !== 'string' || o.teaser.trim().length === 0) return null
    if (typeof o.type_contenu !== 'string' || !TYPES_VALIDES.has(o.type_contenu)) return null
    out.push({
      titre_court: o.titre_court.trim().slice(0, 60),
      teaser: o.teaser.trim().slice(0, 200),
      type_contenu: o.type_contenu as Proposition['type_contenu'],
    })
  }
  return out
}

export async function POST(req: Request) {
  // ── 1. Auth ──
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

  // ── 2. Brand context ──
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
  const brand = brandRow as
    | {
        id: string
        name: string | null
        secteur: string | null
        ton: string | null
        singularite: string | null
      }
    | null
  if (!brand) {
    return NextResponse.json(
      { error: 'no_brand', detail: 'Aucune marque trouvée.' },
      { status: 404 },
    )
  }

  // ── 3. Body validation ──
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'invalid_body', detail: 'Corps de requête invalide.' },
      { status: 400 },
    )
  }
  const pilierRaw = (body as { pilier?: unknown }).pilier
  if (!pilierRaw || typeof pilierRaw !== 'object') {
    return NextResponse.json(
      { error: 'missing_pilier', detail: 'Champ pilier requis.' },
      { status: 400 },
    )
  }
  const p = pilierRaw as Record<string, unknown>
  if (typeof p.nom !== 'string' || p.nom.trim().length === 0) {
    return NextResponse.json(
      { error: 'invalid_pilier', detail: 'Nom du pilier manquant.' },
      { status: 400 },
    )
  }
  const pilier = {
    nom: p.nom.trim().slice(0, 60),
    description:
      typeof p.description === 'string' ? p.description.trim().slice(0, 200) : '',
    mots_cles: Array.isArray(p.mots_cles)
      ? (p.mots_cles
          .filter((m): m is string => typeof m === 'string' && m.trim().length > 0)
          .map((m) => m.trim().slice(0, 30))
          .slice(0, 5) as string[])
      : undefined,
  }

  // ── 4. Appel Claude ──
  const userPrompt = buildUserPromptPilierPropositions(
    {
      nom: brand.name ?? '',
      secteur: brand.secteur ?? '',
      ton: brand.ton ?? '',
      singularite: brand.singularite ?? '',
    },
    pilier,
  )

  const result = await callAnthropic(userPrompt)
  if ('error' in result) {
    return NextResponse.json(
      { error: result.error, detail: 'Génération indisponible.' },
      { status: 503 },
    )
  }

  // ── 5. Parse + validate ──
  let parsed: unknown
  try {
    parsed = JSON.parse(extractJsonFromText(result.text))
  } catch {
    console.warn('[pilier-propositions] invalid JSON:', result.text.slice(0, 300))
    return NextResponse.json(
      { error: 'invalid_response', detail: 'Réponse invalide.' },
      { status: 502 },
    )
  }
  const propositions = validatePropositions(parsed)
  if (!propositions) {
    console.warn('[pilier-propositions] structure invalide:', JSON.stringify(parsed)?.slice(0, 300))
    return NextResponse.json(
      { error: 'invalid_structure', detail: 'Structure invalide.' },
      { status: 502 },
    )
  }

  return NextResponse.json(
    { success: true, propositions, model: result.modelUsed },
    { status: 200 },
  )
}

export async function GET() {
  return NextResponse.json(
    { error: 'method_not_allowed', detail: 'Utilise POST.' },
    { status: 405 },
  )
}
