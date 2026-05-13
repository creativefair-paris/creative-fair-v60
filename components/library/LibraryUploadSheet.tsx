// Sprint 37.A (F9.upload) — Sheet d'upload Bibliothèque.

'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createLibraryDocument } from '@/app/_actions/create-library-document'

type Props = {
  open: boolean
  onClose: () => void
}

const CATEGORIES = [
  { value: 'presse', label: 'Presse' },
  { value: 'brief', label: 'Brief' },
  { value: 'archive', label: 'Archive' },
  { value: 'autre', label: 'Autre' },
] as const

export function LibraryUploadSheet({ open, onClose }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('autre')
  const [file, setFile] = useState<File | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const reset = useCallback(() => {
    setTitle('')
    setDescription('')
    setCategory('autre')
    setFile(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleClose = useCallback(() => {
    if (pending) return
    reset()
    onClose()
  }, [pending, reset, onClose])

  const handleSubmit = useCallback(async () => {
    if (!file || pending) return
    setPending(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      if (title.trim()) fd.append('title', title.trim())
      if (description.trim()) fd.append('description', description.trim())
      fd.append('category', category)
      const result = await createLibraryDocument(fd)
      if (!result.ok) {
        setError(result.reason)
        return
      }
      router.refresh()
      reset()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setPending(false)
    }
  }, [file, pending, title, description, category, router, reset, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lib-upload-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={handleClose}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.18)',
        }}
      />
      <section
        className="glass-regular"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 560,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 20,
          padding: '28px 28px 24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          background: 'rgba(251, 250, 247, 0.96)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.12)',
        }}
      >
        <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h2
            id="lib-upload-title"
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-label)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Ajouter un document
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              lineHeight: 1.5,
              color: 'var(--color-secondary-label)',
              margin: 0,
            }}
          >
            PDF / DOCX / PNG / JPG / JPEG / WEBP. 10 MB maximum.
          </p>
        </header>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={labelStyle}>Titre (optionnel)</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Auto-rempli depuis le nom du fichier"
            maxLength={200}
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={labelStyle}>Description (optionnel)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={1000}
            placeholder="Une note pour te rappeler pourquoi tu as gardé ce document."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={labelStyle}>Catégorie</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={labelStyle}>Fichier</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,image/png,image/jpeg,image/jpg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {error ? (
          <p
            role="alert"
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 13,
              color: '#C0392B',
              margin: 0,
            }}
          >
            {error}
          </p>
        ) : null}

        <footer
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={pending}
            style={{
              padding: '10px 18px',
              borderRadius: 22,
              border: 'none',
              background: 'transparent',
              color: 'var(--color-secondary-label)',
              fontFamily: 'var(--font-system)',
              fontSize: 14,
              fontWeight: 500,
              cursor: pending ? 'not-allowed' : 'pointer',
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pending || !file}
            className="btn-primary"
          >
            {pending ? 'Ajout…' : 'Ajouter'}
          </button>
        </footer>
      </section>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--color-tertiary-label)',
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid var(--color-separator)',
  fontFamily: 'var(--font-system)',
  fontSize: 15,
  color: 'var(--color-label)',
  background: 'rgba(255, 255, 255, 0.6)',
  outline: 'none',
  width: '100%',
}
