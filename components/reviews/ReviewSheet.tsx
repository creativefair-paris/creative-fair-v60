// Sprint 37.A (F8) — Sheet de saisie "Vérifier un post".
//
// Champ titre (optionnel, auto-set depuis post_text). Textarea texte.
// Section visuel : tabs Uploader / URL. Bouton Vérifier (.btn-primary).
//
// Au submit :
//   1. (si upload) uploadReviewVisual(formData) → path
//   2. createReview({ title, postText, visualUrl, visualUploadedPath })
//      → reviewId
//   3. runReviewCheck({ reviewId }) → payload
//   4. router.refresh() pour que la liste reflète la nouvelle review

'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createReview } from '@/app/_actions/create-review'
import { runReviewCheck } from '@/app/_actions/run-review-check'
import { uploadReviewVisual } from '@/app/_actions/upload-review-visual'

type Props = {
  open: boolean
  onClose: () => void
  onCreated?: (reviewId: string) => void
}

type VisualMode = 'upload' | 'url'

export function ReviewSheet({ open, onClose, onCreated }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [postText, setPostText] = useState('')
  const [visualMode, setVisualMode] = useState<VisualMode>('upload')
  const [visualUrl, setVisualUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const canSubmit =
    !pending &&
    (postText.trim().length > 0 ||
      (visualMode === 'url' && visualUrl.trim().length > 0) ||
      (visualMode === 'upload' && file !== null))

  const reset = useCallback(() => {
    setTitle('')
    setPostText('')
    setVisualUrl('')
    setFile(null)
    setError(null)
    setVisualMode('upload')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleClose = useCallback(() => {
    if (pending) return
    reset()
    onClose()
  }, [pending, reset, onClose])

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    setPending(true)
    setError(null)

    let visualUploadedPath: string | undefined
    try {
      // 1. Upload visuel si nécessaire.
      if (visualMode === 'upload' && file) {
        const fd = new FormData()
        fd.append('file', file)
        const up = await uploadReviewVisual(fd)
        if (!up.ok) {
          setError(up.reason)
          setPending(false)
          return
        }
        visualUploadedPath = up.path
      }

      // 2. Création de la row reviews.
      const create = await createReview({
        title: title.trim() || undefined,
        postText: postText.trim() || undefined,
        ...(visualMode === 'url' && visualUrl.trim()
          ? { visualUrl: visualUrl.trim() }
          : {}),
        ...(visualUploadedPath ? { visualUploadedPath } : {}),
      })
      if (!create.ok) {
        setError(create.reason)
        setPending(false)
        return
      }
      const reviewId = create.reviewId

      // 3. Lancement du fact-check (peut être long — 5-30s selon Anthropic).
      const result = await runReviewCheck({ reviewId })
      if (!result.ok) {
        setError(result.reason)
        setPending(false)
        return
      }

      // 4. Refresh + callback.
      router.refresh()
      onCreated?.(reviewId)
      reset()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
    } finally {
      setPending(false)
    }
  }, [
    canSubmit,
    visualMode,
    file,
    title,
    postText,
    visualUrl,
    router,
    onCreated,
    reset,
    onClose,
  ])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-sheet-title"
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
          maxWidth: 640,
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
            id="review-sheet-title"
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-label)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Vérifier un post
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
            Reviews fact-check ton texte et identifie les crédits du visuel.
          </p>
        </header>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={fieldLabelStyle}>Titre (optionnel)</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Auto-rempli depuis le texte du post"
            maxLength={120}
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={fieldLabelStyle}>Texte du post</span>
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={6}
            placeholder="Colle ici le texte que tu prépares à publier."
            style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
          />
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={fieldLabelStyle}>Visuel</span>
          <div className="segmented-control" role="tablist" aria-label="Mode visuel">
            <button
              type="button"
              role="tab"
              aria-selected={visualMode === 'upload'}
              onClick={() => setVisualMode('upload')}
            >
              Uploader
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={visualMode === 'url'}
              onClick={() => setVisualMode('url')}
            >
              URL
            </button>
          </div>
          {visualMode === 'upload' ? (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              style={{ marginTop: 8 }}
            />
          ) : (
            <input
              type="url"
              value={visualUrl}
              onChange={(e) => setVisualUrl(e.target.value)}
              placeholder="https://..."
              style={{ ...inputStyle, marginTop: 8 }}
            />
          )}
          <p
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 12,
              color: 'var(--color-tertiary-label)',
              margin: '4px 0 0 0',
              lineHeight: 1.5,
            }}
          >
            PNG / JPG / JPEG / WEBP. 10 MB maximum.
          </p>
        </div>

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
            disabled={!canSubmit}
            className="btn-primary"
          >
            {pending ? 'Vérification…' : 'Vérifier'}
          </button>
        </footer>
      </section>
    </div>
  )
}

const fieldLabelStyle: React.CSSProperties = {
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
