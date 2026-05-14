// Sprint 37.F (F61) — Vue Stratégie du programme courant.
// Sprint 37.H (F73) — Refondue avec 3 sections : Events business (intention),
// Indicateurs éditoriaux (calcul déterministe), Résultats anticipés (sub-prompt
// fourchettes avec warning + limites obligatoires).

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ProgrammeSplitShell } from '@/components/programme/ProgrammeSplitShell'
import { EmptyState } from '@/components/ui/EmptyState'
import { computeIndicateursEditoriaux } from '@/lib/programme/compute-indicateurs-editoriaux'
import { generateStrategieEventsIntention } from '@/app/_actions/strategie-events-intention'
import { estimateProgrammeOutcomes } from '@/app/_actions/estimate-programme-outcomes'
import { EventIntentionCard } from '@/components/strategie/EventIntentionCard'
import { IndicateursEditorialsList } from '@/components/strategie/IndicateursEditorialsList'
import { EstimationsList } from '@/components/strategie/EstimationsList'

export const dynamic = 'force-dynamic'
// Sprint 37.H (F73) — Sub-prompts Anthropic (events intention + estimations)
// peuvent prendre 30-60s. Élève maxDuration pour éviter le timeout Next.
export const maxDuration = 90

type ProgrammeRow = {
  id: string
  date_debut: string | null
  date_fin: string | null
  arc_narratif: unknown
}

type PilierRaw = { nom?: string } | string

type BrandRow = {
  id: string
  piliers_narratifs: unknown
}

