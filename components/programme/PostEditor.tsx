// Sprint 37.E (F58) — Éditeur de fiche post (workflow B).
//
// Édition inline : pilier, date, objectif éditorial, angle (description),
// caption complète. Bouton "Affiner avec le conseiller →" qui ouvre le
// scénario B2 sur ce post.

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updatePostFields } from '@/app/_actions/update-post'

const FORMAT_COLOR: Record<string, string> = {
  anecdote: '#007AFF',
  produit: '#34C759',
  evenement: '#FF9500',
  coulisses: '#AF52DE',
  manifeste: '#FF3B30',
  question: '#5856D6',
}
const FORMAT_LABEL: Record<string, string> = {
  anecdote: 'Anecdote',
  produit: 'Produit',
  evenement: 'Événement',
  coulisses: 'Coulisses',
  manifeste: 'Manifeste',
  question: 'Question',
}

type PostRow = {
  id: string
  pilier_nom: string | null
  date_prevue: string | null
  format: string | null
  structure_type: string | null
  objectif_editorial: string | null
  angle: string | null
  caption_complete: string | null
  visuel_url: string | null
  statut: string | null
}

type Props = {
  post: PostRow
  pillarsCatalog: ReadonlyArray<string>
}

export function PostEditor({ post, pillarsCatalog }: Props) {
  const [pilier, setPilier] = useState(post.pilier_nom ?? '')
  const [date, setDate] = useState(post.date_prevue ?? '')
  const [objectif, setObjectif] = useState(post.objectif_editorial ?? '')
  const [angle, setAngle] = useState(post.angle ?? '')
  const [caption, setCaption] = useState(post.caption_complete ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDirty =
    pilier !== (post.pilier_nom ?? '') ||
    date !== (post.date_prevue ?? '') ||
    objectif !== (post.objectif_editorial ?? '') ||
    angle !== (post.angle ?? '') ||
    caption !== (post.caption_complete ?? '')

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await updatePostFields({
        postId: post.id,
        pilier_nom: pilier,
        date_prevue: date,
        objectif_editorial: objectif,
        angle,
        caption_complete: caption,
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } else {
        setError(res.reason)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {post.format ? (
            <span
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: 6,
                fontFamily: 'var(--font-system)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#FFFFFF',
                background: FORMAT_COLOR[post.format] ?? '#8E8E93',
              }}
            >
              {FORMAT_LABEL[post.format] ?? post.format}
            </span>
          ) : null}
          {post.structure_type ? (
            <span
              style={{
                fontSize: 12,
                color: 'var(--color-secondary-label)',
                padding: '3px 8px',
                borderRadius: 6,
                background: 'rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
              }}
            >
              {post.structure_type}
            </span>
          ) : null}
        </div>
        <Link
          href={`/outils/conseiller?scenario=B2&post_id=${post.id}`}
          className="btn-choice"
          style={{
            textDecoration: 'none',
            padding: '8px 14px',
            background: 'rgba(0, 122, 255, 0.06)',
            borderColor: 'rgba(0, 122, 255, 0.18)',
            color: '#007AFF',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Affiner avec le conseiller →
        </Link>
      </header>

      <Field label="Pilier mobilisé">
        {pillarsCatalog.length > 0 ? (
          <select value={pilier} onChange={(e) => setPilier(e.target.value)} style={inputStyle}>
            <option value="">— sélectionner —</option>
            {pillarsCatalog.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={pilier}
            onChange={(e) => setPilier(e.target.value)}
            placeholder="Nom du pilier"
            style={inputStyle}
          />
        )}
      </Field>

      <Field label="Date de publication prévue">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={inputStyle}
        />
      </Field>

      <Field label="Objectif éditorial">
        <input
          type="text"
          value={objectif}
          onChange={(e) => setObjectif(e.target.value)}
          placeholder="En une phrase, ce que ce post doit produire."
          style={inputStyle}
        />
      </Field>

      <Field label="Description (idée éditoriale)">
        <textarea
          value={angle}
          onChange={(e) => setAngle(e.target.value)}
          rows={4}
          placeholder="L'angle, le déroulé, les visuels imaginés."
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
        />
      </Field>

      <Field label="Caption complète (Post Creator)">
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={8}
          placeholder="Écris ici ta caption complète, ou utilise Post Creator pour la générer."
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55 }}
        />
      </Field>

      {error ? (
        <p
          role="alert"
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            color: '#C0392B',
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(192, 57, 43, 0.06)',
            margin: 0,
          }}
        >
          {error}
        </p>
      ) : null}

      <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
        {saved ? (
          <span style={{ fontSize: 13, color: '#34C759', alignSelf: 'center' }}>
            Enregistré ✓
          </span>
        ) : null}
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="btn-primary"
        >
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </footer>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-tertiary-label)',
        }}
      >
        {label}
      </span>
      {children}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(0, 0, 0, 0.08)',
  background: 'rgba(255, 255, 255, 0.7)',
  fontFamily: 'var(--font-system)',
  fontSize: 14,
  color: 'var(--color-label)',
  outline: 'none',
  width: '100%',
}
