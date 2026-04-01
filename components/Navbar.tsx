'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CartButton from '@/components/CartButton'
import {
  Shield, Bell, Menu, X, LogIn, LogOut,
  User, Settings, LayoutDashboard, BookOpen,
  ShoppingBag, AlertTriangle, Home, Search, ChevronDown
} from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) fetchProfile(data.user.id)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) setProfile(data)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    setMenuOpen(false)
    router.push('/')
  }

  const navLinks = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/secteurs', label: 'Formations', icon: BookOpen },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/alertes', label: 'Alertes', icon: AlertTriangle },
    { href: '/abonnements', label: 'Abonnements', icon: Shield },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-navy-900/98 backdrop-blur-md shadow-lg border-b border-white/5' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-3">

            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--orange)' }}>
                <Shield size={18} className="text-white" fill="white" />
              </div>
              <div className="hidden sm:block">
                <div className="font-display text-base font-bold text-white leading-none">
                  THINK <span style={{ color: 'var(--orange)' }}>SAFETY</span>
                </div>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive(link.href) ? 'text-orange-400 bg-orange-500/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Link href="/recherche" className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all">
                <Search size={18} />
              </Link>

              <Link href="/alertes" className="relative flex items-center justify-center w-9 h-9 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>

              {/* Panier */}
              <CartButton />

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button type="button" onClick={() => setUserMenuOpen(prev => !prev)}
                    className="flex items-center gap-1.5 bg-navy-700 border border-white/10 rounded-lg px-2.5 py-1.5 hover:bg-navy-600 transition-all">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,107,53,0.25)' }}>
                      <User size={12} style={{ color: 'var(--orange)' }} />
                    </div>
                    <span className="text-sm text-white/80 hidden sm:block max-w-[80px] truncate">
                      {profile?.prenom || '...'}
                    </span>
                    <ChevronDown size={12} className={`text-white/40 hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-navy-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]">
                      <div className="p-3 border-b border-white/5">
                        <div className="text-sm font-medium text-white truncate">{profile?.prenom} {profile?.nom}</div>
                        <div className="text-xs text-white/40 truncate">{user.email}</div>
                        <span className={`badge text-[10px] mt-1.5 inline-block ${
                          profile?.role === 'superadmin' ? 'badge-danger' :
                          profile?.role === 'admin' ? 'badge-orange' :
                          profile?.role === 'moderateur' ? 'badge-info' : 'badge-safe'
                        }`}>{profile?.role || 'user'}</span>
                      </div>
                      <div className="p-1.5">
                        <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                          <LayoutDashboard size={15} />Mon espace
                        </Link>
                        {profile?.is_seller && (
                          <Link href="/mes-commandes" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                            <ShoppingBag size={15} />Mes commandes
                          </Link>
                        )}
                        {(profile?.role === 'admin' || profile?.role === 'superadmin') && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-orange-500/10 transition-all"
                            style={{ color: 'var(--orange)' }}>
                            <Settings size={15} />Administration
                          </Link>
                        )}
                      </div>
                      <div className="p-1.5 border-t border-white/5">
                        <button onClick={handleLogout}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all w-full">
                          <LogOut size={15} />Deconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth" className="btn-primary text-xs py-2 px-3 whitespace-nowrap">
                  <LogIn size={14} /><span className="hidden sm:inline">Connexion</span>
                </Link>
              )}

              <button className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
                onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-[280px] bg-navy-800 border-l border-white/5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--orange)' }}>
                  <Shield size={16} className="text-white" fill="white" />
                </div>
                <span className="font-display font-bold text-white">Think Safety</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                      isActive(link.href) ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20' : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}>
                    <Icon size={18} />{link.label}
                  </Link>
                )
              })}
              <Link href="/recherche" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all">
                <Search size={18} />Rechercher
              </Link>
              <Link href="/panier" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all">
                <ShoppingBag size={18} />Mon panier
              </Link>
            </nav>

            <div className="p-3 border-t border-white/5">
              {user ? (
                <div className="space-y-1">
                  <div className="px-4 py-3 bg-navy-700 rounded-xl mb-2">
                    <p className="text-white text-sm font-medium">{profile?.prenom} {profile?.nom}</p>
                    <p className="text-white/40 text-xs truncate">{user.email}</p>
                  </div>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                    <LayoutDashboard size={16} />Mon espace
                  </Link>
                  {profile?.is_seller && (
                    <Link href="/mes-commandes" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                      <ShoppingBag size={16} />Mes commandes
                    </Link>
                  )}
                  {(profile?.role === 'admin' || profile?.role === 'superadmin') && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm hover:bg-orange-500/10 transition-all"
                      style={{ color: 'var(--orange)' }}>
                      <Settings size={16} />Administration
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all w-full">
                    <LogOut size={16} />Deconnexion
                  </button>
                </div>
              ) : (
                <Link href="/auth" onClick={() => setMenuOpen(false)} className="btn-primary w-full justify-center py-3">
                  <LogIn size={16} />Se connecter — Gratuit
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
