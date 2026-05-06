import type { SupabaseClient } from '@supabase/supabase-js'
import type { Brand, BrandBook } from '@/types/brand-book'
import type { BusinessCalendar } from '@/types/business-calendar'

export async function getBrandByTenantId(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<Brand | null> {
  const { data, error } = await supabase
    .from('brands')
    .select(
      'id, tenant_id, name, brand_book, business_calendar, brand_book_status, questions_answered, created_at, updated_at',
    )
    .eq('tenant_id', tenantId)
    .maybeSingle()

  if (error) throw error
  return (data as Brand | null) ?? null
}

export async function updateBrandBook(
  supabase: SupabaseClient,
  brandId: string,
  brandBook: BrandBook,
): Promise<void> {
  const { error } = await supabase
    .from('brands')
    .update({
      brand_book: brandBook,
      brand_book_status: 'complete',
      updated_at: new Date().toISOString(),
    })
    .eq('id', brandId)

  if (error) throw error
}

export async function updateBusinessCalendar(
  supabase: SupabaseClient,
  brandId: string,
  calendar: BusinessCalendar,
): Promise<void> {
  const { error } = await supabase
    .from('brands')
    .update({
      business_calendar: calendar,
      updated_at: new Date().toISOString(),
    })
    .eq('id', brandId)

  if (error) throw error
}

export async function getBrandIdForCurrentUser(
  supabase: SupabaseClient,
): Promise<{ brandId: string; tenantId: string } | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle()

  const profile = rawProfile as { tenant_id: string } | null
  if (!profile?.tenant_id) return null

  const brand = await getBrandByTenantId(supabase, profile.tenant_id)
  if (!brand) return null

  return { brandId: brand.id, tenantId: profile.tenant_id }
}
