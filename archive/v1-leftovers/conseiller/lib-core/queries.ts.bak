// Sprint 37 (Lot 3) — Requêtes Supabase conseiller (lecture).
//
// Pas de mutation ici. Les server actions de mutation (création
// conversation, ajout message, livraison) seront en Lot 6.

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ConseillerContext,
  ConseillerConversation,
  ConversationMessage,
  ScenarioType,
} from './types'

// Row brut Supabase. Les colonnes JSONB sont typées en `unknown` ici, on
// affine après lecture.
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

function castContext(value: unknown): ConseillerContext | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'object') return null
  return value as ConseillerContext
}

function castMessages(value: unknown): ConversationMessage[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (m): m is ConversationMessage =>
      m !== null &&
      typeof m === 'object' &&
      'role' in m &&
      'content' in m &&
      'created_at' in m,
  )
}

function fromRow(row: RawConversation): ConseillerConversation {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    user_id: row.user_id,
    scenario_type: row.scenario_type as ScenarioType,
    context: castContext(row.context),
    state: row.state as ConseillerConversation['state'],
    turn_count: row.turn_count,
    user_addresses_formally: row.user_addresses_formally,
    messages: castMessages(row.messages),
    delivered_payload: row.delivered_payload ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    consumed_at: row.consumed_at,
  }
}

// Liste des conversations du tenant courant (RLS appliquée).
// Triées par created_at DESC. Limite V1 = 100 (assez pour les premiers
// clients ; pagination future si besoin).
export async function listConversations(
  supabase: SupabaseClient,
  limit = 100,
): Promise<ConseillerConversation[]> {
  const { data, error } = await supabase
    .from('conseiller_conversations')
    .select(
      'id, tenant_id, user_id, scenario_type, context, state, turn_count, user_addresses_formally, messages, delivered_payload, created_at, updated_at, consumed_at',
    )
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) {
    console.warn('[conseiller/queries] listConversations failed:', error.message)
    return []
  }
  return ((data ?? []) as RawConversation[]).map(fromRow)
}

export async function getConversation(
  supabase: SupabaseClient,
  id: string,
): Promise<ConseillerConversation | null> {
  const { data, error } = await supabase
    .from('conseiller_conversations')
    .select(
      'id, tenant_id, user_id, scenario_type, context, state, turn_count, user_addresses_formally, messages, delivered_payload, created_at, updated_at, consumed_at',
    )
    .eq('id', id)
    .maybeSingle()
  if (error) {
    console.warn('[conseiller/queries] getConversation failed:', error.message)
    return null
  }
  if (!data) return null
  return fromRow(data as RawConversation)
}

// ── Helpers d'affichage côté page historique ─────────────────────────────

// Titre dérivé du contexte ou du scénario (pattern macOS Mail / Notes /
// Things 3). Doc 09 §8 ("Post jeudi 14h", "Bilan trim T2", "Salon du Dessin
// mars").
export function deriveTitleFromConversation(conv: ConseillerConversation): string {
  const ctx = conv.context
  if (ctx) {
    if (typeof ctx.period_start === 'string' && typeof ctx.period_end === 'string') {
      return `Plan ${ctx.period_start} → ${ctx.period_end}`
    }
    if (typeof ctx.post_id === 'string') {
      return `Sur post ${ctx.post_id.slice(0, 8)}`
    }
    if (typeof ctx.buzz_text === 'string' && ctx.buzz_text.length > 0) {
      const head = ctx.buzz_text.split(/\s+/).slice(0, 6).join(' ')
      return `Bad buzz · ${head}…`
    }
    if (typeof ctx.message_text === 'string' && ctx.message_text.length > 0) {
      const head = ctx.message_text.split(/\s+/).slice(0, 6).join(' ')
      return `DM · ${head}…`
    }
  }
  // Fallback : libellé scénario.
  return scenarioLabel(conv.scenario_type)
}

export function scenarioLabel(type: ScenarioType): string {
  const labels: Record<ScenarioType, string> = {
    A1: 'Création de plan',
    A2: 'Régénération de plan',
    A7: 'Bilan',
    B2: 'Affiner un post',
    B4: 'Préparer le week-end',
    B5: 'Réponse à un message',
    C3a: 'Bad buzz',
    C3b: 'Imprévu opérationnel',
    D6: 'Et si on faisait...',
    D8: 'Opportunité business',
    D9: 'Opportunité visibilité',
    E1: 'Préparation réunion',
    'E-divers': 'Question ouverte',
    A8: 'Renseigner mes chiffres',
  }
  return labels[type]
}

// Groupement par date pour la sidebar (pattern Things 3).
export type ConversationGroup = {
  key: string
  label: string
  items: ConseillerConversation[]
}

export function groupConversationsByDate(
  conversations: ReadonlyArray<ConseillerConversation>,
  now: Date = new Date(),
): ConversationGroup[] {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const today = startOfDay(now).getTime()
  const yesterday = today - 24 * 60 * 60 * 1000
  const week = today - 7 * 24 * 60 * 60 * 1000
  const month = today - 30 * 24 * 60 * 60 * 1000

  const groups: Record<string, ConseillerConversation[]> = {
    today: [],
    yesterday: [],
    week: [],
    month: [],
    older: [],
  }

  for (const conv of conversations) {
    const created = new Date(conv.created_at).getTime()
    if (created >= today) groups.today!.push(conv)
    else if (created >= yesterday) groups.yesterday!.push(conv)
    else if (created >= week) groups.week!.push(conv)
    else if (created >= month) groups.month!.push(conv)
    else groups.older!.push(conv)
  }

  const labels: Record<string, string> = {
    today: "Aujourd'hui",
    yesterday: 'Hier',
    week: 'Cette semaine',
    month: 'Ce mois',
    older: 'Plus ancien',
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([key, items]) => ({ key, label: labels[key] ?? key, items }))
}
