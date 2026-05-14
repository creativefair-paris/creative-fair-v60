// Sprint 37.I (F80) — 4 designs Apple-grade distincts par format.
//
// Plus de couleurs flat. Chaque format = identité visuelle propre :
// - ANECDOTE : bibliothèque ancienne, papier velin, serif italique bleu profond
// - PRODUIT : atelier, lumière chaude, sienne + vert sombre
// - ÉVÉNEMENT : save-the-date Hermès, bordure double + corner stamps
// - MANIFESTE : affiche brutaliste noir/blanc + barre rouge SF

import Link from 'next/link'
import type { ReactNode } from 'react'

type SupportedFormat = 'anecdote' | 'produit' | 'evenement' | 'manifeste'
type DisabledFormat = 'question' | 'coulisses'
type FormatLike = SupportedFormat | DisabledFormat

type Props = {
  format: FormatLike
  label: string
  description?: string
  href?: string
  disabled?: boolean
}

export function FormatCardApple({ format, label, description, href, disabled }: Props) {
  const isSupported = !disabled && (
    format === 'anecdote' || format === 'produit' ||
    format === 'evenement' || format === 'manifeste'
  )

  const inner = (
    <div className={`fca fca--${format}${disabled ? ' is-disabled' : ''}`}>
      {format === 'anecdote' ? <AnecdoteInner label={label} description={description} disabled={disabled} /> : null}
      {format === 'produit' ? <ProduitInner label={label} description={description} disabled={disabled} /> : null}
      {format === 'evenement' ? <EvenementInner label={label} description={description} disabled={disabled} /> : null}
      {format === 'manifeste' ? <ManifesteInner label={label} description={description} disabled={disabled} /> : null}
      {format === 'question' ? <QuestionInner label={label} description={description} /> : null}
      {format === 'coulisses' ? <CoulissesInner label={label} description={description} /> : null}
      {disabled ? <span className="fca__tag">BIENTÔT</span> : <span className="fca__arrow" aria-hidden="true">→</span>}
      <FormatCardStyles />
    </div>
  )

  if (!isSupported || disabled || !href) {
    return (
      <div aria-disabled="true" style={{ cursor: 'not-allowed' }}>
        {inner}
      </div>
    )
  }
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      {inner}
    </Link>
  )
}

// ── Inner par format ────────────────────────────────────────────────────

function InnerWrap({ children }: { children: ReactNode }) {
  return <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>{children}</div>
}

function AnecdoteInner({
  label,
  description,
}: { label: string; description?: string; disabled?: boolean }) {
  return (
    <>
      <div className="fca-anecdote__paper" aria-hidden="true" />
      <InnerWrap>
        <span
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 22,
            fontWeight: 500,
            color: '#003B6F',
            fontStyle: 'italic',
            letterSpacing: '0.5px',
            lineHeight: 1.1,
          }}
        >
          {label}
        </span>
        {description ? (
          <span
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 12,
              color: 'rgba(0, 59, 111, 0.7)',
              fontStyle: 'italic',
              lineHeight: 1.4,
            }}
          >
            {description}
          </span>
        ) : null}
      </InnerWrap>
    </>
  )
}

function ProduitInner({
  label,
  description,
}: { label: string; description?: string; disabled?: boolean }) {
  return (
    <>
      <div className="fca-produit__overlay" aria-hidden="true" />
      <InnerWrap>
        <span
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: 20,
            fontWeight: 600,
            color: '#1F4937',
            letterSpacing: '-0.3px',
            lineHeight: 1.15,
          }}
        >
          {label}
        </span>
        {description ? (
          <span
            style={{
              fontFamily: 'var(--font-system)',
              fontSize: 12,
              color: 'rgba(31, 73, 55, 0.75)',
              lineHeight: 1.45,
            }}
          >
            {description}
          </span>
        ) : null}
      </InnerWrap>
    </>
  )
}

function EvenementInner({
  label,
  description,
}: { label: string; description?: string; disabled?: boolean }) {
  return (
    <>
      <span className="fca-evt__stamp fca-evt__stamp--tl" aria-hidden="true" />
      <span className="fca-evt__stamp fca-evt__stamp--tr" aria-hidden="true" />
      <span className="fca-evt__stamp fca-evt__stamp--bl" aria-hidden="true" />
      <span className="fca-evt__stamp fca-evt__stamp--br" aria-hidden="true" />
      <InnerWrap>
        <span
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 18,
            fontWeight: 400,
            color: '#7A0E1A',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontStyle: 'italic',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {label}
        </span>
        {description ? (
          <span
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 11,
              color: 'rgba(122, 14, 26, 0.7)',
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              textAlign: 'center',
              lineHeight: 1.5,
              fontStyle: 'normal',
            }}
          >
            {description}
          </span>
        ) : null}
      </InnerWrap>
    </>
  )
}

function ManifesteInner({
  label,
  description,
}: { label: string; description?: string; disabled?: boolean }) {
  return (
    <>
      <InnerWrap>
        <span
          style={{
            fontFamily: 'Helvetica, "Helvetica Neue", Arial, system-ui',
            fontSize: 28,
            fontWeight: 900,
            color: '#000000',
            letterSpacing: '-1px',
            lineHeight: 0.95,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        {description ? (
          <span
            style={{
              fontFamily: 'Helvetica, "Helvetica Neue", Arial, system-ui',
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(0, 0, 0, 0.75)',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
              lineHeight: 1.45,
            }}
          >
            {description}
          </span>
        ) : null}
      </InnerWrap>
      <div className="fca-manifeste__bar" aria-hidden="true" />
    </>
  )
}

function QuestionInner({ label, description }: { label: string; description?: string }) {
  return (
    <InnerWrap>
      <span
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 20,
          fontWeight: 600,
          color: '#5856D6',
          letterSpacing: '-0.2px',
          lineHeight: 1.15,
        }}
      >
        {label}
      </span>
      {description ? (
        <span style={{ fontSize: 12, color: 'rgba(88, 86, 214, 0.7)', lineHeight: 1.45 }}>
          {description}
        </span>
      ) : null}
    </InnerWrap>
  )
}

