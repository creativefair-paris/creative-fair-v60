import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getBrandByTenantId } from '@/lib/supabase/brands'

const SECTIONS = [
  {
    href: '/ma-marque/brand-book',
    label: 'Brand book',
    description: 'Identité, voix éditoriale, territoires.',
  },
  {
    href: '/ma-marque/business-calendar',
    label: 'Calendrier business',
    description: "Événements récurrents, lancements, saisonnalité.",
  },
]

export default async function MaMarquePage() {
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

  const tenantId = (rawProfile as { tenant_id?: string } | null)?.tenant_id

  let brand = null
  if (tenantId) brand = await getBrandByTenantId(supabase, tenantId)

  const incomplete = !brand || brand.brand_book_status === 'incomplete'

  return (
    <div className="px-6 md:px-10 py-10 max-w-2xl mx-auto w-full">
      <header className="mb-10">
        <h1
          className="text-3xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          {brand?.name ?? 'Ma marque'}
        </h1>
      </header>

      {incomplete && (
        <div
          className="glass-z1 mb-8 px-5 py-4"
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
          >
            {brand
              ? 'Ton brand book est en cours. Continue à le compléter.'
              : "Ton espace marque n'est pas encore initialisé."}
          </p>
          <Link
            href="/ma-marque/onboarding"
            className="inline-block mt-3 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-body)' }}
          >
            {brand ? 'Continuer' : 'Commencer'} →
          </Link>
        </div>
      )}

      <nav className="flex flex-col">
        {SECTIONS.map((section, i) => (
          <Link
            key={section.href}
            href={section.href}
            className="flex items-center justify-between gap-4 py-4 transition-opacity hover:opacity-70"
            style={{
              borderTop: i === 0 ? '1px solid var(--color-border)' : undefined,
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div className="space-y-0.5">
              <p
                className="text-base"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
              >
                {section.label}
              </p>
              <p
                className="text-sm"
                style={{
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {section.description}
              </p>
            </div>
            <ChevronRight
              size={18}
              style={{ color: 'var(--color-text-muted)' }}
              className="shrink-0"
            />
          </Link>
        ))}
      </nav>
    </div>
  )
}
