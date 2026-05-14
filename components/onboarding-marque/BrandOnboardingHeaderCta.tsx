// Sprint 37.D (F35a) — Bouton header /ma-marque pour lancer l'onboarding
// guidé. Optionnel : la page native reste éditable directement, le wizard
// est UN chemin parmi d'autres. Détecte la présence d'une session
// IN_PROGRESS pour adapter le label ('Reprendre' vs 'Lancer').

'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  hasResumable: boolean
}

export function BrandOnboardingHeaderCta({ hasResumable }: Props) {
  const router = useRouter()

  const handleClick = useCallback(() => {
    // Sprint 37.F (F60a) — Double trigger pour robustesse :
    // 1. CustomEvent qui force le BrandOnboardingTrigger à re-render
    //    immédiatement (cas où useSearchParams n'est pas réactif).
    // 2. URL push qui permet de partager le lien direct + back history.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cfs-open-brand-onboarding'))
    }
    router.push('/ma-marque?onboarding=true')
  }, [router])

  return (
    <button
      type="button"
      onClick={handleClick}
      className="btn-choice"
      style={{
        padding: '10px 16px',
        background: 'rgba(0, 122, 255, 0.06)',
        borderColor: 'rgba(0, 122, 255, 0.18)',
        color: '#007AFF',
        fontFamily: 'var(--font-system)',
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      {hasResumable
        ? "Reprendre l'onboarding guidé →"
        : 'Lancer un onboarding guidé →'}
    </button>
  )
}
