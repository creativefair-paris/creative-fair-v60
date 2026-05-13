// Sprint 37 (Lot 6) — Server action runConseillerTurn.
//
// Charge le contexte conversation, sélectionne le sub-prompt scénario,
// appelle Anthropic Opus 4.7, persiste, retourne le résultat.
//
// V1 non-streaming côté client : on attend la complétion Anthropic,
// puis on retourne le payload final. Le client-side StreamingReasoning
// (Lot 2) simule visuellement le streaming via les reasoning steps.
// Sprint 38+ pourra basculer en SSE / async iterators pour stream réel.
//
// Décision technique #6 — server actions partout (pas d'API routes).
// Décision technique #7 — quotas Anthropic V1 = unlimited + monitoring
// uniquement (pas de gate côté quota V1).

'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import { buildConseillerSystemPrompt } from '@/lib/conseiller/system-prompt'
import { getScenarioSubPrompt } from '@/lib/conseiller/scenarios'
import {
  detectsFormalAddress,
  MAX_TURNS,
  CRISIS_DEGRADED_MENTIONS_THRESHOLD,
  type ConseillerContext,
  type ConseillerState,
  type ConversationMessage,
  type ScenarioType,
} from '@/lib/conseiller/types'
import type { PilotRole } from '@/lib/conseiller/onboarding-types'
import type { ReasoningStep } from '@/components/conseiller/StreamingReasoning'

// ── Input / output types ──────────────────────────────────────────────────

export type RunConseillerInput = {
  conversationId: string | null
  scenarioType: ScenarioType
  context: ConseillerContext | null
  message: string | null
  userAddressesFormally: boolean
  history: ReadonlyArray<ConversationMessage>
}

export type RunConseillerOutput = {
  conversationId: string
  result: {
    state: ConseillerState
    reasoningSteps: ReadonlyArray<ReasoningStep>
    message: string
    choices?: ReadonlyArray<{ id: string; label: string }>
    delivered_payload?: unknown
  }
}

// ── Anthropic client ──────────────────────────────────────────────────────

function getAnthropicClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  return new Anthropic({ apiKey: key })
}

// ── Brand context (chargé tenant-side, RLS appliquée) ─────────────────────

async function loadBrandContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenantId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('brands')
    .select('name, secteur, ton, singularite, piliers_narratifs')
    .eq('tenant_id', tenantId)
    .maybeSingle()
  if (error || !data) return null
  const brand = data as {
    name: string | null
    secteur: string | null
    ton: string | null
    singularite: string | null
    piliers_narratifs: unknown
  }
  const piliers = Array.isArray(brand.piliers_narratifs)
    ? (brand.piliers_narratifs as Array<{ nom?: string; description?: string }>)
    : []
  const pilierLines = piliers
    .filter((p) => typeof p.nom === 'string')
    .map((p) => `- ${p.nom}${p.description ? ` (${p.description})` : ''}`)
    .join('\n')
  const parts: string[] = []
  if (brand.name) parts.push(`Marque : ${brand.name}`)
  if (brand.secteur) parts.push(`Secteur : ${brand.secteur}`)
  if (brand.ton) parts.push(`Ton : ${brand.ton}`)
  if (brand.singularite) parts.push(`Singularité : ${brand.singularite}`)
  if (pilierLines) parts.push(`Piliers narratifs :\n${pilierLines}`)
  return parts.length > 0 ? parts.join('\n') : null
}

// ── Conversation row helpers ──────────────────────────────────────────────

type ConversationRow = {
  id: string
  tenant_id: string
  user_id: string
  scenario_type: string
  context: unknown
  state: string
  turn_count: number
  user_addresses_formally: boolean
  messages: unknown
}

async function loadOrCreateConversation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  admin: ReturnType<typeof createAdmin>,
  userId: string,
  tenantId: string,
  input: RunConseillerInput,
): Promise<ConversationRow> {
  if (input.conversationId) {
    const { data } = await supabase
      .from('conseiller_conversations')
      .select('id, tenant_id, user_id, scenario_type, context, state, turn_count, user_addresses_formally, messages')
      .eq('id', input.conversationId)
      .maybeSingle()
    if (data) return data as ConversationRow
  }
  // Création via admin (bypass RLS — on a déjà validé l'auth + tenant
  // côté server action).
  const adminConv = admin as unknown as {
    from: (t: 'conseiller_conversations') => {
      insert: (row: Record<string, unknown>) => {
        select: (cols: string) => {
          single: () => Promise<{
            data: ConversationRow | null
            error: { message: string } | null
          }>
        }
      }
    }
  }
  const { data, error } = await adminConv
    .from('conseiller_conversations')
    .insert({
      tenant_id: tenantId,
      user_id: userId,
      scenario_type: input.scenarioType,
      context: input.context,
      state: 'CONTEXT_LOAD',
      turn_count: 0,
      user_addresses_formally: input.userAddressesFormally,
      messages: [],
    })
    .select(
      'id, tenant_id, user_id, scenario_type, context, state, turn_count, user_addresses_formally, messages',
    )
    .single()
  if (error || !data) {
    throw new Error(
      `conseiller_conversations insert failed: ${error?.message ?? 'no row'}`,
    )
  }
  return data
}

