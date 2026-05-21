// Sprint 37.C (Chantier 5) — /programme/retombees.
//
// Sous-section de /programme dédiée aux retombées du programme actuel.
// Doctrine : les chiffres existent à découvrir, pas à imposer. Pas de
// graphiques V1. Pas de courbes, juste les valeurs actuelles + retombées
// qualitatives par post.
//
// Vocabulaire OBLIGATOIRE : Retombées / Indicateurs éditoriaux / Chiffres.
// JAMAIS : stats / analytics / dashboard / performance / KPI / métriques.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RetombeesQualitativesList } from '@/components/retombees/RetombeesQualitativesList'
import { RetombeesQuantitativesGrid } from '@/components/retombees/RetombeesQuantitativesGrid'
import { ProgrammeSplitShell } from '@/components/programme/ProgrammeSplitShell'
import { AppMetricsSection } from '@/components/retombees/AppMetricsSection'

export const dynamic = 'force-dynamic'

type ProgrammeRow = {
  id: string
  date_debut: string | null
  date_fin: string | null
}

type PostRetombee = {
  id: string
  titre: string | null
  date_prevue: string | null
  retombees: string | null
  statut: string | null
}

type MetricRow = {
  metric_type: string
  value: number
  recorded_at: string
}

export default async function RetombeesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()
  const tenantId =
    (rawProfile as { tenant_id?: string | null } | null)?.tenant_id ?? null
  if (!tenantId) redirect('/onboarding/analyse-marque')

  // Programme actif courant (status='active'). Si aucun, on affiche une
  // empty state douce (pas de redirect).
  const { data: rawProgramme } = await supabase
    .from('programmes')
    .select('id, date_debut, date_fin')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const programme = (rawProgramme as ProgrammeRow | null) ?? null

  // Posts du programme (publiés + en draft) avec retombées.
  let posts: PostRetombee[] = []
  if (programme) {
    const { data: rawPosts } = await supabase
      .from('posts')
      .select('id, titre, date_prevue, retombees, statut')
      .eq('programme_id', programme.id)
      .order('date_prevue', { ascending: true })
    posts = (rawPosts as PostRetombee[] | null) ?? []
  }

  // Indicateurs éditoriaux : dernière valeur connue par metric_type.
  const { data: rawMetrics } = await supabase
    .from('brand_metrics')
    .select('metric_type, value, recorded_at')
    .order('recorded_at', { ascending: false })
  const allMetrics = (rawMetrics as MetricRow[] | null) ?? []
  const latestByType = new Map<string, MetricRow>()
  for (const m of allMetrics) {
    if (!latestByType.has(m.metric_type)) latestByType.set(m.metric_type, m)
  }

  // Sprint 37.E (F52) — Compteurs app pour la section "Chiffres Creative Fair".
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const monthStartIso = monthStart.toISOString()

  const { count: plansCount } = await supabase
    .from('programmes')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', monthStartIso)
  const { count: postsCount } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', monthStartIso)
  const { count: conversationsCount } = await supabase
    .from('conseiller_conversations')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', monthStartIso)
  const { count: libraryDocsCount } = await supabase
    .from('library_documents')
    .select('id', { count: 'exact', head: true })

  const appMetrics = {
    plansCount: plansCount ?? 0,
    postsCount: postsCount ?? 0,
    conversationsCount: conversationsCount ?? 0,
    libraryDocsCount: libraryDocsCount ?? 0,
  }

  return (
    <ProgrammeSplitShell activeItem="retombees">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h2
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.015em',
              color: 'var(--color-label)',
              margin: 0,
            }}
          >
            Retombées du programme actuel
          </h2>
          {programme?.date_debut && programme?.date_fin ? (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-secondary-label)' }}>
              Du {formatFr(programme.date_debut)} au {formatFr(programme.date_fin)}
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-secondary-label)' }}>
              Pas de programme actif. Crée un programme pour suivre tes retombées.
            </p>
          )}
        </header>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionHeader>Retombées qualitatives</SectionHeader>
          <RetombeesQualitativesList posts={posts} />
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionHeader>Indicateurs éditoriaux</SectionHeader>
          <RetombeesQuantitativesGrid latestByType={Object.fromEntries(latestByType)} />
        </section>

        {/* Sprint 37.E (F52) — Chiffres app. */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AppMetricsSection metrics={appMetrics} />
        </section>
      </div>
    </ProgrammeSplitShell>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: 'var(--font-system)',
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'var(--color-tertiary-label)',
        margin: '0 0 4px',
      }}
    >
      {children}
    </h2>
  )
}

function formatFr(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  const mois = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ]
  return `${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`
}
