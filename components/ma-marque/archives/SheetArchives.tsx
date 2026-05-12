// Sprint 36.B.3 — Sheet "Archives et uploads".
// Mémoire totale de la marque — texte/pdf/image/vidéo/lien.

'use client'

import { useMemo, useRef, useState } from 'react'
import { SheetMaMarque } from '@/components/ma-marque/SheetMaMarque'
import type { ArchiveType, BrandArchive } from '@/types/ma-marque'
import type { BlocId } from '@/lib/ma-marque/completude'

type Props = {
  initialItems: BrandArchive[]
  onClose: () => void
  onAllerVers?: (suivant: BlocId) => void
}

const INTRO =
  "La mémoire de ta marque. Tout ce que Creative Fair pourra relire et croiser : citations, anecdotes, photos, vidéos, briefs anciens, presse, contrats."

const TYPES: { id: ArchiveType; label: string; accept: string }[] = [
  { id: 'texte', label: 'Texte', accept: 'text/plain' },
  { id: 'pdf',   label: 'PDF',   accept: 'application/pdf' },
  { id: 'image', label: 'Image', accept: 'image/png,image/jpeg,image/webp,image/svg+xml' },
  { id: 'video', label: 'Vidéo', accept: 'video/mp4,video/quicktime' },
  { id: 'lien',  label: 'Lien',  accept: '' },
]

const TYPE_ICON: Record<ArchiveType, string> = {
  texte: 'Aa',
  pdf: 'PDF',
  image: 'IMG',
  video: 'VID',
  lien: '↗',
}

function dateCourte(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })
  } catch {
    return ''
  }
}

