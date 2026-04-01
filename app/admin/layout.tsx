'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Shield, LayoutDashboard, Users, BookOpen,
  AlertTriangle, ShoppingBag, Settings, Globe,
  LogOut, ChevronLeft, ChevronRight, Menu, X,
  Video, FileText, HelpCircle, Bell
} from 'lucide-react'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  {
    label: 'Contenus', icon: BookOpen,
    children: [
      { href: '/admin/contenus', label: 'Tous les contenus', icon: BookOpen },
      { href: '/admin/contenus/nouveau', label: 'Ajouter contenu', icon: Video },
    ]
  },
  { href: '/admin/alertes', label: 'Alertes', icon: AlertTriangle },
  { href: '/admin/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/admin/parametres', label: 'Parametres', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenus, setOpenMenus] = useState<string[]>(['Contenus'])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth'); return }
      supabase.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: p }) => {
        if (!p || p.role !== 'superadmin') {
          router.push('/')
          return
        }
        setProfile(p)
        setLoading(false)
      })
    })
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--orange)' }}>
            <Shield size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-white text-sm font-bold font-display">Think Safety</p>
              <p className="text-[10px] font-mono" style={{ color: 'var(--orange)' }}>SUPER ADMIN</p>
            </div>
          )}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="text-white/30 hover:text-white p-1 hidden md:block">
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          if (item.children) {
            const isOpen = openMenus.includes(item.label)
            const Icon = item.icon
            return (
              <div key={item.label}>
                <button
                  onClick={() => setOpenMenus(isOpen ? openMenus.filter(m => m !== item.label) : [...openMenus, item.label])}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-white/50 hover:text-white hover:bg-white/5`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronRight size={12} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    </>
                  )}
                </button>
                {!collapsed && isOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${isActive(child.href) ? 'text-orange-400 bg-orange-500/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                        <child.icon size={13} />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href!}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(item.href!) ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <Link href="/" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/30 hover:text-white hover:bg-white/5 transition-all`}>
          <Globe size={15} />
          {!collapsed && 'Voir le site'}
        </Link>
        {!collapsed && profile && (
          <div className="px-3 py-2 bg-navy-700 rounded-xl">
            <p className="text-white text-xs font-medium">{profile.prenom} {profile.nom}</p>
            <p className="text-orange-400 text-[10px]">Super Administrateur</p>
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
    </div>
  )

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Sidebar desktop */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-navy-800 border-r border-white/5 fixed h-full z-20 transition-all duration-300 hidden md:flex flex-col`}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-60 bg-navy-800 border-r border-white/5 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className={`flex-1 ${collapsed ? 'md:ml-16' : 'md:ml-60'} transition-all duration-300`}>
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-navy-800 border-b border-white/5 sticky top-0 z-10">
          <button onClick={() => setMobileOpen(true)} className="text-white/60 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--orange)' }}>
              <Shield size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-sm">Admin</span>
          </div>
          <div className="w-8" />
        </div>

        {children}
      </main>
    </div>
  )
}
