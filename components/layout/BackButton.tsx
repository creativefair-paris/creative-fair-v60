// Sprint 36.B.1 — BackButton réutilisable (glass-thin pill 44×44 chevron).
// Créé pour usage futur sur sous-routes (preferences, compte, post/[id]).
// Non rendu sur destinations racines (Mon Programme, Ma Marque, Mes Outils)
// pour respecter Apple HIG : pas de back là où il n'y a rien derrière.
'use client'

import { useRouter } from 'next/navigation'

type BackButtonProps = {
  href?: string
  ariaLabel?: string
}

export function BackButton({ href, ariaLabel }: BackButtonProps) {
  const router = useRouter()

  function handleClick() {
    if (href) {
      router.push(href)
      return
    }
    router.back()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel ?? 'Retour'}
      className="cfs-back-button glass-thin"
    >
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 3L5 8L10 13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
