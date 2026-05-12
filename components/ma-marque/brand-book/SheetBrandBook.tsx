// Sprint 36.B.3 — Sheet "Brand book et charte visuelle".
// Palette + typo + logo + exemples À faire / À ne pas faire.

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SheetMaMarque } from '@/components/ma-marque/SheetMaMarque'
import {
  BRAND_BOOK_VIDE,
  brandBookNormaliser,
  type BrandBook,
  type PaletteCouleur,
} from '@/types/ma-marque'
import type { BlocId } from '@/lib/ma-marque/completude'

type Props = {
  initialValue: BrandBook | null
  onClose: () => void
  onAllerVers?: (suivant: BlocId) => void
}

const INTRO =
  "Ta charte visuelle. Creative Fair s'en inspire pour calibrer les visuels et la palette des piliers."

const MAX_PALETTE = 6
const MAX_VISUELS = 6
const HEX_RE = /^#[0-9A-Fa-f]{6}$/

function uploadFichier(file: File, dossier: 'brand-book' | 'uploads'): Promise<string | null> {
  const form = new FormData()
  form.append('file', file)
  form.append('dossier', dossier)
  return fetch('/api/brand/upload', { method: 'POST', body: form })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
    .then((data) => (data && typeof data.path === 'string' ? data.path : null))
    .catch((err) => {
      console.warn('[brand-book] upload échoué:', err)
      return null
    })
}

