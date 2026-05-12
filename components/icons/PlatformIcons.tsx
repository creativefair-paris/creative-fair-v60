// Sprint 36.B.5 — Logos officiels des plateformes en SVG monochrome.
//
// Doctrine : c'est la forme qui dit la plateforme, pas la couleur de marque.
// Tous les paths sont reconnaissables (caméra IG, « in » LI, etc.) mais
// rendus en `currentColor` pour respecter la palette Apple.
//
// Pas de librairie tierce. Tous les SVG sont inlinés ici.

import type { CSSProperties } from 'react'

type Props = {
  className?: string
  style?: CSSProperties
  size?: number
  'aria-label'?: string
}

function base(size: number | undefined, style: CSSProperties | undefined): CSSProperties {
  return {
    width: size ?? 24,
    height: size ?? 24,
    color: 'currentColor',
    flexShrink: 0,
    ...style,
  }
}

// ── Canal principal V1 ───────────────────────────────────────────────

export function InstagramIcon({ className, style, size, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={base(size, style)}
      aria-label={rest['aria-label'] ?? 'Instagram'}
      role="img"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
    </svg>
  )
}

// ── Extensions V1 ────────────────────────────────────────────────────

export function LinkedInIcon({ className, style, size, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={base(size, style)}
      aria-label={rest['aria-label'] ?? 'LinkedIn'}
      role="img"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M7.5 10.5v6m0-8.7v.01m3.5 8.69V13c0-.9.7-1.5 1.6-1.5s1.6.6 1.6 1.5v3.5m0 0V13c0-.9.7-1.5 1.6-1.5s1.6.6 1.6 1.5v3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function NewsletterIcon({ className, style, size, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={base(size, style)}
      aria-label={rest['aria-label'] ?? 'Newsletter'}
      role="img"
    >
      <rect x="3" y="5.5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 7l8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function GlobeIcon({ className, style, size, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={base(size, style)}
      aria-label={rest['aria-label'] ?? 'Site web'}
      role="img"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function GoogleMyBusinessIcon({ className, style, size, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={base(size, style)}
      aria-label={rest['aria-label'] ?? 'Google My Business'}
      role="img"
    >
      <path
        d="M12 21s7-6.4 7-12a7 7 0 0 0-14 0c0 5.6 7 12 7 12z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

// ── Bientôt — V1+ ────────────────────────────────────────────────────

export function TikTokIcon({ className, style, size, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={base(size, style)}
      aria-label={rest['aria-label'] ?? 'TikTok'}
      role="img"
    >
      <path
        d="M13.5 3v11.2a2.8 2.8 0 1 1-2.8-2.8h.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 3c.3 1.6 1.4 3 3 3.6.7.3 1.5.4 2 .4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function XIcon({ className, style, size, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={base(size, style)}
      aria-label={rest['aria-label'] ?? 'X'}
      role="img"
    >
      <path
        d="M4 4l16 16M20 4L4 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function YouTubeIcon({ className, style, size, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={base(size, style)}
      aria-label={rest['aria-label'] ?? 'YouTube'}
      role="img"
    >
      <rect x="2.5" y="6.5" width="19" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 9.5v5l4-2.5-4-2.5z" fill="currentColor" />
    </svg>
  )
}

export function FacebookIcon({ className, style, size, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={base(size, style)}
      aria-label={rest['aria-label'] ?? 'Facebook'}
      role="img"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M13.5 21V13H16l.5-3h-3V8c0-.9.3-1.5 1.5-1.5H16.5V4a18 18 0 0 0-2.4-.1c-2.4 0-3.6 1.4-3.6 3.7V10H8.5v3h2v8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}
