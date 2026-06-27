'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SECTEURS } from '@/lib/secteurs-data'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, FileText, BookOpen, Lock, Download, Clock, Users, Volume2, Share2, CheckSquare, Square, CheckCircle } from 'lucide-react'

const IMGS: Record<string,string> = {
  'construction-btp':         'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
  'industrie-manufacturiere': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80',
  'sante-medical':            'https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200&q=80',
  'agriculture':              'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80',
  'transport-logistique':     'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=80',
  'mines-carrieres':          'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=1200&q=80',
  'energie':                  'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=80',
  'chimie-pharmacie':         'https://images.unsplash.com/photo-1616400619175-5beda3a17896?w=1200&q=80',
  'bureaux-tertiaire':        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
  'restauration-hotellerie':  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
  'commerce-distribution':    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1200&q=80',
  'education-formation':      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80',
  'sport-loisirs':            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
  'numerique-it':             'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
  'maritime-peche':           'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=1200&q=80',
  'aerien':                   'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80',
  'foret-environnement':      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80',
  'securite-defense':         'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80',
}

function ytId(url: string): string | null {
  if (!url) return null
  if (url.length === 11 && !url.includes('/') && !url.includes('.')) return url
  const m = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
  return m ? m[1] : null
}

export default function ModulePage() {
  const params  = useParams()
  const slug    = params.slug   as string
  const modSlug = params.module as string
  const secteur = SECTEURS.find(s => s.slug === slug)

  const [allMods,    setAllMods]    = useState<any[]>([])
  const [mod,        setMod]        = useState<any>(null)
  const [docs,       setDocs]       = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [user,       setUser]       = useState<any>(null)
  const [authLoading,setAuthLoading]= useState(true)
  const [objChecked, setObjChecked] = useState(false)
  const [objTexte,   setObjTexte]   = useState('')
  const [dateFin,    setDateFin]    = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setAuthLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!slug) return
    async function load() {
      const { data: mods } = await supabase.from('modules')
        .select('*').eq('secteur_slug', slug).eq('statut', 'published')
        .order('ordre', { ascending: true })
      setAllMods(mods || [])
      const current = (mods || []).find(m => m.slug === modSlug)
      setMod(current || null)
      if (current) {
        const { data: d } = await supabase.from('module_documents').select('*').eq('module_id', current.id)
        setDocs(d || [])
        // Incrémenter les vues
        await supabase.from('modules').update({ vues: (current.vues || 0) + 1 }).eq('id', current.id)
      }
      setLoading(false)
    }
    load()
  }, [slug, modSlug])

  // Charger progression existante
  useEffect(() => {
    if (!user || !mod) return
    supabase.from('user_module_progress')
      .select('*').eq('user_id', user.id).eq('module_id', mod.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProgressSaved(true)
          if (data.completed_at) setDateFin(data.completed_at.split('T')[0])
          if (data.objectif) setObjTexte(data.objectif)
        }
      })
  }, [user, mod])

  const saveProgress = async (completed: boolean) => {
    if (!user || !mod) return
    setSaving(true)
    await supabase.from('user_module_progress').upsert({
      user_id: user.id,
      module_id: mod.id,
      secteur_slug: slug,
      completed_at: completed ? new Date().toISOString() : null,
      objectif: objTexte,
    }, { onConflict: 'user_id,module_id' })
    setSaving(false)
    setProgressSaved(true)
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',color:'var(--text-secondary)'}}>Chargement du cours...</div>
    </div>
  )

  if (!secteur || !mod) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-main)'}}>
      <div style={{textAlign:'center'}}>
        <p style={{color:'var(--text-secondary)',marginBottom:'16px'}}>Module introuvable</p>
        <Link href={`/secteurs/${slug}`} style={{padding:'10px 24px',borderRadius:'12px',background:'var(--orange)',color:'white',textDecoration:'none',fontWeight:700}}>Retour au secteur</Link>
      </div>
    </div>
  )

  const modIdx = allMods.findIndex(m => m.slug === modSlug)
  const prev   = allMods[modIdx - 1]
  const next   = allMods[modIdx + 1]
  const img    = IMGS[slug]
  const c      = secteur.couleur
  const hasAccess = mod.libre || !!user
  const decouvrir = allMods.filter(m => m.slug !== modSlug).slice(0, 3)
  const videoId = ytId(mod.youtube_id || '')

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar />

      {/* HERO */}
      <div style={{paddingTop:'64px'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',height:'220px',overflow:'hidden'}}>
          <div style={{position:'relative',overflow:'hidden'}}>
            {img ? <img src={img} alt={secteur.nom} style={{width:'100%',height:'100%',objectFit:'cover',filter:'brightness(0.55) saturate(0.7)'}}/>
                 : <div style={{width:'100%',height:'100%',background:`linear-gradient(135deg,${c}30,#0a1628)`}}/>}
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to right,transparent 60%,rgba(6,13,26,0.5))'}}/>
          </div>
          <div style={{background:`linear-gradient(135deg,${c},${c}bb)`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'8px',position:'relative'}}>
            <span style={{fontSize:'4rem',fontWeight:900,color:'white',lineHeight:1,letterSpacing:'-0.04em'}}>{mod.numero}</span>
            <div style={{width:'40px',height:'3px',background:'rgba(255,255,255,0.45)',borderRadius:'99px'}}/>
            {!mod.libre && (
              <div style={{position:'absolute',top:'10px',right:'10px',display:'flex',alignItems:'center',gap:'4px',padding:'4px 8px',borderRadius:'8px',fontSize:'10px',fontWeight:700,color:'white',background:'rgba(0,0,0,0.3)'}}>
                <Lock size={10}/> Membres
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CORPS */}
      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 24px',display:'grid',gridTemplateColumns:'1fr 300px',gap:'48px',alignItems:'start'}}>

        <article style={{paddingTop:'36px',paddingBottom:'96px'}}>
          {/* Fil d'ariane */}
          <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'var(--text-secondary)',marginBottom:'20px',flexWrap:'wrap'}}>
            <Link href="/secteurs" style={{color:'var(--text-secondary)',textDecoration:'none'}}>Secteurs</Link>
            <ChevronRight size={12}/>
            <Link href={`/secteurs/${slug}`} style={{color:'var(--text-secondary)',textDecoration:'none'}}>{secteur.nom}</Link>
            <ChevronRight size={12}/>
            <span style={{color:'var(--text-primary)',fontWeight:600}}>Leçon {mod.numero}</span>
          </div>

          <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.15em',color:c,margin:'0 0 8px 0'}}>Leçon {mod.numero}</p>
          <h1 style={{fontSize:'clamp(1.5rem,3vw,2.3rem)',fontWeight:900,color:'var(--text-primary)',margin:'0 0 16px 0',lineHeight:1.15}}>{mod.titre}</h1>

          <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'32px',fontSize:'12px',color:'var(--text-secondary)'}}>
            {mod.duree && <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><Clock size={12}/>{mod.duree}</span>}
            <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><Users size={12}/>{(mod.vues||0).toLocaleString()} vues</span>
            {progressSaved && <span style={{display:'inline-flex',alignItems:'center',gap:'4px',color:'#22c55e',fontWeight:600}}><CheckCircle size={12}/>Progression sauvegardée</span>}
          </div>

          {/* Description / intro toujours visible */}
          {mod.description && (
            <p style={{fontSize:'1rem',lineHeight:1.9,color:'var(--text-secondary)',marginBottom:'24px'}}>{mod.description}</p>
          )}

          {/* AUTH GATE */}
          {!hasAccess && !authLoading ? (
            <div style={{position:'relative',marginTop:'8px'}}>
              <div style={{filter:'blur(5px)',pointerEvents:'none',userSelect:'none',maxHeight:'160px',overflow:'hidden',opacity:0.5}}
                dangerouslySetInnerHTML={{ __html: mod.contenu_texte || '<p>Contenu du module...</p>' }}/>
              <div style={{position:'absolute',inset:0,background:`linear-gradient(to bottom, transparent 0%, var(--bg-main) 70%)`}}/>
              <div style={{position:'relative',zIndex:2,display:'flex',justifyContent:'center',paddingTop:'16px'}}>
                <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'24px',padding:'36px 32px',textAlign:'center',maxWidth:'420px',width:'100%',boxShadow:'0 24px 64px rgba(0,0,0,0.15)'}}>
                  <div style={{width:'56px',height:'56px',borderRadius:'18px',background:c+'20',border:'1px solid '+c+'30',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
                    <Lock size={24} style={{color:c}}/>
                  </div>
                  <h3 style={{fontSize:'1.2rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 10px 0'}}>Module réservé aux membres</h3>
                  <p style={{fontSize:'14px',color:'var(--text-secondary)',margin:'0 0 24px 0',lineHeight:1.7}}>
                    Créez un compte <strong style={{color:'var(--text-primary)'}}>gratuit</strong> pour accéder à tous les modules.
                  </p>
                  <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                    <Link href={`/inscription?redirect=/secteurs/${slug}/${modSlug}`} style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'13px 24px',borderRadius:'14px',fontSize:'14px',fontWeight:700,color:'white',textDecoration:'none',background:c,boxShadow:'0 6px 20px '+c+'40'}}>
                      Créer un compte gratuit
                    </Link>
                    <Link href={`/connexion?redirect=/secteurs/${slug}/${modSlug}`} style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'13px 24px',borderRadius:'14px',fontSize:'14px',fontWeight:700,color:'var(--text-primary)',textDecoration:'none',background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
                      J&apos;ai déjà un compte
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* VIDÉO en haut si disponible */}
              {videoId && (
                <div style={{marginBottom:'32px',borderRadius:'16px',overflow:'hidden',border:'1px solid var(--border)'}}>
                  <div style={{position:'relative',paddingBottom:'56.25%',height:0,background:'#000'}}>
                    <iframe src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`} title={mod.titre}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                      style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}}/>
                  </div>
                </div>
              )}

              {/* CONTENU HTML RICHE */}
              <div className="course-body" style={{marginBottom:'40px'}}
                dangerouslySetInnerHTML={{ __html: mod.contenu_texte || '<p>Contenu à venir...</p>' }}/>

              <style>{`
                .course-body h2{font-size:1.15rem;font-weight:900;color:${c};margin:28px 0 14px;padding-top:12px;border-top:1px solid var(--border)}
                .course-body h3{font-size:1.05rem;font-weight:700;color:var(--text-primary);margin:20px 0 10px}
                .course-body p{font-size:1rem;line-height:1.9;color:var(--text-secondary);margin:0 0 16px}
                .course-body blockquote{padding:18px 22px;border-left:4px solid ${c};background:${c}12;border-radius:0 12px 12px 0;margin:20px 0;font-style:italic}
                .course-body blockquote p{color:var(--text-primary);margin:0}
                .course-body ul,.course-body ol{padding-left:24px;margin:0 0 16px}
                .course-body li{font-size:1rem;color:var(--text-secondary);line-height:1.8;margin-bottom:8px}
                .course-body img{max-width:100%;border-radius:14px;border:1px solid var(--border);margin:20px 0;display:block}
                .course-body iframe{width:100%;aspect-ratio:16/9;border-radius:14px;margin:20px 0;border:none}
                .course-body mark{background:${c}35;color:var(--text-primary);border-radius:3px;padding:1px 4px}
                .course-body strong{color:var(--text-primary);font-weight:700}
                .course-body hr{border:none;border-top:2px solid var(--border);margin:28px 0}
                .course-body a{color:${c};text-decoration:underline}
              `}</style>

              {/* DOCUMENTS */}
              {docs.length > 0 && (
                <div style={{marginBottom:'36px'}}>
                  <p style={{fontSize:'12px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text-secondary)',margin:'0 0 12px 0'}}>Documents du module</p>
                  <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                    {docs.map((doc) => (
                      <a key={doc.id} href={doc.url || '#'} target="_blank" rel="noopener noreferrer"
                        style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-card)',textDecoration:'none'}}>
                        <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'rgba(239,68,68,0.12)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <FileText size={16} style={{color:'#ef4444'}}/>
                        </div>
                        <div style={{flex:1}}>
                          <p style={{fontSize:'13px',fontWeight:600,color:'var(--text-primary)',margin:0}}>{doc.titre}</p>
                          {(doc.pages || doc.taille) && <p style={{fontSize:'11px',color:'var(--text-secondary)',margin:'2px 0 0 0'}}>{doc.pages ? `${doc.pages} pages` : ''}{doc.pages && doc.taille ? ' · ' : ''}{doc.taille || ''}</p>}
                        </div>
                        <Download size={14} style={{color:'var(--orange)',flexShrink:0}}/>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* FIN DE LEÇON */}
              <div style={{marginTop:'48px',padding:'24px',borderRadius:'16px',background:'var(--bg-card)',border:`1px solid ${progressSaved?'rgba(34,197,94,0.3)':'var(--border)'}`}}>
                {progressSaved && (
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px',padding:'8px 14px',borderRadius:'10px',background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)'}}>
                    <CheckCircle size={15} style={{color:'#22c55e'}}/>
                    <span style={{fontSize:'13px',fontWeight:600,color:'#22c55e'}}>Progression sauvegardée dans votre profil</span>
                  </div>
                )}
                <p style={{fontSize:'12px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text-secondary)',margin:'0 0 12px 0'}}>Leçon terminée le</p>
                <input type="date" value={dateFin} onChange={e=>setDateFin(e.target.value)}
                  style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'14px',marginBottom:'20px',boxSizing:'border-box'}}/>
                <div style={{padding:'18px',borderRadius:'12px',background:'var(--bg-secondary)',border:'1px solid var(--border)',marginBottom:'16px'}}>
                  <p style={{fontSize:'14px',fontWeight:900,color:'var(--text-primary)',margin:'0 0 12px 0'}}>Mon objectif</p>
                  <label style={{display:'flex',alignItems:'flex-start',gap:'10px',cursor:'pointer',marginBottom:'10px'}}>
                    <button onClick={()=>setObjChecked(!objChecked)} style={{background:'none',border:'none',padding:0,cursor:'pointer',marginTop:'1px',flexShrink:0}}>
                      {objChecked ? <CheckSquare size={18} style={{color:c}}/> : <Square size={18} style={{color:'var(--text-secondary)'}}/>}
                    </button>
                    <span style={{fontSize:'13px',color:'var(--text-secondary)',lineHeight:1.6}}>Commencer le module suivant cette semaine.</span>
                  </label>
                  <textarea value={objTexte} onChange={e=>setObjTexte(e.target.value)} placeholder="Autre objectif..."
                    style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-main)',color:'var(--text-primary)',fontSize:'13px',resize:'vertical',minHeight:'72px',boxSizing:'border-box',fontFamily:'inherit'}}/>
                </div>
                <div style={{display:'flex',gap:'10px'}}>
                  <button onClick={()=>saveProgress(false)} disabled={saving}
                    style={{flex:1,padding:'11px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-secondary)',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>
                    {saving?'Sauvegarde...':'💾 Sauvegarder'}
                  </button>
                  <button onClick={()=>saveProgress(true)} disabled={saving}
                    style={{flex:1,padding:'11px',borderRadius:'12px',border:'none',background:c,color:'white',fontSize:'13px',fontWeight:700,cursor:'pointer',boxShadow:`0 4px 14px ${c}40`}}>
                    {saving?'...':'✅ Marquer comme terminé'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* NAVIGATION */}
          <div style={{display:'flex',justifyContent:'space-between',marginTop:'40px',gap:'16px',flexWrap:'wrap'}}>
            {prev ? (
              <Link href={`/secteurs/${slug}/${prev.slug}`} style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 20px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-primary)',textDecoration:'none',fontSize:'13px',fontWeight:700}}>
                <ChevronLeft size={16}/> Précédent
              </Link>
            ) : <div/>}
            {next && (
              <Link href={`/secteurs/${slug}/${next.slug}`} style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 20px',borderRadius:'12px',background:c,color:'white',textDecoration:'none',fontSize:'13px',fontWeight:700,boxShadow:'0 4px 16px '+c+'40'}}>
                {!next.libre && <Lock size={12}/>} Suivant <ChevronRight size={16}/>
              </Link>
            )}
          </div>

          {/* À DÉCOUVRIR AUSSI */}
          {decouvrir.length > 0 && (
            <div style={{marginTop:'56px',paddingTop:'32px',borderTop:'1px solid var(--border)'}}>
              <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.15em',color:'var(--text-secondary)',margin:'0 0 16px 0'}}>À découvrir aussi</p>
              <div style={{display:'flex',flexDirection:'column',gap:'1px',border:'1px solid var(--border)',borderRadius:'14px',overflow:'hidden'}}>
                {decouvrir.map(m => (
                  <Link key={m.id} href={`/secteurs/${slug}/${m.slug}`} style={{display:'flex',alignItems:'center',gap:'16px',padding:'14px 16px',background:'var(--bg-card)',textDecoration:'none',borderBottom:'1px solid var(--border)'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg-secondary)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='var(--bg-card)'}>
                    <div style={{width:'48px',height:'36px',borderRadius:'8px',background:c+'20',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <span style={{fontSize:'13px',fontWeight:900,color:c}}>{m.numero}</span>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.titre}</p>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'11px',fontWeight:700,flexShrink:0,color:m.libre?'#22c55e':'var(--text-secondary)'}}>
                      {m.libre ? 'Gratuit' : <><Lock size={10}/>Membre</>}
                      <ChevronRight size={12} style={{color:c}}/>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* SIDEBAR */}
        <aside style={{paddingTop:'36px',position:'sticky',top:'80px'}}>
          <div style={{borderRadius:'14px',overflow:'hidden',border:'1px solid var(--border)',marginBottom:'20px'}}>
            <div style={{height:'110px',position:'relative',background:c+'20'}}>
              {img && <img src={img} alt={secteur.nom} style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.45}}/>}
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 100%)'}}/>
              <div style={{position:'absolute',bottom:'10px',left:'12px',right:'12px'}}>
                <p style={{color:'white',fontSize:'12px',fontWeight:900,margin:0}}>{secteur.nom}</p>
                <p style={{color:'rgba(255,255,255,0.55)',fontSize:'10px',margin:'2px 0 0 0'}}>Leçon {mod.numero} / {allMods.length}</p>
              </div>
            </div>
          </div>

          <div style={{padding:'14px',borderRadius:'14px',border:'1px solid var(--border)',background:'var(--bg-card)',marginBottom:'16px'}}>
            <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text-secondary)',margin:'0 0 10px 0'}}>Téléchargement</p>
            <div style={{display:'flex',gap:'6px'}}>
              {[{icon:FileText,label:'PDF'},{icon:Volume2,label:'Audio'},{icon:Share2,label:'Partager'}].map(({icon:Icon,label}) => (
                <button key={label} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'5px',padding:'10px 6px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',cursor:'pointer'}}>
                  <Icon size={16} style={{color:'var(--text-secondary)'}}/>
                  <span style={{fontSize:'10px',fontWeight:600,color:'var(--text-secondary)'}}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{borderRadius:'14px',border:'1px solid var(--border)',background:'var(--bg-card)',overflow:'hidden'}}>
            <div style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text-secondary)',margin:0}}>Table des matières</p>
              <BookOpen size={13} style={{color:'var(--text-secondary)'}}/>
            </div>
            <div style={{maxHeight:'380px',overflowY:'auto'}}>
              {allMods.map(m => {
                const isActive = m.slug === modSlug
                return (
                  <Link key={m.id} href={`/secteurs/${slug}/${m.slug}`}
                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderBottom:'1px solid var(--border)',textDecoration:'none',background:isActive?c+'15':'transparent'}}
                    onMouseEnter={e=>{ if(!isActive)(e.currentTarget as HTMLElement).style.background='var(--bg-secondary)' }}
                    onMouseLeave={e=>{ if(!isActive)(e.currentTarget as HTMLElement).style.background='transparent' }}>
                    <span style={{width:'26px',height:'26px',borderRadius:'8px',background:isActive?c+'30':'var(--bg-secondary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:900,color:isActive?c:'var(--text-secondary)',flexShrink:0}}>{m.numero}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:'12px',fontWeight:isActive?700:500,color:isActive?'var(--text-primary)':'var(--text-secondary)',margin:0,lineHeight:1.35,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.titre}</p>
                    </div>
                    {!m.libre && <Lock size={10} style={{color:'var(--text-secondary)',flexShrink:0,opacity:0.5}}/>}
                  </Link>
                )
              })}
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  )
}