// Sprint 37.I (F78) — Hub Post Creator rendu directement dans la preview
// /outils (pas de route /outils/post-creator séparée).
//
// Architecture : OutilsCatalog dispatch sur outil.id === 'post-creator'
// pour rendre ce composant au lieu de l'OutilPreview générique.

import { ToolMockup } from '../ToolMockup'
import { FormatCard } from '../post-creator/FormatCard'

export function PostCreatorHubPreview() {
  return (
    <article
      className="glass-regular"
      style={{
        borderRadius: 20,
        padding: '32px 36px',
        background: 'rgba(251, 250, 247, 0.7)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="cfs-pc-hub-grid">
        {/* Contenu à gauche : titre + description + 2 sections format */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
          <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
              Post Creator
            </h2>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-system)',
                fontSize: 14,
                lineHeight: 1.55,
                color: 'var(--color-label)',
              }}
            >
              Rédige et programme tes publications Instagram. Chaque post part
              d&apos;un de tes piliers narratifs et garde la voix de ta marque.
            </p>
          </header>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3 style={sectionLabelStyle}>Supportés</h3>
            <div className="cfs-format-cards-grid">
              <FormatCard
                format="anecdote"
                label="Anecdote"
                href="/outils/post-creator/anecdote"
                description="Raconter une histoire qui sert un pilier."
              />
              <FormatCard
                format="produit"
                label="Produit"
                href="/outils/post-creator/produit"
                description="Mettre en avant une création avec son histoire."
              />
              <FormatCard
                format="evenement"
                label="Événement"
                href="/outils/post-creator/evenement"
                description="Annoncer une date qui compte."
              />
              <FormatCard
                format="manifeste"
                label="Manifeste"
                href="/outils/post-creator/manifeste"
                description="Affirmer une position forte."
              />
            </div>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3 style={sectionLabelStyle}>À venir</h3>
            <div className="cfs-format-cards-grid">
              <FormatCard
                format="question"
                label="Question"
                disabled
                description="Faire réagir la communauté."
              />
              <FormatCard
                format="coulisses"
                label="Coulisses"
                disabled
                description="Montrer le geste, l'atelier, la fabrication."
              />
            </div>
          </section>
        </div>

        {/* Mockup Instagram à droite (refondu F79) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <ToolMockup toolType="post-creator" />
        </div>
      </div>

      <style>{`
        .cfs-pc-hub-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 32px;
          align-items: start;
        }
        .cfs-format-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (max-width: 900px) {
          .cfs-pc-hub-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .cfs-format-cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </article>
  )
}

const sectionLabelStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-system)',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-tertiary-label)',
}
