'use client'

import { useState, useTransition } from 'react'
import { updateTenantTheme, type ThemePayload } from '../actions'

type Props = {
  slug: string
  initialTheme: ThemePayload
}

const COLOR_FIELDS: { key: keyof ThemePayload['colors']; label: string }[] = [
  { key: 'background', label: 'Fond principal' },
  { key: 'surface', label: 'Surface (cartes)' },
  { key: 'text', label: 'Texte principal' },
  { key: 'textMuted', label: 'Texte secondaire' },
  { key: 'border', label: 'Bordures' },
  { key: 'accent', label: 'Accent' },
  { key: 'accentForeground', label: 'Texte sur accent' },
]

export function ThemeEditor({ slug, initialTheme }: Props) {
  const [theme, setTheme] = useState<ThemePayload>(initialTheme)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const updateColor = (key: keyof ThemePayload['colors'], value: string) => {
    setTheme({ ...theme, colors: { ...theme.colors, [key]: value } })
    setSaved(false)
  }

  const updateFont = (key: keyof ThemePayload['fonts'], value: string) => {
    setTheme({ ...theme, fonts: { ...theme.fonts, [key]: value } })
    setSaved(false)
  }

  const onSave = () => {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      try {
        await updateTenantTheme(slug, theme)
        setSaved(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur')
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-5">
        <h2 className="text-sm font-medium" style={{ color: '#E8E6E1' }}>
          Couleurs
        </h2>
        {COLOR_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-xs font-medium mb-2" style={{ color: '#A8A39A' }}>
              {label}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={theme.colors[key]}
                onChange={(e) => updateColor(key, e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <input
                type="text"
                value={theme.colors[key]}
                onChange={(e) => updateColor(key, e.target.value)}
                className="flex-1 px-3 py-2 rounded-md text-sm font-mono"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#E8E6E1',
                }}
              />
            </div>
          </div>
        ))}

        <div className="pt-4">
          <h2 className="text-sm font-medium mb-3" style={{ color: '#E8E6E1' }}>
            Typographie
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#A8A39A' }}>
                Police de titre
              </label>
              <input
                type="text"
                value={theme.fonts.display}
                onChange={(e) => updateFont('display', e.target.value)}
                className="w-full px-3 py-2 rounded-md text-sm font-mono"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#E8E6E1',
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#A8A39A' }}>
                Police de texte
              </label>
              <input
                type="text"
                value={theme.fonts.body}
                onChange={(e) => updateFont('body', e.target.value)}
                className="w-full px-3 py-2 rounded-md text-sm font-mono"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#E8E6E1',
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={onSave}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium rounded-md transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#E8E6E1', color: '#13171B' }}
          >
            {isPending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          {saved && (
            <span className="text-xs" style={{ color: '#7EBF8A' }}>
              Thème enregistré.
            </span>
          )}
          {error && (
            <span className="text-xs" style={{ color: '#E89090' }}>
              {error}
            </span>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium mb-3" style={{ color: '#E8E6E1' }}>
          Aperçu
        </h2>
        <div
          className="rounded-lg p-6"
          style={{
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            fontFamily: theme.fonts.body,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <h3
            className="text-2xl mb-2"
            style={{ fontFamily: theme.fonts.display, color: theme.colors.text }}
          >
            Aujourd&apos;hui
          </h3>
          <p className="text-sm mb-6" style={{ color: theme.colors.textMuted }}>
            Voici à quoi ressemblera l&apos;interface du client.
          </p>
          <div
            className="rounded-md p-4 mb-4"
            style={{
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <p className="text-sm font-medium mb-1">Prochaine action</p>
            <p className="text-xs" style={{ color: theme.colors.textMuted }}>
              Compléter votre identité de marque pour démarrer.
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-md"
            style={{
              backgroundColor: theme.colors.accent,
              color: theme.colors.accentForeground,
            }}
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  )
}
