'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Shield, Bell, Menu, X, ChevronDown, LogIn, LogOut, User, Settings, LayoutDashboard, BookOpen, ShoppingBag, AlertTriangle, Home, Search } from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) fetchProfile(data.user.id)
    })
    supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) setProfile(data)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    setUserMenuOpen(false)
  }

  const navLinks = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/secteurs', label: 'Secteurs', icon: BookOpen },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/alertes', label: 'Alertes', icon: AlertTriangle },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-navy-900/95 backdrop-blur-md shadow-lg border-b border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--orange)' }}>
              <Shield size={20} className="text-white" fill="white" />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-white tracking-wide leading-none">
                THINK <span style={{ color: 'var(--orange)' }}>SAFETY</span>
              </div>
              <div className="font-mono text-[9px] text-white/30 tracking-widest">FORMATION SECURITE</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname === link.href ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                style={pathname === link.href ? { color: 'var(--orange)' } : {}}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/recherche" className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all">
              <Search size={18} />
            </Link>
            <Link href="/alertes" className="relative flex items-center justify-center w-9 h-9 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>

            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-navy-700 border border-white/10 rounded-lg px-3 py-1.5 transition-all hover:bg-navy-600">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,107,53,0.2)' }}>
                    <User size={12} style={{ color: 'var(--orange)' }} />
                  </div>
                  <span className="text-sm text-white/80 hidden sm:block max-w-[100px] truncate">{profile?.prenom || 'Profil'}</span>
                  <ChevronDown size={14} className="text-white/40" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-navy-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="p-3 border-b border-white/5">
                      <div className="text-sm font-medium text-white">{profile?.prenom} {profile?.nom}</div>
                      <div className="text-xs text-white/40">{user.email}</div>
                    </div>
                    <div className="p-1">
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="sidebar-link"><LayoutDashboard size={16} />Tableau de bord</Link>
                      {profile?.role === 'admin' && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="sidebar-link"><Settings size={16} />Administration</Link>
                      )}
                    </div>
                    <div className="p-1 border-t border-white/5">
                      <button onClick={handleLogout} className="sidebar-link text-red-400 hover:bg-red-500/10"><LogOut size={16} />Deconnexion</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth" className="btn-primary text-sm py-2 px-4 hidden sm:flex">
                <LogIn size={16} />Connexion
              </Link>
            )}

            <button className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-white/60 hover:text-white hover:bg-white/5" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-navy-800 border-t border-white/5">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all">
                  <Icon size={18} />{link.label}
                </Link>
              )
            })}
            <div className="pt-2 border-t border-white/5">
              {user ? (
                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 w-full hover:bg-red-500/10">
                  <LogOut size={18} />Deconnexion
                </button>
              ) : (
                <Link href="/auth" onClick={() => setMenuOpen(false)} className="btn-primary w-full justify-center">
                  <LogIn size={16} />Se connecter
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
