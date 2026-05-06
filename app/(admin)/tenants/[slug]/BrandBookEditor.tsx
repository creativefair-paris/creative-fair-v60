'use client'

import { useState, useTransition } from 'react'
import type { BrandBook } from '@/types/brand-book'
import { updateTenantBrandBook } from '../actions'

const EMPTY_BRAND_BOOK: BrandBook = {
  identity: { name: '', domain: '', tagline: '', description: '', history: '' },
  voice: { tone: [], register: 'mixed', forbiddenWords: [], encouragedWords: [], sentenceStyle: '' },
  audience: { personas: [], aspirational: '' },
  territories: [],
  visual: { colors: [], fonts: [], references: [] },
  taboos: [],
  goals: { primary: '', instagram: '' },
}

type Props = {
  slug: string
  initialBrandBook: BrandBook | null
}

export function BrandBookEditor({ slug, initialBrandBook }: Props) {
  const [json, setJson] = useState(() =>
    JSON.stringify(initialBrandBook ?? EMPTY_BRAND_BOOK, null, 2),
  )
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  const onSave = () => {
    setError(null)
    setSaved(false)
    let parsed: BrandBook
    try {
      parsed = JSON.parse(json) as BrandBook
    } catch {
      setError('JSON invalide. Vérifiez la syntaxe.')
      return
    }
    if (!parsed.identity || !parsed.voice || !parsed.audience) {
      setError('Structure invalide. Champs identity, voice, audience requis.')
      return
    }
    startTransition(async () => {
      try {
        await updateTenantBrandBook(slug, parsed)
        setSaved(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur')
      }
    })
  }

  const onFormat = () => {
    try {
      const parsed = JSON.parse(json)
      setJson(JSON.stringify(parsed, null, 2))
      setError(null)
    } catch {
      setError('Impossible de reformater : JSON invalide.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: '#A8A39A' }}>
          Édition JSON brute. Marque comme « complet » lors de l&apos;enregistrement.
        </p>
        <button
          type="button"
          onClick={onFormat}
          className="text-xs underline transition-opacity hover:opacity-80"
          style={{ color: '#A8A39A' }}
        >
          Reformater
        </button>
      </div>

      <textarea
        value={json}
        onChange={(e) => {
          setJson(e.target.value)
          setSaved(false)
        }}
        rows={28}
        className="w-full px-3 py-2 rounded-md text-xs font-mono"
        style={{
          backgroundColor: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#E8E6E1',
          lineHeight: 1.6,
        }}
        spellCheck={false}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium rounded-md transition-opacity disabled:opacity-50"
          style={{ backgroundColor: '#E8E6E1', color: '#13171B' }}
        >
          {isPending ? 'Enregistrement…' : 'Enregistrer brand book'}
        </button>
        {saved && (
          <span className="text-xs" style={{ color: '#7EBF8A' }}>
            Brand book enregistré.
          </span>
        )}
        {error && (
          <span className="text-xs" style={{ color: '#E89090' }}>
            {error}
          </span>
        )}
      </div>
    </div>
  )
}
