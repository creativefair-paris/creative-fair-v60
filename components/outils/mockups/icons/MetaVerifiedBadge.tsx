// Sprint 37.M (F86.3) — Badge vérifié Meta SVG officiel 8 lobes arrondis.
//
// Remplace l'approximation Sprint 37.L (2 rects à 45° → étoile carrée
// pointue). Forme stamp "scalloped" canonique Meta : 8 lobes arrondis
// distincts visibles dès 14px. Fond #0095F6, checkmark blanc centré.
//
// Path fourni par Lead (réplique pixel-près de la capture Instagram iOS
// mai 2026). NE PAS approximer — copier tel quel.

type Props = {
  size?: number
}

export function MetaVerifiedBadge({ size = 14 }: Props) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0, display: 'inline-block' }}
    >
      <path
        d="M19.998.32a3.464 3.464 0 0 1 2.453 1.016l1.61 1.611a3.473 3.473 0 0 0 2.453 1.016h2.278a3.469 3.469 0 0 1 3.469 3.469v2.278a3.473 3.473 0 0 0 1.016 2.453l1.61 1.61a3.469 3.469 0 0 1 0 4.906l-1.61 1.61a3.473 3.473 0 0 0-1.016 2.453v2.278a3.469 3.469 0 0 1-3.469 3.469h-2.278a3.473 3.473 0 0 0-2.453 1.016l-1.61 1.61a3.469 3.469 0 0 1-4.906 0l-1.61-1.61a3.473 3.473 0 0 0-2.453-1.016H11.21a3.469 3.469 0 0 1-3.469-3.469v-2.278a3.473 3.473 0 0 0-1.016-2.453l-1.61-1.61a3.469 3.469 0 0 1 0-4.906l1.61-1.61a3.473 3.473 0 0 0 1.016-2.453V7.432a3.469 3.469 0 0 1 3.469-3.469h2.278a3.473 3.473 0 0 0 2.453-1.016l1.61-1.611A3.464 3.464 0 0 1 19.998.32z"
        fill="#0095F6"
      />
      <path
        d="M27.114 14.114l-9.114 9.114-5.114-5.114 1.886-1.886 3.228 3.228 7.228-7.228 1.886 1.886z"
        fill="#FFFFFF"
      />
    </svg>
  )
}
