// Sprint 37.F (F61) — Vue Stratégie du programme courant.
//
// V1 minimaliste : affiche l'arc narratif du programme actif, la liste
// des piliers de la marque, et un aperçu de l'audit éditorial (équilibre
// des formats sur le programme). Sprint 37.G enrichira avec audits
// chiffrés (TF Analytics côté serveur).

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProgrammeSplitShell } from '@/components/programme/ProgrammeSplitShell'
import { EmptyState } from '@/components/ui/EmptyState'

export const dynamic = 'force-dynamic'

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

type PostFormatRow = { format: string | null }

const FORMAT_COLOR: Record<string, string> = {
  anecdote: '#007AFF',
  produit: '#34C759',
  evenement: '#FF9500',
  coulisses: '#AF52DE',
  manifeste: '#FF3B30',
  question: '#5856D6',
}
const FORMAT_LABEL: Record<string, string> = {
  anecdote: 'Anecdote',
  produit: 'Produit',
  evenement: 'Événement',
  coulisses: 'Coulisses',
  manifeste: 'Manifeste',
  question: 'Question',
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

  // Compte les formats du programme actif (audit éditorial).
  let formatsCount: Record<string, number> = {}
  if (programme) {
    const { data: rawFormats } = await supabase
      .from('posts')
      .select('format')
      .eq('programme_id', programme.id)
    const rows = (rawFormats as PostFormatRow[] | null) ?? []
    for (const r of rows) {
      if (r.format) {
        formatsCount[r.format] = (formatsCount[r.format] ?? 0) + 1
      }
    }
  }
  const totalPosts = Object.values(formatsCount).reduce((s, n) => s + n, 0)

  const arcNarratif = ((): string | null => {
    if (!programme?.arc_narratif || typeof programme.arc_narratif !== 'object') return null
    const obj = programme.arc_narratif as { semaines?: Array<{ theme?: string }> }
    return obj.semaines?.[0]?.theme ?? null
  })()

  return (
    <ProgrammeSplitShell activeItem="strategie">
      {programme === null ? (
        <EmptyState
          title="Pas encore de programme en cours"
          description="Crée un programme pour voir ta stratégie éditoriale interprétée par le conseiller."
          cta={{ label: 'Créer un programme', href: '/programme/create' }}
        />
      ) : (
        <article style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
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
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-tertiary-label)',
                }}
              >
                Fil rouge de la période
              </span>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-system)',
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'var(--color-label)',
                  lineHeight: 1.4,
                }}
              >
                {arcNarratif}
              </p>
            </section>
          ) : null}

          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-tertiary-label)',
                margin: 0,
              }}
            >
              Piliers mobilisés
            </h3>
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

          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-tertiary-label)',
                margin: 0,
              }}
            >
              Audit éditorial — répartition des formats
            </h3>
            {totalPosts === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-secondary-label)' }}>
                Aucun post généré pour le moment.
              </p>
            ) : (
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {Object.entries(formatsCount)
                  .sort((a, b) => b[1] - a[1])
                  .map(([format, count]) => {
                    const pct = Math.round((count / totalPosts) * 100)
                    return (
                      <li
                        key={format}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 14px',
                          borderRadius: 10,
                          background: 'rgba(255, 255, 255, 0.5)',
                          border: '1px solid rgba(0, 0, 0, 0.05)',
                        }}
                      >
                        <span
                          style={{
                            padding: '3px 9px',
                            borderRadius: 6,
                            fontFamily: 'var(--font-system)',
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: '#FFFFFF',
                            background: FORMAT_COLOR[format] ?? '#8E8E93',
                          }}
                        >
                          {FORMAT_LABEL[format] ?? format}
                        </span>
                        <span style={{ flex: 1, fontSize: 13, color: 'var(--color-label)' }}>
                          {count} post{count > 1 ? 's' : ''}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-secondary-label)' }}>
                          {pct}%
                        </span>
                      </li>
                    )
                  })}
              </ul>
            )}
          </section>

          <footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link
              href="/outils/conseiller?scenario=A7"
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
