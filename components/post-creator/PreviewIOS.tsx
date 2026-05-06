import type { PostDraft } from '@/types/post-draft'

type Props = {
  draft: PostDraft
  brandName?: string
}

// Mockup iPhone sobre, sans image PNG. Outline + zones.
// Mis à jour à chaque changement de draft (rendu côté client).
export function PreviewIOS({ draft, brandName = 'ta marque' }: Props) {
  const captionLines = (draft.caption ?? '').split('\n').slice(0, 3)
  const hashtags = draft.hashtags ?? []

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="relative w-full max-w-[320px] aspect-[9/19.5] flex flex-col"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: '36px',
          overflow: 'hidden',
        }}
      >
        <div
          className="px-3 py-2 flex items-center justify-between"
          style={{
            borderBottom: '1px solid #EEEEEE',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-7 h-7 rounded-full inline-block"
              style={{ backgroundColor: '#EEEEEE' }}
            />
            <span
              className="text-xs font-semibold truncate"
              style={{ color: '#262626', fontFamily: 'var(--font-body)' }}
            >
              {brandName}
            </span>
          </div>
          <span
            className="text-xs"
            style={{ color: '#8E8E8E', fontFamily: 'var(--font-body)' }}
          >
            ···
          </span>
        </div>

        <div
          className="aspect-square w-full flex items-center justify-center"
          style={{ backgroundColor: '#F2F2F2' }}
        >
          <p
            className="text-xs"
            style={{ color: '#8E8E8E', fontFamily: 'var(--font-body)' }}
          >
            Visuel à préparer
          </p>
        </div>

        <div className="flex-1 px-3 py-2 space-y-2 overflow-hidden">
          {draft.hook ? (
            <p
              className="text-xs font-semibold leading-snug"
              style={{ color: '#262626', fontFamily: 'var(--font-body)' }}
            >
              {draft.hook}
            </p>
          ) : (
            <p
              className="text-xs"
              style={{ color: '#8E8E8E', fontFamily: 'var(--font-body)' }}
            >
              Le hook apparaîtra ici.
            </p>
          )}

          {captionLines.length > 0 && captionLines[0] && (
            <p
              className="text-[11px] leading-snug line-clamp-3"
              style={{ color: '#262626', fontFamily: 'var(--font-body)' }}
            >
              {captionLines.join('\n')}
            </p>
          )}

          {hashtags.length > 0 && (
            <p
              className="text-[11px] leading-snug"
              style={{ color: '#385898', fontFamily: 'var(--font-body)' }}
            >
              {hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}
            </p>
          )}
        </div>
      </div>

      <p
        className="text-[10px] mt-3"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
      >
        Aperçu indicatif Instagram
      </p>
    </div>
  )
}
