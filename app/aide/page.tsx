// Sprint 43-stable — Page Aide V1 (template temporaire selon brief §7.2).
//
// Doctrine 01-ARCHITECTURE.md §1 (Aide = système, icône en bas de sidebar
// Aujourd'hui). Contenu réel viendra après Sprint cadrage.
//
// Exception explicite §7.2 amendement Lead "beta interne" : on accepte
// temporairement de contredire 00-CONCEPT.md §6 pilier 6 "Zéro bientôt"
// pour ne pas casser la sidebar globale.

import Link from 'next/link'

export default function AidePage() {
  return (
    <>
      <div className="wallpaper-neutral" aria-hidden="true" />

      <header className="page-header">
        <div className="page-shell">
          <div className="breadcrumb">
            <Link href="/aujourd-hui" className="breadcrumb-link">Aujourd&apos;hui</Link>
            <span className="breadcrumb-separator">›</span>
            <span>Aide</span>
          </div>
          <h1 className="header-h1">Aide</h1>
          <p className="header-subtitle">Support, à propos et documentation.</p>
        </div>
      </header>

      <main className="page-shell">
        <section className="empty-state glass-z1">
          <h2 className="empty-state__title">Page en cours de conception</h2>
          <p>
            La page Aide arrive après le sprint cadrage. En attendant, contacte directement
            l&apos;équipe Creative Fair par email.
          </p>
          <p style={{ marginTop: 16 }}>
            <a
              href="mailto:creativefair@1922.studio"
              style={{
                color: 'var(--blue-cf)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              creativefair@1922.studio
            </a>
          </p>
        </section>
      </main>
    </>
  )
}