export function SheetArchives({ initialItems, onClose, onAllerVers }: Props) {
  const [items, setItems] = useState<BrandArchive[]>(initialItems ?? [])
  const [editing, setEditing] = useState(false)
  const [draftType, setDraftType] = useState<ArchiveType>('texte')
  const [draftTitre, setDraftTitre] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [draftUrl, setDraftUrl] = useState('')
  const [draftTags, setDraftTags] = useState('')
  const [draftFile, setDraftFile] = useState<File | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  // Pas de recharge depuis initialItems : la sheet est créée à chaque ouverture
  // avec une snapshot serveur fraîche, et l'état local couvre les mutations
  // pendant la session (insert/delete). La page refetch au prochain rendu serveur.

  function resetDraft() {
    setEditing(false)
    setDraftType('texte')
    setDraftTitre('')
    setDraftDescription('')
    setDraftUrl('')
    setDraftTags('')
    setDraftFile(null)
    setSubmitError(null)
  }

  async function enregistrer() {
    setSubmitError(null)
    if (draftTitre.trim().length === 0) {
      setSubmitError('Le titre est requis.')
      return
    }

    let fichier_path: string | null = null
    let url: string | null = null

    if (draftType === 'lien') {
      if (draftUrl.trim().length === 0) {
        setSubmitError('Une URL est requise pour un lien.')
        return
      }
      url = draftUrl.trim()
    } else if (draftFile) {
      const form = new FormData()
      form.append('file', draftFile)
      form.append('dossier', 'uploads')
      try {
        const res = await fetch('/api/brand/upload', { method: 'POST', body: form })
        if (!res.ok) {
          setSubmitError('Le téléversement a échoué.')
          return
        }
        const data = await res.json()
        fichier_path = typeof data.path === 'string' ? data.path : null
      } catch {
        setSubmitError('Le téléversement a échoué.')
        return
      }
    }

    const tags = draftTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    try {
      const res = await fetch('/api/brand/archives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: draftType,
          titre: draftTitre.trim(),
          description: draftDescription.trim(),
          url,
          fichier_path,
          tags,
        }),
      })
      if (!res.ok) {
        setSubmitError("Impossible d'enregistrer l'archive.")
        return
      }
      const data = (await res.json()) as { archive?: BrandArchive }
      if (data.archive) {
        setItems((prev) => [data.archive!, ...prev])
        resetDraft()
      }
    } catch {
      setSubmitError("Connexion impossible.")
    }
  }

  async function supprimer(id: string) {
    try {
      const res = await fetch(`/api/brand/archives/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems((prev) => prev.filter((a) => a.id !== id))
      }
    } catch {
      // silencieux — la prochaine recharge corrigera
    }
  }

  const repartition = useMemo(() => {
    const r: Record<ArchiveType, number> = {
      texte: 0, pdf: 0, image: 0, video: 0, lien: 0,
    }
    items.forEach((it) => {
      r[it.type] += 1
    })
    return r
  }, [items])

  return (
    <SheetMaMarque
      layout="split"
      title="Archives et uploads"
      bloc="archives"
      intro={INTRO}
      onClose={onClose}
      {...(onAllerVers ? { onAllerVers } : {})}
      context={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              style={{
                padding: '12px 20px',
                borderRadius: 24,
                border: 'none',
                cursor: 'pointer',
                background: 'var(--color-label)',
                color: 'var(--color-background)',
                fontFamily: 'var(--font-system)',
                fontSize: 14,
                fontWeight: 600,
                alignSelf: 'flex-start',
              }}
            >
              Ajouter un document
            </button>
          ) : (
            <div
              className="glass-thin"
              style={{
                padding: 'var(--space-4)',
                borderRadius: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={draftType === t.id}
                    onClick={() => setDraftType(t.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 16,
                      border: 'none',
                      cursor: 'pointer',
                      background: draftType === t.id ? 'var(--color-label)' : 'transparent',
                      color: draftType === t.id ? 'var(--color-background)' : 'var(--color-secondary-label)',
                      fontFamily: 'var(--font-system)',
                      fontSize: 13,
                      fontWeight: draftType === t.id ? 600 : 500,
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={draftTitre}
                onChange={(e) => setDraftTitre(e.target.value)}
                placeholder="Titre"
                maxLength={120}
                style={{
                  padding: '8px 0',
                  border: 'none',
                  borderBottom: '1px solid rgba(0,0,0,0.08)',
                  background: 'transparent',
                  fontFamily: 'var(--font-system)',
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--color-label)',
                  outline: 'none',
                }}
              />

              <textarea
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                placeholder="Description courte (optionnel)"
                rows={2}
                maxLength={400}
                style={{
                  padding: '6px 0',
                  border: 'none',
                  background: 'transparent',
                  fontFamily: 'var(--font-system)',
                  fontSize: 14,
                  lineHeight: 1.4,
                  color: 'var(--color-secondary-label)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />

              {draftType === 'lien' ? (
                <input
                  type="url"
                  value={draftUrl}
                  onChange={(e) => setDraftUrl(e.target.value)}
                  placeholder="https://…"
                  style={{
                    padding: '8px 0',
                    border: 'none',
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    background: 'transparent',
                    fontFamily: 'var(--font-system)',
                    fontSize: 14,
                    color: 'var(--color-label)',
                    outline: 'none',
                  }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    ref={fileRef}
                    type="file"
                    accept={TYPES.find((t) => t.id === draftType)?.accept ?? ''}
                    style={{ display: 'none' }}
                    onChange={(e) => setDraftFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="glass-thin"
                    style={{
                      padding: '8px 14px',
                      borderRadius: 18,
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-label)',
                      fontFamily: 'var(--font-system)',
                      fontSize: 13,
                    }}
                  >
                    {draftFile ? 'Remplacer le fichier' : 'Choisir un fichier'}
                  </button>
                  {draftFile ? (
                    <span
                      style={{
                        fontFamily: 'var(--font-system)',
                        fontSize: 12,
                        color: 'var(--color-tertiary-label)',
                      }}
                    >
                      {draftFile.name}
                    </span>
                  ) : null}
                </div>
              )}

              <input
                type="text"
                value={draftTags}
                onChange={(e) => setDraftTags(e.target.value)}
                placeholder="Tags séparés par des virgules (optionnel)"
                style={{
                  padding: '8px 0',
                  border: 'none',
                  borderBottom: '1px solid rgba(0,0,0,0.08)',
                  background: 'transparent',
                  fontFamily: 'var(--font-system)',
                  fontSize: 13,
                  color: 'var(--color-secondary-label)',
                  outline: 'none',
                }}
              />

              {submitError ? (
                <p
                  role="alert"
                  style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 13,
                    color: '#D70015',
                    margin: 0,
                  }}
                >
                  {submitError}
                </p>
              ) : null}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={resetDraft}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--color-secondary-label)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-system)',
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => void enregistrer()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: 'none',
                    background: 'var(--color-label)',
                    color: 'var(--color-background)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-system)',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {items.map((a) => (
              <li
                key={a.id}
                className="glass-thin"
                style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(0,0,0,0.06)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-system)',
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--color-secondary-label)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {TYPE_ICON[a.type]}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--color-label)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {a.titre}
                  </div>
                  {a.description ? (
                    <div
                      style={{
                        fontFamily: 'var(--font-system)',
                        fontSize: 12,
                        color: 'var(--color-secondary-label)',
                        marginTop: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {a.description}
                    </div>
                  ) : null}
                  <div
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 11,
                      color: 'var(--color-tertiary-label)',
                      marginTop: 4,
                    }}
                  >
                    {dateCourte(a.created_at)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void supprimer(a.id)}
                  aria-label={`Supprimer ${a.titre}`}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: 'var(--color-tertiary-label)',
                  }}
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        </div>
      }
      preview={
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
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-tertiary-label)',
              margin: 0,
            }}
          >
            Bibliothèque
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '-0.015em',
              color: 'var(--color-label)',
              margin: 0,
            }}
          >
            {items.length} document{items.length > 1 ? 's' : ''} archivé{items.length > 1 ? 's' : ''}
          </p>

          {items.length > 0 ? (
            <p
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 14,
                color: 'var(--color-secondary-label)',
                margin: 0,
              }}
            >
              {TYPES.map((t) => `${repartition[t.id]} ${t.label.toLowerCase()}`)
                .filter((s) => !s.startsWith('0 '))
                .join(' · ')}
            </p>
          ) : null}

          {items.length > 0 ? (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <h4
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-tertiary-label)',
                  margin: '0 0 8px 0',
                }}
              >
                Derniers ajouts
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {items.slice(0, 5).map((a) => (
                  <li
                    key={a.id}
                    style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: 14,
                      color: 'var(--color-label)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {a.titre}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      }
    />
  )
}
