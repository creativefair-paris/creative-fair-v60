import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdmin } from '@/lib/supabase/admin'
import type { BrandBook } from '@/types/brand-book'
import type { BusinessCalendar } from '@/types/business-calendar'
import type { ThemePayload } from '../actions'
import { ThemeEditor } from './ThemeEditor'
import { BrandBookEditor } from './BrandBookEditor'
import { BusinessCalendarEditor } from './BusinessCalendarEditor'
import { UsersTab } from './UsersTab'
import { TenantTabs } from './TenantTabs'

type TenantRow = {
  id: string
  slug: string
  name: string
  plan: string
  theme: ThemePayload | null
  created_at: string
}

type BrandRow = {
  id: string
  brand_book: BrandBook | null
  business_calendar: BusinessCalendar | null
  brand_book_status: 'incomplete' | 'complete'
}

type ProfileRow = {
  id: string
  email: string
  role: 'owner' | 'admin' | 'member'
  created_at: string
}

const FALLBACK_THEME: ThemePayload = {
  colors: {
    background: '#F4EFE8',
    surface: '#FFFFFF',
    text: '#1F2622',
    textMuted: '#5C6660',
    border: '#DFD9D0',
    accent: '#2F4A3A',
    accentForeground: '#FFFFFF',
  },
  fonts: {
    display: '"Playfair Display", Georgia, serif',
    body: '"Inter", -apple-system, sans-serif',
    mono: 'ui-monospace, monospace',
  },
}

export default async function TenantConfigPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const admin = createAdmin()

  type SingleChain<T> = {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{ data: T | null; error: { message: string } | null }>
        }
      }
    }
  }
  type ListChain<T> = {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          order: (col: string, opts: { ascending: boolean }) => Promise<{
            data: T[] | null
            error: { message: string } | null
          }>
        }
      }
    }
  }

  const tenantClient = admin as unknown as SingleChain<TenantRow>
  const { data: tenant } = await tenantClient
    .from('tenants')
    .select('id, slug, name, plan, theme, created_at')
    .eq('slug', slug)
    .maybeSingle()

  if (!tenant) notFound()

  const brandClient = admin as unknown as SingleChain<BrandRow>
  const { data: brand } = await brandClient
    .from('brands')
    .select('id, brand_book, business_calendar, brand_book_status')
    .eq('tenant_id', tenant.id)
    .maybeSingle()

  const profileClient = admin as unknown as ListChain<ProfileRow>
  const { data: profiles } = await profileClient
    .from('profiles')
    .select('id, email, role, created_at')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: true })

  const theme = tenant.theme ?? FALLBACK_THEME

  return (
    <div>
      <Link
        href="/admin/tenants"
        className="text-xs underline transition-opacity hover:opacity-80"
        style={{ color: '#A8A39A' }}
      >
        ← Retour à la liste
      </Link>
      <div className="flex items-end justify-between mt-4 mb-8">
        <div>
          <h1
            className="text-3xl tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: '#E8E6E1' }}
          >
            {tenant.name}
          </h1>
          <p className="text-xs font-mono mt-1" style={{ color: '#A8A39A' }}>
            {tenant.slug} · {tenant.plan}
          </p>
        </div>
      </div>

      <TenantTabs
        themeContent={<ThemeEditor slug={slug} initialTheme={theme} />}
        brandBookContent={
          <BrandBookEditor
            slug={slug}
            initialBrandBook={brand?.brand_book ?? null}
          />
        }
        businessCalendarContent={
          <BusinessCalendarEditor
            slug={slug}
            initialCalendar={brand?.business_calendar ?? null}
          />
        }
        usersContent={<UsersTab slug={slug} profiles={profiles ?? []} />}
      />
    </div>
  )
}
