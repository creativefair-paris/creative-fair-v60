// Sprint 36.B.3 → 36.B.5 — Sheet "Canaux activés".
//
// Patches Sprint 36.B.5 :
//   - Instagram en tête comme canal principal V1 (toggle masqué, toujours actif).
//   - Logos officiels SVG monochrome inline (composants PlatformIcons).
//   - Bloc Bientôt + waiting list pour TikTok / X / YouTube / Facebook.
//   - Preview enrichie : canaux actifs avec logo + URL, mention canaux Bientôt
//     + liste des inscriptions actives.

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SheetMaMarque } from '@/components/ma-marque/SheetMaMarque'
import { WaitlistModal } from './WaitlistModal'
import {
  CANAUX_LABELS,
  CANAUX_ORDRE,
  CANAUX_VIDES,
  CANAUX_BIENTOT_LABELS,
  CANAUX_BIENTOT_ORDRE,
  canauxNormaliser,
  type CanalId,
  type CanalBientotId,
  type Canaux,
} from '@/types/ma-marque'
import type { BlocId } from '@/lib/ma-marque/completude'
import {
  InstagramIcon,
  LinkedInIcon,
  NewsletterIcon,
  GlobeIcon,
  GoogleMyBusinessIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
  FacebookIcon,
} from '@/components/icons/PlatformIcons'

type Props = {
  initialValue: Canaux | null
  defaultEmail?: string
  onClose: () => void
  onAllerVers?: (suivant: BlocId) => void
}

const INTRO =
  "Active uniquement les canaux que tu vas vraiment nourrir. Un canal vide vaut moins qu'un canal absent."

const PLACEHOLDERS: Record<CanalId, string> = {
  instagram: '@ta-marque',
  linkedin: 'linkedin.com/company/ta-marque',
  newsletter: 'ta-marque@substack.com',
  site: 'tamarque.fr',
  gmb: 'Lien Google My Business',
}

const ICONES_V1: Record<CanalId, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  newsletter: NewsletterIcon,
  site: GlobeIcon,
  gmb: GoogleMyBusinessIcon,
}

const ICONES_BIENTOT: Record<CanalBientotId, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  tiktok: TikTokIcon,
  x: XIcon,
  youtube: YouTubeIcon,
  facebook: FacebookIcon,
}

export function SheetCanaux({ initialValue, defaultEmail, onClose, onAllerVers }: Props) {
  const [canaux, setCanaux] = useState<Canaux>(
    canauxNormaliser(initialValue ?? CANAUX_VIDES),
  )
  const [waitlistInscrits, setWaitlistInscrits] = useState<Set<CanalBientotId>>(new Set())
  const [waitlistModal, setWaitlistModal] = useState<CanalBientotId | null>(null)
  const persistRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Chargement initial de la waitlist (silencieux si migration 010 pas appliquée).
  useEffect(() => {
    const ctrl = new AbortController()
    void (async () => {
      try {
        const res = await fetch('/api/brand/waitlist', { signal: ctrl.signal })
        if (!res.ok) return
        const data = (await res.json()) as {
          entries?: Array<{ channel: string }>
        }
        if (Array.isArray(data.entries)) {
          const set = new Set<CanalBientotId>()
          for (const e of data.entries) {
            if (CANAUX_BIENTOT_ORDRE.includes(e.channel as CanalBientotId)) {
              set.add(e.channel as CanalBientotId)
            }
          }
          setWaitlistInscrits(set)
        }
      } catch {
        // silencieux — table peut-être absente
      }
    })()
    return () => ctrl.abort()
  }, [])

  useEffect(() => {
    return () => {
      if (persistRef.current) clearTimeout(persistRef.current)
    }
  }, [])

  const persister = useCallback((next: Canaux) => {
    if (persistRef.current) clearTimeout(persistRef.current)
    persistRef.current = setTimeout(() => {
      void fetch('/api/brand/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'canaux', value: next }),
      }).catch((err) => {
        console.warn('[canaux] persistance échouée:', err)
      })
    }, 400)
  }, [])

  function toggle(id: CanalId) {
    if (id === 'instagram') return // canal principal — toujours actif
    setCanaux((prev) => {
      const next = { ...prev, [id]: { ...prev[id], actif: !prev[id].actif } }
      persister(next)
      return next
    })
  }

  function changeUrl(id: CanalId, url: string) {
    setCanaux((prev) => {
      const next = { ...prev, [id]: { ...prev[id], url } }
      persister(next)
      return next
    })
  }

  async function inscrireWaitlist(channel: CanalBientotId, email: string) {
    try {
      const res = await fetch('/api/brand/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        return { ok: false, detail: (data as { detail?: string }).detail ?? 'Service indisponible.' }
      }
      setWaitlistInscrits((s) => {
        const next = new Set(s)
        next.add(channel)
        return next
      })
      return { ok: true }
    } catch {
      return { ok: false, detail: 'Connexion impossible.' }
    }
  }

  async function retirerWaitlist(channel: CanalBientotId, email: string) {
    try {
      const res = await fetch('/api/brand/waitlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        return { ok: false, detail: (data as { detail?: string }).detail ?? 'Service indisponible.' }
      }
      setWaitlistInscrits((s) => {
        const next = new Set(s)
        next.delete(channel)
        return next
      })
      return { ok: true }
    } catch {
      return { ok: false, detail: 'Connexion impossible.' }
    }
  }

  return (
    <>
      <SheetMaMarque
        layout="split"
        title="Canaux activés"
        bloc="canaux"
        intro={INTRO}
        onClose={onClose}
        {...(onAllerVers ? { onAllerVers } : {})}
        context={
          <ContexteCanaux
            canaux={canaux}
            onToggle={toggle}
            onChangeUrl={changeUrl}
            waitlistInscrits={waitlistInscrits}
            onOuvrirWaitlist={setWaitlistModal}
          />
        }
        preview={
          <PreviewCanaux
            canaux={canaux}
            waitlistInscrits={waitlistInscrits}
          />
        }
      />

      {waitlistModal ? (
        <WaitlistModal
          channel={waitlistModal}
          defaultEmail={defaultEmail ?? ''}
          dejaInscrit={waitlistInscrits.has(waitlistModal)}
          onClose={() => setWaitlistModal(null)}
          onInscrire={(email) => inscrireWaitlist(waitlistModal, email)}
          onRetirer={(email) => retirerWaitlist(waitlistModal, email)}
        />
      ) : null}
    </>
  )
}

