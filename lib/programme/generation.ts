// Sprint 36.A — Génération du programme initial (flux inversé Marcus)
// Appelle Claude Opus, parse + valide la réponse, persiste programme + posts.

import Anthropic, { APIError } from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  BrandData,
  Jour,
  PilierNarratif,
  PostPrevu,
  ResponseProgrammeInitial,
  TypeContenu,
} from '@/types/programme'
import { SYSTEM_PROMPT_INITIAL, buildUserPromptInitial } from './prompts'

// Cascade modèles : Opus 4-5 → Opus 4-1 → Sonnet 4-5 (dernière chance).
// Documentée dans audits/SPRINT_36A.md (décisions prises seul).
const MODELS_CASCADE = ['claude-opus-4-5', 'claude-opus-4-1', 'claude-sonnet-4-5'] as const
const MODEL_PRIMARY = MODELS_CASCADE[0]
const MAX_TOKENS = 2048
const TEMPERATURE = 0.7
const TIMEOUT_MS = 45_000

const JOURS_VALIDES: readonly Jour[] = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
] as const

const TYPES_VALIDES: readonly TypeContenu[] = ['photo', 'carousel', 'video', 'texte'] as const

export type GenerationErrorCode =
  | 'api_failed'
  | 'invalid_json_response'
  | 'invalid_structure'
  | 'save_failed'

export class GenerationError extends Error {
  code: GenerationErrorCode
  detail: string

  constructor(code: GenerationErrorCode, detail: string) {
    super(`${code}: ${detail}`)
    this.code = code
    this.detail = detail
    this.name = 'GenerationError'
  }
}

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ── Appel Anthropic avec cascade de modèles ──────────────────────────────────

async function callAnthropic(userPrompt: string): Promise<{ text: string; modelUsed: string }> {
  const tryModel = async (model: string) => {
    return anthropicClient.messages.create(
      {
        model,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT_INITIAL,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: userPrompt }],
      },
      { timeout: TIMEOUT_MS },
    )
  }

  let response: Awaited<ReturnType<typeof tryModel>> | null = null
  let modelUsed = ''
  const errors: string[] = []

  for (const model of MODELS_CASCADE) {
    try {
      response = await tryModel(model)
      modelUsed = model
      if (model !== MODEL_PRIMARY) {
        console.warn(`[generation] modèle de repli utilisé : ${model}`)
      } else {
        console.info(`[generation] modèle utilisé : ${model}`)
      }
      break
    } catch (err) {
      const is404 = err instanceof APIError && err.status === 404
      const message = err instanceof Error ? err.message : String(err)
      errors.push(`${model}: ${message}`)
      // 404 = modèle non disponible → on tente le suivant.
      // Autre erreur = on s'arrête immédiatement (clé invalide, quota, etc.).
      if (!is404) {
        throw new GenerationError('api_failed', message)
      }
    }
  }

  if (!response) {
    throw new GenerationError(
      'api_failed',
      `cascade épuisée — ${errors.join(' | ')}`,
    )
  }

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => ('text' in b ? b.text : ''))
    .join('')
    .trim()

  return { text, modelUsed }
}

// ── Nettoyage JSON brut Anthropic ────────────────────────────────────────────
// Claude répond parfois avec des fences markdown (```json ... ```) ou du texte
// d'introduction malgré les instructions strictes. On extrait le bloc JSON.

export function extractJsonFromText(rawText: string): string {
  const trimmed = rawText.trim()
  // 1. Fence ```json ... ```
  const jsonFence = /```json\s*([\s\S]*?)```/i.exec(trimmed)
  if (jsonFence?.[1]) return jsonFence[1].trim()
  // 2. Fence générique ``` ... ```
  const anyFence = /```\s*([\s\S]*?)```/.exec(trimmed)
  if (anyFence?.[1]) return anyFence[1].trim()
  // 3. Substring entre premier { et dernier } (objet racine)
  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1)
  }
  // 4. Rien trouvé : on laisse JSON.parse échouer naturellement
  return trimmed
}

// ── Validation structure ─────────────────────────────────────────────────────

function isPilier(value: unknown): value is PilierNarratif {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.nom === 'string' &&
    v.nom.trim().length > 0 &&
    typeof v.description === 'string' &&
    typeof v.ratio_suggere === 'number'
  )
}

function isPostPrevu(value: unknown): value is PostPrevu {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.pilier_nom === 'string' &&
    typeof v.jour === 'string' &&
    JOURS_VALIDES.includes(v.jour as Jour) &&
    typeof v.date_relative === 'string' &&
    /^\+\d+$/.test(v.date_relative) &&
    typeof v.titre === 'string' &&
    v.titre.trim().length > 0 &&
    typeof v.angle === 'string' &&
    typeof v.type === 'string' &&
    TYPES_VALIDES.includes(v.type as TypeContenu) &&
    typeof v.heure_suggeree === 'string' &&
    /^\d{2}:\d{2}$/.test(v.heure_suggeree)
  )
}

