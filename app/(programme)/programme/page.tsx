// Sprint 36.B.3 — Page Programme refondue en Split Brief 40/60.
//
// Server Component. Lit programme + posts + piliers + brand_book.
// Délègue l'orchestration (vue/semaine, sheet détail) au client
// ProgrammeDashboard.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBrandByTenantId } from '@/lib/supabase/brands'
import { Button } from '@/components/ui/Button'
import { WelcomeURLCleaner } from '@/components/programme/WelcomeURLCleaner'
import { ConseillerAccess } from '@/components/programme/ConseillerAccess'
import { PlanPreview } from '@/components/programme/PlanPreview'
import { NewPlanPedagogyOverlay } from '@/components/programme/NewPlanPedagogyOverlay'
import { ProgrammeSplitShell } from '@/components/programme/ProgrammeSplitShell'
import { ProgrammeCalendarView } from '@/components/programme/ProgrammeCalendarView'
import type { PublicationFrequency } from '@/components/programme/PeriodSelectionSheet'
import { checkJalonStatus } from '@/lib/jalons/check-jalons'
import type { BusinessCalendar } from '@/types/business-calendar'
import type { PilierNarratif, PostRow } from '@/types/programme'
import type { BrandBook } from '@/types/ma-marque'

export const dynamic = 'force-dynamic'
// Sprint 37.E (F37) — Server actions déclenchées depuis cette route
// (wizard A1 plan generation) peuvent prendre 30-60s côté Anthropic.
// Le default Next.js (10-30s selon plan) coupe la promesse côté client
// → spinner infini perçu comme bug. On élève à 90s.
export const maxDuration = 90

type BrandRowWithExtras = {
  id: string
  piliers_narratifs?: unknown
  brand_book?: unknown
}

type ProgrammeRow = {
  id: string
  arc_narratif: unknown
  // Sprint 37 Lot 4 : fin du programme pour calcul bannière régénération.
  date_fin?: string | null
  // Sprint 37.F (F48) : début de période pour affichage calendrier.
  date_debut?: string | null
}

type ProgrammePageProps = {
  searchParams?: Promise<{ welcome?: string; action?: string; newPlan?: string }>
}

function asObjet<T>(v: unknown): T | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null
  return v as T
}

