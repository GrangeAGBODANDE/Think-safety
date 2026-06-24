'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { SECTEURS } from '@/lib/secteurs-data'
import { Users, BookOpen, AlertTriangle, ShoppingBag, Plus, ArrowRight, Layers, TrendingUp, Lock, Unlock } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users:0, modules:0, modulesLibre:0, alertes:0, annonces:0, pending:0 })
  const [recentUsers,   setRecentUsers]   = useState<any[]>([])
  const [recentModules, setRecentModules] = useState<any[]>([])
  const [modulesBySector, setModulesBySector] = useState<Record<string,number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [u, m, mLibre, a, an, p, ru, rm, allM] = await Promise.all([
        supabase.from('profiles').select('id', { count:'exact', head:true }),
        supabase.from('modules').select('id', { count:'exact', head:true }),
        supabase.from('modules').select('id', { count:'exact', head:true }).eq('libre', true),
        supabase.from('alertes').select('id', { count:'exact', head:true }).eq('statut', 'active'),
        supabase.from('marketplace_annonces').select('id', { count:'exact', head:true }),
        supabase.from('marketplace_annonces').select('id', { count:'exact', head:true }).eq('statut', 'pending'),
        supabase.from('profiles').select('id, prenom, nom, email, role, pays, created_at').order('created_at', { ascending:false }).limit(5),
        supabase.from('modules').select('id, titre, secteur_slug, numero, statut, libre, created_at').order('created_at', { ascending:false }).limit(5),
        supabase.from('modules').select('secteur_slug'),
      ])
      setStats({
        users: u.count || 0,
        modules: m.count || 0,
        modulesLibre: mLibre.count || 0,
        alertes: a.count || 0,
        annonces: an.count || 0,
        pending: p.count || 0,
      })
      setRecentUsers(ru.data || [])
      setRecentModules(rm.data || [])
      const counts: Record<string,number> = {}
      allM.data?.forEach((x:any) => { counts[x.secteur_slug] = (counts[x.secteur_slug]||0)+1 })
      setModulesBySector(counts)
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label:'Utilisateurs',  value:stats.users,    icon:Users,        color:'#3b82f6', href:'/admin/utilisateurs' },
    { label:'Modules',       value:stats.modules,  icon:BookOpen,     color:'var(--orange)', href:'/admin/modules' },
    { label:'Alertes actives', value:stats.alertes, icon:AlertTriangle, color:'#ef4444', href:'/admin/alertes' },
    { label:'Annonces EPI',  value:stats.annonces, icon:ShoppingBag,  color:'#f59e0b', href:'/admin/marketplace', badge: stats.pending>0 ? `${stats.pending} en attente` : undefined },
  ]

  const secteurName = (slug:string) => SECTEURS.find(s=>s.slug===slug)?.nom || slug
  const secteurColor = (slug:string) => SECTEURS.find(s=>s.slug===slug)?.couleur || '#888'
  const activeSectors = Object.keys(modulesBySector).length

  return (
    <div style={{padding:'24px', maxWidth:'1200px'}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'28px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h1 style={{fontSize:'1.6rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 4px 0'}}>Tableau de bord</h1>
          <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:0}}>Vue d&apos;ensemble de la plateforme Think Safety</p>
        </div>
        <Link href="/admin/modules/nouveau"
          style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'10px 18px',borderRadius:'12px',background:'var(--orange)',color:'white',textDecoration:'none',fontSize:'13px',fontWeight:700}}>
          <Plus size={14}/> Nouveau module
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'16px',marginBottom:'24px'}}>
        {statCards.map((s,i) => {
          const Icon = s.icon
          return (
            <Link key={i} href={s.href} style={{textDecoration:'none'}}>
              <div style={{padding:'20px',borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)',transition:'all 0.2s',cursor:'pointer'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=s.color+'50';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.transform='translateY(0)'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
                  <div style={{width:'40px',height:'40px',borderRadius:'12px',background:s.color+'18',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Icon size={20} style={{color:s.color}}/>
                  </div>
                  {s.badge && <span style={{fontSize:'10px',fontWeight:700,padding:'3px 8px',borderRadius:'99px',background:'rgba(245,158,11,0.15)',color:'#f59e0b'}}>{s.badge}</span>}
                </div>
                <div style={{fontSize:'2rem',fontWeight:900,color:'var(--text-primary)',lineHeight:1}}>{loading?'—':s.value}</div>
                <div style={{fontSize:'12px',color:'var(--text-secondary)',marginTop:'4px'}}>{s.label}</div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Mini-stats modules */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'12px',marginBottom:'28px'}}>
        {[
          { label:'Secteurs actifs', val:activeSectors, icon:Layers,  color:'#06b6d4' },
          { label:'Modules gratuits', val:stats.modulesLibre, icon:Unlock, color:'#22c55e' },
          { label:'Modules membres', val:stats.modules-stats.modulesLibre, icon:Lock, color:'#8b5cf6' },
        ].map((s,i) => {
          const Icon = s.icon
          return (
            <div key={i} style={{padding:'14px 16px',borderRadius:'14px',border:'1px solid var(--border)',background:'var(--bg-card)',display:'flex',alignItems:'center',gap:'12px'}}>
              <Icon size={18} style={{color:s.color,flexShrink:0}}/>
              <div>
                <div style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',lineHeight:1}}>{loading?'—':s.val}</div>
                <div style={{fontSize:'11px',color:'var(--text-secondary)',marginTop:'2px'}}>{s.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 2 colonnes */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>

        {/* Derniers modules */}
        <div style={{borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)',overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <h2 style={{fontSize:'14px',fontWeight:900,color:'var(--text-primary)',margin:0}}>Derniers modules</h2>
            <Link href="/admin/modules" style={{fontSize:'12px',color:'var(--orange)',textDecoration:'none',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'3px'}}>
              Tout voir <ArrowRight size={12}/>
            </Link>
          </div>
          {loading ? (
            <div style={{padding:'30px',textAlign:'center',color:'var(--text-secondary)',fontSize:'13px'}}>Chargement...</div>
          ) : recentModules.length === 0 ? (
            <div style={{padding:'30px',textAlign:'center'}}>
              <p style={{color:'var(--text-secondary)',fontSize:'13px',marginBottom:'12px'}}>Aucun module créé</p>
              <Link href="/admin/modules/nouveau" style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'8px 16px',borderRadius:'10px',background:'var(--orange)',color:'white',textDecoration:'none',fontSize:'12px',fontWeight:700}}>
                <Plus size={12}/> Créer un module
              </Link>
            </div>
          ) : recentModules.map((m,i) => (
            <Link key={m.id} href={`/admin/modules/${m.id}`}
              style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 18px',borderBottom:i<recentModules.length-1?'1px solid var(--border)':'none',textDecoration:'none',transition:'background 0.2s'}}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg-secondary)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
              <div style={{width:'32px',height:'32px',borderRadius:'9px',background:secteurColor(m.secteur_slug)+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <span style={{fontSize:'11px',fontWeight:900,color:secteurColor(m.secteur_slug)}}>{m.numero}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:'13px',fontWeight:600,color:'var(--text-primary)',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.titre}</p>
                <p style={{fontSize:'11px',color:'var(--text-secondary)',margin:'2px 0 0 0'}}>{secteurName(m.secteur_slug)}</p>
              </div>
              {m.libre
                ? <span style={{fontSize:'9px',fontWeight:700,padding:'2px 7px',borderRadius:'6px',background:'rgba(34,197,94,0.12)',color:'#22c55e',flexShrink:0}}>Gratuit</span>
                : <span style={{fontSize:'9px',fontWeight:700,padding:'2px 7px',borderRadius:'6px',background:'rgba(139,92,246,0.12)',color:'#8b5cf6',flexShrink:0}}>Membre</span>}
            </Link>
          ))}
        </div>

        {/* Derniers utilisateurs */}
        <div style={{borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)',overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <h2 style={{fontSize:'14px',fontWeight:900,color:'var(--text-primary)',margin:0}}>Nouveaux membres</h2>
            <Link href="/admin/utilisateurs" style={{fontSize:'12px',color:'var(--orange)',textDecoration:'none',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'3px'}}>
              Tout voir <ArrowRight size={12}/>
            </Link>
          </div>
          {loading ? (
            <div style={{padding:'30px',textAlign:'center',color:'var(--text-secondary)',fontSize:'13px'}}>Chargement...</div>
          ) : recentUsers.length === 0 ? (
            <div style={{padding:'30px',textAlign:'center',color:'var(--text-secondary)',fontSize:'13px'}}>Aucun utilisateur</div>
          ) : recentUsers.map((u,i) => (
            <div key={u.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 18px',borderBottom:i<recentUsers.length-1?'1px solid var(--border)':'none'}}>
              <div style={{width:'34px',height:'34px',borderRadius:'50%',background:'var(--orange)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'white',fontSize:'13px',fontWeight:700}}>
                {(u.prenom?.[0] || u.email?.[0] || '?').toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:'13px',fontWeight:600,color:'var(--text-primary)',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.prenom} {u.nom}</p>
                <p style={{fontSize:'11px',color:'var(--text-secondary)',margin:'2px 0 0 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.email}{u.pays ? ` · ${u.pays}` : ''}</p>
              </div>
              {u.role && u.role!=='user' && (
                <span style={{fontSize:'9px',fontWeight:700,padding:'2px 7px',borderRadius:'6px',background:'rgba(212,80,15,0.12)',color:'var(--orange)',flexShrink:0}}>{u.role}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Répartition par secteur */}
      <div style={{marginTop:'20px',borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)',padding:'18px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
          <h2 style={{fontSize:'14px',fontWeight:900,color:'var(--text-primary)',margin:0}}>Modules par secteur</h2>
          <Link href="/admin/secteurs" style={{fontSize:'12px',color:'var(--orange)',textDecoration:'none',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'3px'}}>
            Gérer <ArrowRight size={12}/>
          </Link>
        </div>
        {activeSectors === 0 ? (
          <p style={{fontSize:'13px',color:'var(--text-secondary)',textAlign:'center',padding:'16px',opacity:0.6}}>Aucun module réparti pour le moment</p>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'10px'}}>
            {Object.entries(modulesBySector).sort((a,b)=>b[1]-a[1]).map(([slug, count]) => (
              <Link key={slug} href={`/admin/modules?secteur=${slug}`}
                style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',textDecoration:'none'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:secteurColor(slug),flexShrink:0}}/>
                <span style={{flex:1,fontSize:'12px',fontWeight:600,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{secteurName(slug)}</span>
                <span style={{fontSize:'12px',fontWeight:900,color:secteurColor(slug),flexShrink:0}}>{count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}