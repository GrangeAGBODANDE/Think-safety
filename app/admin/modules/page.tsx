'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SECTEURS } from '@/lib/secteurs-data'
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Lock, Unlock, BookOpen, Video, FileText, Filter, ChevronDown } from 'lucide-react'

export default function AdminModulesPage() {
  const [modules,   setModules]   = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [sectFilter,setSectFilter] = useState('tous')
  const [msg,       setMsg]       = useState('')

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('modules').select('*').order('secteur_slug').order('ordre')
    setModules(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleStatut(m: any) {
    const s = m.statut === 'published' ? 'draft' : 'published'
    await supabase.from('modules').update({ statut: s }).eq('id', m.id)
    load()
  }

  async function toggleLibre(m: any) {
    await supabase.from('modules').update({ libre: !m.libre }).eq('id', m.id)
    load()
  }

  async function deleteModule(id: string) {
    if (!confirm('Supprimer ce module définitivement ?')) return
    await supabase.from('modules').delete().eq('id', id)
    load()
    flash('Module supprimé.')
  }

  function flash(s: string) { setMsg(s); setTimeout(() => setMsg(''), 3000) }

  const filtered = modules.filter(m => {
    const matchSearch = m.titre?.toLowerCase().includes(search.toLowerCase()) || m.secteur_slug?.includes(search.toLowerCase())
    const matchSect   = sectFilter === 'tous' || m.secteur_slug === sectFilter
    return matchSearch && matchSect
  })

  const grouped = SECTEURS.reduce((acc: any, s) => {
    const mods = filtered.filter(m => m.secteur_slug === s.slug)
    if (mods.length > 0 || sectFilter === s.slug) acc[s.slug] = { secteur: s, mods }
    return acc
  }, {})

  const totalPublished = modules.filter(m => m.statut === 'published').length
  const totalLibre     = modules.filter(m => m.libre).length

  return (
    <div style={{padding:'24px',maxWidth:'1200px'}}>

      {msg && (
        <div style={{position:'fixed',top:'80px',right:'24px',padding:'12px 20px',borderRadius:'12px',background:'#22c55e',color:'white',fontSize:'13px',fontWeight:700,zIndex:50,boxShadow:'0 8px 24px rgba(0,0,0,0.2)'}}>
          {msg}
        </div>
      )}

      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'28px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h1 style={{fontSize:'1.5rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 4px 0'}}>Modules & Cours</h1>
          <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:0}}>
            {modules.length} modules · {totalPublished} publiés · {totalLibre} gratuits
          </p>
        </div>
        <Link href="/admin/modules/nouveau"
          style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'10px 18px',borderRadius:'12px',background:'var(--orange)',color:'white',textDecoration:'none',fontSize:'13px',fontWeight:700}}>
          <Plus size={14}/> Nouveau module
        </Link>
      </div>

      {/* Stats rapides */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'12px',marginBottom:'24px'}}>
        {[
          {label:'Total modules',   val:modules.length,        color:'#3b82f6'},
          {label:'Publiés',         val:totalPublished,        color:'#22c55e'},
          {label:'Brouillons',      val:modules.length-totalPublished, color:'#f59e0b'},
          {label:'Accès libre',     val:totalLibre,            color:'var(--orange)'},
          {label:'Membres requis',  val:modules.length-totalLibre, color:'#8b5cf6'},
          {label:'Secteurs actifs', val:Object.keys(grouped).length, color:'#06b6d4'},
        ].map((s,i) => (
          <div key={i} style={{padding:'14px 16px',borderRadius:'14px',border:'1px solid var(--border)',background:'var(--bg-card)'}}>
            <div style={{fontSize:'1.4rem',fontWeight:900,color:s.color}}>{s.val}</div>
            <div style={{fontSize:'11px',color:'var(--text-secondary)',marginTop:'2px'}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{display:'flex',gap:'10px',marginBottom:'20px',flexWrap:'wrap'}}>
        <div style={{position:'relative',flex:1,minWidth:'200px'}}>
          <Search size={14} style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'var(--text-secondary)'}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un module..."
            style={{width:'100%',padding:'9px 12px 9px 36px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'13px',outline:'none',boxSizing:'border-box'}}/>
        </div>
        <div style={{position:'relative'}}>
          <Filter size={13} style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:'var(--text-secondary)'}}/>
          <select value={sectFilter} onChange={e=>setSectFilter(e.target.value)}
            style={{padding:'9px 28px 9px 30px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'13px',outline:'none',cursor:'pointer',appearance:'none'}}>
            <option value="tous">Tous les secteurs</option>
            {SECTEURS.map(s => <option key={s.slug} value={s.slug}>{s.nom}</option>)}
          </select>
          <ChevronDown size={12} style={{position:'absolute',right:'8px',top:'50%',transform:'translateY(-50%)',color:'var(--text-secondary)',pointerEvents:'none'}}/>
        </div>
      </div>

      {/* Liste groupée par secteur */}
      {loading ? (
        <div style={{padding:'60px',textAlign:'center',color:'var(--text-secondary)'}}>Chargement...</div>
      ) : modules.length === 0 ? (
        <div style={{padding:'60px',textAlign:'center',border:'2px dashed var(--border)',borderRadius:'16px'}}>
          <BookOpen size={40} style={{color:'var(--text-secondary)',margin:'0 auto 16px auto',display:'block',opacity:0.4}}/>
          <p style={{color:'var(--text-secondary)',marginBottom:'16px'}}>Aucun module créé</p>
          <Link href="/admin/modules/nouveau" style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'10px 20px',borderRadius:'12px',background:'var(--orange)',color:'white',textDecoration:'none',fontSize:'13px',fontWeight:700}}>
            <Plus size={14}/> Créer le premier module
          </Link>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
          {Object.values(grouped).map(({ secteur: s, mods }: any) => (
            <div key={s.slug} style={{borderRadius:'16px',border:'1px solid var(--border)',overflow:'hidden'}}>
              {/* Header secteur */}
              <div style={{padding:'12px 16px',background:s.couleur+'15',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{width:'8px',height:'8px',borderRadius:'50%',background:s.couleur,flexShrink:0}}/>
                  <span style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)'}}>{s.nom}</span>
                  <span style={{fontSize:'11px',padding:'2px 8px',borderRadius:'99px',background:s.couleur+'20',color:s.couleur,fontWeight:700}}>{mods.length} module{mods.length>1?'s':''}</span>
                </div>
                <Link href={`/admin/modules/nouveau?secteur=${s.slug}`}
                  style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'5px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-secondary)',textDecoration:'none',fontSize:'11px',fontWeight:600}}>
                  <Plus size={11}/> Ajouter
                </Link>
              </div>
              {/* Modules du secteur */}
              {mods.length === 0 ? (
                <div style={{padding:'20px',textAlign:'center',color:'var(--text-secondary)',fontSize:'13px'}}>Aucun module pour ce secteur</div>
              ) : (
                mods.map((m: any, i: number) => (
                  <div key={m.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',borderBottom:i<mods.length-1?'1px solid var(--border)':'none',background:'var(--bg-card)',transition:'background 0.2s'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg-secondary)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='var(--bg-card)'}>
                    {/* Numéro */}
                    <div style={{width:'32px',height:'32px',borderRadius:'10px',background:s.couleur+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <span style={{fontSize:'11px',fontWeight:900,color:s.couleur}}>{m.numero||String(i+1).padStart(2,'0')}</span>
                    </div>
                    {/* Infos */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'3px',flexWrap:'wrap'}}>
                        <span style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.titre}</span>
                        {m.libre
                          ? <span style={{fontSize:'10px',padding:'1px 6px',borderRadius:'6px',background:'rgba(34,197,94,0.12)',color:'#22c55e',fontWeight:700,flexShrink:0}}>Gratuit</span>
                          : <span style={{fontSize:'10px',padding:'1px 6px',borderRadius:'6px',background:'rgba(139,92,246,0.12)',color:'#8b5cf6',fontWeight:700,flexShrink:0}}>Membre</span>}
                        {m.statut==='draft' && <span style={{fontSize:'10px',padding:'1px 6px',borderRadius:'6px',background:'rgba(245,158,11,0.12)',color:'#f59e0b',fontWeight:700,flexShrink:0}}>Brouillon</span>}
                      </div>
                      <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                        {(m.types||[]).map((t:string) => (
                          <span key={t} style={{fontSize:'10px',color:'var(--text-secondary)',display:'flex',alignItems:'center',gap:'3px'}}>
                            {t==='video'&&<><Video size={9}/>Vidéo</>}
                            {t==='document'&&<><FileText size={9}/>Doc</>}
                            {t==='text'&&<><BookOpen size={9}/>Cours</>}
                          </span>
                        ))}
                        {m.duree && <span style={{fontSize:'10px',color:'var(--text-secondary)'}}>{m.duree}</span>}
                        <span style={{fontSize:'10px',color:'var(--text-secondary)'}}>{m.vues||0} vues</span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div style={{display:'flex',gap:'6px',flexShrink:0}}>
                      <button onClick={()=>toggleLibre(m)} title={m.libre?'Rendre premium':'Rendre gratuit'}
                        style={{padding:'6px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',cursor:'pointer',display:'flex',alignItems:'center'}}>
                        {m.libre ? <Unlock size={13} style={{color:'#22c55e'}}/> : <Lock size={13} style={{color:'#8b5cf6'}}/>}
                      </button>
                      <button onClick={()=>toggleStatut(m)} title={m.statut==='published'?'Mettre en brouillon':'Publier'}
                        style={{padding:'6px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',cursor:'pointer',display:'flex',alignItems:'center'}}>
                        {m.statut==='published' ? <Eye size={13} style={{color:'#22c55e'}}/> : <EyeOff size={13} style={{color:'#f59e0b'}}/>}
                      </button>
                      <Link href={`/admin/modules/${m.id}`}
                        style={{padding:'6px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',display:'flex',alignItems:'center'}}>
                        <Edit size={13} style={{color:'var(--text-secondary)'}}/>
                      </Link>
                      <button onClick={()=>deleteModule(m.id)}
                        style={{padding:'6px',borderRadius:'8px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.08)',cursor:'pointer',display:'flex',alignItems:'center'}}>
                        <Trash2 size={13} style={{color:'#ef4444'}}/>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}