// Sprint 36.G — Refonte V3 /aujourd-hui sous doctrine "Tranquillité du pilote".
//
// Structure :
//   * Header full-width (date + avatar)
//   * Zone Critique conditionnelle (alerts actives)
//   * Split Brief 40/60 :
//     - Gauche 40% : Bloc 1 Prochaine action · Bloc 2 État programme · Bloc 3 État Ma Marque
//     - Droite 60% : Bloc A Aujourd'hui · Bloc B Cette semaine · Bloc C Suggéré
//
// Pas de compteur gamifié (Pattern A migre vers /mon-programme — sprint séparé).
// Pas de copy "il te reste N gestes". Pas de "5/14 FONDATIONS POSÉES".
// Avatar conservé tel quel (PageHeader.tsx existant).

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { SplitBrief } from '@/components/layouts/SplitBrief'
import { CriticalBanner } from '@/components/today/CriticalBanner'
import { TaskRow } from '@/components/today/TaskRow'
import { BlocCetteSemaine } from '@/components/today/BlocCetteSemaine'
import { AFaireCetteSemaine } from '@/components/today/AFaireCetteSemaine'
import { DemarrerCard, type DemarrerStep } from '@/components/today/DemarrerCard'
import { loadAujourdhuiData } from '@/lib/aujourd-hui/load-data'
import { computeSuggestions } from '@/lib/aujourd-hui/suggestions'
import { mapStatutToState } from '@/lib/types/post'
import { jourCourantFr, nomDuJourFr, semaineRangeFr } from '@/lib/aujourd-hui/dates-fr'
import { startOfWeek, endOfWeek } from '@/lib/calendar/dates'
import { createClient } from '@/lib/supabase/server'
import { checkJalonStatus } from '@/lib/jalons/check-jalons'
import { JalonHero } from '@/components/jalons/JalonHero'
import type { BusinessCalendar } from '@/types/business-calendar'

export const dynamic = 'force-dynamic'