// ── Colonne gauche : contexte d'édition ───────────────────────────────

function ContexteCanaux({
  canaux,
  onToggle,
  onChangeUrl,
  waitlistInscrits,
  onOuvrirWaitlist,
}: {
  canaux: Canaux
  onToggle: (id: CanalId) => void
  onChangeUrl: (id: CanalId, url: string) => void
  waitlistInscrits: Set<CanalBientotId>
  onOuvrirWaitlist: (c: CanalBientotId) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <Bloc titre="Canal principal">
        <CanalLigneInstagram canal={canaux.instagram} onChangeUrl={(url) => onChangeUrl('instagram', url)} />
      </Bloc>

      <Bloc titre="Extensions V1">
        <ul style={ulReset}>
          {CANAUX_ORDRE.filter((id) => id !== 'instagram').map((id, i, arr) => (
            <CanalLigneExtension
              key={id}
              id={id}
              canal={canaux[id]}
              onToggle={() => onToggle(id)}
              onChangeUrl={(url) => onChangeUrl(id, url)}
              isLast={i === arr.length - 1}
            />
          ))}
        </ul>
      </Bloc>

      <Bloc
        titre="Bientôt"
        sous="Inscris-toi à la liste d'attente."
      >
        <ul style={ulReset}>
          {CANAUX_BIENTOT_ORDRE.map((id, i, arr) => (
            <CanalLigneBientot
              key={id}
              id={id}
              inscrit={waitlistInscrits.has(id)}
              onClick={() => onOuvrirWaitlist(id)}
              isLast={i === arr.length - 1}
            />
          ))}
        </ul>
      </Bloc>
    </div>
  )
}

// ── Sous-composants ──────────────────────────────────────────────────

const ulReset: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 14,
  overflow: 'hidden',
  border: '1px solid rgba(0,0,0,0.06)',
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(12px) saturate(160%)',
  WebkitBackdropFilter: 'blur(12px) saturate(160%)',
}

function Bloc({
  titre,
  sous,
  children,
}: {
  titre: string
  sous?: string
  children: React.ReactNode
}) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h4
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'rgba(0,0,0,0.4)',
          margin: 0,
        }}
      >
        {titre}
      </h4>
      {sous ? (
        <p
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            color: 'rgba(0,0,0,0.55)',
            margin: 0,
          }}
        >
          {sous}
        </p>
      ) : null}
      {children}
    </section>
  )
}

function CanalLigneInstagram({
  canal,
  onChangeUrl,
}: {
  canal: { actif: boolean; url: string }
  onChangeUrl: (url: string) => void
}) {
  return (
    <div
      style={{
        ...ulReset,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <InstagramIcon size={24} style={{ color: '#1C1C1E' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 16,
              fontWeight: 600,
              color: '#1C1C1E',
            }}
          >
            Instagram
          </div>
          <div
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 12,
              color: 'rgba(0,0,0,0.45)',
              marginTop: 2,
            }}
          >
            Actif par défaut
          </div>
        </div>
      </div>
      <input
        type="text"
        value={canal.url}
        onChange={(e) => onChangeUrl(e.target.value)}
        placeholder={PLACEHOLDERS.instagram}
        aria-label="Handle Instagram"
        style={{
          padding: '8px 0',
          border: 'none',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          background: 'transparent',
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          color: '#1C1C1E',
          outline: 'none',
        }}
      />
    </div>
  )
}