async function persistTurn(
  admin: ReturnType<typeof createAdmin>,
  conversationId: string,
  messages: ReadonlyArray<ConversationMessage>,
  turnCount: number,
  state: ConseillerState,
  userAddressesFormally: boolean,
  deliveredPayload: unknown | null,
): Promise<void> {
  const adminConv = admin as unknown as {
    from: (t: 'conseiller_conversations') => {
      update: (row: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{
          error: { message: string } | null
        }>
      }
    }
  }
  const update: Record<string, unknown> = {
    messages,
    turn_count: turnCount,
    state,
    user_addresses_formally: userAddressesFormally,
  }
  if (deliveredPayload !== null) update.delivered_payload = deliveredPayload
  if (state === 'CONSUMED') update.consumed_at = new Date().toISOString()
  const { error } = await adminConv
    .from('conseiller_conversations')
    .update(update)
    .eq('id', conversationId)
  if (error) {
    console.warn(`[runConseillerTurn] persist failed: ${error.message}`)
  }
}

// ── Détection mode dégradé CRISIS_DEGRADED ────────────────────────────────

function isCrisisDegraded(input: RunConseillerInput): boolean {
  if (input.scenarioType !== 'C3a') return false
  const ctx = input.context
  if (!ctx) return false
  const count =
    typeof ctx.buzz_mentions_count === 'number' ? ctx.buzz_mentions_count : 0
  return count >= CRISIS_DEGRADED_MENTIONS_THRESHOLD
}

// ── Reasoning steps stub (V1 non-streamé) ─────────────────────────────────

function defaultReasoningSteps(scenario: ScenarioType): ReadonlyArray<ReasoningStep> {
  if (scenario === 'A1' || scenario === 'A2') {
    return [
      { inProgress: 'Je lis ton brand book', done: 'Brand book chargé.' },
      {
        inProgress: 'Je consulte les ancres business sur la période',
        done: 'Ancres business identifiées.',
      },
      { inProgress: 'Je construis ta proposition' },
    ]
  }
  if (scenario === 'C3a') {
    return [
      { inProgress: 'Je qualifie la situation', done: "Situation qualifiée." },
      {
        inProgress: 'Je consulte la grille de gravité',
        done: 'Grille appliquée.',
      },
      { inProgress: 'Je prépare une réponse mesurée' },
    ]
  }
  if (scenario === 'B5') {
    return [
      { inProgress: 'Je regarde qui te contacte', done: 'Compte identifié.' },
      { inProgress: 'Je calibre 3 versions sur ton ton de marque' },
    ]
  }
  return [
    {
      inProgress: 'Je consulte ton contexte marque',
      done: 'Contexte marque chargé.',
    },
    { inProgress: 'Je prépare ma réponse' },
  ]
}

// ── Fallback texte si pas d'API key ───────────────────────────────────────

function fallbackText(
  scenario: ScenarioType,
  userMessage: string | null,
  brandContext: string | null,
): string {
  const brand =
    brandContext && brandContext.includes('Marque :')
      ? brandContext.split('\n')[0]?.replace('Marque : ', '') ?? 'ta marque'
      : 'ta marque'
  if (userMessage === null) {
    return `Je charge le contexte de ${brand} et le scénario ${scenario}. La clé Anthropic n'est pas configurée localement, je travaille en mode hors-ligne. Dis-moi ce que tu veux préciser.`
  }
  return `(Mode hors-ligne — pas de clé Anthropic configurée) J'ai bien lu : "${userMessage}". Sur le scénario ${scenario}, je te propose de continuer la conversation une fois la clé branchée. En attendant, le squelette du flux (sheet, persistence, machine à états) est opérationnel.`
}

// ── Action principale ─────────────────────────────────────────────────────

