'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { SECTEURS } from '@/lib/secteurs-data'
import { BookOpen, Shield, ChevronRight, MapPin, Briefcase, LogOut, Award, CheckCircle, TrendingUp, User } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [profile,   setProfile]   = useState<any>(null)
  const [progress,  setProgress]  = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/connexion?redirect=/dashboard'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      const { data: prog } = await supabase
        .from('user_module_progress')
        .select('*, module:module_id(id, titre, numero, secteur_slug, duree, slug, libre)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setProgress(prog || [])
      setLoading(false)
    }
    load()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',color:'var(--text-secondary)'}}>Chargement...</div>
    </div>
  )

  if (!profile) return null

  const secteurNom   = (s: string) => SECTEURS.find(x=>x.slug===s)?.nom || s
  const secteurColor = (s: string) => SECTEURS.find(x=>x.slug===s)?.couleur || 'var(--orange)'
  const initial      = (profile.prenom?.[0] || profile.email?.[0] || '?').toUpperCase()
  const prenom       = profile.prenom || profile.email?.split('@')[0] || 'Membre'
  const completed    = progress.filter(p => p.completed_at)

  // Regrouper par secteur
  const bySecteur: Record<string,{total:number,done:number}> = {}
  progress.forEach(p => {
    const s = p.module?.secteur_slug
    if (!s) return
    if (!bySecteur[s]) bySecteur[s] = { total:0, done:0 }
    bySecteur[s].total++
    if (p.completed_at) bySecteur[s].done++
  })

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>
      <div style={{maxWidth:'1100px',margin:'0 auto',padding:'88px 24px 96px'}}>

        {/* HEADER */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'32px',flexWrap:'wrap',gap:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap'}}>
            <div style={{width:'72px',height:'72px',borderRadius:'50%',background:'linear-gradient(135deg,var(--orange),#ff9a4a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',fontWeight:900,color:'white',flexShrink:0,boxShadow:'0 4px 16px rgba(212,80,15,0.35)'}}>
              {initial}
            </div>
            <div>
              <h1 style={{fontSize:'1.6rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 6px 0',letterSpacing:'-0.02em'}}>
                Bonjour, {prenom} ! 👋
              </h1>
              <div style={{display:'flex',flexWrap:'wrap',gap:'12px',fontSize:'13px',color:'var(--text-secondary)'}}>
                {profile.pays && <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><MapPin size={12}/>{profile.ville ? `${profile.ville}, ` : ''}{profile.pays}</span>}
                {profile.profession && <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><Briefcase size={12}/>{profile.profession}</span>}
                {profile.secteur_activite && <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><Shield size={12}/>{profile.secteur_activite}</span>}
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <Link href="/dashboard/profil" style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'8px 14px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-secondary)',textDecoration:'none',fontSize:'13px',fontWeight:600}}>
              <User size={13}/> Mon profil
            </Link>
            <button onClick={handleLogout} style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'8px 14px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-secondary)',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>
              <LogOut size={13}/> Déconnexion
            </button>
          </div>
        </div>

        {/* STATS */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'14px',marginBottom:'32px'}}>
          {[
            { label:'Modules commencés',  val:progress.length,               icon:BookOpen,    color:'var(--orange)' },
            { label:'Modules complétés',  val:completed.length,              icon:CheckCircle, color:'#22c55e'       },
            { label:'Secteurs explorés',  val:Object.keys(bySecteur).length, icon:TrendingUp,  color:'#3b82f6'       },
            { label:'Niveau',             val:profile.niveau_experience || 'Débutant', icon:Award, color:'#8b5cf6', text:true },
          ].map((s,i) => {
            const Icon = s.icon
            return (
              <div key={i} style={{padding:'20px',borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)'}}>
                <Icon size={18} style={{color:s.color,marginBottom:'12px'}}/>
                <div style={{fontSize:(s as any).text?'1rem':'1.8rem',fontWeight:900,color:'var(--text-primary)',lineHeight:1,marginBottom:'4px',textTransform:(s as any).text?'capitalize':'none'}}>{s.val}</div>
                <div style={{fontSize:'12px',color:'var(--text-secondary)'}}>{s.label}</div>
              </div>
            )
          })}
        </div>

        {/* PROGRESSION PAR SECTEUR */}
        {Object.keys(bySecteur).length > 0 && (
          <div style={{borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)',padding:'20px',marginBottom:'24px'}}>
            <h3 style={{fontSize:'14px',fontWeight:900,color:'var(--text-primary)',margin:'0 0 16px 0'}}>Progression par secteur</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {Object.entries(bySecteur).map(([slug, data]) => {
                const color = secteurColor(slug)
                const pct   = Math.min(100, Math.round((data.done / Math.max(data.total,1)) * 100))
                return (
                  <Link key={slug} href={`/secteurs/${slug}`} style={{textDecoration:'none'}}>
                    <div style={{transition:'opacity 0.15s'}}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.opacity='0.75'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.opacity='1'}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'6px'}}>
                        <span style={{fontSize:'13px',fontWeight:600,color:'var(--text-primary)'}}>{secteurNom(slug)}</span>
                        <span style={{fontSize:'11px',color:'var(--text-secondary)'}}>{data.done}/{data.total} complétés</span>
                      </div>
                      <div style={{height:'6px',borderRadius:'99px',background:'var(--bg-secondary)',overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${pct}%`,borderRadius:'99px',background:`linear-gradient(to right,${color},${color}aa)`,transition:'width 0.5s'}}/>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'24px',alignItems:'start'}}>

          {/* MODULES RÉCENTS */}
          <div style={{borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)',overflow:'hidden'}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <h2 style={{fontSize:'14px',fontWeight:900,color:'var(--text-primary)',margin:0}}>Mes modules récents</h2>
              <Link href="/secteurs" style={{fontSize:'12px',color:'var(--orange)',textDecoration:'none',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'3px'}}>
                Explorer <ChevronRight size={12}/>
              </Link>
            </div>
            {progress.length === 0 ? (
              <div style={{padding:'48px 24px',textAlign:'center'}}>
                <BookOpen size={40} style={{color:'var(--text-secondary)',margin:'0 auto 16px',display:'block',opacity:0.3}}/>
                <p style={{fontSize:'14px',color:'var(--text-secondary)',marginBottom:'16px'}}>Vous n&apos;avez pas encore commencé de module.</p>
                <Link href="/secteurs" style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'10px 20px',borderRadius:'12px',background:'var(--orange)',color:'white',textDecoration:'none',fontSize:'13px',fontWeight:700}}>
                  Commencer une formation
                </Link>
              </div>
            ) : progress.map((p, i) => {
              const mod  = p.module
              if (!mod) return null
              const col  = secteurColor(mod.secteur_slug)
              const done = !!p.completed_at
              return (
                <Link key={p.id} href={`/secteurs/${mod.secteur_slug}/${mod.slug}`}
                  style={{display:'flex',alignItems:'center',gap:'14px',padding:'14px 20px',borderBottom:i<progress.length-1?'1px solid var(--border)':'none',textDecoration:'none',transition:'background 0.15s'}}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg-secondary)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                  <div style={{width:'42px',height:'42px',borderRadius:'12px',background:col+'18',border:'1px solid '+col+'25',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:'12px',fontWeight:900,color:col}}>{mod.numero}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 3px 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{mod.titre}</p>
                    <p style={{fontSize:'11px',color:'var(--text-secondary)',margin:0}}>{secteurNom(mod.secteur_slug)}{mod.duree?` · ${mod.duree}`:''}</p>
                  </div>
                  {done
                    ? <span style={{fontSize:'10px',fontWeight:700,padding:'3px 8px',borderRadius:'6px',background:'rgba(34,197,94,0.12)',color:'#22c55e',flexShrink:0,display:'inline-flex',alignItems:'center',gap:'3px'}}><CheckCircle size={10}/>Terminé</span>
                    : <span style={{fontSize:'10px',fontWeight:700,padding:'3px 8px',borderRadius:'6px',background:'rgba(212,80,15,0.12)',color:'var(--orange)',flexShrink:0}}>En cours</span>}
                </Link>
              )
            })}
          </div>

          {/* SIDEBAR */}
          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>

            {/* Continuer */}
            {progress.length > 0 && (() => {
              const inProgress = progress.find(p=>!p.completed_at&&p.module)
              if (!inProgress) return null
              const mod = inProgress.module
              const col = secteurColor(mod.secteur_slug)
              return (
                <div style={{borderRadius:'14px',border:'1px solid rgba(212,80,15,0.25)',background:'rgba(212,80,15,0.06)',padding:'18px'}}>
                  <h3 style={{fontSize:'13px',fontWeight:900,color:'var(--orange)',margin:'0 0 10px 0'}}>🎯 Continuer</h3>
                  <Link href={`/secteurs/${mod.secteur_slug}/${mod.slug}`} style={{textDecoration:'none'}}>
                    <div style={{padding:'12px',borderRadius:'10px',background:'var(--bg-card)',border:'1px solid var(--border)'}}>
                      <p style={{fontSize:'12px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 4px 0',lineHeight:1.3}}>{mod.titre}</p>
                      <p style={{fontSize:'11px',color:'var(--text-secondary)',margin:'0 0 10px 0'}}>{secteurNom(mod.secteur_slug)}</p>
                      <span style={{display:'inline-flex',alignItems:'center',gap:'4px',fontSize:'12px',fontWeight:700,color:col}}>Reprendre →</span>
                    </div>
                  </Link>
                </div>
              )
            })()}

            {/* Profil */}
            <div style={{borderRadius:'14px',border:'1px solid var(--border)',background:'var(--bg-card)',padding:'18px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
                <h3 style={{fontSize:'13px',fontWeight:900,color:'var(--text-primary)',margin:0}}>Mon profil</h3>
                <Link href="/dashboard/profil" style={{fontSize:'11px',color:'var(--orange)',textDecoration:'none',fontWeight:700}}>Modifier →</Link>
              </div>
              {[
                { label:'Email',      val:profile.email },
                { label:'Localisation', val:profile.ville ? `${profile.ville}, ${profile.pays}` : profile.pays },
                { label:'Téléphone',  val:profile.telephone },
                { label:'Profession', val:profile.profession },
                { label:'Secteur',    val:profile.secteur_activite },
                { label:'Niveau',     val:profile.niveau_experience },
              ].filter(f=>f.val).map((f,i) => (
                <div key={i} style={{display:'flex',gap:'8px',marginBottom:'8px',fontSize:'12px'}}>
                  <span style={{color:'var(--text-secondary)',flexShrink:0,minWidth:'80px'}}>{f.label}</span>
                  <span style={{color:'var(--text-primary)',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.val}</span>
                </div>
              ))}
            </div>

            {/* Accès rapide */}
            <div style={{borderRadius:'14px',border:'1px solid var(--border)',background:'var(--bg-card)',padding:'18px'}}>
              <h3 style={{fontSize:'13px',fontWeight:900,color:'var(--text-primary)',margin:'0 0 12px 0'}}>Accès rapide</h3>
              {[
                { label:'Tous les secteurs', href:'/secteurs',    icon:BookOpen  },
                { label:'Alertes sécurité',  href:'/alertes',     icon:Shield    },
                { label:'Marketplace EPI',   href:'/marketplace', icon:Briefcase },
                { label:'Abonnements',       href:'/abonnements', icon:Award     },
              ].map((l,i) => {
                const Icon = l.icon
                return (
                  <Link key={i} href={l.href}
                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 10px',borderRadius:'9px',textDecoration:'none',marginBottom:'4px',fontSize:'13px',color:'var(--text-secondary)',transition:'all 0.15s'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--bg-secondary)';(e.currentTarget as HTMLElement).style.color='var(--text-primary)'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';(e.currentTarget as HTMLElement).style.color='var(--text-secondary)'}}>
                    <Icon size={14} style={{color:'var(--orange)',flexShrink:0}}/>{l.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}