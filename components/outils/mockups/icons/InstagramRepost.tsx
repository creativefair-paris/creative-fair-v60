// Sprint 37.L (F86.3) — Icône repost Instagram (deux flèches courbes en cercle).
//
// PAS le `Repeat` Lucide (deux flèches parallèles droites) — Instagram utilise
// une icône custom où les flèches forment un cercle ouvert. SVG fidèle au
// rendu iOS mai 2026.

type Props = {
  size?: number
  stroke?: string
  strokeWidth?: number
}

export function InstagramRepost({ size = 24, stroke = '#000000', strokeWidth = 2 }: Props) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Arc supérieur : flèche partant de gauche, courbant vers la droite. */}
      <path d="M4 9 a8 8 0 0 1 14 -2" />
      <polyline points="14 4 18 7 15 11" />
      {/* Arc inférieur : flèche partant de droite, courbant vers la gauche. */}
      <path d="M20 15 a8 8 0 0 1 -14 2" />
      <polyline points="10 20 6 17 9 13" />
    </svg>
  )
}
