// Sprint 33 §8.8 — Plug-to-post sheet (glass-thick)
'use client'

import { Sheet } from './Sheet'

type PlugToPostProps = {
  open: boolean
  onDismiss?: () => void
  artefact?: { kind: 'image' | 'text'; preview: string }
}

export function PlugToPost({ open, onDismiss }: PlugToPostProps) {
  return (
    <Sheet open={open} title="Utiliser dans :" onDismiss={onDismiss}>
      <div role="list">
        {/* Stub Sprint 33 — items rendus par les Sprints 35-36 (programme + outils livrés). */}
      </div>
    </Sheet>
  )
}
