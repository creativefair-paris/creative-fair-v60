// Sprint 43-stable — Section Marques (bloc unique selon doctrine §4 mono-marque V1)

import Link from 'next/link'

type Props = {
  brandName: string | null
}

export function CompteSectionMarques({ brandName }: Props) {
  return (
    <section className="compte-section glass-z2">
      <h2 className="compte-section-title">Marques</h2>
      <p className="compte-section-subtitle">
        En V1, tu pilotes une marque à la fois. Le multi-marque arrive en V2.
      </p>

      <div className="compte-marque-card">
        <div className="compte-marque-info">
          <div className="compte-marque-eyebrow">Marque active</div>
          <div className="compte-marque-name">{brandName ?? 'Pas encore de marque'}</div>
          <div className="compte-marque-plan">Plan Pro · une marque active</div>
        </div>
        <Link href="/ma-marque" className="compte-btn compte-btn--secondary">
          Ouvrir Ma Marque
        </Link>
      </div>
    </section>
  )
}