export function SheetBrandBook({ initialValue, onClose, onAllerVers }: Props) {
  const [book, setBook] = useState<BrandBook>(
    brandBookNormaliser(initialValue ?? BRAND_BOOK_VIDE),
  )
  const persistRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (persistRef.current) clearTimeout(persistRef.current)
    }
  }, [])

  const persister = useCallback((next: BrandBook) => {
    if (persistRef.current) clearTimeout(persistRef.current)
    persistRef.current = setTimeout(() => {
      void fetch('/api/brand/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'brand_book', value: next }),
      }).catch((err) => {
        console.warn('[brand-book] persistance échouée:', err)
      })
    }, 500)
  }, [])

  function maj(patch: Partial<BrandBook>) {
    setBook((prev) => {
      const next = { ...prev, ...patch }
      persister(next)
      return next
    })
  }

  // ── Palette ────────────────────────────────────────────────────────
  function paletteAjouter() {
    if (book.palette.length >= MAX_PALETTE) return
    maj({ palette: [...book.palette, { nom: '', hex: '#888888' }] })
  }

  function paletteUpdate(i: number, patch: Partial<PaletteCouleur>) {
    const next = book.palette.map((p, idx) => (idx === i ? { ...p, ...patch } : p))
    maj({ palette: next })
  }

  function paletteRetirer(i: number) {
    maj({ palette: book.palette.filter((_, idx) => idx !== i) })
  }

  // ── Logo ───────────────────────────────────────────────────────────
  async function logoUploader(file: File) {
    const path = await uploadFichier(file, 'brand-book')
    if (path) maj({ logo_url: path })
  }

  // ── Dos / Donts ────────────────────────────────────────────────────
  async function dosAjouter(file: File) {
    if (book.dos.length >= MAX_VISUELS) return
    const path = await uploadFichier(file, 'brand-book')
    if (path) maj({ dos: [...book.dos, path] })
  }

  function dosRetirer(i: number) {
    maj({ dos: book.dos.filter((_, idx) => idx !== i) })
  }

  async function dontsAjouter(file: File) {
    if (book.donts.length >= MAX_VISUELS) return
    const path = await uploadFichier(file, 'brand-book')
    if (path) maj({ donts: [...book.donts, path] })
  }

  function dontsRetirer(i: number) {
    maj({ donts: book.donts.filter((_, idx) => idx !== i) })
  }

  return (
    <SheetMaMarque
      layout="split"
      title="Brand book et charte visuelle"
      bloc="brand-book"
      intro={INTRO}
      onClose={onClose}
      {...(onAllerVers ? { onAllerVers } : {})}
      context={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Section titre="Palette">
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
              {book.palette.map((c, i) => (
                <li
                  key={i}
                  style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <input
                    type="color"
                    value={HEX_RE.test(c.hex) ? c.hex : '#888888'}
                    onChange={(e) => paletteUpdate(i, { hex: e.target.value })}
                    aria-label={`Couleur ${i + 1}`}
                    style={{
                      width: 40,
                      height: 32,
                      borderRadius: 8,
                      border: '1px solid rgba(0,0,0,0.06)',
                      cursor: 'pointer',
                      padding: 0,
                      background: 'transparent',
                    }}
                  />
                  <input
                    type="text"
                    value={c.nom}
                    onChange={(e) => paletteUpdate(i, { nom: e.target.value })}
                    placeholder="Nom"
                    maxLength={32}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: 8,
                      background: 'transparent',
                      fontFamily: 'var(--font-system)',
                      fontSize: 14,
                      color: 'var(--color-label)',
                      outline: 'none',
                    }}
                  />
                  <input
                    type="text"
                    value={c.hex}
                    onChange={(e) => paletteUpdate(i, { hex: e.target.value })}
                    placeholder="#000000"
                    maxLength={7}
                    style={{
                      width: 90,
                      padding: '6px 8px',
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: 8,
                      background: 'transparent',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: 12,
                      color: 'var(--color-label)',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => paletteRetirer(i)}
                    aria-label={`Retirer la couleur ${i + 1}`}
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      fontSize: 12,
                      color: 'var(--color-tertiary-label)',
                    }}
                  >
                    Retirer
                  </button>
                </li>
              ))}
            </ul>
            {book.palette.length < MAX_PALETTE ? (
              <button
                type="button"
                onClick={paletteAjouter}
                className="glass-thin"
                style={btnDoux}
              >
                Ajouter une couleur
              </button>
            ) : null}
          </Section>

          <Section titre="Typographie">
            <input
              type="text"
              value={book.typo.principale}
              onChange={(e) => maj({ typo: { ...book.typo, principale: e.target.value } })}
              placeholder="Famille principale (ex. Inter, Söhne)"
              maxLength={80}
              style={inputBase}
            />
            <input
              type="text"
              value={book.typo.secondaire ?? ''}
              onChange={(e) =>
                maj({
                  typo: {
                    ...book.typo,
                    ...(e.target.value.trim().length > 0
                      ? { secondaire: e.target.value }
                      : {}),
                  },
                })
              }
              placeholder="Famille secondaire (optionnel)"
              maxLength={80}
              style={inputBase}
            />
          </Section>

          <Section titre="Logo">
            <UploadInput
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              label={book.logo_url ? 'Remplacer le logo' : 'Téléverser un logo'}
              onFile={(f) => void logoUploader(f)}
            />
            {book.logo_url ? (
              <p
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 12,
                  color: 'var(--color-tertiary-label)',
                  margin: 0,
                }}
              >
                Logo déposé.
              </p>
            ) : null}
          </Section>

          <Section titre="À faire">
            <Galerie
              items={book.dos}
              max={MAX_VISUELS}
              onAjouter={(f) => void dosAjouter(f)}
              onRetirer={dosRetirer}
              ariaLabel="Exemples validés"
            />
          </Section>

          <Section titre="À ne pas faire">
            <Galerie
              items={book.donts}
              max={MAX_VISUELS}
              onAjouter={(f) => void dontsAjouter(f)}
              onRetirer={dontsRetirer}
              ariaLabel="Exemples rejetés"
            />
          </Section>
        </div>
      }
      preview={<BrandBookPreview book={book} />}
    />
  )
}

// ── Sous-composants ──────────────────────────────────────────────────

const inputBase = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: 8,
  background: 'transparent',
  fontFamily: 'var(--font-system)',
  fontSize: 14,
  color: 'var(--color-label)',
  outline: 'none',
} as const

