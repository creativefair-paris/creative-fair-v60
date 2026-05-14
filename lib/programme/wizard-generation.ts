// Sprint 37.D (F34) — Génération du plan depuis une session du wizard A1.
//
// Pipeline :
//   1. Charge la session wizard + brand context
//   2. Construit le prompt avec les 7 réponses + 6 formats canoniques
//   3. Appelle Anthropic (cascade modèles existante)
//   4. Parse JSON, valide manuellement la structure
//   5. Crée le programme + insère les posts (avec format, structure_type,
//      objectif_editorial)
//   6. Retourne le programmeId

import Anthropic, { APIError } from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  SYSTEM_PROMPT_WIZARD_PLAN,
  buildWizardPlanUserPrompt,
} from './wizard-prompt'
import { extractJsonFromText, GenerationError } from './generation'
import type { WizardResponses } from '@/lib/programme-creation/types'

const MODELS_CASCADE = ['claude-opus-4-5', 'claude-opus-4-1', 'claude-sonnet-4-5'] as const
const MODEL_PRIMARY = MODELS_CASCADE[0]
const MAX_TOKENS = 4096
const TEMPERATURE = 0.7
const TIMEOUT_MS = 60_000

const VALID_FORMATS = ['anecdote', 'produit', 'evenement', 'coulisses', 'manifeste', 'question'] as const
const VALID_STRUCTURES = ['carrousel', 'photo', 'reel'] as const
const VALID_JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const

type ValidFormat = (typeof VALID_FORMATS)[number]
type ValidStructure = (typeof VALID_STRUCTURES)[number]

export type WizardGeneratedPost = {
  date: string
  week_number: number
  format: ValidFormat
  structure_type: ValidStructure
  pilier: string
  objectif: string
  description: string
}

export type WizardGeneratedPlan = {
  arc_narratif: string
  plan: ReadonlyArray<WizardGeneratedPost>
}

function validatePlan(json: unknown): WizardGeneratedPlan {
  if (!json || typeof json !== 'object') {
    throw new GenerationError('invalid_structure', 'JSON racine non-objet')
  }
  const obj = json as Record<string, unknown>
  const arcNarratif = typeof obj.arc_narratif === 'string' ? obj.arc_narratif : ''
  if (!Array.isArray(obj.plan)) {
    throw new GenerationError('invalid_structure', 'Champ "plan" manquant ou non-array')
  }
  if (obj.plan.length === 0) {
    throw new GenerationError('invalid_structure', 'plan vide')
  }
  if (obj.plan.length > 50) {
    throw new GenerationError('invalid_structure', `plan trop long : ${obj.plan.length}`)
  }
  const validated: WizardGeneratedPost[] = []
  for (const [idx, raw] of obj.plan.entries()) {
    if (!raw || typeof raw !== 'object') {
      throw new GenerationError('invalid_structure', `post ${idx} non-objet`)
    }
    const p = raw as Record<string, unknown>
    if (typeof p.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(p.date)) {
      throw new GenerationError('invalid_structure', `post ${idx} date invalide`)
    }
    const weekNumber = typeof p.week_number === 'number' ? Math.trunc(p.week_number) : 1
    if (weekNumber < 1 || weekNumber > 20) {
      throw new GenerationError('invalid_structure', `post ${idx} week_number invalide`)
    }
    if (typeof p.format !== 'string' || !VALID_FORMATS.includes(p.format as ValidFormat)) {
      throw new GenerationError('invalid_structure', `post ${idx} format invalide : ${String(p.format)}`)
    }
    if (typeof p.structure_type !== 'string' || !VALID_STRUCTURES.includes(p.structure_type as ValidStructure)) {
      throw new GenerationError('invalid_structure', `post ${idx} structure_type invalide : ${String(p.structure_type)}`)
    }
    const pilier = typeof p.pilier === 'string' ? p.pilier.trim() : ''
    const objectif = typeof p.objectif === 'string' ? p.objectif.trim().slice(0, 100) : ''
    const description = typeof p.description === 'string' ? p.description.trim().slice(0, 250) : ''
    if (!pilier || !objectif || !description) {
      throw new GenerationError('invalid_structure', `post ${idx} champ texte vide`)
    }
    validated.push({
      date: p.date,
      week_number: weekNumber,
      format: p.format as ValidFormat,
      structure_type: p.structure_type as ValidStructure,
      pilier,
      objectif,
      description,
    })
  }
  return { arc_narratif: arcNarratif, plan: validated }
}

function jourFromDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const idx = (d.getDay() + 6) % 7 // lundi=0
  return VALID_JOURS[idx] ?? 'lundi'
}

