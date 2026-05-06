'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { inviteUser } from '../actions'

type ProfileRow = {
  id: string
  email: string
  role: 'owner' | 'admin' | 'member'
  created_at: string
}

type Props = {
  slug: string
  profiles: ProfileRow[]
}

export function UsersTab({ slug, profiles }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'owner' | 'admin' | 'member'>('member')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      try {
        await inviteUser(slug, email, role)
        setSuccess(`Invitation envoyée à ${email}`)
        setEmail('')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur')
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-sm font-medium mb-4" style={{ color: '#E8E6E1' }}>
          Utilisateurs ({profiles.length})
        </h2>
        <div
          className="rounded-md overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <th
                  className="text-left px-3 py-2 text-xs font-medium"
                  style={{ color: '#A8A39A' }}
                >
                  Email
                </th>
                <th
                  className="text-left px-3 py-2 text-xs font-medium"
                  style={{ color: '#A8A39A' }}
                >
                  Rôle
                </th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr
                  key={p.id}
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <td className="px-3 py-2 text-xs" style={{ color: '#E8E6E1' }}>
                    {p.email}
                  </td>
                  <td className="px-3 py-2 text-xs" style={{ color: '#A8A39A' }}>
                    {p.role}
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-3 py-6 text-center text-xs"
                    style={{ color: '#A8A39A' }}
                  >
                    Aucun utilisateur pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium mb-4" style={{ color: '#E8E6E1' }}>
          Inviter un utilisateur
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#A8A39A' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md text-sm"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#E8E6E1',
              }}
              placeholder="prenom@entreprise.fr"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#A8A39A' }}>
              Rôle
            </label>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as 'owner' | 'admin' | 'member')
              }
              className="w-full px-3 py-2 rounded-md text-sm"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#E8E6E1',
              }}
            >
              <option value="member">Membre</option>
              <option value="admin">Administrateur</option>
              <option value="owner">Propriétaire</option>
            </select>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium rounded-md transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#E8E6E1', color: '#13171B' }}
            >
              {isPending ? 'Envoi…' : 'Envoyer l\u2019invitation'}
            </button>
            {success && (
              <span className="text-xs" style={{ color: '#7EBF8A' }}>
                {success}
              </span>
            )}
            {error && (
              <span className="text-xs" style={{ color: '#E89090' }}>
                {error}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
