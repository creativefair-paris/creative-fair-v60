// Sprint 43-stable — Page Compte V2.0 (refonte complète depuis stub Sprint 34).
// Sprint 41-secu-compte (D) — déplacée depuis /compte/mon-compte vers /compte
// (URL canonique V2.0 doctrine 01-ARCHITECTURE.md §1).
//
// Doctrine 01-ARCHITECTURE.md §3.2 (sub-sidebar 260px + content) + §4 (mono-marque V1).
// HTML de référence : docs/design-mockups/06-compte.html
//
// 5 sections : Profil, Marques, Plan et facturation, Sécurité, Apparence.

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CompteSubSidebar, type CompteSection } from '@/components/compte/CompteSubSidebar'
import { CompteSectionProfil } from '@/components/compte/CompteSectionProfil'
import { CompteSectionMarques } from '@/components/compte/CompteSectionMarques'
import { CompteSectionPlan } from '@/components/compte/CompteSectionPlan'
import { CompteSectionSecurite } from '@/components/compte/CompteSectionSecurite'
import { CompteSectionApparence } from '@/components/compte/CompteSectionApparence'

export const dynamic = 'force-dynamic'

const SECTION_TITLES: Record<CompteSection, string> = {
  profil: 'Profil',
  marques: 'Marques',
  notifications: 'Notifications',
  apparence: 'Apparence',
  securite: 'Sécurité',
  plan: 'Plan et facturation',
}

type SearchParams = {
  section?: string
}

export default async function MonComptePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Section active (depuis query param)
  const validSections: ReadonlyArray<CompteSection> = [
    'profil',
    'marques',
    'notifications',
    'apparence',
    'securite',
    'plan',
  ]
  const requested = params.section as CompteSection | undefined
  const active: CompteSection =
    requested && validSections.includes(requested) ? requested : 'profil'

  // Profil utilisateur (RLS s'applique)
  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('full_name, tenant_id, language')
    .eq('id', user.id)
    .maybeSingle()
  const profile =
    (profileRaw as {
      full_name?: string | null
      tenant_id?: string | null
      language?: string | null
    } | null) ?? null

  const userName = profile?.full_name ?? user.email?.split('@')[0] ?? 'Utilisateur'
  const userEmail = user.email ?? ''

  // Marque active (mono-marque V1, doctrine §4)
  let brandName: string | null = null
  if (profile?.tenant_id) {
    const { data: brandRaw } = await supabase
      .from('brands')
      .select('name')
      .eq('tenant_id', profile.tenant_id)
      .maybeSingle()
    brandName = (brandRaw as { name?: string | null } | null)?.name ?? null
  }

  return (
    <>
      <div className="wallpaper-neutral" aria-hidden="true" />

      <header className="page-header">
        <div className="page-shell">
          <div className="breadcrumb">
            <Link href="/aujourd-hui" className="breadcrumb-link">Aujourd&apos;hui</Link>
            <span className="breadcrumb-separator">›</span>
            <span>Compte</span>
          </div>
          <h1 className="header-h1">{SECTION_TITLES[active]}</h1>
        </div>
      </header>

      <div className="page-shell compte-layout">
        <CompteSubSidebar active={active} userName={userName} userEmail={userEmail} />

        <main className="compte-content">
          {active === 'profil' ? (
            <CompteSectionProfil
              initialName={userName}
              initialEmail={userEmail}
              initialLanguage={profile?.language ?? 'fr'}
            />
          ) : null}
          {active === 'marques' ? <CompteSectionMarques brandName={brandName} /> : null}
          {active === 'plan' ? <CompteSectionPlan /> : null}
          {active === 'securite' ? <CompteSectionSecurite /> : null}
          {active === 'apparence' ? <CompteSectionApparence /> : null}
          {active === 'notifications' ? (
            <section className="compte-section glass-z2">
              <h2 className="compte-section-title">Notifications</h2>
              <p className="compte-section-subtitle">
                Gestion des notifications à configurer prochainement.
              </p>
            </section>
          ) : null}
        </main>
      </div>
    </>
  )
}