export default async function AujourdhuiPage() {
  const data = await loadAujourdhuiData()
  if (!data.authenticated) redirect('/login')
  if ('redirect' in data && data.redirect) redirect(data.redirect)
  if (!('postsToday' in data)) redirect('/login') // garde TS

  // ── Adaptation contextuelle déterministe (server-side) ─────────────────
  const now = new Date(data.todayISO)
  const dayOfWeek = now.getDay() // 0 dim, 1 lun, ..., 5 ven, 6 sam
  const hour = now.getHours()
  const isMondayMorning = dayOfWeek === 1 && hour < 12
  const isFridayLate = dayOfWeek === 5 && hour >= 16

  // ── Bloc 1 — Prochaine action ──────────────────────────────────────────
  // Premier post non-publié d'aujourd'hui, par ordre heure_prevue ASC.
  const prochain = data.postsToday.find(
    (p) => p.statut !== 'publie' && p.statut !== 'archive',
  )
  const prochainState = prochain ? mapStatutToState(prochain.statut) : null
  const prochainAction =
    prochainState === 'ready' ? 'Voir' : prochainState === 'todo' ? 'Commencer' : 'Reprendre'

  // ── Bloc 3 — Affiché uniquement si fondations < 14 ─────────────────────
  const showMaMarqueBloc = data.questionsAnswered < 14

  // ── Header text (Sprint 36.H Findings 1+2) ─────────────────────────────
  // H1 = "Aujourd'hui" (breadcrumb supprimée — doublon).
  // Sous-titre = "Semaine du 11 au 17 mai" (range dynamique, sans année).
  // Bloc A titre = "Aujourd'hui, 13 mai".
  const weekStart = startOfWeek(now)
  const weekEnd = endOfWeek(now)
  const semaineLabel = semaineRangeFr(weekStart, weekEnd)
  const blocATitre = `Aujourd'hui, ${jourCourantFr(now)}`

  // Sprint 36.I Finding 1 — Fallback narratif si rien aujourd'hui mais
  // un post arrive plus tard cette semaine. data.postsWeek est déjà
  // ordonné par date_prevue ASC, donc [0] = premier post à venir.
  const firstUpcoming = data.postsWeek[0]
  const firstUpcomingJour = firstUpcoming
    ? nomDuJourFr(new Date(`${firstUpcoming.date_prevue}T00:00:00`))
    : null
  const todayEmptyMessage = firstUpcomingJour
    ? `Pas de post aujourd'hui. Ton premier post arrive ${firstUpcomingJour}.`
    : "Rien à préparer aujourd'hui."

  // Sprint 37.A F7 — récupère la fin du programme actif pour le calcul
  // de la suggestion "Préparer ton prochain plan" (<14j de la fin).
  const supabaseSuggestions = await createClient()

  // Sprint 37.C (F26) — jalon courant (marque/programme/production).
  const { data: rawProfileTenant } = await supabaseSuggestions
    .from('profiles')
    .select('tenant_id')
    .limit(1)
    .maybeSingle()
  const jalonTenantId =
    (rawProfileTenant as { tenant_id?: string | null } | null)?.tenant_id ?? null
  const jalonStatus = jalonTenantId
    ? await checkJalonStatus(supabaseSuggestions, jalonTenantId)
    : null
  const showJalonHero =
    jalonStatus !== null && jalonStatus.current !== 'production'

  const { data: rawSugProgramme } = await supabaseSuggestions
    .from('programmes')
    .select('date_fin')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const currentProgrammeEnd =
    (rawSugProgramme as { date_fin?: string | null } | null)?.date_fin ?? null
  const hasActiveProgramme = currentProgrammeEnd !== null

  // Sprint 37.C (F24) — Calendrier Business : compte les événements à
  // venir dans les 90 prochains jours (upcomingLaunches + industryEvents
  // du brand.business_calendar).
  const { data: rawBrandCalendar } = await supabaseSuggestions
    .from('brands')
    .select('business_calendar')
    .limit(1)
    .maybeSingle()
  const brandCalendar = (rawBrandCalendar as { business_calendar?: BusinessCalendar | null } | null)
    ?.business_calendar ?? null
  const calendarHorizon = new Date(now.getTime() + 90 * 86400000)
  const businessCalendarCount = ((): number => {
    if (!brandCalendar) return 0
    const inWindow = (iso: string | null | undefined): boolean => {
      if (!iso) return false
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return false
      return d.getTime() >= now.getTime() && d.getTime() <= calendarHorizon.getTime()
    }
    const launches = (brandCalendar.upcomingLaunches ?? []).filter((l) => inWindow(l.date)).length
    const events = (brandCalendar.industryEvents ?? []).filter((e) => inWindow(e.date)).length
    return launches + events
  })()

  const suggestions = computeSuggestions({
    currentProgrammeEnd,
    postsWeek: data.postsWeek,
    brandQuestionsAnswered: data.questionsAnswered,
    now,
  })

  // Sprint 37.A F10 — Carte "Démarrer cette semaine" affichée pendant
  // les 7 premiers jours du tenant. Au 8e jour, la card disparaît
  // automatiquement (anti-friction Apple, pas de bouton "Ignorer").
  const { data: rawTenantCreatedAt } = await supabaseSuggestions
    .from('tenants')
    .select('created_at')
    .limit(1)
    .maybeSingle()
  const tenantCreatedAt =
    (rawTenantCreatedAt as { created_at?: string | null } | null)?.created_at ?? null
  let tenantAgeDays = Number.POSITIVE_INFINITY
  if (tenantCreatedAt) {
    const created = new Date(tenantCreatedAt)
    if (!Number.isNaN(created.getTime())) {
      tenantAgeDays = Math.floor(
        (now.getTime() - created.getTime()) / 86400000,
      )
    }
  }
  const showDemarrerCard = tenantAgeDays < 7
  const demarrerSteps: DemarrerStep[] = []
  if (showDemarrerCard) {
    const brandIncomplete = data.questionsAnswered < 14
    const noActiveProgramme = currentProgrammeEnd === null
    if (brandIncomplete) {
      demarrerSteps.push({
        label: 'Vérifier ta marque',
        href: '/ma-marque',
        description: 'Tes piliers narratifs ne sont pas posés.',
      })
    }
    if (noActiveProgramme) {
      demarrerSteps.push({
        label: 'Créer ton premier plan',
        href: '/programme?action=create-plan',
        description:
          'Le conseiller construit avec toi un plan éditorial sur la période de ton choix.',
      })
    }
    demarrerSteps.push({
      label: 'Pose une question au conseiller',
      href: '/outils/conseiller',
      description:
        'Test sur un sujet réel. Une opportunité, un bad buzz, une idée de la direction.',
    })
  }

  return (
    <div
      className="min-h-screen"
      style={{ position: 'relative', background: 'var(--color-background)' }}
    >
      <div className="bg-halo bg-halo-1" aria-hidden="true" />
      <div className="bg-halo bg-halo-2" aria-hidden="true" />
      <div className="bg-halo bg-halo-3" aria-hidden="true" />
      <div className="bg-halo bg-halo-4" aria-hidden="true" />
      <div className="bg-halo bg-halo-5" aria-hidden="true" />
      <div className="bg-halo bg-halo-6" aria-hidden="true" />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header full-width — H1 "Aujourd'hui" + sous-titre Semaine, avatar à droite. */}
        <PageHeader title="Aujourd'hui" subtitle={semaineLabel} hideBreadcrumb />

        <div
          className="cfs-page-container"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: 'var(--space-6)',
            gap: 24,
          }}
        >
          {/* Zone Critique conditionnelle (full-width, au-dessus du Split Brief). */}
          <CriticalBanner alerts={data.alerts} />

          {/* Sprint 37.C (F26) — Hero jalon. Affiché quand le pilote
              n'a pas encore atteint le jalon "production". Remplace le
              dashboard split-brief tant que les fondations critiques
              ne sont pas posées. */}
          {showJalonHero && jalonStatus !== null ? (
            <JalonHero jalon={jalonStatus.current as 'marque' | 'programme'} />
          ) : null}

          {!showJalonHero ? (
          <SplitBrief
            leftColumn={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Sprint 37.A F10 — Carte "Démarrer cette semaine"
                    affichée pendant les 7 premiers jours du tenant
                    (au-dessus de Prochaine action). Effacée auto au 8e
                    jour, pas de bouton "Ignorer" — anti-friction Apple. */}
                {showDemarrerCard && demarrerSteps.length > 0 ? (
                  <div className="cfs-stagger cfs-stagger-1">
                    <DemarrerCard steps={demarrerSteps} />
                  </div>
                ) : null}

                {/* ── Bloc 1 — Prochaine action (Liquid Glass niveau 2) ── */}
                <section
                  className="glass-regular cfs-bloc-prochaine cfs-stagger cfs-stagger-2"
                  style={{
                    borderRadius: 16,
                    padding: '20px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'rgba(0,0,0,0.55)',
                    }}
                  >
                    Prochaine action
                  </span>
                  {prochain ? (
                    <>
                      <h2
                        style={{
                          fontFamily: 'var(--font-system)',
                          fontSize: 20,
                          fontWeight: 700,
                          letterSpacing: '-0.01em',
                          color: '#1C1C1E',
                          margin: 0,
                          lineHeight: 1.3,
                        }}
                      >
                        Préparer le post de{' '}
                        {prochain.heure_prevue.slice(0, 5).replace(':00', 'h').replace(':', 'h')}
                      </h2>
                      <p
                        style={{
                          fontFamily: 'var(--font-system)',
                          fontSize: 14,
                          color: 'rgba(0,0,0,0.55)',
                          margin: 0,
                          lineHeight: 1.45,
                        }}
                      >
                        {prochain.titre
                          ? `${prochain.titre} · ${prochain.type_contenu}`
                          : prochain.type_contenu}
                      </p>
                      <span
                        style={{
                          fontFamily: 'var(--font-system)',
                          fontSize: 12,
                          color: 'rgba(0,0,0,0.45)',
                        }}
                      >
                        ~5 min
                      </span>
                      <Link
                        href={`/programme/post/${prochain.id}`}
                        className="cfs-bloc-prochaine-cta"
                        style={{
                          marginTop: 4,
                          alignSelf: 'flex-start',
                          padding: '10px 20px',
                          borderRadius: 22,
                          background: '#1C1C1E',
                          color: '#FFFFFF',
                          textDecoration: 'none',
                          fontFamily: 'var(--font-system)',
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {prochainAction}
                      </Link>
                    </>
                  ) : (
                    <p
                      style={{
                        fontFamily: 'var(--font-system)',
                        fontSize: 15,
                        color: 'rgba(0,0,0,0.55)',
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {todayEmptyMessage}
                    </p>
                  )}
                </section>

                {/* ── Bloc 2 — État du programme (Liquid Glass niveau 1) ──
                    Sprint 37.C (F24) : ajout d'une phrase bleue cliquable.
                    Sans programme actif → "Créer Mon Programme →".
                    Avec programme → "Voir Mon Programme →". */}
                <section
                  className="glass-thin cfs-stagger cfs-stagger-6"
                  style={{
                    borderRadius: 14,
                    padding: '14px 18px',
                    border: '1px solid rgba(255,255,255,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'rgba(0,0,0,0.55)',
                    }}
                  >
                    Programme
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 15,
                      fontWeight: 500,
                      color: '#1C1C1E',
                      lineHeight: 1.45,
                    }}
                  >
                    {data.weekStats.total} {data.weekStats.total === 1 ? 'post' : 'posts'} cette semaine · {data.weekStats.ready} {data.weekStats.ready === 1 ? 'prêt' : 'prêts'} · {data.weekStats.todo} à préparer
                  </span>
                  <Link
                    href={hasActiveProgramme ? '/programme' : '/programme?action=create-plan'}
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#007AFF',
                      textDecoration: 'none',
                      marginTop: 2,
                      alignSelf: 'flex-start',
                    }}
                  >
                    {hasActiveProgramme ? 'Voir Mon Programme →' : 'Créer Mon Programme →'}
                  </Link>
                </section>

                {/* ── Bloc 3 — État Ma Marque (Liquid Glass niveau 1, conditionnel) ── */}
                {showMaMarqueBloc ? (
                  <section
                    className="glass-thin cfs-stagger cfs-stagger-7"
                    style={{
                      borderRadius: 14,
                      padding: '14px 18px',
                      border: '1px solid rgba(255,255,255,0.5)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-system)',
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'rgba(0,0,0,0.55)',
                      }}
                    >
                      Ma marque
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-system)',
                        fontSize: 15,
                        fontWeight: 500,
                        color: '#1C1C1E',
                      }}
                    >
                      14 fondations · {data.questionsAnswered} {data.questionsAnswered === 1 ? 'posée' : 'posées'}
                    </span>
                    <Link
                      href="/ma-marque"
                      style={{
                        fontFamily: 'var(--font-system)',
                        fontSize: 13,
                        fontWeight: 500,
                        color: '#007AFF',
                        textDecoration: 'none',
                        marginTop: 4,
                      }}
                    >
                      Compléter Ma Marque →
                    </Link>
                  </section>
                ) : null}

                {/* ── Bloc 4 — Calendrier Business (Sprint 37.C F24) ──
                    Affiché sous Ma Marque. Compte les événements à venir
                    dans les 90 prochains jours (upcomingLaunches +
                    industryEvents). Lien bleu vers la sheet d'édition. */}
                <section
                  className="glass-thin cfs-stagger cfs-stagger-7"
                  aria-label="Calendrier Business"
                  style={{
                    borderRadius: 14,
                    padding: '14px 18px',
                    border: '1px solid rgba(255,255,255,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'rgba(0,0,0,0.55)',
                    }}
                  >
                    Calendrier Business
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 15,
                      fontWeight: 500,
                      color: '#1C1C1E',
                      lineHeight: 1.45,
                    }}
                  >
                    {businessCalendarCount > 0
                      ? `${businessCalendarCount} ${businessCalendarCount === 1 ? 'événement' : 'événements'} à venir`
                      : 'Aucun événement renseigné'}
                  </span>
                  <Link
                    href="/ma-marque?section=calendrier-business"
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#007AFF',
                      textDecoration: 'none',
                      marginTop: 2,
                      alignSelf: 'flex-start',
                    }}
                  >
                    Compléter mon Calendrier →
                  </Link>
                </section>
              </div>
            }
            rightColumn={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {/* ── Bloc A — Aujourd'hui (Sprint 36.H Finding 2) ── */}
                <section
                  className="cfs-stagger cfs-stagger-3"
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <h2
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 18,
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      color: '#1C1C1E',
                      margin: 0,
                      padding: '6px 0',
                    }}
                  >
                    {blocATitre}
                  </h2>
                  {data.postsToday.length === 0 ? (
                    <p
                      style={{
                        fontFamily: 'var(--font-system)',
                        fontSize: 14,
                        color: 'rgba(0,0,0,0.55)',
                        margin: '4px 0 0 8px',
                      }}
                    >
                      {todayEmptyMessage}
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {data.postsToday.map((post) => (
                        <TaskRow key={post.id} post={post} variant="today" today={now} />
                      ))}
                    </div>
                  )}
                </section>

                {/* ── Bloc B — Cette semaine ── */}
                <div className="cfs-stagger cfs-stagger-8">
                  <BlocCetteSemaine
                    posts={data.postsWeek}
                    initialOpen={isMondayMorning}
                    showWeekendCta={isFridayLate}
                    todayISO={data.todayISO}
                  />
                </div>

                {/* Sprint 37.A F7 — Bloc "À faire cette semaine".
                    Remplace le CTA standalone "Préparer le week-end"
                    livré Sprint 37 Lot 5 (intégré ici comme l'une des
                    3 suggestions dynamiques possibles). Si zéro
                    suggestion calculée, le bloc ne rend rien. */}
                {suggestions.length > 0 ? (
                  <div className="cfs-stagger cfs-stagger-9">
                    <AFaireCetteSemaine suggestions={suggestions} />
                  </div>
                ) : null}
              </div>
            }
          />
          ) : null}
        </div>
      </div>
    </div>
  )
}
