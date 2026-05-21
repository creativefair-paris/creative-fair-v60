// Sprint 43-stable — Section Apparence (V1 minimaliste)

export function CompteSectionApparence() {
  return (
    <section className="compte-section glass-z2">
      <h2 className="compte-section-title">Apparence</h2>
      <p className="compte-section-subtitle">Personnalisation visuelle de Creative Fair.</p>

      <div className="compte-security-block">
        <h3 className="compte-subsection-title">Thème</h3>
        <p className="compte-help">
          En V1, Creative Fair s&apos;affiche en mode clair. Le mode sombre arrivera en V2.
        </p>
      </div>

      <div className="compte-security-block">
        <h3 className="compte-subsection-title">Mouvement</h3>
        <p className="compte-help">
          Les animations respectent automatiquement ton réglage système{' '}
          <code>prefers-reduced-motion</code>.
        </p>
      </div>
    </section>
  )
}
