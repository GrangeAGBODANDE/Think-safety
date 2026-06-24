'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { SECTEURS } from '@/lib/secteurs-data'
import { Search, BookOpen, FileText, Play, Image as ImgIcon, Lock, ChevronRight } from 'lucide-react'

const TYPE_ICONS: Record<string,any> = { video:Play, document:FileText, image:ImgIcon, text:BookOpen }
const TYPE_LABELS: Record<string,string> = { video:'Vidéo', document:'Document', image:'Images', text:'Cours' }

function RechercheContent() {
  const searchParams  = useSearchParams()
  const initialQuery  = searchParams.get('q') || ''
  const [query,    setQuery]    = useState(initialQuery)
  const [results,  setResults]  = useState<any[]>([])
  const [secteurs, setSecteurs] = useState<any[]>([])
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)

  const search = async (q: string) => {
    if (!q.trim()) { setResults([]); setSecteurs([]); setSearched(false); return }
    setLoading(true); setSearched(true)
    // Chercher dans les modules
    const { data: mods } = await supabase
      .from('modules')
      .select('id, titre, description, numero, slug, secteur_slug, types, libre, duree')
      .eq('statut', 'published')
      .or(`titre.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(20)
    setResults(mods || [])
    // Filtrer les secteurs correspondants
    const matchSect = SECTEURS.filter(s =>
      s.nom.toLowerCase().includes(q.toLowerCase()) ||
      s.description.toLowerCase().includes(q.toLowerCase()) ||
      s.risques.some(r => r.toLowerCase().includes(q.toLowerCase()))
    )
    setSecteurs(matchSect)
    setLoading(false)
  }

  useEffect(() => { if (initialQuery) search(initialQuery) }, [])

  const secteurNom   = (slug: string) => SECTEURS.find(s=>s.slug===slug)?.nom || slug
  const secteurColor = (slug: string) => SECTEURS.find(s=>s.slug===slug)?.couleur || 'var(--orange)'

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>
      <div style={{maxWidth:'900px',margin:'0 auto',padding:'48px 24px 96px'}}>

        {/* Barre de recherche */}
        <div style={{marginBottom:'40px',textAlign:'center'}}>
          <h1 style={{fontSize:'1.8rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 24px 0'}}>Rechercher une formation</h1>
          <div style={{position:'relative',maxWidth:'600px',margin:'0 auto'}}>
            <Search size={18} style={{position:'absolute',left:'16px',top:'50%',transform:'translateY(-50%)',color:'var(--text-secondary)'}}/>
            <input
              value={query}
              onChange={e=>setQuery(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&search(query)}
              placeholder="Sécurité BTP, EPI, risques chimiques..."
              style={{width:'100%',padding:'14px 16px 14px 48px',borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-primary)',fontSize:'15px',outline:'none',boxSizing:'border-box'}}
              onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
              onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}
              autoFocus
            />
            <button onClick={()=>search(query)}
              style={{position:'absolute',right:'8px',top:'50%',transform:'translateY(-50%)',padding:'8px 18px',borderRadius:'11px',background:'var(--orange)',color:'white',border:'none',fontSize:'13px',fontWeight:700,cursor:'pointer'}}>
              Chercher
            </button>
          </div>
        </div>

        {/* Résultats */}
        {loading ? (
          <div style={{textAlign:'center',padding:'40px',color:'var(--text-secondary)'}}>Recherche en cours...</div>
        ) : searched && results.length === 0 && secteurs.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 24px',border:'2px dashed var(--border)',borderRadius:'20px'}}>
            <Search size={40} style={{color:'var(--text-secondary)',margin:'0 auto 16px',display:'block',opacity:0.4}}/>
            <p style={{fontSize:'1rem',fontWeight:700,color:'var(--text-primary)',marginBottom:'8px'}}>Aucun résultat pour &quot;{query}&quot;</p>
            <p style={{fontSize:'14px',color:'var(--text-secondary)',marginBottom:'20px'}}>Essayez avec d&apos;autres mots-clés ou explorez les secteurs directement.</p>
            <Link href="/secteurs" style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'10px 20px',borderRadius:'12px',background:'var(--orange)',color:'white',textDecoration:'none',fontSize:'13px',fontWeight:700}}>
              Voir tous les secteurs
            </Link>
          </div>
        ) : (
          <>
            {/* Secteurs trouvés */}
            {secteurs.length > 0 && (
              <div style={{marginBottom:'32px'}}>
                <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text-secondary)',margin:'0 0 12px 0'}}>Secteurs ({secteurs.length})</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:'10px'}}>
                  {secteurs.map(s => (
                    <Link key={s.slug} href={`/secteurs/${s.slug}`}
                      style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-card)',textDecoration:'none',transition:'all 0.2s'}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=s.couleur+'50';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)'}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.transform='translateY(0)'}}>
                      <div style={{width:'8px',height:'8px',borderRadius:'50%',background:s.couleur,flexShrink:0}}/>
                      <span style={{flex:1,fontSize:'13px',fontWeight:700,color:'var(--text-primary)'}}>{s.nom}</span>
                      <ChevronRight size={13} style={{color:'var(--text-secondary)'}}/>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Modules trouvés */}
            {results.length > 0 && (
              <div>
                <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text-secondary)',margin:'0 0 12px 0'}}>Modules ({results.length})</p>
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  {results.map(m => {
                    const c = secteurColor(m.secteur_slug)
                    return (
                      <Link key={m.id} href={`/secteurs/${m.secteur_slug}/${m.slug}`}
                        style={{display:'flex',alignItems:'center',gap:'16px',padding:'16px 18px',borderRadius:'14px',border:'1px solid var(--border)',background:'var(--bg-card)',textDecoration:'none',transition:'all 0.2s'}}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=c+'50';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)'}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.transform='translateY(0)'}}>
                        <div style={{width:'44px',height:'44px',borderRadius:'12px',background:c+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <span style={{fontSize:'13px',fontWeight:900,color:c}}>{m.numero}</span>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'4px',flexWrap:'wrap'}}>
                            <span style={{fontSize:'12px',fontWeight:700,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.titre}</span>
                            {m.libre
                              ? <span style={{fontSize:'9px',fontWeight:700,padding:'2px 6px',borderRadius:'5px',background:'rgba(34,197,94,0.12)',color:'#22c55e',flexShrink:0}}>Gratuit</span>
                              : <span style={{fontSize:'9px',fontWeight:700,padding:'2px 6px',borderRadius:'5px',background:'rgba(139,92,246,0.12)',color:'#8b5cf6',flexShrink:0,display:'inline-flex',alignItems:'center',gap:'2px'}}><Lock size={8}/>Membre</span>}
                          </div>
                          <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                            <span style={{fontSize:'11px',color:'var(--text-secondary)'}}>{secteurNom(m.secteur_slug)}</span>
                            {(m.types||[]).slice(0,2).map((t:string) => {
                              const Icon = TYPE_ICONS[t]
                              return Icon ? <span key={t} style={{fontSize:'10px',color:'var(--text-secondary)',display:'inline-flex',alignItems:'center',gap:'2px'}}><Icon size={9}/>{TYPE_LABELS[t]}</span> : null
                            })}
                            {m.duree && <span style={{fontSize:'10px',color:'var(--text-secondary)'}}>{m.duree}</span>}
                          </div>
                        </div>
                        <ChevronRight size={14} style={{color:c,flexShrink:0}}/>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {!searched && (
              <div style={{textAlign:'center',padding:'40px 24px'}}>
                <p style={{fontSize:'14px',color:'var(--text-secondary)',marginBottom:'20px'}}>Tapez un mot-clé pour rechercher parmi les modules de formation.</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px',justifyContent:'center'}}>
                  {['EPI','Risques chimiques','Chute de hauteur','Incendie','Premiers secours','HACCP','Ergonomie'].map(t => (
                    <button key={t} onClick={()=>{setQuery(t);search(t)}}
                      style={{padding:'6px 14px',borderRadius:'99px',border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-secondary)',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Footer/>
    </div>
  )
}

export default function RecherchePage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'var(--bg-main)'}}/>}>
      <RechercheContent/>
    </Suspense>
  )
}