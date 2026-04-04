import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const pathname = request.nextUrl.pathname

  // Routes admin toujours accessibles
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth') || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return res
  }

  // Verifier le mode maintenance
  try {
    const supabase = createMiddlewareClient({ req: request, res })
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single()

    if (data?.value === 'true') {
      // Verifier si l'utilisateur est admin
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (profile?.role && ['admin', 'superadmin', 'moderateur'].includes(profile.role)) {
          return res // Admin peut acceder
        }
      }

      // Rediriger vers page maintenance
      return NextResponse.rewrite(new URL('/maintenance', request.url))
    }
  } catch {}

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
