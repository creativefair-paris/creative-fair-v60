// Sprint 43-stable — Carnet des 13 Experts (fusionné dans Messages)
// Doctrine 02-EXPERTS.md §5 (Hélène pinned + 12 alphabétique)

import Link from 'next/link'
import { ALL_PARTICIPANTS, HELENE } from '@/lib/messages/experts'

export function MessagesCarnetExperts() {
  const others = ALL_PARTICIPANTS.filter((e) => e.id !== HELENE.id).sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  return (
    <div className="ms-carnet">
      <header className="ms-carnet-header">
        <div>
          <h2 className="ms-carnet-title">Carnet</h2>
          <p className="ms-carnet-subtitle">
            Hélène M. orchestre. 12 Experts spécialistes à ta disposition.
          </p>
        </div>
        <Link href="/messages" className="ms-carnet-close">
          ← Retour aux conversations
        </Link>
      </header>

      <section className="ms-carnet-section">
        <h3 className="ms-carnet-eyebrow">Orchestratrice</h3>
        <ExpertCard expert={HELENE} pinned />
      </section>

      <section className="ms-carnet-section">
        <h3 className="ms-carnet-eyebrow">12 Experts spécialistes</h3>
        <div className="ms-carnet-grid">
          {others.map((expert) => (
            <ExpertCard key={expert.id} expert={expert} />
          ))}
        </div>
      </section>
    </div>
  )
}

function ExpertCard({
  expert,
  pinned,
}: {
  expert: (typeof ALL_PARTICIPANTS)[number]
  pinned?: boolean
}) {
  return (
    <article className={`ms-expert-card ${pinned ? 'is-pinned' : ''} glass-z1`}>
      <div className="ms-expert-avatar" style={{ background: expert.color }}>
        {expert.initial}
      </div>
      <div className="ms-expert-info">
        <div className="ms-expert-name">{expert.name}</div>
        <div className="ms-expert-domain">{expert.domain}</div>
        <p className="ms-expert-desc">{expert.description}</p>
      </div>
      <div className="ms-expert-actions">
        <Link href={`/messages?conv=conv-${expert.id}`} className="ms-expert-btn ms-expert-btn--primary">
          Démarrer une conversation
        </Link>
      </div>
    </article>
  )
}