export default async function StrategiePage() {
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
  const tenantId = (rawProfile as { tenant_id?: string | null } | null)?.tenant_id ?? null
  if (!tenantId) redirect('/onboarding/analyse-marque')

  // Programme courant actif.
  const { data: rawProgramme } = await supabase
    .from('programmes')
    .select('id, date_debut, date_fin, arc_narratif')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const programme = rawProgramme as ProgrammeRow | null

  // Marque (piliers).
  const { data: rawBrand } = await supabase
    .from('brands')
    .select('id, piliers_narratifs')
    .eq('tenant_id', tenantId)
    .maybeSingle()
  const brand = rawBrand as BrandRow | null
  const piliers: ReadonlyArray<string> = (() => {
    if (!brand) return []
    if (!Array.isArray(brand.piliers_narratifs)) return []
    return brand.piliers_narratifs
      .map((p: PilierRaw) => (typeof p === 'string' ? p : p.nom ?? ''))
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
  })()

  const arcNarratif = ((): string | null => {
    if (!programme?.arc_narratif || typeof programme.arc_narratif !== 'object') return null
    const obj = programme.arc_narratif as { semaines?: Array<{ theme?: string }> }
    return obj.semaines?.[0]?.theme ?? null
  })()

  // Sprint 37.H (F73) — Charge les 3 sections en parallèle si programme actif.
  const admin = createAdmin() as unknown as SupabaseClient
  const [eventsResult, indicateurs, estimationsResult] = programme
    ? await Promise.all([
        generateStrategieEventsIntention(programme.id),
        computeIndicateursEditoriaux(admin, programme.id),
        estimateProgrammeOutcomes(programme.id),
      ])
    : [null, null, null]

  return (
    <ProgrammeSplitShell activeItem="strategie">
      {programme === null ? (
        <EmptyState
          title="Pas encore de programme en cours"
          description="Crée un programme pour voir ta stratégie éditoriale interprétée par le conseiller."
          cta={{ label: 'Créer un programme', href: '/programme/create' }}
        />
      ) : (
        <article style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-system)',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '-0.015em',
                color: 'var(--color-label)',
              }}
            >
              Stratégie éditoriale en cours
            </h2>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-system)',
                fontSize: 14,
                color: 'var(--color-secondary-label)',
                lineHeight: 1.5,
              }}
            >
              Voici comment Creative Fair a interprété ta marque sur la période en cours.
            </p>
          </header>

          {/* Fil rouge */}
          {arcNarratif ? (
            <section
              className="glass-thin"
              style={{
                padding: '20px 22px',
                borderRadius: 14,
                border: '1px solid rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <span style={sectionLabelStyle}>Fil rouge de la période</span>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: 'var(--color-label)', lineHeight: 1.4 }}>
                {arcNarratif}
              </p>
            </section>
          ) : null}

          {/* Piliers mobilisés */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={sectionLabelStyle}>Piliers mobilisés</span>
            {piliers.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-secondary-label)' }}>
                Tes piliers narratifs ne sont pas encore posés.{' '}
                <Link href="/ma-marque?onboarding=true" style={{ color: '#007AFF' }}>
                  Les définir →
                </Link>
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {piliers.map((p) => (
                  <span
                    key={p}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      fontFamily: 'var(--font-system)',
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--color-label)',
                      background: 'rgba(0, 122, 255, 0.08)',
                      border: '1px solid rgba(0, 122, 255, 0.18)',
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Section 1 — Events business : intention et couverture */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={sectionLabelStyle}>Events business — Intention et couverture</span>
            {eventsResult && eventsResult.ok && eventsResult.events.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {eventsResult.events.map((event) => (
                  <EventIntentionCard key={`${event.event_name}-${event.event_date}`} event={event} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Pas d'event business sur cette période"
                description="Tu peux en ajouter dans Ma Marque › Calendrier business."
                cta={{ label: 'Ouvrir Ma Marque', href: '/ma-marque?section=calendrier-business' }}
              />
            )}
          </section>

          {/* Section 2 — Indicateurs éditoriaux */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={sectionLabelStyle}>Indicateurs éditoriaux</span>
            {indicateurs ? (
              <IndicateursEditorialsList indicateurs={indicateurs} />
            ) : (
              <p style={{ fontSize: 13, color: 'var(--color-secondary-label)' }}>
                Indicateurs indisponibles.
              </p>
            )}
          </section>

          {/* Section 3 — Résultats anticipés */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={sectionLabelStyle}>Résultats anticipés</span>
            {estimationsResult?.ok ? (
              <>
                <p
                  style={{
                    margin: 0,
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'rgba(255, 149, 0, 0.06)',
                    border: '1px solid rgba(255, 149, 0, 0.2)',
                    fontFamily: 'var(--font-system)',
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: 'var(--color-label)',
                  }}
                >
                  <span aria-hidden="true" style={{ marginRight: 6 }}>⚠️</span>
                  {estimationsResult.warning}
                </p>
                {estimationsResult.estimations.length > 0 ? (
                  <EstimationsList estimations={estimationsResult.estimations} />
                ) : (
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--color-secondary-label)',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'rgba(0, 0, 0, 0.02)',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      margin: 0,
                    }}
                  >
                    Renseigne tes chiffres marque pour activer les estimations.{' '}
                    <Link href="/programme/retombees" style={{ color: '#007AFF' }}>
                      Renseigner mes chiffres →
                    </Link>
                  </p>
                )}
                {estimationsResult.limites ? (
                  <p
                    style={{
                      margin: 0,
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'rgba(0, 0, 0, 0.02)',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      fontFamily: 'var(--font-system)',
                      fontSize: 12,
                      lineHeight: 1.55,
                      color: 'var(--color-secondary-label)',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>Ce que je ne peux pas prédire : </span>
                    {estimationsResult.limites}
                  </p>
                ) : null}
              </>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--color-secondary-label)' }}>
                Estimations indisponibles pour le moment.
              </p>
            )}
          </section>

          <footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link
              href="/outils/conseiller?scenario=A2"
              className="btn-primary"
              style={{ textDecoration: 'none' }}
            >
              Affiner ma stratégie →
            </Link>
          </footer>
        </article>
      )}
    </ProgrammeSplitShell>
  )
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-tertiary-label)',
}
