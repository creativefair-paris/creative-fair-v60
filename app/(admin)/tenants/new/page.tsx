import Link from 'next/link'
import { NewTenantForm } from './NewTenantForm'

export default function NewTenantPage() {
  return (
    <div>
      <Link
        href="/admin/tenants"
        className="text-xs underline transition-opacity hover:opacity-80"
        style={{ color: '#A8A39A' }}
      >
        ← Retour à la liste
      </Link>
      <h1
        className="text-3xl tracking-tight mt-4 mb-2"
        style={{ fontFamily: 'var(--font-display)', color: '#E8E6E1' }}
      >
        Nouveau tenant
      </h1>
      <p className="text-sm mb-8" style={{ color: '#A8A39A' }}>
        Provisionne un espace client avec son propriétaire.
      </p>
      <NewTenantForm />
    </div>
  )
}
