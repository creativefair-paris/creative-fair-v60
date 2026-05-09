// Stub Sprint 32.5 — implémentation Sprint 36 (§2.5 + §8.8)

type PlugToPostProps = {
  open: boolean
  artefact?: { kind: 'image' | 'text'; preview: string }
}

export function PlugToPost({ open }: PlugToPostProps) {
  if (!open) return null
  return (
    <div role="dialog" aria-modal="true" aria-label="Utiliser dans">
      <h2>Utiliser dans :</h2>
    </div>
  )
}
