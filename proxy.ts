import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// Routes that do NOT require authentication
const PUBLIC_PATHS = new Set(['/login', '/signup', '/forgot-password', '/landing'])

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow public routes, API routes, and auth callbacks through without checking
  if (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth')
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Unauthenticated users hitting the root go to the landing page;
    // all other protected routes go to login.
    const dest = request.nextUrl.pathname === '/' ? '/landing' : '/login'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  return response
}
