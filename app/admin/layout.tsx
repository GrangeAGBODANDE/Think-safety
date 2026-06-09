'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ThemeToggle from '@/components/ThemeToggle'
import {
  Shield, LayoutDashboard, Users, BookOpen, Layers,
  AlertTriangle, ShoppingBag, Settings, Globe,
  LogOut, ChevronLeft, ChevronRight,
  Building2, CreditCard, Star, Plus, FileText
} from 'lucide-react'

const NAV = [
  { section: 'Principal' },
  { href: '/admin/dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
  { section: 'Formations' },
  { href: '/admin/secteurs',     label: 'Secteurs',        icon: Layers          },
  { href: '/admin/modules',      label: 'Modules & Cours', icon: BookOpen        },
  { section: 'Communauté' },
  { href: '/admin/utilisateurs', label: 'Utilisateurs',    icon: Users           },
  { href: '/admin/entreprises',  label: 'Entreprises',     icon: Building2       },
  { href: '/admin/alertes',      label: 'Alertes',         icon: AlertTriangle   },
  { section: 'Marketplace' },
  { href: '/admin/marketplace',  label: 'Annonces EPI',    icon: ShoppingBag     },
  { href: '/admin/abonnements',  label: 'Abonnements',     icon: Star            },
  { href: '/admin/paiements',    label: 'Transactions',    icon: CreditCard      },
  { section: 'Système' },
  { href: '/admin/parametres',   label: 'Paramètres',      icon: Settings        },
  { href: '/admin/documentation', label: 'Documentation',    icon: FileText        },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [profile,   setProfile]   = useState<any>(null)
  const [loading,   setLoading]   = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth'); return }
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (!p || !['admin','superadmin','moderateur'].includes(p.role)) { router.push('/'); return }
        setProfile(p)
        setLoading(false)
      } catch (e: any) { setError('Erreur: ' + e.message); setLoading(false) }
    }
    checkAccess()
  }, [router])

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-main)'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:'48px',height:'48px',borderRadius:'14px',background:'var(--orange)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px auto'}}>
          <Shield size={22} style={{color:'white'}}/>
        </div>
        <p style={{fontSize:'13px',color:'var(--text-secondary)'}}>Vérification des droits...</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-main)'}}>
      <div style={{textAlign:'center'}}>
        <p style={{color:'#ef4444',fontSize:'13px',marginBottom:'16px'}}>{error}</p>
        <Link href="/" style={{padding:'8px 20px',borderRadius:'10px',border:'1px solid var(--border)',color:'var(--text-primary)',textDecoration:'none',fontSize:'13px'}}>Retour</Link>
      </div>
    </div>
  )

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div style={{minHeight:'100vh',display:'flex',background:'var(--bg-main)'}}>

      {/* SIDEBAR */}
      <aside style={{
        width: collapsed ? '64px' : '224px',
        position:'fixed',height:'100%',zIndex:20,
        display:'flex',flexDirection:'column',
        background:'var(--bg-card)',
        borderRight:'1px solid var(--border)',
        transition:'width 0.25s ease'
      }}>

        {/* Logo */}
        <div style={{padding:'16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',overflow:'hidden'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'10px',background:'var(--orange)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <Shield size={16} style={{color:'white'}}/>
            </div>
            {!collapsed && (
              <div style={{overflow:'hidden'}}>
                <p style={{fontSize:'13px',fontWeight:900,color:'var(--text-primary)',margin:0,lineHeight:1,fontFamily:'var(--font-display, sans-serif)'}}>Think Safety</p>
                <p style={{fontSize:'10px',color:'var(--orange)',margin:'2px 0 0 0',fontWeight:700}}>{profile?.role?.toUpperCase()}</p>
              </div>
            )}
          </div>
          <button onClick={()=>setCollapsed(!collapsed)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)',flexShrink:0,padding:'2px'}}>
            {collapsed ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
          </button>
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:'8px',overflowY:'auto'}}>
          {NAV.map((item: any, i) => {
            if (item.section) {
              if (collapsed) return null
              return (
                <p key={i} style={{fontSize:'10px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text-secondary)',padding:'12px 12px 4px',margin:0,opacity:0.5}}>
                  {item.section}
                </p>
              )
            }
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href}
                title={collapsed ? item.label : undefined}
                style={{
                  display:'flex',alignItems:'center',gap:'10px',
                  padding:'9px 12px',borderRadius:'10px',
                  fontSize:'13px',fontWeight:active?700:500,
                  textDecoration:'none',marginBottom:'1px',
                  color: active ? 'var(--orange)' : 'var(--text-secondary)',
                  background: active ? 'rgba(212,80,15,0.1)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(212,80,15,0.2)' : 'transparent'}`,
                  transition:'all 0.15s',
                }}
                onMouseEnter={e=>{ if(!active)(e.currentTarget as HTMLElement).style.background='var(--bg-secondary)' }}
                onMouseLeave={e=>{ if(!active)(e.currentTarget as HTMLElement).style.background='transparent' }}>
                <Icon size={15} style={{flexShrink:0}}/>
                {!collapsed && <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{padding:'8px',borderTop:'1px solid var(--border)'}}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 12px',borderRadius:'10px',fontSize:'13px',color:'var(--text-secondary)',textDecoration:'none'}}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg-secondary)'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
            <Globe size={14}/>{!collapsed && 'Voir le site'}
          </Link>
          {!collapsed && profile && (
            <div style={{padding:'8px 12px',borderRadius:'10px',background:'var(--bg-secondary)',margin:'4px 0'}}>
              <p style={{fontSize:'12px',fontWeight:600,color:'var(--text-primary)',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {profile.prenom} {profile.nom}
              </p>
              <p style={{fontSize:'10px',color:'var(--orange)',margin:'2px 0 0 0'}}>{profile.role}</p>
            </div>
          )}
          <button onClick={async()=>{ await supabase.auth.signOut(); router.push('/') }}
            style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 12px',borderRadius:'10px',fontSize:'13px',color:'#ef4444',background:'none',border:'none',cursor:'pointer',width:'100%'}}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.1)'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
            <LogOut size={14}/>{!collapsed && 'Déconnexion'}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{flex:1,marginLeft:collapsed?'64px':'224px',transition:'margin-left 0.25s ease',minHeight:'100vh'}}>
        {/* Topbar */}
        <header style={{
          padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',
          position:'sticky',top:0,zIndex:10,
          background:'var(--bg-card)',borderBottom:'1px solid var(--border)'
        }}>
          <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:0}}>
            Connecté en tant que{' '}
            <strong style={{color:'var(--text-primary)'}}>{profile?.prenom} {profile?.nom}</strong>
            <span style={{marginLeft:'8px',padding:'2px 8px',borderRadius:'6px',fontSize:'10px',fontWeight:700,
              background: profile?.role==='superadmin'?'rgba(239,68,68,0.15)':'rgba(212,80,15,0.15)',
              color: profile?.role==='superadmin'?'#ef4444':'var(--orange)'}}>
              {profile?.role}
            </span>
          </p>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <ThemeToggle />
            <Link href="/admin/modules/nouveau"
              style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'7px 16px',borderRadius:'10px',background:'var(--orange)',color:'white',textDecoration:'none',fontSize:'13px',fontWeight:700,boxShadow:'0 2px 8px rgba(212,80,15,0.3)'}}>
              <Plus size={13}/> Nouveau module
            </Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}