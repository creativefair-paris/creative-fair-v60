import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/admin'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  // Sprint 36.C.1 — /aujourdhui (sans hyphen, dangling) → /aujourd-hui (home).
  if (!isAdmin(user.email)) redirect('/aujourd-hui')

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#13171B',
        color: '#E8E6E1',
        fontFamily: 'var(--font-body)',
      }}
    >
      <header
        className="px-6 py-3 flex items-center justify-between"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(0,0,0,0.25)',
        }}
      >
        <Link
          href="/admin/tenants"
          className="text-sm font-semibold tracking-tight"
          style={{ color: '#E8E6E1' }}
        >
          Admin · Creative Fair
        </Link>
        <form action="/logout" method="post">
          <button
            type="submit"
            className="text-xs underline transition-opacity hover:opacity-80"
            style={{ color: '#A8A39A' }}
          >
            Se déconnecter
          </button>
        </form>
      </header>
      <main className="px-6 py-10 max-w-5xl mx-auto">{children}</main>
    </div>
  )
}
