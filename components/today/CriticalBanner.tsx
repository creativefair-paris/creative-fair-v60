// Sprint 36.G — Zone Critique full-width pour /aujourd-hui.
//
// Si pas d'alerte active : retourne null (n'occupe pas d'espace).
// Sinon : bandeau orange sobre full-width au-dessus du Split Brief.

export type Alert = {
  id: string
  severity: 'critical' | 'warning'
  message: string
  source: string
}

type Props = {
  alerts: Alert[]
}

export function CriticalBanner({ alerts }: Props) {
  if (!alerts || alerts.length === 0) return null

  // Plusieurs alertes : la première en exergue, mention "+N" si plus.
  const first = alerts[0]!
  const extra = alerts.length - 1
  const isCritical = first.severity === 'critical'

  return (
    <aside
      role="alert"
      aria-live="polite"
      style={{
        width: '100%',
        marginBottom: 24,
        padding: '14px 20px',
        borderRadius: 12,
        background: isCritical ? 'rgba(215, 0, 21, 0.06)' : 'rgba(255, 149, 0, 0.06)',
        border: `1px solid ${isCritical ? 'rgba(215, 0, 21, 0.15)' : 'rgba(255, 149, 0, 0.18)'}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        fontFamily: 'var(--font-system)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          marginTop: 1,
          width: 8,
          height: 8,
          borderRadius: 4,
          background: isCritical ? '#D70015' : '#FF9500',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: isCritical ? '#D70015' : '#B86E00',
          }}
        >
          {first.source}
        </span>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#1C1C1E', lineHeight: 1.45 }}>
          {first.message}
        </span>
        {extra > 0 ? (
          <span
            style={{
              fontSize: 12,
              fontWeight: 400,
              color: 'rgba(0,0,0,0.55)',
              marginTop: 2,
            }}
          >
            {extra} {extra === 1 ? 'autre signal' : 'autres signaux'} actifs
          </span>
        ) : null}
      </div>
    </aside>
  )
}
