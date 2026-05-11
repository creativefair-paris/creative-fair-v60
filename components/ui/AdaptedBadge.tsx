type Props = {
  context: string
  type?: 'coaching' | 'post'
}

// Badge discret — rend visible que Creative Fair s'appuie sur le brand book
// et le calendrier business du tenant. Pilier transparence radicale.
export function AdaptedBadge({ context, type = 'coaching' }: Props) {
  const prefix =
    type === 'coaching' ? 'Adapté à ton calendrier' : 'Adapté à ta voix'

  return (
    <p
      className="text-xs"
      style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
    >
      {prefix} · {context}
    </p>
  )
}
