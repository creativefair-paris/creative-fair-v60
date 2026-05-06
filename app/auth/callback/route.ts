import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

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
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    // User authenticated but not yet provisioned in a tenant.
    // Admins create profiles via Sprint 22 interface.
    return NextResponse.redirect(new URL('/login?error=no_access', origin))
  }

  return NextResponse.redirect(new URL('/aujourdhui', origin))
}
