// Sprint 37.L (F86.3) — Badge vérifié Meta forme "stamp" 8 pointes arrondies.
//
// PAS un simple cercle bleu — la forme officielle Meta combine 4 grandes
// pointes (top/right/bottom/left) + 4 petites pointes diagonales (corners),
// le tout arrondi. Fond #0095F6, checkmark blanc stroke 2px centré.
//
// Path inspiré du badge Meta officiel (approximation pixel-fidèle pour un
// mockup statique, ne tente pas de cloner le SVG breveté).

type Props = {
  size?: number
}

export function MetaVerifiedBadge({ size = 14 }: Props) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ flexShrink: 0, display: 'inline-block' }}
    >
      {/*
        Forme stamp : on combine deux carrés (un droit + un rotated 45°) avec
        des coins très arrondis. Le résultat visuel : 8 pointes arrondies
        (4 cardinales + 4 diagonales), proche du badge Meta officiel.
        Approche par compositing CSS via 2 paths SVG superposés.
      */}
      <g>
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="6"
          ry="6"
          fill="#0095F6"
        />
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="6"
          ry="6"
          fill="#0095F6"
          transform="rotate(45 12 12)"
        />
      </g>
      {/* Checkmark blanc centré, stroke 2px. */}
      <path
        d="M8.2 12.4 L10.8 15 L15.8 9.5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
