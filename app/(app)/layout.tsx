import type { ReactNode } from 'react'
import type { CSSProperties } from 'react'
import { createClient } from '@/lib/supabase/server'
import { buildThemeVars, mergeTheme } from '@/lib/theme/apply-theme'
import { defaultTheme } from '@/lib/theme/default-theme'
import type { TenantTheme } from '@/types/tenant'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let theme = defaultTheme

  if (user) {
    const { data: rawProfile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .maybeSingle()

    const tenantId = (rawProfile as { tenant_id?: string } | null)?.tenant_id

    if (tenantId) {
      const { data: rawTenant } = await supabase
        .from('tenants')
        .select('theme')
        .eq('id', tenantId)
        .maybeSingle()

      const tenantTheme = (rawTenant as { theme?: Partial<TenantTheme> } | null)?.theme

      if (tenantTheme) {
        theme = mergeTheme(defaultTheme, tenantTheme)
      }
    }
  }

  const themeVars = buildThemeVars(theme)

  return (
    <div style={themeVars as CSSProperties} className="min-h-screen">
      {children}
    </div>
  )
}
