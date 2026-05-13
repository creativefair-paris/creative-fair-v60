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
import { SuggestedSignal } from '@/components/today/SuggestedSignal'
import { loadAujourdhuiData } from '@/lib/aujourd-hui/load-data'
import { mapStatutToState } from '@/lib/types/post'
import { jourCourantFr, semaineRangeFr } from '@/lib/aujourd-hui/dates-fr'
import { startOfWeek, endOfWeek } from '@/lib/calendar/dates'

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

          <SplitBrief
            leftColumn={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* ── Bloc 1 — Prochaine action (Liquid Glass niveau 2) ── */}
                <section
                  className="glass-regular cfs-bloc-prochaine"
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
                      Rien à préparer aujourd&apos;hui.
                    </p>
                  )}
                </section>

                {/* ── Bloc 2 — État du programme (Liquid Glass niveau 1) ── */}
                <Link
                  href="/programme"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <section
                    className="glass-thin cfs-bloc-link"
                    style={{
                      borderRadius: 14,
                      padding: '14px 18px',
                      border: '1px solid rgba(255,255,255,0.5)',
                      transition: 'background-color 200ms ease-out, transform 200ms ease-out',
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
                  </section>
                </Link>

                {/* ── Bloc 3 — État Ma Marque (Liquid Glass niveau 1, conditionnel) ── */}
                {showMaMarqueBloc ? (
                  <section
                    className="glass-thin"
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
              </div>
            }
            rightColumn={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {/* ── Bloc A — Aujourd'hui (Sprint 36.H Finding 2) ── */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                      Rien à préparer aujourd&apos;hui.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {data.postsToday.map((post) => (
                        <TaskRow key={post.id} post={post} variant="today" />
                      ))}
                    </div>
                  )}
                </section>

                {/* ── Bloc B — Cette semaine ── */}
                <BlocCetteSemaine
                  posts={data.postsWeek}
                  initialOpen={isMondayMorning}
                  showWeekendCta={isFridayLate}
                />

                {/* ── Bloc C — Suggéré pour toi (mocké V1) ── */}
                <SuggestedSignal signal={data.dailySignal} />
              </div>
            }
          />
        </div>
      </div>
    </div>
  )
}
