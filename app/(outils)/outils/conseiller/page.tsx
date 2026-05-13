// Sprint 35 → 37 Lot 3 → Lot 5 — Page /outils/conseiller en mode
// historique avec auto-ouverture de sheet depuis l'URL.
//
// Doctrine doc 09 §8 (décision Apple #49) : page = historique uniquement.
// Mais les voies d'accès 5-7 (TaskRow /aujourd-hui, "Préparer le
// week-end", DM modération) sont des Server Components qui ne peuvent
// pas ouvrir une sheet inline → elles routent vers /outils/conseiller
// avec des paramètres URL. Cette page les lit et auto-ouvre la
// ConseillerSheet correspondante via initialSheet.
//
// Paramètres URL acceptés :
//   ?scenario=B2&post_id=xxx
//   ?scenario=B4
//   ?scenario=B5&message_text=...&message_author=...
//   ?scenario=C3a (texte libre → l'utilisateur tape dans la sheet)
//   ?scenario=C3b&post_id=xxx
//
// Rétrocompat : ?context=post_<id> (format Sprint 36.H/I) ouvre scénario
// B2 avec post_id extrait du context string.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  ConseillerHistory,
  type InitialSheet,
} from '@/components/conseiller/ConseillerHistory'
import { listConversations } from '@/lib/conseiller/queries'
import type { ConseillerContext, ScenarioType } from '@/lib/conseiller/types'

export const dynamic = 'force-dynamic'

const VALID_SCENARIOS: ReadonlySet<ScenarioType> = new Set<ScenarioType>([
  'A1', 'A2', 'A7', 'B2', 'B4', 'B5', 'C3a', 'C3b', 'D6', 'D8', 'D9', 'E1', 'E-divers',
])

const HEADER_LABELS: Record<ScenarioType, string> = {
  A1: 'Création de plan',
  A2: 'Régénération de plan',
  A7: 'Faire le point',
  B2: 'Affiner ce post',
  B4: 'Préparer le week-end',
  B5: 'Répondre à un message',
  C3a: 'Bad buzz',
  C3b: 'Imprévu sur ce post',
  D6: "Et si on faisait...",
  D8: 'Opportunité business',
  D9: 'Opportunité visibilité',
  E1: 'Préparer ma réunion',
  'E-divers': 'Nouvelle question',
}

type SearchParamsRaw = {
  scenario?: string
  post_id?: string
  message_text?: string
  message_author?: string
  context?: string // rétrocompat 36.H/I
}

function parseInitialSheet(params: SearchParamsRaw): InitialSheet | null {
  // Rétrocompat 36.H/I : ?context=post_<id> → scénario B2.
  if (!params.scenario && params.context && params.context.startsWith('post_')) {
    const postId = params.context.slice('post_'.length)
    return {
      scenarioType: 'B2',
      headerLabel: HEADER_LABELS.B2,
      context: { post_id: postId },
    }
  }

  if (!params.scenario) return null
  const scenario = params.scenario as ScenarioType
  if (!VALID_SCENARIOS.has(scenario)) return null

  const context: ConseillerContext = {}
  if (params.post_id) context.post_id = params.post_id
  if (params.message_text) context.message_text = params.message_text
  if (params.message_author) context.message_author = params.message_author

  return {
    scenarioType: scenario,
    headerLabel: HEADER_LABELS[scenario],
    context,
  }
}

type Props = {
  searchParams?: Promise<SearchParamsRaw>
}

export default async function ConseillerPage({ searchParams }: Props) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const resolved = (await searchParams) ?? {}
  const initialSheet = parseInitialSheet(resolved)

  const conversations = await listConversations(supabase)

  return (
    <main
      className="min-h-screen"
      style={{ position: 'relative', background: 'var(--color-background)' }}
    >
      <div className="bg-halo bg-halo-1" aria-hidden="true" />
      <div className="bg-halo bg-halo-2" aria-hidden="true" />
      <div className="bg-halo bg-halo-3" aria-hidden="true" />
      <div className="bg-halo bg-halo-4" aria-hidden="true" />
      <div className="bg-halo bg-halo-5" aria-hidden="true" />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <PageHeader title="Conseiller" />

        <section
          className="cfs-page-container"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: 'var(--space-12)',
          }}
        >
          <ConseillerHistory conversations={conversations} initialSheet={initialSheet} />
        </section>
      </div>
    </main>
  )
}
