// Sprint 36.G — Layout Split Brief 40/60 canonique.
//
// Pattern central de la doctrine v60 pour les pages denses : colonne
// gauche (contexte du pilote, 40%), colonne droite (le faire, 60%).
// Mobile < 768px : passage en single column, ordre selon mobileOrder.

import type { ReactNode } from 'react'

type Props = {
  leftColumn: ReactNode
  rightColumn: ReactNode
  // Sur mobile, ordre d'apparition des 2 colonnes. Défaut 'right-first'
  // car la colonne droite contient "le faire" prioritaire dans la
  // doctrine "Tranquillité du pilote".
  mobileOrder?: 'right-first' | 'left-first'
}

export function SplitBrief({ leftColumn, rightColumn, mobileOrder = 'right-first' }: Props) {
  return (
    <div className="cfs-split-brief">
      <div className="cfs-split-brief-left">{leftColumn}</div>
      <div className="cfs-split-brief-right">{rightColumn}</div>

      <style>{`
        .cfs-split-brief {
          display: grid;
          grid-template-columns: 40% 60%;
          gap: 40px;
          width: 100%;
        }
        .cfs-split-brief-left,
        .cfs-split-brief-right {
          min-width: 0;
        }
        @media (max-width: 1023px) {
          .cfs-split-brief {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          ${mobileOrder === 'right-first'
            ? `
            .cfs-split-brief-left { order: 2; }
            .cfs-split-brief-right { order: 1; }
            `
            : `
            .cfs-split-brief-left { order: 1; }
            .cfs-split-brief-right { order: 2; }
            `}
        }
      `}</style>
    </div>
  )
}
