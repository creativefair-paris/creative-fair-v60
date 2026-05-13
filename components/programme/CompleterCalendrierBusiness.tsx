// Sprint 37.B (F17) — CTA "Compléter mon calendrier business" sur /programme.
//
// Affiché sous les CTAs primaire/secondaires de ConseillerAccess quand
// le calendrier business du tenant n'a pas d'événements dans les 90
// prochains jours. Le conseiller a besoin de ces ancres pour adapter
// le plan ; sans elles, A1/A2 sont en pilotage à vue.

import Link from 'next/link'

export function CompleterCalendrierBusiness() {
  return (
    <section
      aria-label="Compléter le calendrier business"
      className="glass-thin"
      style={{
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        border: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 9,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#007AFF',
          background: 'rgba(0, 122, 255, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 9 L21 9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 3 L8 7 M16 3 L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <div style={{ flex: 1, minWidth: 220 }}>
        <h3
          style={{
            margin: 0,
            fontFamily: 'var(--font-system)',
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--color-label)',
            lineHeight: 1.4,
          }}
        >
          Compléter mon calendrier business
        </h3>
        <p
          style={{
            margin: '4px 0 0 0',
            fontFamily: 'var(--font-system)',
            fontSize: 13,
            lineHeight: 1.5,
            color: 'var(--color-secondary-label)',
          }}
        >
          Ajoute tes événements à venir pour que le conseiller adapte ton plan.
        </p>
      </div>
      <Link
        href="/ma-marque?section=calendrier-business"
        className="btn-choice btn-choice-sm"
        style={{
          textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        Compléter →
      </Link>
    </section>
  )
}