function CoulissesInner({ label, description }: { label: string; description?: string }) {
  return (
    <InnerWrap>
      <span
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 20,
          fontWeight: 600,
          color: '#AF52DE',
          letterSpacing: '-0.2px',
          lineHeight: 1.15,
        }}
      >
        {label}
      </span>
      {description ? (
        <span style={{ fontSize: 12, color: 'rgba(175, 82, 222, 0.7)', lineHeight: 1.45 }}>
          {description}
        </span>
      ) : null}
    </InnerWrap>
  )
}

// ── Styles — 4 directions distinctes ────────────────────────────────────

function FormatCardStyles() {
  return (
    <style>{`
      .fca {
        position: relative;
        border-radius: 14px;
        overflow: hidden;
        cursor: pointer;
        min-height: 140px;
        display: flex;
        flex-direction: column;
        padding: 18px 20px;
        transition: transform 240ms cubic-bezier(0.32, 0.72, 0, 1), box-shadow 240ms cubic-bezier(0.32, 0.72, 0, 1);
      }
      .fca:not(.is-disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
      }
      .fca.is-disabled {
        opacity: 0.55;
      }
      .fca__arrow {
        position: absolute;
        bottom: 14px;
        right: 18px;
        font-size: 18px;
        opacity: 0.4;
        transition: transform 200ms ease-out, opacity 200ms ease-out;
        z-index: 2;
      }
      .fca:not(.is-disabled):hover .fca__arrow {
        transform: translateX(4px);
        opacity: 0.75;
      }
      .fca__tag {
        position: absolute;
        bottom: 14px;
        right: 18px;
        font-family: var(--font-system);
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: rgba(0, 0, 0, 0.45);
        background: rgba(0, 0, 0, 0.05);
        padding: 3px 7px;
        border-radius: 4px;
        z-index: 2;
      }

      /* ── ANECDOTE — bibliothèque ancienne ── */
      .fca--anecdote {
        background: linear-gradient(135deg, #F8F4ED 0%, #F0E8D8 100%);
        border: 1px solid rgba(0, 59, 111, 0.12);
      }
      .fca-anecdote__paper {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.5) 0%, transparent 60%),
          radial-gradient(ellipse at bottom right, rgba(0, 59, 111, 0.04) 0%, transparent 60%);
        pointer-events: none;
      }

      /* ── PRODUIT — atelier, lumière chaude ── */
      .fca--produit {
        background: linear-gradient(135deg, #F5EFE8 0%, #E8DCC8 55%, #D4C4A8 100%);
        border: 1px solid rgba(31, 73, 55, 0.16);
      }
      .fca-produit__overlay {
        position: absolute;
        top: -30%;
        right: -20%;
        width: 220px;
        height: 220px;
        background: radial-gradient(circle, rgba(255, 200, 130, 0.2) 0%, transparent 70%);
        pointer-events: none;
      }

      /* ── ÉVÉNEMENT — save-the-date Hermès ── */
      .fca--evenement {
        background: #F8F4ED;
        border: 2px double rgba(122, 14, 26, 0.35);
        text-align: center;
        align-items: center;
        justify-content: center;
      }
      .fca-evt__stamp {
        position: absolute;
        width: 12px;
        height: 12px;
        border: 1px solid rgba(122, 14, 26, 0.4);
        z-index: 1;
      }
      .fca-evt__stamp--tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }
      .fca-evt__stamp--tr { top: 8px; right: 8px; border-left: none; border-bottom: none; }
      .fca-evt__stamp--bl { bottom: 8px; left: 8px; border-right: none; border-top: none; }
      .fca-evt__stamp--br { bottom: 8px; right: 8px; border-left: none; border-top: none; }
      .fca--evenement .fca__arrow,
      .fca--evenement .fca__tag {
        bottom: 4px;
        right: 4px;
      }

      /* ── MANIFESTE — affiche brutaliste ── */
      .fca--manifeste {
        background: #FAFAFA;
        border: 1px solid rgba(0, 0, 0, 0.85);
      }
      .fca-manifeste__bar {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 4px;
        width: 60%;
        background: #FF3B30;
      }
      .fca--manifeste .fca__arrow {
        color: #000;
        font-weight: 900;
        opacity: 0.6;
      }

      /* ── À VENIR : Question + Coulisses (placeholders pâles) ── */
      .fca--question {
        background: linear-gradient(135deg, rgba(88, 86, 214, 0.06) 0%, rgba(88, 86, 214, 0.02) 100%);
        border: 1px solid rgba(88, 86, 214, 0.16);
      }
      .fca--coulisses {
        background: linear-gradient(135deg, rgba(175, 82, 222, 0.06) 0%, rgba(175, 82, 222, 0.02) 100%);
        border: 1px solid rgba(175, 82, 222, 0.16);
      }

      @media (prefers-reduced-motion: reduce) {
        .fca, .fca__arrow { transition: none !important; transform: none !important; }
      }
    `}</style>
  )
}