function CanalLigneExtension({
  id,
  canal,
  onToggle,
  onChangeUrl,
  isLast,
}: {
  id: CanalId
  canal: { actif: boolean; url: string }
  onToggle: () => void
  onChangeUrl: (url: string) => void
  isLast: boolean
}) {
  const Icone = ICONES_V1[id]
  return (
    <li
      style={{
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icone size={24} style={{ color: '#1C1C1E' }} />
        <span
          style={{
            flex: 1,
            fontFamily: 'var(--font-system)',
            fontSize: 16,
            fontWeight: 600,
            color: '#1C1C1E',
          }}
        >
          {CANAUX_LABELS[id]}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={canal.actif}
          aria-label={`Activer ${CANAUX_LABELS[id]}`}
          onClick={onToggle}
          style={{
            all: 'unset',
            cursor: 'pointer',
            flexShrink: 0,
            width: 44,
            height: 26,
            borderRadius: 13,
            background: canal.actif ? 'var(--color-system-green)' : 'rgba(0,0,0,0.15)',
            position: 'relative',
            transition: 'background 220ms ease',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 2,
              left: canal.actif ? 20 : 2,
              width: 22,
              height: 22,
              borderRadius: 11,
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transition: 'left 220ms ease',
            }}
          />
        </button>
      </div>
      {canal.actif ? (
        <input
          type="text"
          value={canal.url}
          onChange={(e) => onChangeUrl(e.target.value)}
          placeholder={PLACEHOLDERS[id]}
          aria-label={`URL ou handle ${CANAUX_LABELS[id]}`}
          style={{
            padding: '8px 0',
            border: 'none',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            background: 'transparent',
            fontFamily: 'var(--font-system)',
            fontSize: 14,
            color: '#1C1C1E',
            outline: 'none',
          }}
        />
      ) : null}
    </li>
  )
}

function CanalLigneBientot({
  id,
  inscrit,
  onClick,
  isLast,
}: {
  id: CanalBientotId
  inscrit: boolean
  onClick: () => void
  isLast: boolean
}) {
  const Icone = ICONES_BIENTOT[id]
  return (
    <li
      style={{
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <Icone size={24} style={{ color: '#1C1C1E', opacity: 0.4 }} />
      <span
        style={{
          flex: 1,
          fontFamily: 'var(--font-system)',
          fontSize: 16,
          fontWeight: 500,
          color: 'rgba(0,0,0,0.6)',
        }}
      >
        {CANAUX_BIENTOT_LABELS[id]}
      </span>
      {inscrit ? (
        <button
          type="button"
          onClick={onClick}
          style={{
            padding: '6px 14px',
            borderRadius: 16,
            border: 'none',
            cursor: 'pointer',
            background: 'rgba(52, 199, 89, 0.12)',
            color: '#34C759',
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Tu es sur la liste
        </button>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="cfs-btn-secondaire"
          style={{ padding: '6px 14px', fontSize: 13 }}
        >
          Notifier moi
        </button>
      )}
    </li>
  )
}

// ── Colonne droite : preview ─────────────────────────────────────────

function PreviewCanaux({
  canaux,
  waitlistInscrits,
}: {
  canaux: Canaux
  waitlistInscrits: Set<CanalBientotId>
}) {
  const actifsV1 = CANAUX_ORDRE.filter((id) => {
    const c = canaux[id]
    if (!c) return false
    if (id === 'instagram') return c.url.trim().length > 0
    return c.actif && c.url.trim().length > 0
  })

  return (
    <article
      className="glass-regular"
      style={{
        borderRadius: 24,
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'rgba(0,0,0,0.4)',
          margin: 0,
        }}
      >
        Canaux activés
      </h3>

      {actifsV1.length === 0 ? (
        <p
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 15,
            color: 'rgba(0,0,0,0.45)',
            fontStyle: 'italic',
            margin: 0,
          }}
        >
          Aucun canal renseigné.
        </p>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {actifsV1.map((id) => {
            const Icone = ICONES_V1[id]
            return (
              <li key={id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Icone size={22} style={{ color: '#1C1C1E', marginTop: 1 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#1C1C1E',
                    }}
                  >
                    {CANAUX_LABELS[id]}
                    {id === 'instagram' ? (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          fontWeight: 500,
                          color: 'rgba(0,0,0,0.4)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Canal principal
                      </span>
                    ) : null}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 13,
                      color: 'rgba(0,0,0,0.55)',
                      marginTop: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {canaux[id].url}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div
        style={{
          marginTop: 'var(--space-4)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 12,
            color: 'rgba(0,0,0,0.45)',
            margin: 0,
          }}
        >
          Bientôt : TikTok, X, YouTube, Facebook
        </p>
        {waitlistInscrits.size > 0 ? (
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 12,
              color: 'rgba(0,0,0,0.55)',
              margin: 0,
            }}
          >
            Tu es sur la liste pour :{' '}
            {Array.from(waitlistInscrits)
              .map((c) => CANAUX_BIENTOT_LABELS[c])
              .join(', ')}
          </p>
        ) : null}
      </div>
    </article>
  )
}