export async function runConseillerTurn(
  input: RunConseillerInput,
): Promise<RunConseillerOutput> {
  // 1. Auth + tenant
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id, pilot_role')
    .eq('id', user.id)
    .maybeSingle()
  const profile = rawProfile as {
    tenant_id?: string | null
    pilot_role?: PilotRole | null
  } | null
  const tenantId = profile?.tenant_id ?? null
  if (!tenantId) throw new Error('Tenant non provisionné')
  const pilotRole = profile?.pilot_role ?? null

  // 2. Conversation row
  const admin = createAdmin()
  const conv = await loadOrCreateConversation(
    supabase,
    admin,
    user.id,
    tenantId,
    input,
  )

  // 3. Détection vouvoiement (si pas encore basculée et 1er message pilote).
  let addressesFormally = conv.user_addresses_formally
  if (
    !addressesFormally &&
    input.message !== null &&
    !conv.messages ||
    (Array.isArray(conv.messages) && conv.messages.length === 0)
  ) {
    if (input.message && detectsFormalAddress(input.message)) {
      addressesFormally = true
    }
  }

  // 4. Mode dégradé crise ?
  const crisisDegraded = isCrisisDegraded(input)

  // 5. Compteur de tours (plafond doctrinal 3 — doc 09 §8).
  const newTurnCount = conv.turn_count + 1
  const willForceDelivery = newTurnCount > MAX_TURNS

  // 6. Brand context
  const brandContext = await loadBrandContext(supabase, tenantId)

  // 7. Construit le system prompt complet
  const systemPrompt = buildConseillerSystemPrompt({
    pilotRole,
    addressForm: addressesFormally ? 'vouvoiement' : 'tutoiement',
    scenarioSubPrompt: getScenarioSubPrompt(input.scenarioType),
    ...(brandContext ? { brandContext } : {}),
  })

  // 8. Appel Anthropic Opus 4.7 (ou fallback hors-ligne)
  const anthropic = getAnthropicClient()
  let assistantReply: string

  // Reconstruit l'historique pour Anthropic (rôles user/assistant).
  const apiMessages: Array<{ role: 'user' | 'assistant'; content: string }> = []
  for (const m of input.history) {
    apiMessages.push({
      role: m.role === 'conseiller' ? 'assistant' : 'user',
      content: m.content,
    })
  }
  if (input.message !== null) {
    apiMessages.push({ role: 'user', content: input.message })
  } else if (apiMessages.length === 0) {
    // 1er appel sans message utilisateur : on amorce avec une consigne
    // standard pour que le conseiller produise le tour 1.
    apiMessages.push({
      role: 'user',
      content:
        '[Ouverture de session. Le pilote vient de cliquer sur la voie d\'accès. Charge le contexte et propose le Tour 1 selon le scénario.]',
    })
  }

  if (anthropic) {
    try {
      const completion = await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        system: [
          {
            type: 'text',
            text: systemPrompt,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: apiMessages,
      })
      const content = completion.content[0]
      if (content && content.type === 'text') {
        assistantReply = content.text
      } else {
        assistantReply = fallbackText(input.scenarioType, input.message, brandContext)
      }
    } catch (err) {
      console.warn('[runConseillerTurn] Anthropic call failed:', err)
      assistantReply = fallbackText(input.scenarioType, input.message, brandContext)
    }
  } else {
    assistantReply = fallbackText(input.scenarioType, input.message, brandContext)
  }

  // 9. Détermine l'état final
  let finalState: ConseillerState
  if (crisisDegraded) {
    finalState = 'CRISIS_DEGRADED'
  } else if (willForceDelivery) {
    finalState = 'FORCED_DELIVERY'
  } else if (newTurnCount >= MAX_TURNS) {
    finalState = 'DELIVERED'
  } else if (newTurnCount === 1) {
    finalState = 'TURN_1'
  } else if (newTurnCount === 2) {
    finalState = 'TURN_2'
  } else {
    finalState = 'DELIVERED'
  }

  // 10. Update history + persist
  const existingMessages = Array.isArray(conv.messages)
    ? (conv.messages as ConversationMessage[])
    : []
  const newMessages: ConversationMessage[] = [...existingMessages]
  if (input.message !== null) {
    newMessages.push({
      role: 'user',
      content: input.message,
      created_at: new Date().toISOString(),
    })
  }
  newMessages.push({
    role: 'conseiller',
    content: assistantReply,
    created_at: new Date().toISOString(),
  })

  await persistTurn(
    admin,
    conv.id,
    newMessages,
    newTurnCount,
    finalState,
    addressesFormally,
    null,
  )

  return {
    conversationId: conv.id,
    result: {
      state: finalState,
      reasoningSteps: defaultReasoningSteps(input.scenarioType),
      message: assistantReply,
    },
  }
}
