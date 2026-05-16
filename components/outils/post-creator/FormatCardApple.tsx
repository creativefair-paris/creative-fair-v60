// Sprint 37.J (F82) — Revert vers une version sobre Apple.
//
// Subtraction over addition : suppression des 4 designs distincts Sprint
// 37.I F80 (papier velin / atelier / save-the-date / brutaliste) trop
// chargés au regard de la doctrine "tranquillité du pilote dans le contrôle".
//
// Pattern unique : carte uniforme avec icône Lucide + label + description
// + flèche. La couleur du format reste en accent (15% opacity sur le carré
// d'icône uniquement), pas en background dominant.

import Link from 'next/link'
import { BookOpen, Package, Calendar, Megaphone, MessageCircle, Camera } from 'lucide-react'
import {
  FORMAT_COLORS,
  FORMAT_LABELS,
  FORMAT_DESCRIPTIONS,
  type FormatSlug,
} from '@/lib/i18n/formats'

type IconComponent = typeof BookOpen

const FORMAT_ICONS: Record<FormatSlug, IconComponent> = {
  anecdote: BookOpen,
  produit: Package,
  evenement: Calendar,
  manifeste: Megaphone,
  question: MessageCircle,
  coulisses: Camera,
}

type Props = {
  format: FormatSlug
  // Override optionnel (sinon lecture i18n FR par défaut).
  label?: string
  description?: string
  href?: string
  disabled?: boolean
}

export function FormatCardApple({ format, label, description, href, disabled }: Props) {
  const Icon = FORMAT_ICONS[format]
  const color = FORMAT_COLORS[format]
  const finalLabel = label ?? FORMAT_LABELS[format].fr
  const finalDescription = description ?? FORMAT_DESCRIPTIONS[format].fr

  const card = (
    <div className={`fcc${disabled ? ' is-disabled' : ''}`}>
      <span
        className="fcc__icon"
        aria-hidden="true"
        style={{ background: `${color}26` /* hex 0x26 ≈ 15% opacity */ }}
      >
        <Icon size={20} color={color} strokeWidth={2} />
      </span>
      <span className="fcc__body">
        <span className="fcc__label">{finalLabel}</span>
        <span className="fcc__description">{finalDescription}</span>
      </span>
      {disabled ? (
        <span className="fcc__tag">BIENTÔT</span>
      ) : (
        <span className="fcc__arrow" aria-hidden="true">→</span>
      )}
      <FormatCardStyles />
    </div>
  )

  if (disabled || !href) {
    return (
      <div className="fcc-wrapper" aria-disabled={disabled ? 'true' : undefined}>
        {card}
      </div>
    )
  }
  return (
    <Link href={href} className="fcc-wrapper">
      {card}
    </Link>
  )
}

function FormatCardStyles() {
  return (
    <style>{`
      .fcc-wrapper {
        display: block;
        text-decoration: none;
        color: inherit;
      }
      .fcc-wrapper[aria-disabled="true"] {
        cursor: not-allowed;
      }
      .fcc {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 16px;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(20px) saturate(1.4);
        -webkit-backdrop-filter: blur(20px) saturate(1.4);
        border: 1px solid rgba(0, 0, 0, 0.06);
        border-radius: 12px;
        transition: transform 200ms cubic-bezier(0.32, 0.72, 0, 1),
                    box-shadow 200ms,
                    background 200ms;
        cursor: pointer;
      }
      .fcc-wrapper:hover .fcc:not(.is-disabled) {
        transform: translateY(-1px);
        background: rgba(255, 255, 255, 0.9);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      }
      .fcc.is-disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .fcc__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 9px;
        flex-shrink: 0;
      }
      .fcc__body {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .fcc__label {
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui;
        font-size: 15px;
        font-weight: 600;
        line-height: 1.3;
        color: rgba(0, 0, 0, 0.88);
        letter-spacing: -0.1px;
      }
      .fcc__description {
        font-family: -apple-system, system-ui;
        font-size: 13px;
        font-weight: 400;
        line-height: 1.4;
        color: rgba(0, 0, 0, 0.55);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .fcc__arrow {
        font-size: 16px;
        color: rgba(0, 0, 0, 0.3);
        flex-shrink: 0;
        transition: transform 200ms ease-out, color 200ms ease-out;
      }
      .fcc-wrapper:hover .fcc:not(.is-disabled) .fcc__arrow {
        transform: translateX(3px);
        color: rgba(0, 0, 0, 0.55);
      }
      .fcc__tag {
        font-family: -apple-system, system-ui;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: rgba(0, 0, 0, 0.4);
        background: rgba(0, 0, 0, 0.04);
        padding: 4px 8px;
        border-radius: 5px;
        flex-shrink: 0;
      }
      @media (prefers-reduced-motion: reduce) {
        .fcc, .fcc__arrow { transition: none !important; transform: none !important; }
      }
    `}</style>
  )
}
