// Sprint 36.C — Label uppercase utilisé comme titre de section (iOS Settings).

import type { ReactNode } from 'react'

type Props = { children: ReactNode }

export function SectionLabel({ children }: Props) {
  return (
    <h2
      style={{
        fontFamily: 'var(--font-system)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'rgba(0,0,0,0.55)',
        margin: 0,
        marginBottom: 12,
      }}
    >
      {children}
    </h2>
  )
}
