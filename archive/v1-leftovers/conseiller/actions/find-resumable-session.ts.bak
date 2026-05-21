// Sprint 37.B (F14) — Server action de matching session reprenable.
//
// 3 règles de priorité (cf. brief Sprint 37.B F14) :
//   1. Session PAUSED ou en cours (THINKING_n, TURN_n) sur même
//      scenario + même contexte (matchesContext).
//   2. Session CONSUMED sur même scenario + même contexte dans
//      les 24 dernières heures.
//   3. Sinon, pas de reprise.

'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  ConseillerContext,
  ConseillerConversation,
  ConseillerState,
  ScenarioType,
  ConversationMessage,
} from '@/lib/conseiller/types'

type RawConversation = {
  id: string
  tenant_id: string
  user_id: string
  scenario_type: string
  context: unknown
  state: string
  turn_count: number
  user_addresses_formally: boolean
  messages: unknown
  delivered_payload: unknown
  created_at: string
  updated_at: string
  consumed_at: string | null
}

function fromRow(row: RawConversation): ConseillerConversation {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    user_id: row.user_id,
    scenario_type: row.scenario_type as ScenarioType,
    context:
      row.context && typeof row.context === 'object'
        ? (row.context as ConseillerContext)
        : null,
    state: row.state as ConseillerState,
    turn_count: row.turn_count,
    user_addresses_formally: row.user_addresses_formally,
    messages: Array.isArray(row.messages)
      ? (row.messages as ConversationMessage[])
      : [],
    delivered_payload: row.delivered_payload ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    consumed_at: row.consumed_at,
  }
}

function matchesContext(
  stored: ConseillerContext | null,
  requested: ConseillerContext | null | undefined,
): boolean {
  if (!requested) return true
  if (requested.post_id && stored?.post_id !== requested.post_id) return false
  // programme_id n'est pas typé dans ConseillerContext, on lit en dynamique
  const reqAny = requested as Record<string, unknown>
  const stoAny = (stored ?? {}) as Record<string, unknown>
  if (
    typeof reqAny['programme_id'] === 'string' &&
    stoAny['programme_id'] !== reqAny['programme_id']
  ) {
    return false
  }
  if (
    typeof requested.period_start === 'string' &&
    stored?.period_start !== requested.period_start
  ) {
    return false
  }
  return true
}

export type ResumableMatch = {
  session: ConseillerConversation
  matchType: 'paused' | 'recent_consumed'
}

export type FindResumableInput = {
  scenarioType: ScenarioType
  context: ConseillerContext | null
}

export async function findResumableSession(
  input: FindResumableInput,
): Promise<ResumableMatch | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Règle 1 : session active ou en pause sur même scenario.
  const inProgressStates: ConseillerState[] = [
    'PAUSED',
    'THINKING_1',
    'TURN_1',
    'THINKING_2',
    'TURN_2',
    'THINKING_3',
  ]
  const { data: inProgress } = await supabase
    .from('conseiller_conversations')
    .select(
      'id, tenant_id, user_id, scenario_type, context, state, turn_count, user_addresses_formally, messages, delivered_payload, created_at, updated_at, consumed_at',
    )
    .eq('scenario_type', input.scenarioType)
    .in('state', inProgressStates as unknown as string[])
    .order('updated_at', { ascending: false })
    .limit(5)
  const inProgressList = ((inProgress ?? []) as RawConversation[]).map(fromRow)
  const inProgressMatch = inProgressList.find((s) =>
    matchesContext(s.context, input.context),
  )
  if (inProgressMatch) {
    return { session: inProgressMatch, matchType: 'paused' }
  }

  // Règle 2 : session CONSUMED dans les 24 dernières heures.
  const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: recent } = await supabase
    .from('conseiller_conversations')
    .select(
      'id, tenant_id, user_id, scenario_type, context, state, turn_count, user_addresses_formally, messages, delivered_payload, created_at, updated_at, consumed_at',
    )
    .eq('scenario_type', input.scenarioType)
    .eq('state', 'CONSUMED')
    .gte('consumed_at', sinceIso)
    .order('consumed_at', { ascending: false })
    .limit(5)
  const recentList = ((recent ?? []) as RawConversation[]).map(fromRow)
  const recentMatch = recentList.find((s) =>
    matchesContext(s.context, input.context),
  )
  if (recentMatch) {
    return { session: recentMatch, matchType: 'recent_consumed' }
  }

  // Règle 3 : pas de reprise.
  return null
}
