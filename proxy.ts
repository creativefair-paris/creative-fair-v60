import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require an authenticated session.
const PROTECTED_PATHS = [
  '/aujourdhui',
  '/conseiller',
  '/ma-marque',
  '/calendar',
  '/calendrier',
  '/post-creator',
  '/mon-compte',
  '/admin',
]

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh session — required for Server Components to read fresh auth state.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isAdminRoute = pathname.startsWith('/admin')

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin routes require both auth + email allowlist.
  if (isAdminRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const email = user.email?.toLowerCase() ?? null
    const ADMIN_EMAILS = ['creativefair@1922.studio']
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return NextResponse.redirect(new URL('/aujourdhui', request.url))
    }
  }

  // Redirect authenticated users away from /login.
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/aujourdhui', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Run on all paths except Next.js internals and static files.
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
