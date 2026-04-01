'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Shield, LayoutDashboard, Users, BookOpen,
  AlertTriangle, ShoppingBag, Settings, Globe,
  LogOut, ChevronLeft, ChevronRight, Menu, Video, Plus
} from 'lucide-react'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { href: '/admin/contenus', label: 'Contenus', icon: BookOpen },
  { href: '/admin/contenus/nouveau', label: '+ Ajouter contenu', icon: Plus },
  { href: '/admin/alertes', label: 'Alertes', icon: AlertTriangle },
  { href: '/admin/marketplace', label: 'Marketplace', icon: ShoppingBag },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push('/auth')
          return
        }

        const { data: p, error: profileError } = await supabase
          .from('profiles')
          .select('id, prenom, nom, email, role')
          .eq('id', user.id)
          .single()

        if (profileError) {
          setError('Erreur profil: ' + profileError.message)
          setLoading(false)
          return
        }

        if (!p) {
          setError('Profil introuvable')
          setLoading(false)
          return
        }

        if (p.role !== 'superadmin' && p.role !== 'admin') {
          router.push('/')
          return
        }

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
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--orange)' }}>
            <Shield size={24} className="text-white" />
          </div>
          <p className="text-white/50 text-sm">Verification des droits...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-red-500/20">
            <Shield size={24} className="text-red-400" />
          </div>
          <p className="text-white font-bold mb-2">Erreur d&apos;acces</p>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <Link href="/" className="btn-secondary py-2 px-4 text-sm">Retour au site</Link>
        </div>
      </div>
    )
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-navy-800 border-r border-white/5 fixed h-full z-20 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--orange)' }}>
              <Shield size={16} className="text-white" />
            </div>
            {!collapsed && (
              <div>
                <p className="text-white text-sm font-bold font-display leading-none">Think Safety</p>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--orange)' }}>
                  {profile?.role === 'superadmin' ? 'SUPER ADMIN' : 'ADMIN'}
                </p>
              </div>
            )}
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="text-white/30 hover:text-white p-1">
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/30 hover:text-white hover:bg-white/5 transition-all">
            <Globe size={15} />
            {!collapsed && 'Voir le site'}
          </Link>
          {!collapsed && profile && (
            <div className="px-3 py-2 bg-navy-700 rounded-xl mt-1">
              <p className="text-white text-xs font-medium truncate">{profile.prenom} {profile.nom}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--orange)' }}>
                {profile.role === 'superadmin' ? 'Super Admin' : 'Administrateur'}
              </p>
            </div>
          )}
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut size={15} />
            {!collapsed && 'Deconnexion'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 ${collapsed ? 'ml-16' : 'ml-56'} transition-all duration-300 min-h-screen`}>
        {/* Header */}
        <header className="bg-navy-800 border-b border-white/5 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <p className="text-white/40 text-sm">
            Connecte en tant que <span className="text-white font-medium">{profile?.prenom}</span>
            <span className="ml-2 badge badge-orange text-[10px]">{profile?.role}</span>
          </p>
          <Link href="/admin/contenus/nouveau" className="btn-primary py-1.5 px-4 text-xs">
            <Plus size={13} />Nouveau contenu
          </Link>
        </header>

        {children}
      </main>
    </div>
  )
}
