// Sprint 37.A (F9.preview) — Preview multi-type Bibliothèque.
// Sprint 40 Phase 2B — kind 'conversation' retiré (Conseiller V1 dégagé Blocs 1-9) ;
// section ConversationSection + imports ConseillerBubble/PiloteBubble + types
// ConversationData / ConversationMessage retirés.
//
// Affiche le payload selon LibraryItem.category :
//   - document : iframe PDF (browser viewer) ou message DOCX "à télécharger"
//                ou image direct
//   - brand-book : metadata 4 piliers du brand book
//   - post : reconstruction fiche post (texte + statut + retombées)
//   - review : 3 sections (fact-check + crédit + ready-to-paste)
//   - programme : arc + dates + status

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  BrandBookPreview as BrandBookData,
  DocumentPreview as DocumentData,
  LibraryItem,
  PostPreview as PostData,
  ProgrammePreview as ProgrammeData,
  ReviewPreview as ReviewData,
} from '@/lib/library/types'
import type {
  FactCheckItem,
  VisualCredit,
} from '@/lib/reviews/types'

type Props = {
  item: LibraryItem
}

export function LibraryPreview({ item }: Props) {
  const preview = item.preview as { kind: string }
  switch (preview.kind) {
    case 'document':
      return <DocumentSection data={item.preview as DocumentData} title={item.title} />
    case 'brand-book':
      return <BrandBookSection data={item.preview as BrandBookData} title={item.title} />
    case 'post':
      return <PostSection data={item.preview as PostData} title={item.title} />
    case 'review':
      return <ReviewSection data={item.preview as ReviewData} title={item.title} />
    case 'programme':
      return <ProgrammeSection data={item.preview as ProgrammeData} title={item.title} />
    default:
      return (
        <article className="glass-thin" style={cardStyle}>
          Preview non disponible pour cette catégorie.
        </article>
      )
  }
}

// ── Document (PDF / DOCX / image) ────────────────────────────────────────

function DocumentSection({ data, title }: { data: DocumentData; title: string }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchSignedUrl() {
      try {
        const supabase = createClient()
        const { data: signed, error: sErr } = await supabase.storage
          .from('library-uploads')
          .createSignedUrl(data.file_path, 60 * 30) // 30 min
        if (cancelled) return
        if (sErr || !signed) {
          setError(sErr?.message ?? 'Lien signé indisponible')
          return
        }
        setSignedUrl(signed.signedUrl)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      }
    }
    void fetchSignedUrl()
    return () => {
      cancelled = true
    }
  }, [data.file_path])

  const isPDF = data.file_type === 'application/pdf'
  const isImage = data.file_type.startsWith('image/')
  const isDOCX =
    data.file_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    data.file_type === 'application/msword'

  return (
    <article className="glass-thin" style={cardStyle}>
      <Header title={title} subtitle={data.category_label} />
      {data.description ? (
        <p style={pStyle}>{data.description}</p>
      ) : null}
      {data.file_size_bytes ? (
        <p style={metaStyle}>{Math.round(data.file_size_bytes / 1024)} Ko</p>
      ) : null}
      {error ? (
        <p style={{ ...pStyle, color: '#C0392B' }}>Lien indisponible. {error}</p>
      ) : !signedUrl ? (
        <p style={metaStyle}>Chargement…</p>
      ) : isPDF ? (
        <iframe
          src={signedUrl}
          title={`Aperçu ${title}`}
          style={{
            width: '100%',
            minHeight: 480,
            border: '1px solid var(--color-separator)',
            borderRadius: 12,
          }}
        />
      ) : isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={signedUrl}
          alt={title}
          style={{
            width: '100%',
            maxHeight: 520,
            objectFit: 'contain',
            borderRadius: 12,
            background: 'rgba(0, 0, 0, 0.02)',
          }}
        />
      ) : (
        <div
          style={{
            padding: '16px 18px',
            borderRadius: 12,
            background: 'rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <p style={{ ...pStyle, margin: 0 }}>
            {isDOCX
              ? "Aperçu DOCX non rendu en navigateur. Télécharge le fichier pour le consulter."
              : "Aperçu non rendu pour ce type de fichier. Télécharge pour voir."}
          </p>
          <a
            href={signedUrl}
            download
            className="btn-choice btn-choice-sm"
            style={{ alignSelf: 'flex-start', textDecoration: 'none' }}
          >
            Télécharger
          </a>
        </div>
      )}
    </article>
  )
}

// ── Brand book ───────────────────────────────────────────────────────────

function BrandBookSection({ data, title }: { data: BrandBookData; title: string }) {
  return (
    <article className="glass-thin" style={cardStyle}>
      <Header title={title} subtitle={data.secteur ?? 'Brand book'} />
      <dl style={dlStyle}>
        <dt style={dtStyle}>Nom</dt>
        <dd style={ddStyle}>{data.nom ?? '—'}</dd>
        <dt style={dtStyle}>Secteur</dt>
        <dd style={ddStyle}>{data.secteur ?? '—'}</dd>
        <dt style={dtStyle}>Ton</dt>
        <dd style={ddStyle}>{data.ton ?? '—'}</dd>
        <dt style={dtStyle}>Singularité</dt>
        <dd style={ddStyle}>{data.singularite ?? '—'}</dd>
      </dl>
    </article>
  )
}

// ── Post ─────────────────────────────────────────────────────────────────

