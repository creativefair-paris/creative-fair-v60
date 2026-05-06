'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { deletePost } from '@/lib/posts/actions'

type Props = {
  postId: string
}

export function DeletePostButton({ postId }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  function onDelete() {
    startTransition(async () => {
      await deletePost(postId)
      router.push('/calendrier')
    })
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm underline transition-opacity hover:opacity-80"
        style={{
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
        }}
      >
        Supprimer
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <p
        className="text-xs"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
      >
        Confirmer ?
      </p>
      <button
        type="button"
        onClick={onDelete}
        disabled={isPending}
        className="px-3 py-1 text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{
          backgroundColor: '#9B2828',
          color: '#FFFFFF',
          borderRadius: 'var(--radius)',
          fontFamily: 'var(--font-body)',
        }}
      >
        Oui, supprimer
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs underline"
        style={{
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
        }}
      >
        Annuler
      </button>
    </div>
  )
}
