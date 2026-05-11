// Sprint 36.B — Client wrapper de la démo Split Brief.
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { NavigationBar } from '@/components/layout/NavigationBar'
import { SplitBrief } from '@/components/split-brief/SplitBrief'

const MOCK_QUESTIONS = [
  {
    q: 'Quel temps fort de ton calendrier business veux-tu travailler ?',
    options: ['Lancement printemps', 'Anniversaire boutique', 'Saint-Valentin'],
  },
  {
    q: 'À qui veux-tu t\u2019adresser en priorité ?',
    options: ['Clientes fidèles', 'Nouvelles arrivées', 'Audience curieuse'],
  },
  {
    q: 'Sur quel registre veux-tu poser le ton ?',
    options: ['Émotion sobre', 'Témoignage atelier', 'Mise en scène produit'],
  },
] as const

export function SplitBriefDemoClient() {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="min-h-screen"
      style={{ position: 'relative', background: 'var(--color-background)' }}
    >
      <div className="bg-halo bg-halo-1" aria-hidden="true" />
      <div className="bg-halo bg-halo-2" aria-hidden="true" />
      <div className="bg-halo bg-halo-3" aria-hidden="true" />
      <div className="bg-halo bg-halo-4" aria-hidden="true" />
      <div className="bg-halo bg-halo-5" aria-hidden="true" />
      <div className="bg-halo bg-halo-6" aria-hidden="true" />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <NavigationBar title="Démo Split Brief" />

        <div
          style={{
            maxWidth: 560,
            margin: '0 auto',
            padding: 'var(--space-6) var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 17,
              lineHeight: 1.4,
              color: 'var(--color-secondary-label)',
              margin: 0,
            }}
          >
            Cette page sert à valider le pattern Split Brief avant de l\u2019intégrer
            sur les cards posts et les sous-blocs Ma Marque.
          </p>
          <Button onClick={() => setOpen(true)}>Ouvrir Split Brief de démo</Button>
        </div>
      </div>

      {open ? (
        <SplitBrief
          intro="On va parler de ton calendrier business."
          onClose={() => setOpen(false)}
          context={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {MOCK_QUESTIONS.map((block) => (
                <div key={block.q} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 15,
                      fontWeight: 500,
                      color: 'var(--color-label)',
                      margin: 0,
                    }}
                  >
                    {block.q}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {block.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className="glass-thin"
                        style={{
                          padding: '8px 14px',
                          borderRadius: 999,
                          border: 'none',
                          fontFamily: 'var(--font-system)',
                          fontSize: 14,
                          color: 'var(--color-label)',
                          cursor: 'pointer',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <textarea
                placeholder="Ou réponds en tes mots."
                rows={3}
                style={{
                  width: '100%',
                  padding: 'var(--space-4)',
                  borderRadius: 16,
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  fontFamily: 'var(--font-system)',
                  fontSize: 15,
                  lineHeight: 1.4,
                  color: 'var(--color-label)',
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          }
          preview={
            <div
              className="glass-thin"
              style={{
                flex: 1,
                borderRadius: 24,
                padding: 'var(--space-6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 480,
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 17,
                  color: 'var(--color-secondary-label)',
                  margin: 0,
                }}
              >
                Preview Calendrier
              </p>
            </div>
          }
        />
      ) : null}
    </div>
  )
}