export default async function ProgrammePage({ searchParams }: ProgrammePageProps) {
  const resolvedSearch = (await searchParams) ?? {}
  const isWelcome = resolvedSearch.welcome === 'true'
  // Sprint 37 Lot 4 — viens du mini-onboarding du conseiller, on auto-ouvre
  // la PeriodSelectionSheet au mount (côté client via ConseillerAccess).
  const autoOpenCreatePlan = resolvedSearch.action === 'create-plan'
  // Sprint 37.D (F34) — aperçu du plan fraîchement généré depuis le wizard.
  const newPlanId = typeof resolvedSearch.newPlan === 'string' ? resolvedSearch.newPlan : null

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
  const tenantId = (rawProfile as { tenant_id?: string } | null)?.tenant_id ?? null
  if (!tenantId) redirect('/onboarding/analyse-marque')

  const brand = await getBrandByTenantId(supabase, tenantId)
  if (!brand || brand.brand_book_status !== 'complete') {
    redirect('/onboarding/analyse-marque')
  }

  // Récupère piliers + brand_book (palette utilisée pour les chips).
  let piliers: PilierNarratif[] = []
  let brandBook: BrandBook | null = null
  const { data: rawBrandExtras } = await supabase
    .from('brands')
    .select('id, piliers_narratifs, brand_book')
    .eq('id', brand.id)
    .maybeSingle()
  const extras = rawBrandExtras as BrandRowWithExtras | null
  if (extras && Array.isArray(extras.piliers_narratifs)) {
    piliers = extras.piliers_narratifs as PilierNarratif[]
  }
  if (extras) {
    brandBook = asObjet<BrandBook>(extras.brand_book)
  }

  // Programme actif le plus récent
  const { data: rawProgramme } = await supabase
    .from('programmes')
    .select('id, arc_narratif, date_debut, date_fin')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const programme = rawProgramme as ProgrammeRow | null

  // Sprint 37 Lot 4 — récupère publication_frequency du pilote pour l'estim
  // de posts dans la PeriodSelectionSheet.
  const { data: rawProfileFreq } = await supabase
    .from('profiles')
    .select('publication_frequency')
    .eq('id', user.id)
    .maybeSingle()
  const publicationFrequency =
    (rawProfileFreq as { publication_frequency?: PublicationFrequency | null } | null)
      ?.publication_frequency ?? null

  // Sprint 37.C (F26) — vérifie le jalon courant avant d'autoriser le
  // wizard A1. Si la marque n'est pas posée, un dialogue de friction
  // s'ouvre côté client.
  const jalonStatus = await checkJalonStatus(supabase, tenantId)

  // Sprint 37.D (F34) — Charge l'aperçu du plan fraîchement généré.
  type NewPlanPreviewPost = {
    id: string
    date_prevue: string | null
    format: string | null
    structure_type: string | null
    pilier_nom: string | null
    objectif_editorial: string | null
    angle: string | null
    titre: string | null
  }
  type NewPlanRow = {
    date_debut: string | null
    date_fin: string | null
  }
  let newPlanPosts: NewPlanPreviewPost[] = []
  let newPlanRow: NewPlanRow | null = null
  if (newPlanId) {
    const { data: rawPlan } = await supabase
      .from('programmes')
      .select('date_debut, date_fin')
      .eq('id', newPlanId)
      .maybeSingle()
    newPlanRow = (rawPlan as NewPlanRow | null) ?? null
    const { data: rawPosts } = await supabase
      .from('posts')
      .select('id, date_prevue, format, structure_type, pilier_nom, objectif_editorial, angle, titre')
      .eq('programme_id', newPlanId)
      .order('date_prevue', { ascending: true })
    newPlanPosts = (rawPosts as NewPlanPreviewPost[] | null) ?? []
  }

  // Sprint 37.C (F25) — bloc "Compléter mon calendrier business" déplacé
  // vers /aujourd-hui (F24). brandCalendar reste lu ci-dessous pour le
  // wizard A1 (businessAnchorSuggestions).
  const brandCalendar = brand.business_calendar as BusinessCalendar | null
  const now90Plus = new Date()
  now90Plus.setDate(now90Plus.getDate() + 90)

  let posts: PostRow[] = []
  let arcNarratif = ''

  if (programme) {
    const arc = programme.arc_narratif as
      | { semaines?: Array<{ theme?: string }> }
      | null
    arcNarratif = arc?.semaines?.[0]?.theme ?? ''

    const { data: rawPosts } = await supabase
      .from('posts')
      .select(
        // Sprint 37.F (F48) — ajout format/structure_type/objectif_editorial
        // pour la vue Calendrier (Sprint 37.D F34 colonnes posts).
        'id, programme_id, tenant_id, brand_id, pilier_nom, jour, date_prevue, heure_prevue, titre, angle, type_contenu, statut, contenu_genere, created_at, updated_at, format, structure_type, objectif_editorial',
      )
      .eq('programme_id', programme.id)
      .order('date_prevue', { ascending: true })

    if (Array.isArray(rawPosts)) {
      posts = rawPosts as unknown as PostRow[]
    }
  }

  const hasProgramme = programme != null && posts.length > 0

  // Sprint 37.B (F16) — alimente le wizard immersif :
  //   * pillarsCatalog depuis brand.piliers_narratifs
  //   * businessAnchorSuggestions construites à partir de
  //     brand.business_calendar (upcomingLaunches + industryEvents
  //     filtrés sur les 90 prochains jours, label "calendar"). Pas
  //     d'appel Anthropic streaming V1 — Sprint 38 ajoutera les
  //     suggestions externes.
  const piliersForWizard: ReadonlyArray<{ id: string; nom: string }> =
    (piliers ?? []).map((p, i) => ({
      id: `pilier-${i}`,
      nom: (p as { nom?: string }).nom ?? `Pilier ${i + 1}`,
    }))

  const businessAnchorSuggestions: Array<{
    value: string
    source: 'calendar' | 'external' | 'history'
  }> = []
  if (brandCalendar) {
    for (const l of brandCalendar.upcomingLaunches ?? []) {
      if (l.date && new Date(l.date).getTime() <= now90Plus.getTime()) {
        businessAnchorSuggestions.push({
          value: `${l.name} — ${l.date}`,
          source: 'calendar',
        })
      }
    }
    for (const e of brandCalendar.industryEvents ?? []) {
      if (e.date && new Date(e.date).getTime() <= now90Plus.getTime()) {
        businessAnchorSuggestions.push({
          value: `${e.name} — ${e.date}`,
          source: 'calendar',
        })
      }
    }
  }

  // Sprint 37.F (F61) — /programme wrapped dans ProgrammeSplitShell.
  // La vue Calendrier (default activeItem='calendrier') est livrée Sprint 37.F
  // chantier 4 (F48 PlanPreview calendrier + preview + mini chat).
  return (
    <>
      {isWelcome ? <WelcomeURLCleaner /> : null}
      <ProgrammeSplitShell activeItem="calendrier">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Sprint 37.D (F34) — aperçu du plan fraîchement généré quand
              on arrive avec ?newPlan=ID. F48 le remplacera par le calendrier
              interactif dans la vue par défaut. */}
          {newPlanId && newPlanPosts.length > 0 ? (
            <PlanPreview
              posts={newPlanPosts}
              periodStart={newPlanRow?.date_debut}
              periodEnd={newPlanRow?.date_fin}
            />
          ) : null}

          {/* Sprint 37.E (F47+F53) — Pédagogie post-génération en overlay. */}
          {newPlanId ? <NewPlanPedagogyOverlay programmeId={newPlanId} /> : null}

          {/* Sprint 37 Lot 4 — Voies d'accès au conseiller. */}
          <ConseillerAccess
            currentProgrammeEnd={programme?.date_fin ?? null}
            publicationFrequency={publicationFrequency}
            autoOpenCreatePlan={autoOpenCreatePlan}
            pillarsCatalog={piliersForWizard}
            businessAnchorSuggestions={businessAnchorSuggestions}
            marqueComplete={jalonStatus.marque.complete}
          />

          {hasProgramme ? (
            // Sprint 37.F (F48) — Vue Calendrier interactive avec mini chat.
            // Remplace ProgrammeDashboard (l'ancien dashboard reste disponible
            // pour rétro-compat depuis ProgrammeCreateForm — pas utilisé V1).
            <ProgrammeCalendarView
              posts={posts as unknown as Array<{
                id: string
                date_prevue: string | null
                format: string | null
                structure_type: string | null
                pilier_nom: string | null
                objectif_editorial: string | null
                angle: string | null
                titre: string | null
                statut: string | null
              }>}
              programmeDateDebut={programme?.date_debut ?? null}
              programmeDateFin={programme?.date_fin ?? null}
            />
          ) : (
            <section
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-6)',
                gap: 'var(--space-5)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-5)',
                  maxWidth: 560,
                  width: '100%',
                }}
              >
                <h2
                  style={{
                    fontSize: 'var(--text-title-1-size)',
                    fontWeight: 700,
                    letterSpacing: '-0.022em',
                    color: 'var(--color-label)',
                    margin: 0,
                  }}
                >
                  Tu n&apos;as pas encore de plan en cours.
                </h2>
                <p
                  className="text-body"
                  style={{
                    color: 'var(--color-secondary-label)',
                    margin: 0,
                  }}
                >
                  Creative Fair analyse ta marque et structure ton plan éditorial.
                </p>
                <Button
                  disabled
                  aria-disabled="true"
                  title="Génération en préparation"
                >
                  Générer mon programme
                </Button>
              </div>
            </section>
          )}
        </div>
      </ProgrammeSplitShell>
    </>
  )
}
