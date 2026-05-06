'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createTenant } from '../actions'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export function NewTenantForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [plan, setPlan] = useState<'b2b_custom' | 'b2c'>('b2b_custom')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const onNameChange = (value: string) => {
    setName(value)
    if (!slug || slug === slugify(name)) setSlug(slugify(value))
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        const res = await createTenant({ name, slug, plan, ownerEmail })
        router.push(`/admin/tenants/${res.slug}`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue'
        setError(msg)
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-xl">
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: '#A8A39A' }}>
          Nom du tenant
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-3 py-2 rounded-md text-sm"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#E8E6E1',
          }}
          placeholder="Angelina"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: '#A8A39A' }}>
          Slug
        </label>
        <input
          type="text"
          required
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          className="w-full px-3 py-2 rounded-md text-sm font-mono"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#E8E6E1',
          }}
          placeholder="angelina"
        />
        <p className="text-xs mt-1" style={{ color: '#5C6660' }}>
          Identifiant URL — minuscules, tirets uniquement.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: '#A8A39A' }}>
          Plan
        </label>
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value as 'b2b_custom' | 'b2c')}
          className="w-full px-3 py-2 rounded-md text-sm"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#E8E6E1',
          }}
        >
          <option value="b2b_custom">B2B custom</option>
          <option value="b2c">B2C</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: '#A8A39A' }}>
          Email du propriétaire
        </label>
        <input
          type="email"
          required
          value={ownerEmail}
          onChange={(e) => setOwnerEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-md text-sm"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#E8E6E1',
          }}
          placeholder="contact@angelina-paris.fr"
        />
        <p className="text-xs mt-1" style={{ color: '#5C6660' }}>
          Le propriétaire recevra une invitation par email pour définir son mot de passe.
        </p>
      </div>

      {error && (
        <div
          className="px-3 py-2 rounded-md text-xs"
          style={{
            backgroundColor: 'rgba(220,90,90,0.1)',
            color: '#E89090',
            border: '1px solid rgba(220,90,90,0.2)',
          }}
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium rounded-md transition-opacity disabled:opacity-50"
          style={{ backgroundColor: '#E8E6E1', color: '#13171B' }}
        >
          {isPending ? 'Création…' : 'Créer le tenant'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/tenants')}
          className="text-xs underline transition-opacity hover:opacity-80"
          style={{ color: '#A8A39A' }}
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
