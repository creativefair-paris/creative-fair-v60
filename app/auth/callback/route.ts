import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { getBrandByTenantId } from '@/lib/supabase/brands'

// Supabase redirects here after the user clicks the magic link.
// URL: /auth/callback?code=<pkce_code>
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=true', origin))
  }

  const supabase = await createClient()

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    return NextResponse.redirect(new URL('/login?error=true', origin))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login?error=true', origin))
  }

  // Check if a profile exists for this user (provisioned by admin).
  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('id, tenant_id')
    .eq('id', user.id)
    .maybeSingle()

  const profile = rawProfile as { id: string; tenant_id: string | null } | null

  if (!profile) {
    // User authenticated but not yet provisioned in a tenant.
    // Admins create profiles via the admin interface.
    return NextResponse.redirect(new URL('/login?error=no_access', origin))
  }

  // If no brand exists for this tenant yet, send the user directly to onboarding.
  if (profile.tenant_id) {
    const brand = await getBrandByTenantId(supabase, profile.tenant_id)
    if (!brand) {
      return NextResponse.redirect(new URL('/onboarding/analyse-marque', origin))
    }
  }

  // Sprint 36.C — /aujourd-hui (avec hyphen) est la home.
  return NextResponse.redirect(new URL('/aujourd-hui', origin))
}
