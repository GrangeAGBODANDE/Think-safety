'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSelector from '@/components/LanguageSelector'
import {
  Search, Bell, ShoppingCart, Menu, X,
  User, LogOut, Settings, Shield
} from 'lucide-react'

const NAV_LINKS = [
  { href: '/',            label: 'Accueil' },
  { href: '/secteurs',    label: 'Formations' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/alertes',     label: 'Alertes' },
  { href: '/abonnements', label: 'Abonnements' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [user,        setUser]        = useState<any>(null)
  const [profile,     setProfile]     = useState<any>(null)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [userMenu,    setUserMenu]    = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [searchQ,     setSearchQ]     = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u)
      if (u) {
        supabase.from('profiles').select('*').eq('id', u.id).single()
          .then(({ data: p }) => setProfile(p))
      }
    })
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null); setProfile(null); setUserMenu(false)
    router.push('/')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQ.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(searchQ.trim())}`)
      setSearchOpen(false)
      setSearchQ('')
    }
  }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin' || profile?.role === 'moderateur'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

      {/* Barre principale */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 hover:no-underline">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--orange)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2zm0 2.5L19 8.5v7L12 19.5 5 15.5v-7L12 4.5z"/>
            </svg>
          </div>
          <span className="font-bold text-base hidden sm:block" style={{ color: 'var(--text-primary)' }}>
            THINKS <span style={{ color: 'var(--orange)' }}>SAFETY</span>
          </span>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1 ml-4">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:no-underline"
              style={pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                ? { color: 'var(--orange)', background: 'rgba(212,80,15,0.08)' }
                : { color: 'var(--text-secondary)' }
              }
              onMouseEnter={e => { if (!(pathname === link.href)) e.currentTarget.style.background = 'var(--navy-700)' }}
              onMouseLeave={e => { if (!(pathname === link.href)) e.currentTarget.style.background = 'transparent' }}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions droite */}
        <div className="flex items-center gap-1 ml-auto">

          {/* Recherche */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Rechercher une formation..."
                className="input-field py-1.5 px-3 text-sm w-48 sm:w-64"
              />
              <button type="button" onClick={() => setSearchOpen(false)}
                className="p-2 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
                <X size={16} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg transition-all"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-700)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Search size={18} />
            </button>
          )}

          <Link href="/alertes"
            className="p-2 rounded-lg transition-all relative hover:no-underline"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-700)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Bell size={18} />
          </Link>

          <Link href="/panier"
            className="p-2 rounded-lg transition-all hover:no-underline"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-700)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <ShoppingCart size={18} />
          </Link>

          {/* Langue + Thème */}
          <div className="hidden sm:flex items-center gap-1">
            <LanguageSelector />
            <ThemeToggle />
          </div>

          {/* Utilisateur */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'var(--navy-700)', color: 'var(--text-primary)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'var(--orange)' }}>
                  {profile?.prenom?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:block">{profile?.prenom || 'Mon compte'}</span>
              </button>

              {userMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl py-2 z-50 border"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  {isAdmin && (
                    <Link href="/admin/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:no-underline transition-all"
                      style={{ color: 'var(--orange)' }}
                      onClick={() => setUserMenu(false)}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-700)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Shield size={14} />Administration
                    </Link>
                  )}
                  <Link href="/profil"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:no-underline transition-all"
                    style={{ color: 'var(--text-secondary)' }}
                    onClick={() => setUserMenu(false)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-700)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <User size={14} />Mon profil
                  </Link>
                  <div className="border-t my-1" style={{ borderColor: 'var(--border)' }} />
                  <button onClick={signOut}
                    className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left transition-all text-red-400"
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,71,87,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <LogOut size={14} />Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth"
              className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all hover:no-underline"
              style={{ background: 'var(--orange)', color: 'white' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Se connecter
            </Link>
          )}

          {/* Hamburger mobile */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: 'var(--text-secondary)' }}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-3 space-y-1" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:no-underline"
              style={pathname === link.href
                ? { color: 'var(--orange)', background: 'rgba(212,80,15,0.08)' }
                : { color: 'var(--text-secondary)' }}>
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  )
}
