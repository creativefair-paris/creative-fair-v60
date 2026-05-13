// Sprint 37 (Lot 2) — Types partagés conseiller en situation.
//
// Doctrine canonique : docs/sprint-37/09-modele-conseiller-en-situation.md
// §5 (scénarios), §9 (machine à états), §10 (vocabulaire).

// ── Scénarios doctrinaux (doc 09 §5) ─────────────────────────────────────
// 13 scénarios V1. Le type est une union literale → autocomplete + safety
// dans les sous-prompts côté Lot 6.
export type ScenarioType =
  | 'A1' // Création initiale du plan (CTA primaire /programme)
  | 'A2' // Régénération de plan (bannière auto /programme)
  | 'A7' // Bilan fin de mois/trimestre (CTA secondaire /programme)
  | 'B2' // Panne sèche (TaskRow /aujourd-hui)
  | 'B4' // Panique du week-end (/aujourd-hui vendredi 17h+)
  | 'B5' // Modération quotidienne (interface modération)
  | 'C3a' // Bad buzz / mention presse négative (/outils/conseiller libre)
  | 'C3b' // Imprévu opérationnel (TaskRow /aujourd-hui)
  | 'D6' // Et si on faisait... (/outils/conseiller libre)
  | 'D8' // Opportunité business (/outils/conseiller libre)
  | 'D9' // Opportunité visibilité (/outils/conseiller libre)
  | 'E1' // Réunion lundi matin (CTA secondaire /programme)
  | 'E-divers' // Question ouverte (/outils/conseiller libre)

// ── Machine à états (doc 09 §9) ──────────────────────────────────────────
// Cycle nominal : IDLE → CONTEXT_LOAD → THINKING_1 → TURN_1 → THINKING_2 →
// TURN_2 → THINKING_3 → DELIVERED → CONSUMED.
// États dégradés : PAUSED, ABANDONED, FORCED_DELIVERY, ERROR_FALLBACK,
//                  CRISIS_DEGRADED, ERROR_TIMEOUT, REOPENED.
export type ConseillerState =
  | 'IDLE'
  | 'CONTEXT_LOAD'
  | 'THINKING_1'
  | 'TURN_1'
  | 'THINKING_2'
  | 'TURN_2'
  | 'THINKING_3'
  | 'DELIVERED'
  | 'CONSUMED'
  | 'PAUSED'
  | 'ABANDONED'
  | 'FORCED_DELIVERY'
  | 'ERROR_FALLBACK'
  | 'CRISIS_DEGRADED'
  | 'ERROR_TIMEOUT'
  | 'REOPENED'

export function isThinking(state: ConseillerState): boolean {
  return state === 'THINKING_1' || state === 'THINKING_2' || state === 'THINKING_3'
}

export function isTurn(state: ConseillerState): boolean {
  return state === 'TURN_1' || state === 'TURN_2'
}

export function isTerminal(state: ConseillerState): boolean {
  return (
    state === 'CONSUMED' ||
    state === 'ABANDONED' ||
    state === 'ERROR_FALLBACK' ||
    state === 'FORCED_DELIVERY'
  )
}

// ── Messages conversationnels ────────────────────────────────────────────
// Format aligné sur ce qu'attend l'API Anthropic mais avec un rôle
// 'conseiller' explicite (plutôt qu'assistant') pour rester lisible côté
// stockage + côté UI.
export type ConversationRole = 'user' | 'conseiller'

export type ConversationMessage = {
  role: ConversationRole
  content: string
  created_at: string // ISO timestamp
}

// ── Contexte préchargé à l'ouverture de la sheet ────────────────────────
// Schéma libre V1 — dépend du scenario_type. Sera figé Sprint 38 si
// besoin.
export type ConseillerContext = Record<string, unknown> & {
  // Pour A1 (création plan) — période choisie par le pilote.
  period_start?: string // YYYY-MM-DD
  period_end?: string // YYYY-MM-DD
  // Pour B2 / C3b (TaskRow) — post concerné.
  post_id?: string
  // Pour B5 (modération) — message reçu.
  message_text?: string
  message_author?: string
  // Pour C3a (bad buzz) — texte libre + flag mode dégradé (mockable V1).
  buzz_text?: string
  buzz_mentions_count?: number
}

// ── Conversation complète (row DB) ───────────────────────────────────────
export type ConseillerConversation = {
  id: string
  tenant_id: string
  user_id: string
  scenario_type: ScenarioType
  context: ConseillerContext | null
  state: ConseillerState
  turn_count: number
  user_addresses_formally: boolean
  messages: ConversationMessage[]
  delivered_payload: unknown | null
  created_at: string
  updated_at: string
  consumed_at: string | null
}

// ── Heuristique vouvoiement (décision technique #12) ─────────────────────
// Regex sur le 1er message pilote. Si match → bascule prompt système en
// vouvoiement pour la session entière.
const FORMAL_PRONOUN_REGEX = /\b(vous|votre|vos)\b/i

export function detectsFormalAddress(firstUserMessage: string): boolean {
  return FORMAL_PRONOUN_REGEX.test(firstUserMessage)
}

// ── Plafond doctrinal des tours (doc 09 §8) ──────────────────────────────
// 3 tours max — au 4e, bascule FORCED_DELIVERY côté serveur.
export const MAX_TURNS = 3

// ── Mode dégradé bad buzz (décision Apple #53) ───────────────────────────
// 5+ nouvelles mentions en 5 minutes → CRISIS_DEGRADED.
export const CRISIS_DEGRADED_MENTIONS_THRESHOLD = 5
export const CRISIS_DEGRADED_WINDOW_MINUTES = 5
