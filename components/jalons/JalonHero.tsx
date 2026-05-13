// Sprint 37.C (F26) — Hero card affiché sur /aujourd-hui quand le pilote
// n'a pas encore atteint le jalon "production" (les 3 étapes).
//
// Jalon "marque" : "Commence par poser ta marque." + CTA → onboarding.
// Jalon "programme" : "Crée ton premier programme." + CTA → wizard.
//
// Anti-paternalisme : le hero remplace le dashboard quand le jalon n'est
// pas atteint. Le pilote n'est pas bloqué : il peut toujours naviguer
// via le menu, mais le focus est mis sur la prochaine action structurante.

import Link from 'next/link'
import type { JalonState } from '@/lib/jalons/check-jalons'

type JalonHeroProps = {
  jalon: Extract<JalonState, 'marque' | 'programme'>
}

const CONTENT: Record<JalonHeroProps['jalon'], {
  headline: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
}> = {
  marque: {
    headline: 'Commence par poser ta marque.',
    subtitle: "Le conseiller a besoin de te connaître pour t'accompagner.",
    ctaLabel: 'Poser ma marque →',
    ctaHref: '/ma-marque?onboarding=true',
  },
  programme: {
    headline: 'Crée ton premier programme.',
    subtitle: "Le conseiller construit avec toi un plan éditorial sur la période de ton choix.",
    ctaLabel: 'Créer Mon Programme →',
    ctaHref: '/programme?action=create-plan',
  },
}

export function JalonHero({ jalon }: JalonHeroProps) {
  const { headline, subtitle, ctaLabel, ctaHref } = CONTENT[jalon]

  return (
    <section
      className="glass-regular cfs-stagger cfs-stagger-1"
      aria-label="Prochaine étape"
      style={{
        borderRadius: 20,
        padding: '40px 40px 36px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        alignItems: 'flex-start',
        background:
          'linear-gradient(135deg, rgba(0, 122, 255, 0.06), rgba(88, 86, 214, 0.04))',
        border: '1px solid rgba(0, 122, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--color-label)',
          margin: 0,
          lineHeight: 1.15,
        }}
      >
        {headline}
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 16,
          lineHeight: 1.5,
          color: 'var(--color-secondary-label)',
          margin: 0,
          maxWidth: 540,
        }}
      >
        {subtitle}
      </p>
      <Link
        href={ctaHref}
        className="btn-primary"
        style={{
          marginTop: 8,
          textDecoration: 'none',
        }}
      >
        {ctaLabel}
      </Link>
    </section>
  )
}
