import type { ReactNode, CSSProperties } from 'react'
import { createClient } from '@/lib/supabase/server'
import { buildThemeVars, mergeTheme } from '@/lib/theme/apply-theme'
import { defaultTheme } from '@/lib/theme/default-theme'
import type { TenantTheme } from '@/types/tenant'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { getCreditsThisMonth } from '@/lib/supabase/credits'
import type { CreditsByFeature } from '@/components/layout/CreditsIndicator'

type ProfileRow = { full_name: string | null; email: string; tenant_id: string }

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let theme = defaultTheme
  let firstName = 'vous'
  let email = ''
  let creditsTotal = 0
  let creditsByFeature: CreditsByFeature = {
    coaching: 0,
    generation: 0,
    brief: 0,
    brand_book: 0,
    conseiller: 0,
  }

  if (user) {
    const { data: rawProfile } = await supabase
      .from('profiles')
      .select('full_name, email, tenant_id')
      .eq('id', user.id)
      .maybeSingle()

    const profile = rawProfile as ProfileRow | null

    const displayName = profile?.full_name ?? profile?.email ?? user.email ?? 'vous'
    const atIndex = displayName.indexOf('@')
    const spaceIndex = displayName.indexOf(' ')
    firstName =
      atIndex !== -1
        ? displayName.slice(0, atIndex)
        : spaceIndex !== -1
          ? displayName.slice(0, spaceIndex)
          : displayName

    email = profile?.email ?? user.email ?? ''

    if (profile?.tenant_id) {
      const { data: rawTenant } = await supabase
        .from('tenants')
        .select('theme')
        .eq('id', profile.tenant_id)
        .maybeSingle()

      const tenantTheme = (rawTenant as { theme?: Partial<TenantTheme> } | null)?.theme
      if (tenantTheme) {
        theme = mergeTheme(defaultTheme, tenantTheme)
      }
    }

    const credits = await getCreditsThisMonth(supabase)
    creditsTotal = credits.total
    creditsByFeature = credits.byFeature
  }

  const themeVars = buildThemeVars(theme)

  return (
    <div style={themeVars as CSSProperties} className="min-h-screen flex flex-col">
      <Header
        firstName={firstName}
        email={email}
        creditsTotal={creditsTotal}
        creditsByFeature={creditsByFeature}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
