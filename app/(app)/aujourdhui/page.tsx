import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Explicit types until `supabase gen types` replaces the stub in types/database.ts
type ProfileRow = {
  full_name: string | null
  email: string
  role: string
  tenant_id: string
}

type TenantRow = {
  name: string
  slug: string
}

export default async function AujourdhuiPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('full_name, email, role, tenant_id')
    .eq('id', user.id)
    .maybeSingle()

  const profile = rawProfile as ProfileRow | null

  let tenant: TenantRow | null = null
  if (profile?.tenant_id) {
    const { data: rawTenant } = await supabase
      .from('tenants')
      .select('name, slug')
      .eq('id', profile.tenant_id)
      .maybeSingle()
    tenant = rawTenant as TenantRow | null
  }

  const displayName = profile?.full_name ?? profile?.email ?? user.email ?? 'vous'
  const atIndex = displayName.indexOf('@')
  const spaceIndex = displayName.indexOf(' ')
  const firstName =
    atIndex !== -1
      ? displayName.slice(0, atIndex)
      : spaceIndex !== -1
        ? displayName.slice(0, spaceIndex)
        : displayName

  return (
    <main
      className="min-h-screen flex flex-col px-6 py-12"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-xl mx-auto w-full flex-1 space-y-8">
        <header className="space-y-1">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}
          >
            {tenant?.name ?? 'Creative Fair'}
          </p>
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
          >
            Bonjour {firstName}
          </h1>
        </header>

        <div
          className="rounded-xl px-5 py-4 space-y-1"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
          >
            Connecté en tant que
          </p>
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
          >
            {profile?.email ?? user.email}
          </p>
          {tenant && (
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
            >
              {tenant.name} · {profile?.role}
            </p>
          )}
        </div>

        <p
          className="text-sm"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
        >
          {"L'application est en cours de construction. Sprint 2 livré."}
        </p>
      </div>

      <footer className="max-w-xl mx-auto w-full pt-8">
        <a
          href="/logout"
          className="text-xs"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
        >
          Se déconnecter
        </a>
      </footer>
    </main>
  )
}