const btnDoux = {
  padding: '8px 14px',
  borderRadius: 18,
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-label)',
  fontFamily: 'var(--font-system)',
  fontSize: 13,
  fontWeight: 500,
  alignSelf: 'flex-start',
} as const

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h4
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 13,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: 'var(--color-secondary-label)',
          margin: 0,
        }}
      >
        {titre}
      </h4>
      {children}
    </section>
  )
}

function UploadInput({
  label,
  accept,
  onFile,
}: {
  label: string
  accept: string
  onFile: (file: File) => void
}) {
  const ref = useRef<HTMLInputElement | null>(null)
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = '' // permet de re-sélectionner le même fichier
        }}
      />
      <button type="button" onClick={() => ref.current?.click()} className="glass-thin" style={btnDoux}>
        {label}
      </button>
    </>
  )
}

function Galerie({
  items,
  max,
  onAjouter,
  onRetirer,
  ariaLabel,
}: {
  items: string[]
  max: number
  onAjouter: (file: File) => void
  onRetirer: (i: number) => void
  ariaLabel: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ul
        aria-label={ariaLabel}
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {items.map((path, i) => (
          <li
            key={path + i}
            className="glass-thin"
            style={{
              borderRadius: 12,
              padding: '8px 12px',
              fontFamily: 'var(--font-system)',
              fontSize: 12,
              color: 'var(--color-secondary-label)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {path.split('/').slice(-1)[0]}
            </span>
            <button
              type="button"
              onClick={() => onRetirer(i)}
              aria-label="Retirer ce visuel"
              style={{ all: 'unset', cursor: 'pointer', color: 'var(--color-tertiary-label)' }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      {items.length < max ? (
        <UploadInput
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          label="Téléverser un visuel"
          onFile={onAjouter}
        />
      ) : null}
    </div>
  )
}

function BrandBookPreview({ book }: { book: BrandBook }) {
  return (
    <article
      className="glass-regular"
      style={{
        borderRadius: 24,
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
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
        Charte visuelle
      </h3>

      <div>
        <PreviewLabel>Palette</PreviewLabel>
        {book.palette.length === 0 ? (
          <p style={pHint}>Aucune couleur posée.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {book.palette.map((c, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.5)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    background: HEX_RE.test(c.hex) ? c.hex : '#888888',
                    border: '1px solid rgba(0,0,0,0.08)',
                  }}
                />
                <span style={{ fontFamily: 'var(--font-system)', fontSize: 12, color: 'var(--color-label)' }}>
                  {c.nom || c.hex}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <PreviewLabel>Typographie</PreviewLabel>
        {book.typo.principale.length === 0 ? (
          <p style={pHint}>Aucune typo posée.</p>
        ) : (
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 17,
              fontWeight: 500,
              color: 'var(--color-label)',
              margin: 0,
            }}
          >
            {book.typo.principale}
            {book.typo.secondaire ? (
              <span style={{ color: 'var(--color-tertiary-label)' }}>
                {' '}— {book.typo.secondaire}
              </span>
            ) : null}
          </p>
        )}
      </div>

      <div>
        <PreviewLabel>Logo</PreviewLabel>
        <p style={book.logo_url ? pVal : pHint}>
          {book.logo_url ? 'Logo déposé.' : 'Aucun logo déposé.'}
        </p>
      </div>

      <div>
        <PreviewLabel>Exemples</PreviewLabel>
        <p style={pVal}>
          {book.dos.length} validé{book.dos.length > 1 ? 's' : ''} ·{' '}
          {book.donts.length} refusé{book.donts.length > 1 ? 's' : ''}
        </p>
      </div>
    </article>
  )
}

function PreviewLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4
      style={{
        fontFamily: 'var(--font-system)',
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'var(--color-tertiary-label)',
        margin: '0 0 6px 0',
      }}
    >
      {children}
    </h4>
  )
}

const pHint = {
  fontFamily: 'var(--font-system)',
  fontSize: 13,
  color: 'var(--color-tertiary-label)',
  fontStyle: 'italic',
  margin: 0,
} as const

const pVal = {
  fontFamily: 'var(--font-system)',
  fontSize: 14,
  color: 'var(--color-label)',
  margin: 0,
} as const
