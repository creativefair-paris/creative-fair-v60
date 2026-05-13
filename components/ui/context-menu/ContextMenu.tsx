// Sprint 36.G — Menu contextuel réutilisable (desktop + mobile).
//
// Desktop : trigger = bouton "..." rendu par le parent, qui passe
// onOpen au clic. Ce composant ContextMenu rend le menu ouvert.
//
// Mobile : trigger = long-press géré par le parent via use-long-press.
//
// Le menu est positionné en absolute, par défaut sous le trigger
// (anchor 'below'). Click outside ferme. Echap ferme.

'use client'

import { useEffect, useRef } from 'react'

export type ContextMenuItem =
  | { kind: 'action'; label: string; onActivate: () => void; destructive?: boolean }
  | { kind: 'separator' }

type Props = {
  items: ContextMenuItem[]
  onClose: () => void
  // Position du menu : { top, left } en px, relatif au viewport (calculé
  // par le parent à partir de la bounding box du trigger).
  anchor: { top: number; left: number }
}

export function ContextMenu({ items, onClose, anchor }: Props) {
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Close on outside click + Escape.
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      role="menu"
      style={{
        position: 'fixed',
        top: anchor.top,
        left: anchor.left,
        zIndex: 1000,
        minWidth: 220,
        padding: 6,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        fontFamily: 'var(--font-system)',
        animation: 'cfs-context-menu-in 180ms ease-out both',
      }}
    >
      <style>{`
        @keyframes cfs-context-menu-in {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="menu"] { animation: none !important; }
        }
      `}</style>
      {items.map((item, idx) => {
        if (item.kind === 'separator') {
          return (
            <div
              key={`sep-${idx}`}
              role="separator"
              aria-hidden="true"
              style={{
                height: 1,
                margin: '4px 6px',
                background: 'rgba(0,0,0,0.06)',
              }}
            />
          )
        }
        return (
          <button
            key={`a-${idx}-${item.label}`}
            type="button"
            role="menuitem"
            onClick={() => {
              item.onActivate()
              onClose()
            }}
            style={{
              all: 'unset',
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              color: item.destructive ? '#D70015' : '#1C1C1E',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.04)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            }}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
