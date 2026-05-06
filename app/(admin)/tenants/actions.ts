'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdmin } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/auth/admin'
import type { BrandBook } from '@/types/brand-book'
import type { BusinessCalendar } from '@/types/business-calendar'

async function requireAdmin(): Promise<{ userId: string; email: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    throw new Error('Forbidden')
  }
  return { userId: user.id, email: user.email ?? '' }
}

const DEFAULT_THEME = {
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

export type CreateTenantInput = {
  name: string
  slug: string
  plan: 'b2b_custom' | 'b2c'
  ownerEmail: string
}

export async function createTenant(input: CreateTenantInput): Promise<{ slug: string }> {
  await requireAdmin()
  const admin = createAdmin()

  const slug = input.slug.trim().toLowerCase()
  const name = input.name.trim()
  const ownerEmail = input.ownerEmail.trim().toLowerCase()
  if (!slug || !name || !ownerEmail) throw new Error('Missing fields')

  type InsertChain = {
    insert: (rows: unknown[]) => {
      select: (cols: string) => {
        single: () => Promise<{
          data: { id: string } | null
          error: { message: string } | null
        }>
      }
    }
  }
  const writable = admin as unknown as { from: (t: string) => InsertChain }

  const { data: tenant, error: tenantErr } = await writable
    .from('tenants')
    .insert([
      {
        slug,
        name,
        plan: input.plan,
        theme: DEFAULT_THEME,
        enabled_channels: ['instagram'],
      },
    ])
    .select('id')
    .single()
  if (tenantErr || !tenant) throw new Error(tenantErr?.message ?? 'Tenant insert failed')

  const { error: brandErr } = await writable
    .from('brands')
    .insert([
      {
        tenant_id: tenant.id,
        name,
      },
    ])
    .select('id')
    .single()
  if (brandErr) throw new Error(brandErr.message)

  type AuthAdmin = {
    auth: {
      admin: {
        inviteUserByEmail: (email: string) => Promise<{
          data: { user: { id: string } | null } | null
          error: { message: string } | null
        }>
      }
    }
  }
  const authAdmin = admin as unknown as AuthAdmin
  const { data: invited, error: inviteErr } =
    await authAdmin.auth.admin.inviteUserByEmail(ownerEmail)
  if (inviteErr) throw new Error(inviteErr.message)

  if (invited?.user) {
    const { error: profileErr } = await writable
      .from('profiles')
      .insert([
        {
          id: invited.user.id,
          tenant_id: tenant.id,
          email: ownerEmail,
          role: 'owner',
        },
      ])
      .select('id')
      .single()
    if (profileErr) throw new Error(profileErr.message)
  }

  revalidatePath('/admin/tenants')
  return { slug }
}

export type ThemePayload = typeof DEFAULT_THEME

export async function updateTenantTheme(slug: string, theme: ThemePayload): Promise<void> {
  await requireAdmin()
  const admin = createAdmin()
  const updatable = admin as unknown as {
    from: (t: string) => {
      update: (vals: unknown) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
      }
    }
  }
  const { error } = await updatable
    .from('tenants')
    .update({ theme, updated_at: new Date().toISOString() })
    .eq('slug', slug)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/tenants/${slug}`)
}

async function getTenantBrandId(slug: string): Promise<{ tenantId: string; brandId: string }> {
  const admin = createAdmin()
  const readable = admin as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{
            data: { id: string } | null
            error: { message: string } | null
          }>
        }
      }
    }
  }
  const { data: tenant } = await readable
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  if (!tenant) throw new Error('Tenant not found')

  const { data: brand } = await readable
    .from('brands')
    .select('id')
    .eq('tenant_id', tenant.id)
    .maybeSingle()
  if (!brand) throw new Error('Brand not found')

  return { tenantId: tenant.id, brandId: brand.id }
}

export async function updateTenantBrandBook(slug: string, brandBook: BrandBook): Promise<void> {
  await requireAdmin()
  const { brandId } = await getTenantBrandId(slug)
  const admin = createAdmin()
  const updatable = admin as unknown as {
    from: (t: string) => {
      update: (vals: unknown) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
      }
    }
  }
  const { error } = await updatable
    .from('brands')
    .update({
      brand_book: brandBook,
      brand_book_status: 'complete',
      updated_at: new Date().toISOString(),
    })
    .eq('id', brandId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/tenants/${slug}`)
}

export async function updateTenantBusinessCalendar(
  slug: string,
  calendar: BusinessCalendar,
): Promise<void> {
  await requireAdmin()
  const { brandId } = await getTenantBrandId(slug)
  const admin = createAdmin()
  const updatable = admin as unknown as {
    from: (t: string) => {
      update: (vals: unknown) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
      }
    }
  }
  const { error } = await updatable
    .from('brands')
    .update({
      business_calendar: calendar,
      updated_at: new Date().toISOString(),
    })
    .eq('id', brandId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/tenants/${slug}`)
}

export async function inviteUser(
  slug: string,
  email: string,
  role: 'owner' | 'admin' | 'member',
): Promise<void> {
  await requireAdmin()
  const { tenantId } = await getTenantBrandId(slug)
  const admin = createAdmin()

  type AuthAdmin = {
    auth: {
      admin: {
        inviteUserByEmail: (email: string) => Promise<{
          data: { user: { id: string } | null } | null
          error: { message: string } | null
        }>
      }
    }
  }
  const authAdmin = admin as unknown as AuthAdmin
  const cleanEmail = email.trim().toLowerCase()
  const { data: invited, error: inviteErr } =
    await authAdmin.auth.admin.inviteUserByEmail(cleanEmail)
  if (inviteErr) throw new Error(inviteErr.message)
  if (!invited?.user) throw new Error('Invite failed')

  const writable = admin as unknown as {
    from: (t: string) => {
      insert: (rows: unknown[]) => {
        select: (cols: string) => {
          single: () => Promise<{
            data: { id: string } | null
            error: { message: string } | null
          }>
        }
      }
    }
  }
  const { error: profileErr } = await writable
    .from('profiles')
    .insert([
      {
        id: invited.user.id,
        tenant_id: tenantId,
        email: cleanEmail,
        role,
      },
    ])
    .select('id')
    .single()
  if (profileErr) throw new Error(profileErr.message)

  revalidatePath(`/admin/tenants/${slug}`)
}
