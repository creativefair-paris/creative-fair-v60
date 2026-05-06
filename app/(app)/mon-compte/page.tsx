import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'

type ProfileRow = { tenant_id: string | null; first_name: string | null }
type CreditsRow = { feature: string; tokens_input: number; tokens_output: number }

const FEATURE_LABELS: Record<string, string> = {
  coaching: 'Coaching',
  generation: 'Génération de publication',
  brief: 'Brief externe',
  brand_book: 'Brand book',
  conseiller: 'Conseiller',
}

export default async function MonComptePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id, first_name')
    .eq('id', user.id)
    .maybeSingle()

  const profile = rawProfile as ProfileRow | null

  let totalCredits = 0
  const byFeature: Record<string, number> = {}

  if (profile?.tenant_id) {
    const admin = createAdmin()
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: rawRows } = await admin
      .from('credits_usage')
      .select('feature, tokens_input, tokens_output')
      .eq('tenant_id', profile.tenant_id)
      .gte('created_at', startOfMonth.toISOString())

    const rows = (rawRows as CreditsRow[] | null) ?? []
    for (const row of rows) {
      const cost = row.tokens_input + row.tokens_output
      totalCredits += cost
      byFeature[row.feature] = (byFeature[row.feature] ?? 0) + cost
    }
  }

  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-2xl mx-auto w-full space-y-10">
        <header className="space-y-1">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-body)' }}
          >
            Mon compte
          </p>
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
          >
            {profile?.first_name ?? 'Bonjour'}
          </h1>
        </header>

        <section className="glass-z2 px-6 py-5 space-y-3">
          <p
            className="text-xs uppercase tracking-wider"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Identifiants
          </p>
          <p
            className="text-base"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
          >
            {user.email}
          </p>
        </section>

        <section className="space-y-4">
          <h2
            className="text-xs uppercase tracking-wider"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Crédits ce mois
          </h2>
          <div className="glass-z2 px-6 py-5 space-y-4">
            <p
              className="text-2xl font-semibold tracking-tight"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
            >
              {totalCredits.toLocaleString('fr-FR')}
            </p>
            <ul className="space-y-2">
              {Object.keys(FEATURE_LABELS).map((key) => (
                <li
                  key={key}
                  className="flex items-center justify-between text-sm"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <span style={{ color: 'var(--color-text)' }}>
                    {FEATURE_LABELS[key]}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {(byFeature[key] ?? 0).toLocaleString('fr-FR')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <a
          href="/logout"
          className="inline-flex items-center text-sm transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
        >
          Se déconnecter
        </a>
      </div>
    </main>
  )
}
