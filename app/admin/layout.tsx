'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSelector from '@/components/LanguageSelector'
import { useLang } from '@/contexts/LanguageContext'
import {
  Shield, LayoutDashboard, Users, BookOpen,
  AlertTriangle, ShoppingBag, Settings, Globe,
  LogOut, ChevronLeft, ChevronRight,
  Building2, CreditCard, ShoppingCart, Star, Plus, FileText
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLang()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth'); return }
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (!p || !['admin', 'superadmin', 'moderateur'].includes(p.role)) { router.push('/'); return }
        setProfile(p)
        setLoading(false)
      } catch (e: any) {
        setError('Erreur: ' + e.message)
        setLoading(false)
      }
    }
    checkAccess()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-main)' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--orange)' }}>
            <Shield size={24} className="text-white" />
          </div>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm">Verification des droits...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-main)' }}>
        <div className="text-center px-4">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <Link href="/" className="btn-secondary py-2 px-4 text-sm">Retour</Link>
        </div>
      </div>
    )
  }

  const NAV = [
    { href: '/admin/dashboard',        label: t('admin.dashboard'),     icon: LayoutDashboard },
    { href: '/admin/utilisateurs',     label: t('admin.users'),         icon: Users },
    { href: '/admin/entreprises',      label: t('admin.companies'),     icon: Building2 },
    { href: '/admin/contenus',         label: t('admin.contents'),      icon: BookOpen },
    { href: '/admin/contenus/nouveau', label: t('admin.add_content'),   icon: Plus },
    { href: '/admin/alertes',          label: t('admin.alerts'),        icon: AlertTriangle },
    { href: '/admin/marketplace',      label: t('admin.marketplace'),   icon: ShoppingBag },
    { href: '/admin/commandes',        label: t('admin.orders'),        icon: ShoppingCart },
    { href: '/admin/abonnements',      label: t('admin.subscriptions'), icon: Star },
    { href: '/admin/paiements',        label: t('admin.payments'),      icon: CreditCard },
    { href: '/admin/parametres',       label: t('admin.settings'),      icon: Settings },
    { href: '/admin/documentation',    label: t('admin.documentation'), icon: FileText },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-main)' }}>

      <aside
        className={`${collapsed ? 'w-16' : 'w-60'} fixed h-full z-20 transition-all duration-300 flex flex-col border-r`}
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--orange)' }}>
              <Shield size={16} className="text-white" />
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-bold font-display leading-none" style={{ color: 'var(--text-primary)' }}>Thinks Safety</p>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--orange)' }}>{profile?.role?.toUpperCase()}</p>
              </div>
            )}
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href}
                title={collapsed ? item.label : undefined}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border"
                style={active
                  ? { color: 'var(--orange)', background: 'rgba(212,80,15,0.1)', borderColor: 'rgba(212,80,15,0.2)' }
                  : item.href === '/admin/documentation'
                  ? { color: '#1976D2', borderColor: 'transparent' }
                  : { color: 'var(--text-secondary)', borderColor: 'transparent' }
                }
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--navy-700)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={16} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t space-y-1" style={{ borderColor: 'var(--border)' }}>
          <Link href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-700)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Globe size={15} />{!collapsed && t('admin.view_site')}
          </Link>
          {!collapsed && profile && (
            <div className="px-3 py-2 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{profile.prenom} {profile.nom}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--orange)' }}>{profile.role}</p>
            </div>
          )}
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut size={15} />{!collapsed && t('admin.logout')}
          </button>
        </div>
      </aside>

      <main className={`flex-1 ${collapsed ? 'ml-16' : 'ml-60'} transition-all duration-300 min-h-screen`}>
        <header
          className="px-6 py-3 flex items-center justify-between sticky top-0 z-10 border-b"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('admin.connected_as')}{' '}
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{profile?.prenom}</span>
            </p>
            <span className={`badge text-[10px] ${
              profile?.role === 'superadmin' ? 'badge-danger' :
              profile?.role === 'admin' ? 'badge-orange' : 'badge-info'
            }`}>{profile?.role}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <Link href="/admin/contenus/nouveau" className="btn-primary py-1.5 px-4 text-xs">
              <Plus size={13} />{t('admin.new_content')}
            </Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