// Mapping format → type_contenu (colonne pré-existante, autre check constraint).
const FORMAT_TO_TYPE_CONTENU: Record<ValidFormat, 'photo' | 'carousel' | 'video' | 'texte'> = {
  anecdote: 'carousel',
  produit: 'photo',
  evenement: 'photo',
  coulisses: 'video',
  manifeste: 'texte',
  question: 'texte',
}

// Mapping structure_type → type_contenu (override si renseigné).
const STRUCTURE_TO_TYPE_CONTENU: Record<ValidStructure, 'photo' | 'carousel' | 'video' | 'texte'> = {
  carrousel: 'carousel',
  photo: 'photo',
  reel: 'video',
}

export type GenerateFromWizardResult =
  | { ok: true; programmeId: string }
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
              text: SYSTEM_PROMPT_WIZARD_PLAN,
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
      if (model !== MODEL_PRIMARY) {
        console.warn(`[wizard-gen] modèle de repli utilisé : ${model}`)
      }
      return text
    } catch (err) {
      const is404 = err instanceof APIError && err.status === 404
      if (!is404) {
        const message = err instanceof Error ? err.message : String(err)
        throw new GenerationError('api_failed', message)
      }
    }
  }
  throw new GenerationError('api_failed', 'cascade modèles épuisée')
}

export async function generateFromWizardSession(opts: {
  admin: SupabaseClient
  sessionId: string
  tenantId: string
  brandId: string
  brandName: string
  brandSecteur: string | null
  brandTon: string | null
  brandSingularite: string | null
  pillarsCatalog: ReadonlyArray<{ id: string; nom: string }>
  responses: WizardResponses
  publicationFrequency: 'discret' | 'equilibre' | 'dense' | null
  userId: string
}): Promise<GenerateFromWizardResult> {
  // 1. Build prompt
  const userPrompt = buildWizardPlanUserPrompt({
    brandName: opts.brandName,
    brandSecteur: opts.brandSecteur,
    brandTon: opts.brandTon,
    brandSingularite: opts.brandSingularite,
    pillarsCatalog: opts.pillarsCatalog,
    responses: opts.responses,
    publicationFrequency: opts.publicationFrequency,
  })

  // 2. Call Anthropic + parse
  let rawText: string
  try {
    rawText = await callAnthropic(userPrompt)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'API Anthropic injoignable'
    return { ok: false, reason: `Anthropic : ${message}` }
  }
  const cleaned = extractJsonFromText(rawText)
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('[wizard-gen] invalid JSON, raw:', rawText.slice(0, 500))
    return {
      ok: false,
      reason: "Le conseiller a renvoyé une réponse mal formée. Réessaie dans quelques secondes.",
    }
  }

  let validated: WizardGeneratedPlan
  try {
    validated = validatePlan(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'structure invalide'
    console.error('[wizard-gen] schema validation failed:', message)
    return {
      ok: false,
      reason: `Le plan généré ne respecte pas le format attendu (${message}).`,
    }
  }

  // 3. Determine période
  const period = opts.responses['0']
  if (!period) {
    return { ok: false, reason: 'Période wizard manquante.' }
  }

  // 4. Crée le programme
  const adminAny = opts.admin as unknown as SupabaseClient
  const { data: progRow, error: progErr } = await adminAny
    .from('programmes')
    .insert({
      brand_id: opts.brandId,
      tenant_id: opts.tenantId,
      periode: 'mois',
      arc_narratif: { semaines: [{ theme: validated.arc_narratif, posts: [] }] },
      context_generation: {
        source: 'wizard-A1',
        sessionId: opts.sessionId,
        wizardResponses: opts.responses,
      },
      status: 'active',
      date_debut: period.period_start,
      date_fin: period.period_end,
    })
    .select('id')
    .single()
  if (progErr || !progRow) {
    return { ok: false, reason: progErr?.message ?? 'Création programme échouée' }
  }
  const programmeId = (progRow as { id: string }).id

  // 5. Insère les posts
  const postsToInsert = validated.plan.map((p) => ({
    programme_id: programmeId,
    tenant_id: opts.tenantId,
    brand_id: opts.brandId,
    pilier_nom: p.pilier,
    jour: jourFromDate(p.date),
    date_prevue: p.date,
    heure_prevue: '09:00:00',
    titre: p.objectif.slice(0, 60),
    angle: p.description,
    type_contenu: STRUCTURE_TO_TYPE_CONTENU[p.structure_type] ?? FORMAT_TO_TYPE_CONTENU[p.format],
    statut: 'planifie',
    format: p.format,
    structure_type: p.structure_type,
    objectif_editorial: p.objectif,
  }))
  const { error: postsErr } = await adminAny.from('posts').insert(postsToInsert)
  if (postsErr) {
    return { ok: false, reason: `Insertion posts : ${postsErr.message}` }
  }

  return { ok: true, programmeId }
}