export function validateInitialResponse(json: unknown): ResponseProgrammeInitial {
  if (!json || typeof json !== 'object') {
    throw new GenerationError('invalid_structure', 'response is not an object')
  }
  const v = json as Record<string, unknown>

  if (typeof v.comprehension !== 'string') {
    throw new GenerationError('invalid_structure', 'comprehension missing or not string')
  }
  if (typeof v.arc_narratif !== 'string') {
    throw new GenerationError('invalid_structure', 'arc_narratif missing or not string')
  }
  if (!Array.isArray(v.piliers) || v.piliers.length !== 3) {
    throw new GenerationError('invalid_structure', 'piliers must be array of exactly 3')
  }
  if (!Array.isArray(v.posts) || v.posts.length !== 3) {
    throw new GenerationError('invalid_structure', 'posts must be array of exactly 3')
  }
  if (!v.piliers.every(isPilier)) {
    throw new GenerationError('invalid_structure', 'one or more piliers invalid')
  }
  if (!v.posts.every(isPostPrevu)) {
    throw new GenerationError('invalid_structure', 'one or more posts invalid')
  }

  const pilierNoms = new Set(v.piliers.map((p) => p.nom))
  for (const post of v.posts as PostPrevu[]) {
    if (!pilierNoms.has(post.pilier_nom)) {
      throw new GenerationError(
        'invalid_structure',
        `post.pilier_nom "${post.pilier_nom}" not in piliers`,
      )
    }
  }

  return v as unknown as ResponseProgrammeInitial
}

// ── Date helpers ─────────────────────────────────────────────────────────────

export function computeDateFromRelative(dateRelative: string, baseDate: Date): string {
  const match = /^\+(\d+)$/.exec(dateRelative)
  if (!match) throw new GenerationError('invalid_structure', `bad date_relative ${dateRelative}`)
  const offset = Number.parseInt(match[1]!, 10)
  const d = new Date(baseDate)
  d.setUTCDate(d.getUTCDate() + offset)
  return d.toISOString().slice(0, 10)
}

function normalizeHeure(heure: string): string {
  return `${heure}:00`
}

// ── Persistence ──────────────────────────────────────────────────────────────

export async function saveProgrammeInitial(
  parsed: ResponseProgrammeInitial,
  brandId: string,
  tenantId: string,
  supabaseAdmin: SupabaseClient,
  modelUsed: string = MODEL_PRIMARY,
): Promise<string> {
  const today = new Date()

  // 1. Update brands.piliers_narratifs
  const { error: brandErr } = await supabaseAdmin
    .from('brands')
    .update({
      piliers_narratifs: parsed.piliers,
      updated_at: new Date().toISOString(),
    })
    .eq('id', brandId)

  if (brandErr) {
    throw new GenerationError('save_failed', `brands.piliers_narratifs update: ${brandErr.message}`)
  }

  // 2. Insert programmes
  const arcNarratif = { semaines: [{ theme: parsed.arc_narratif, posts: [] }] }
  type ProgrammeInsertResult = { id: string }
  const { data: programmeData, error: programmeErr } = await supabaseAdmin
    .from('programmes')
    .insert({
      brand_id: brandId,
      tenant_id: tenantId,
      periode: 'semaine',
      arc_narratif: arcNarratif,
      context_generation: {
        sprint: '36.A',
        comprehension: parsed.comprehension,
        model: modelUsed,
      },
      status: 'active',
    })
    .select('id')
    .single<ProgrammeInsertResult>()

  if (programmeErr || !programmeData) {
    throw new GenerationError(
      'save_failed',
      `programmes insert: ${programmeErr?.message ?? 'no data'}`,
    )
  }
  const programmeId = programmeData.id

  // 3. Insert 3 posts
  const postsRows = parsed.posts.map((p) => ({
    programme_id: programmeId,
    tenant_id: tenantId,
    brand_id: brandId,
    pilier_nom: p.pilier_nom,
    jour: p.jour,
    date_prevue: computeDateFromRelative(p.date_relative, today),
    heure_prevue: normalizeHeure(p.heure_suggeree),
    titre: p.titre,
    angle: p.angle,
    type_contenu: p.type,
    statut: 'planifie',
  }))

  const { error: postsErr } = await supabaseAdmin.from('posts').insert(postsRows)
  if (postsErr) {
    throw new GenerationError('save_failed', `posts insert: ${postsErr.message}`)
  }

  return programmeId
}

// ── Pipeline d'entrée ────────────────────────────────────────────────────────

export async function generateProgrammeInitial(
  brand: BrandData,
  supabaseAdmin: SupabaseClient,
): Promise<{ programmeId: string }> {
  const userPrompt = buildUserPromptInitial(brand)
  const { text: raw, modelUsed } = await callAnthropic(userPrompt)
  const cleaned = extractJsonFromText(raw)

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    // Log brut pour debug — pas de clé API (jamais loguée), juste le payload texte.
    console.error('[generation] invalid_json_response, raw Anthropic text:')
    console.error(raw)
    throw new GenerationError('invalid_json_response', cleaned.slice(0, 200))
  }

  const validated = validateInitialResponse(parsed)
  const programmeId = await saveProgrammeInitial(
    validated,
    brand.id,
    brand.tenantId,
    supabaseAdmin,
    modelUsed,
  )

  return { programmeId }
}

// ── Legacy export Sprint 32.5 (signature préservée) ──────────────────────────

export type GenerationContext = {
  brandId: string
  tenantId: string
  contextAnswers: Record<string, unknown>
}

export type GeneratedProgramme = {
  arcNarratif: { semaines: Array<{ theme: string; posts: unknown[] }> }
}

export async function genererProgramme(_ctx: GenerationContext): Promise<GeneratedProgramme> {
  throw new GenerationError('api_failed', 'genererProgramme: legacy, voir generateProgrammeInitial')
}