function PostSection({ data, title }: { data: PostData; title: string }) {
  const content =
    typeof data.contenu_genere === 'string'
      ? data.contenu_genere
      : typeof data.contenu_genere === 'object' && data.contenu_genere !== null
        ? JSON.stringify(data.contenu_genere, null, 2)
        : null
  return (
    <article className="glass-thin" style={cardStyle}>
      <Header
        title={data.titre ?? title}
        subtitle={[data.pilier_nom, data.type_contenu].filter(Boolean).join(' · ') || 'Post'}
      />
      {data.date_prevue ? (
        <p style={metaStyle}>Publié le {data.date_prevue}</p>
      ) : null}
      {content ? (
        <pre
          style={{
            margin: 0,
            padding: '14px 16px',
            borderRadius: 12,
            background: 'rgba(0, 0, 0, 0.03)',
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--color-label)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {content}
        </pre>
      ) : (
        <p style={pStyle}>Pas de contenu généré disponible.</p>
      )}
      {data.retombees ? (
        <section style={{ marginTop: 12 }}>
          <h3 style={sectionHeaderStyle}>Retombées</h3>
          <p style={pStyle}>{data.retombees}</p>
        </section>
      ) : null}
    </article>
  )
}

// Sprint 40 Phase 2B — ConversationSection retiré (Conseiller V1 dégagé Blocs 1-9).

// ── Review ───────────────────────────────────────────────────────────────

function ReviewSection({ data, title }: { data: ReviewData; title: string }) {
  const factCheck = Array.isArray(data.fact_check_payload)
    ? (data.fact_check_payload as FactCheckItem[])
    : []
  const credit =
    data.visual_credit_payload && typeof data.visual_credit_payload === 'object'
      ? (data.visual_credit_payload as VisualCredit)
      : null
  return (
    <article className="glass-thin" style={cardStyle}>
      <Header title={title} subtitle="Review" />
      <section>
        <h3 style={sectionHeaderStyle}>Fact-check texte</h3>
        {factCheck.length === 0 ? (
          <p style={pStyle}>Aucune affirmation vérifiée.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {factCheck.map((it, i) => (
              <li key={i} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.03)' }}>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--color-label)' }}>{it.statement}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--color-tertiary-label)' }}>
                  {it.status}
                  {it.suggested_source ? ` · ${it.suggested_source}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      {credit ? (
        <section>
          <h3 style={sectionHeaderStyle}>Crédit visuel</h3>
          <dl style={dlStyle}>
            <dt style={dtStyle}>Auteur</dt>
            <dd style={ddStyle}>{credit.auteur}</dd>
            <dt style={dtStyle}>Archive</dt>
            <dd style={ddStyle}>{credit.archive}</dd>
            <dt style={dtStyle}>Année</dt>
            <dd style={ddStyle}>{credit.annee}</dd>
            <dt style={dtStyle}>Licence</dt>
            <dd style={ddStyle}>{credit.licence}</dd>
          </dl>
        </section>
      ) : null}
      {data.ready_to_paste_credit ? (
        <section>
          <h3 style={sectionHeaderStyle}>Crédit prêt à coller</h3>
          <code
            style={{
              display: 'block',
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(0, 0, 0, 0.04)',
              fontFamily: 'var(--font-mono, ui-monospace, monospace)',
              fontSize: 13,
              color: 'var(--color-label)',
              wordBreak: 'break-word',
            }}
          >
            {data.ready_to_paste_credit}
          </code>
        </section>
      ) : null}
    </article>
  )
}

// ── Programme ────────────────────────────────────────────────────────────

function ProgrammeSection({
  data,
  title,
}: {
  data: ProgrammeData
  title: string
}) {
  const arc = data.arc_narratif as { semaines?: Array<{ theme?: string; posts?: unknown }> } | null
  const semaines = arc?.semaines ?? []
  return (
    <article className="glass-thin" style={cardStyle}>
      <Header
        title={title}
        subtitle={
          data.date_debut && data.date_fin
            ? `${data.date_debut} → ${data.date_fin}`
            : 'Programme'
        }
      />
      {semaines.length === 0 ? (
        <p style={pStyle}>Pas de semaines dans l&apos;arc narratif.</p>
      ) : (
        <ol
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {semaines.map((sem, i) => (
            <li
              key={i}
              style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.03)' }}
            >
              <span style={{ fontSize: 12, color: 'var(--color-tertiary-label)' }}>
                Semaine {i + 1}
              </span>
              <p style={{ margin: '2px 0 0 0', fontSize: 14, color: 'var(--color-label)' }}>
                {sem.theme ?? '—'}
              </p>
            </li>
          ))}
        </ol>
      )}
    </article>
  )
}

// ── Atoms ────────────────────────────────────────────────────────────────

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {subtitle ? (
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
          {subtitle}
        </span>
      ) : null}
      <h2
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 20,
          fontWeight: 600,
          color: 'var(--color-label)',
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {title}
      </h2>
    </header>
  )
}

const cardStyle: React.CSSProperties = {
  borderRadius: 16,
  padding: '24px 26px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
}

const pStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-system)',
  fontSize: 14,
  lineHeight: 1.6,
  color: 'var(--color-secondary-label)',
}

const metaStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: 'var(--font-system)',
  fontSize: 12,
  color: 'var(--color-tertiary-label)',
}

const sectionHeaderStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-tertiary-label)',
  margin: '0 0 10px 0',
}

const dlStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'max-content 1fr',
  gap: '6px 16px',
  margin: 0,
}

const dtStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--color-tertiary-label)',
}

const ddStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 14,
  color: 'var(--color-label)',
  margin: 0,
}
