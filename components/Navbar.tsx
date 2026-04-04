'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CartButton from '@/components/CartButton'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSelector from '@/components/LanguageSelector'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  Shield, Bell, Menu, X, LogIn, LogOut,
  User, Settings, LayoutDashboard,
  ShoppingBag, AlertTriangle, Home, Search, ChevronDown, BookOpen
} from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()
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
    { href: '/', label: t('nav.home'), icon: Home },
    { href: '/secteurs', label: t('nav.sectors'), icon: BookOpen },
    { href: '/marketplace', label: t('nav.marketplace'), icon: ShoppingBag },
    { href: '/alertes', label: t('nav.alerts'), icon: AlertTriangle },
    { href: '/abonnements', label: t('nav.subscriptions'), icon: Shield },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--bg-card)]/95 backdrop-blur-md shadow-lg border-b border-[var(--border)]'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-3">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--orange)' }}>
                <Shield size={18} className="text-white" fill="white" />
              </div>
              <div className="hidden sm:block">
                <div className="font-display text-base font-bold leading-none" style={{ color: 'var(--text-primary)' }}>
                  THINK <span style={{ color: 'var(--orange)' }}>SAFETY</span>
                </div>
              </div>
            </Link>

            {/* Nav desktop */}
            <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive(link.href)
                      ? 'bg-orange-500/10'
                      : 'hover:bg-[var(--navy-700)]'
                  }`}
                  style={{ color: isActive(link.href) ? 'var(--orange)' : 'var(--text-secondary)' }}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions droite */}
            <div className="flex items-center gap-1.5 flex-shrink-0">

              {/* Search */}
              <Link href="/recherche"
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:bg-[var(--navy-700)]"
                style={{ color: 'var(--text-secondary)' }}>
                <Search size={18} />
              </Link>

              {/* Bell */}
              <Link href="/alertes"
                className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:bg-[var(--navy-700)]"
                style={{ color: 'var(--text-secondary)' }}>
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>

              {/* Panier */}
              <CartButton />

              {/* Sélecteur de langue */}
              <LanguageSelector />

              {/* Toggle thème */}
              <ThemeToggle />

              {/* User menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(prev => !prev)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all border"
                    style={{
                      background: 'var(--bg-input)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,107,53,0.2)' }}>
                      <User size={12} style={{ color: 'var(--orange)' }} />
                    </div>
                    <span className="text-sm hidden sm:block max-w-[80px] truncate"
                      style={{ color: 'var(--text-primary)' }}>
                      {profile?.prenom || '...'}
                    </span>
                    <ChevronDown size={12} style={{ color: 'var(--text-secondary)' }}
                      className={`hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-2xl overflow-hidden z-[100] border"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {profile?.prenom} {profile?.nom}
                        </div>
                        <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{user.email}</div>
                        <span className={`badge text-[10px] mt-1.5 inline-block ${
                          profile?.role === 'superadmin' ? 'badge-danger' :
                          profile?.role === 'admin' ? 'badge-orange' :
                          profile?.role === 'moderateur' ? 'badge-info' : 'badge-safe'
                        }`}>{profile?.role || 'user'}</span>
                      </div>
                      <div className="p-1.5">
                        <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all hover:bg-[var(--navy-700)]"
                          style={{ color: 'var(--text-secondary)' }}>
                          <LayoutDashboard size={15} />{t('nav.myspace')}
                        </Link>
                        {profile?.is_seller && (
                          <Link href="/mes-commandes" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all hover:bg-[var(--navy-700)]"
                            style={{ color: 'var(--text-secondary)' }}>
                            <ShoppingBag size={15} />{t('nav.orders')}
                          </Link>
                        )}
                        {(profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.role === 'moderateur') && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all hover:bg-orange-500/10"
                            style={{ color: 'var(--orange)' }}>
                            <Settings size={15} />{t('nav.admin')}
                          </Link>
                        )}
                      </div>
                      <div className="p-1.5 border-t" style={{ borderColor: 'var(--border)' }}>
                        <button onClick={handleLogout}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all w-full">
                          <LogOut size={15} />{t('nav.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth" className="btn-primary text-xs py-2 px-3 whitespace-nowrap">
                  <LogIn size={14} />
                  <span className="hidden sm:inline">{t('nav.login')}</span>
                </Link>
              )}

              {/* Burger mobile */}
              <button
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:bg-[var(--navy-700)]"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-[280px] border-l flex flex-col shadow-2xl"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--orange)' }}>
                  <Shield size={16} className="text-white" fill="white" />
                </div>
                <span className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>Think Safety</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-1 rounded-lg hover:bg-[var(--navy-700)]"
                style={{ color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium border ${
                      isActive(link.href) ? 'border-orange-500/20 bg-orange-500/10' : 'border-transparent hover:bg-[var(--navy-700)]'
                    }`}
                    style={{ color: isActive(link.href) ? 'var(--orange)' : 'var(--text-secondary)' }}>
                    <Icon size={18} />{link.label}
                  </Link>
                )
              })}
              <Link href="/recherche" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-[var(--navy-700)]"
                style={{ color: 'var(--text-secondary)' }}>
                <Search size={18} />{t('nav.search')}
              </Link>
              <Link href="/panier" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-[var(--navy-700)]"
                style={{ color: 'var(--text-secondary)' }}>
                <ShoppingBag size={18} />{t('nav.cart')}
              </Link>
            </nav>

            {/* Langue + Thème dans le menu mobile */}
            <div className="px-4 py-3 border-t flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
              <LanguageSelector />
              <ThemeToggle />
            </div>

            <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
              {user ? (
                <div className="space-y-1">
                  <div className="px-4 py-3 rounded-xl" style={{ background: 'var(--bg-input)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{profile?.prenom} {profile?.nom}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                  </div>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--navy-700)]"
                    style={{ color: 'var(--text-secondary)' }}>
                    <LayoutDashboard size={16} />{t('nav.myspace')}
                  </Link>
                  {(profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.role === 'moderateur') && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all hover:bg-orange-500/10"
                      style={{ color: 'var(--orange)' }}>
                      <Settings size={16} />{t('nav.admin')}
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all w-full">
                    <LogOut size={16} />{t('nav.logout')}
                  </button>
                </div>
              ) : (
                <Link href="/auth" onClick={() => setMenuOpen(false)} className="btn-primary w-full justify-center py-3">
                  <LogIn size={16} />{t('nav.login')} — Gratuit
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
