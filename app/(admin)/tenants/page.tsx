import Link from 'next/link'
import { createAdmin } from '@/lib/supabase/admin'

type TenantRow = {
  id: string
  slug: string
  name: string
  plan: string
  created_at: string
}

type BrandRow = {
  tenant_id: string
  brand_book_status: 'incomplete' | 'complete'
}

type ProfileCount = {
  tenant_id: string
}

type ListChain<T> = {
  from: (t: string) => {
    select: (cols: string) => {
      order: (col: string, opts: { ascending: boolean }) => Promise<{
        data: T[] | null
        error: { message: string } | null
      }>
    } & Promise<{ data: T[] | null; error: { message: string } | null }>
  }
}

export default async function TenantsListPage() {
  const admin = createAdmin()
  const readable = admin as unknown as ListChain<TenantRow>
  const { data: tenants } = await readable
    .from('tenants')
    .select('id, slug, name, plan, created_at')
    .order('created_at', { ascending: false })

  const brandsClient = admin as unknown as ListChain<BrandRow>
  const { data: brands } = await brandsClient
    .from('brands')
    .select('tenant_id, brand_book_status')

  const profilesClient = admin as unknown as ListChain<ProfileCount>
  const { data: profiles } = await profilesClient
    .from('profiles')
    .select('tenant_id')

  const brandStatusByTenant = new Map<string, 'incomplete' | 'complete'>()
  for (const b of brands ?? []) brandStatusByTenant.set(b.tenant_id, b.brand_book_status)

  const usersByTenant = new Map<string, number>()
  for (const p of profiles ?? []) {
    usersByTenant.set(p.tenant_id, (usersByTenant.get(p.tenant_id) ?? 0) + 1)
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1
            className="text-3xl tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: '#E8E6E1' }}
          >
            Tenants
          </h1>
          <p className="text-sm mt-1" style={{ color: '#A8A39A' }}>
            {tenants?.length ?? 0} client{(tenants?.length ?? 0) > 1 ? 's' : ''} configuré
            {(tenants?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/tenants/new"
          className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
          style={{
            backgroundColor: '#E8E6E1',
            color: '#13171B',
          }}
        >
          + Créer un tenant
        </Link>
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: '#A8A39A' }}>
                Slug
              </th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: '#A8A39A' }}>
                Nom
              </th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: '#A8A39A' }}>
                Plan
              </th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: '#A8A39A' }}>
                Users
              </th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: '#A8A39A' }}>
                Brand book
              </th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: '#A8A39A' }}>
                Créé le
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(tenants ?? []).map((t) => {
              const status = brandStatusByTenant.get(t.id) ?? 'incomplete'
              const userCount = usersByTenant.get(t.id) ?? 0
              return (
                <tr
                  key={t.id}
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: '#E8E6E1' }}>
                    {t.slug}
                  </td>
                  <td className="px-4 py-3" style={{ color: '#E8E6E1' }}>
                    {t.name}
                  </td>
                  <td className="px-4 py-3" style={{ color: '#A8A39A' }}>
                    {t.plan}
                  </td>
                  <td className="px-4 py-3" style={{ color: '#A8A39A' }}>
                    {userCount}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor:
                          status === 'complete'
                            ? 'rgba(126,191,138,0.12)'
                            : 'rgba(232,180,124,0.12)',
                        color: status === 'complete' ? '#7EBF8A' : '#E8B47C',
                      }}
                    >
                      {status === 'complete' ? 'Complet' : 'Incomplet'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#A8A39A' }}>
                    {new Date(t.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/tenants/${t.slug}`}
                      className="text-xs underline transition-opacity hover:opacity-80"
                      style={{ color: '#E8E6E1' }}
                    >
                      Configurer
                    </Link>
                  </td>
                </tr>
              )
            })}
            {(!tenants || tenants.length === 0) && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-sm"
                  style={{ color: '#A8A39A' }}
                >
                  Aucun tenant pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
