import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const pathname = request.nextUrl.pathname

  // ══ ROUTES JAMAIS BLOQUÉES (même en maintenance) ══
  const alwaysAllowed = [
    '/admin',
    '/auth',
    '/connexion',
    '/inscription',
    '/api',
    '/_next',
    '/favicon',
    '/maintenance',
  ]
  if (alwaysAllowed.some(r => pathname.startsWith(r))) {
    return res
  }

  // ══ VÉRIFICATION MODE MAINTENANCE ══
  try {
    const supabase = createMiddlewareClient({ req: request, res })

    const { data: setting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single()

    if (setting?.value !== 'true') {
      return res // Maintenance OFF → accès normal
    }

    // Maintenance ON → vérifier si admin connecté
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role && ['admin', 'superadmin', 'moderateur'].includes(profile.role)) {
        return res // Admin connecté → accès total
      }
    }

    // Utilisateur non-admin → page maintenance
    return NextResponse.rewrite(new URL('/maintenance', request.url))

  } catch {
    // En cas d'erreur Supabase → ne jamais bloquer
    return res
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
}