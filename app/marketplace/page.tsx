'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Search, Plus, Star, MapPin, BadgeCheck, ShoppingCart, ChevronRight, Shield, Truck, Eye, Filter, Grid, List, SlidersHorizontal } from 'lucide-react'

const CATEGORIES = ['Tous','EPI','Formation','Service HSE','Detection','Incendie','Signalisation','Premiers secours','Autre']

const CAT_ICONS: Record<string,string> = {
  'EPI':'🦺','Formation':'🎓','Detection':'📡','Service HSE':'🛡️',
  'Premiers secours':'🩺','Signalisation':'⚠️','Incendie':'🔥','Autre':'🔧',
}

const CAT_COLORS: Record<string,string> = {
  'EPI':'#FF6B35','Formation':'#2196F3','Detection':'#9C27B0','Service HSE':'#00C896',
  'Premiers secours':'#ef4444','Signalisation':'#FFD700','Incendie':'#FF4757','Autre':'#607D8B',
}

function formatPrix(p: number, type: string) {
  if (!p) return 'Prix sur demande'
  const f = p.toLocaleString('fr-FR') + ' F CFA'
  if (type === 'location') return f + ' / jour'
  if (type === 'abonnement') return f + ' / mois'
  return f
}

export default function MarketplacePage() {
  const [annonces,  setAnnonces]  = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [categorie, setCategorie] = useState('Tous')
  const [viewMode,  setViewMode]  = useState<'grid'|'list'>('grid')
  const [sortBy,    setSortBy]    = useState<'recent'|'prix_asc'|'prix_desc'|'note'>('recent')
  const [cartMsg,   setCartMsg]   = useState('')
  const [profile,   setProfile]   = useState<any>(null)

  useEffect(() => {
    supabase.from('marketplace_annonces')
      .select('id, titre, description_courte, description, categorie, secteur_slug, prix, prix_type, negociable, localisation, vendeur_certifie, vendeur_nom, vendeur_organisation, note, nb_avis, images, slug, marque, modele, stock, garantie, livraison, vues, likes, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setAnnonces(data || []); setLoading(false) })

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('profiles').select('role, is_seller').eq('id', data.user.id).single()
          .then(({ data: p }) => setProfile(p))
      }
    })
  }, [])

  const canPublish = profile && (['admin','superadmin','moderateur'].includes(profile.role) || profile.is_seller)

  function addToCart(e: React.MouseEvent, a: any) {
    e.preventDefault(); e.stopPropagation()
    try {
      const cart = JSON.parse(localStorage.getItem('ts_cart') || '[]')
      const exists = cart.find((i:any) => i.id === a.id)
      if (exists) {
        localStorage.setItem('ts_cart', JSON.stringify(cart.map((i:any) => i.id===a.id ? {...i, quantite:i.quantite+1} : i)))
      } else {
        localStorage.setItem('ts_cart', JSON.stringify([...cart, { id:a.id, titre:a.titre, prix:a.prix, prix_type:a.prix_type, image:a.images?.[0], quantite:1 }]))
      }
      window.dispatchEvent(new Event('cart_updated'))
      setCartMsg('Ajouté au panier !')
      setTimeout(() => setCartMsg(''), 2500)
    } catch {}
  }

  const filtered = annonces
    .filter(a => {
      const ms = !search || a.titre?.toLowerCase().includes(search.toLowerCase()) || a.description?.toLowerCase().includes(search.toLowerCase()) || a.marque?.toLowerCase().includes(search.toLowerCase())
      const mc = categorie === 'Tous' || a.categorie === categorie
      return ms && mc
    })
    .sort((a, b) => {
      if (sortBy==='prix_asc')  return (a.prix||0)-(b.prix||0)
      if (sortBy==='prix_desc') return (b.prix||0)-(a.prix||0)
      if (sortBy==='note')      return (b.note||0)-(a.note||0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const totalParCat = (cat: string) => annonces.filter(a => cat==='Tous' || a.categorie===cat).length

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>

      {/* ══ HERO ══ */}
      <section style={{paddingTop:'96px',paddingBottom:'48px',background:'linear-gradient(135deg,#0a1628 0%,#0d1f3c 100%)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,opacity:0.04,backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',backgroundSize:'56px 56px'}}/>
        <div style={{position:'absolute',top:'-20%',right:'-10%',width:'400px',height:'400px',borderRadius:'50%',background:'radial-gradient(circle,rgba(212,80,15,0.12),transparent 65%)',filter:'blur(60px)'}}/>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px',position:'relative'}}>
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:'20px',marginBottom:'32px'}}>
            <div>
              <span style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'6px 14px',borderRadius:'99px',fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.08em',color:'white',background:'rgba(212,80,15,0.2)',border:'1px solid rgba(212,80,15,0.35)',marginBottom:'16px'}}>
                <Shield size={11}/> Marketplace EPI & Sécurité
              </span>
              <h1 style={{fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:900,color:'white',margin:'0 0 10px 0',letterSpacing:'-0.02em',lineHeight:1.1}}>
                Équipements & Services<br/>de Sécurité Professionnelle
              </h1>
              <p style={{fontSize:'15px',color:'rgba(255,255,255,0.6)',margin:0,maxWidth:'500px',lineHeight:1.7}}>
                Trouvez des EPI certifiés, formations HSE et prestataires vérifiés près de chez vous.
              </p>
            </div>
            {canPublish && (
              <Link href="/marketplace/publier"
                style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 22px',borderRadius:'14px',background:'var(--orange)',color:'white',textDecoration:'none',fontSize:'14px',fontWeight:700,boxShadow:'0 4px 20px rgba(212,80,15,0.4)',flexShrink:0}}>
                <Plus size={15}/> Publier un produit
              </Link>
            )}
          </div>

          {/* Barre de recherche */}
          <div style={{position:'relative',maxWidth:'640px'}}>
            <Search size={18} style={{position:'absolute',left:'18px',top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)'}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un produit, une marque, un service..."
              style={{width:'100%',padding:'16px 16px 16px 50px',borderRadius:'16px',border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.08)',color:'white',fontSize:'15px',outline:'none',backdropFilter:'blur(10px)',boxSizing:'border-box'}}
              onFocus={e=>(e.currentTarget.style.borderColor='rgba(212,80,15,0.6)')}
              onBlur={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.15)')}/>
            {search && (
              <button onClick={()=>setSearch('')} style={{position:'absolute',right:'14px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.5)',fontSize:'18px',lineHeight:1}}>×</button>
            )}
          </div>
        </div>
      </section>

      {/* ══ STATS RAPIDES ══ */}
      <div style={{background:'var(--bg-card)',borderBottom:'1px solid var(--border)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'12px 24px',display:'flex',alignItems:'center',gap:'32px',flexWrap:'wrap'}}>
          {[
            {val:annonces.length,label:'Produits disponibles'},
            {val:annonces.filter(a=>a.vendeur_certifie).length,label:'Vendeurs vérifiés'},
            {val:annonces.filter(a=>a.livraison).length,label:'Avec livraison'},
          ].map((s,i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px'}}>
              <span style={{fontWeight:900,color:'var(--orange)',fontSize:'1.1rem'}}>{s.val}</span>
              <span style={{color:'var(--text-secondary)'}}>{s.label}</span>
            </div>
          ))}
          <div style={{marginLeft:'auto',display:'flex',gap:'6px'}}>
            <button onClick={()=>setViewMode('grid')} style={{padding:'6px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:viewMode==='grid'?'var(--orange)':'var(--bg-secondary)',cursor:'pointer',display:'flex',alignItems:'center',color:viewMode==='grid'?'white':'var(--text-secondary)'}}>
              <Grid size={14}/>
            </button>
            <button onClick={()=>setViewMode('list')} style={{padding:'6px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:viewMode==='list'?'var(--orange)':'var(--bg-secondary)',cursor:'pointer',display:'flex',alignItems:'center',color:viewMode==='list'?'white':'var(--text-secondary)'}}>
              <List size={14}/>
            </button>
          </div>
        </div>
      </div>

      {/* ══ CONTENU ══ */}
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'32px 24px 96px',display:'grid',gridTemplateColumns:'220px 1fr',gap:'32px',alignItems:'start'}}>

        {/* SIDEBAR FILTRES */}
        <aside style={{position:'sticky',top:'90px'}}>
          <div style={{borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)',padding:'16px',marginBottom:'16px'}}>
            <p style={{fontSize:'11px',fontWeight:900,color:'var(--text-secondary)',margin:'0 0 12px 0',textTransform:'uppercase',letterSpacing:'0.08em',display:'flex',alignItems:'center',gap:'6px'}}>
              <Filter size={12}/> Catégories
            </p>
            {CATEGORIES.map(cat => {
              const count = totalParCat(cat)
              const active = categorie === cat
              const color = CAT_COLORS[cat] || 'var(--orange)'
              return (
                <button key={cat} onClick={()=>setCategorie(cat)}
                  style={{display:'flex',alignItems:'center',width:'100%',padding:'9px 10px',borderRadius:'10px',border:'none',cursor:'pointer',marginBottom:'3px',transition:'all 0.15s',textAlign:'left',
                    background: active ? color+'18' : 'transparent',
                    color:      active ? color       : 'var(--text-secondary)'}}>
                  <span style={{fontSize:'14px',marginRight:'8px',flexShrink:0}}>{cat==='Tous' ? '🔍' : CAT_ICONS[cat]||'📦'}</span>
                  <span style={{flex:1,fontSize:'13px',fontWeight:active?700:400}}>{cat}</span>
                  <span style={{fontSize:'11px',fontWeight:700,color:active?color:'var(--text-secondary)',opacity:active?1:0.6}}>{count}</span>
                </button>
              )
            })}
          </div>

          <div style={{borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)',padding:'16px'}}>
            <p style={{fontSize:'11px',fontWeight:900,color:'var(--text-secondary)',margin:'0 0 12px 0',textTransform:'uppercase',letterSpacing:'0.08em',display:'flex',alignItems:'center',gap:'6px'}}>
              <SlidersHorizontal size={12}/> Trier par
            </p>
            {[
              {v:'recent',    l:'Plus récents'},
              {v:'prix_asc',  l:'Prix croissant'},
              {v:'prix_desc', l:'Prix décroissant'},
              {v:'note',      l:'Mieux notés'},
            ].map(s => (
              <button key={s.v} onClick={()=>setSortBy(s.v as any)}
                style={{display:'flex',alignItems:'center',width:'100%',padding:'8px 10px',borderRadius:'9px',border:'none',cursor:'pointer',marginBottom:'2px',fontSize:'13px',transition:'all 0.15s',
                  background: sortBy===s.v ? 'rgba(212,80,15,0.1)' : 'transparent',
                  color:      sortBy===s.v ? 'var(--orange)' : 'var(--text-secondary)',
                  fontWeight: sortBy===s.v ? 700 : 400}}>
                {sortBy===s.v && <span style={{marginRight:'6px'}}>✓</span>}{s.l}
              </button>
            ))}
          </div>
        </aside>

        {/* LISTE PRODUITS */}
        <div>
          {/* Header résultats */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
            <p style={{fontSize:'14px',color:'var(--text-secondary)',margin:0}}>
              <strong style={{color:'var(--text-primary)'}}>{filtered.length}</strong> résultat{filtered.length!==1?'s':''}
              {search && <span> pour "<strong style={{color:'var(--orange)'}}>{search}</strong>"</span>}
            </p>
          </div>

          {/* Notification panier */}
          {cartMsg && (
            <div style={{position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',zIndex:50,padding:'12px 20px',borderRadius:'12px',background:'#22c55e',color:'white',fontSize:'13px',fontWeight:700,boxShadow:'0 8px 24px rgba(0,0,0,0.2)',display:'flex',alignItems:'center',gap:'8px'}}>
              <ShoppingCart size={15}/>{cartMsg}
            </div>
          )}

          {loading ? (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'16px'}}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)',overflow:'hidden'}}>
                  <div style={{height:'180px',background:'var(--bg-secondary)',animation:'pulse 1.5s infinite'}}/>
                  <div style={{padding:'16px'}}>
                    <div style={{height:'12px',background:'var(--bg-secondary)',borderRadius:'6px',marginBottom:'8px',width:'60%'}}/>
                    <div style={{height:'16px',background:'var(--bg-secondary)',borderRadius:'6px',width:'80%'}}/>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{padding:'80px 24px',textAlign:'center',border:'2px dashed var(--border)',borderRadius:'20px'}}>
              <p style={{fontSize:'1rem',color:'var(--text-secondary)',marginBottom:'8px'}}>Aucun produit trouvé</p>
              {search && <button onClick={()=>setSearch('')} style={{padding:'8px 18px',borderRadius:'10px',background:'var(--orange)',color:'white',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:700}}>Réinitialiser la recherche</button>}
            </div>
          ) : viewMode === 'grid' ? (

            /* ── VUE GRILLE ── */
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'16px'}}>
              {filtered.map(a => (
                <Link key={a.id} href={`/marketplace/${a.slug || a.id}`} style={{textDecoration:'none',display:'block'}}>
                  <div style={{borderRadius:'18px',border:'1px solid var(--border)',background:'var(--bg-card)',overflow:'hidden',transition:'all 0.25s',height:'100%',display:'flex',flexDirection:'column'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-4px)';(e.currentTarget as HTMLElement).style.boxShadow='0 16px 40px rgba(0,0,0,0.15)';(e.currentTarget as HTMLElement).style.borderColor='rgba(212,80,15,0.4)'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(0)';(e.currentTarget as HTMLElement).style.boxShadow='none';(e.currentTarget as HTMLElement).style.borderColor='var(--border)'}}>

                    {/* Image */}
                    <div style={{height:'190px',position:'relative',background:'var(--bg-secondary)',overflow:'hidden',flexShrink:0}}>
                      {a.images?.[0]
                        ? <img src={a.images[0]} alt={a.titre} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.4s'}}
                            onMouseEnter={e=>(e.currentTarget as HTMLImageElement).style.transform='scale(1.06)'}
                            onMouseLeave={e=>(e.currentTarget as HTMLImageElement).style.transform='scale(1)'}/>
                        : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3.5rem'}}>{CAT_ICONS[a.categorie]||'📦'}</div>
                      }
                      {/* Overlay infos */}
                      <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 60%)',opacity:0,transition:'opacity 0.3s'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.opacity='1'}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.opacity='0'}/>
                      {/* Badges */}
                      <div style={{position:'absolute',top:'10px',left:'10px',display:'flex',flexDirection:'column',gap:'5px'}}>
                        {a.vendeur_certifie && (
                          <span style={{display:'inline-flex',alignItems:'center',gap:'3px',padding:'3px 8px',borderRadius:'6px',fontSize:'10px',fontWeight:700,color:'white',background:'#22c55e'}}>
                            <BadgeCheck size={9}/> Vérifié
                          </span>
                        )}
                        {a.categorie && (
                          <span style={{padding:'3px 8px',borderRadius:'6px',fontSize:'10px',fontWeight:700,color:'white',background:CAT_COLORS[a.categorie]||'var(--orange)'}}>
                            {a.categorie}
                          </span>
                        )}
                      </div>
                      {/* Vues */}
                      <div style={{position:'absolute',top:'10px',right:'10px',display:'flex',alignItems:'center',gap:'3px',padding:'3px 7px',borderRadius:'6px',fontSize:'10px',fontWeight:600,color:'white',background:'rgba(0,0,0,0.5)'}}>
                        <Eye size={9}/>{a.vues||0}
                      </div>
                      {/* Bouton panier */}
                      <button onClick={e=>addToCart(e,a)}
                        style={{position:'absolute',bottom:'10px',right:'10px',width:'34px',height:'34px',borderRadius:'10px',border:'none',background:'var(--orange)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(212,80,15,0.4)',opacity:0,transition:'opacity 0.2s'}}
                        onMouseEnter={e=>{ e.stopPropagation(); (e.currentTarget as HTMLElement).style.opacity='1' }}
                        onMouseLeave={e=>{ e.stopPropagation(); (e.currentTarget as HTMLElement).style.opacity='0' }}>
                        <ShoppingCart size={14} style={{color:'white'}}/>
                      </button>
                    </div>

                    {/* Contenu */}
                    <div style={{padding:'16px',display:'flex',flexDirection:'column',flex:1}}>
                      {(a.marque||a.modele) && (
                        <p style={{fontSize:'10px',fontWeight:700,color:'var(--text-secondary)',margin:'0 0 3px 0',textTransform:'uppercase',letterSpacing:'0.06em'}}>
                          {a.marque}{a.marque&&a.modele?' · ':''}{a.modele}
                        </p>
                      )}
                      <h3 style={{fontSize:'14px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 6px 0',lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{a.titre}</h3>
                      {a.description_courte && (
                        <p style={{fontSize:'12px',color:'var(--text-secondary)',margin:'0 0 10px 0',lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',flex:1}}>{a.description_courte}</p>
                      )}
                      {/* Note */}
                      {a.note > 0 && (
                        <div style={{display:'flex',alignItems:'center',gap:'4px',marginBottom:'8px'}}>
                          <Star size={12} style={{color:'#f59e0b'}} fill="#f59e0b"/>
                          <span style={{fontSize:'12px',fontWeight:700,color:'var(--text-primary)'}}>{a.note}</span>
                          <span style={{fontSize:'11px',color:'var(--text-secondary)'}}>({a.nb_avis||0})</span>
                        </div>
                      )}
                      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px',flexWrap:'wrap'}}>
                        {a.localisation && <span style={{display:'inline-flex',alignItems:'center',gap:'3px',fontSize:'11px',color:'var(--text-secondary)'}}><MapPin size={10}/>{a.localisation}</span>}
                        {a.livraison && <span style={{display:'inline-flex',alignItems:'center',gap:'3px',fontSize:'11px',color:'#22c55e'}}><Truck size={10}/>Livraison</span>}
                        {a.garantie && <span style={{fontSize:'11px',color:'var(--text-secondary)'}}>🛡 {a.garantie}</span>}
                      </div>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:'10px',borderTop:'1px solid var(--border)'}}>
                        <div>
                          <div style={{fontSize:'16px',fontWeight:900,color:'var(--orange)',lineHeight:1}}>{formatPrix(a.prix, a.prix_type)}</div>
                          {a.negociable && <div style={{fontSize:'10px',color:'#f59e0b',fontWeight:600,marginTop:'2px'}}>Négociable</div>}
                        </div>
                        <div style={{display:'inline-flex',alignItems:'center',gap:'4px',fontSize:'12px',fontWeight:700,color:'var(--orange)'}}>
                          Voir <ChevronRight size={13}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          ) : (

            /* ── VUE LISTE ── */
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {filtered.map(a => (
                <Link key={a.id} href={`/marketplace/${a.slug || a.id}`} style={{textDecoration:'none',display:'block'}}>
                  <div style={{borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)',padding:'0',overflow:'hidden',transition:'all 0.2s'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(212,80,15,0.4)';(e.currentTarget as HTMLElement).style.transform='translateX(4px)'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.transform='translateX(0)'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
                      {/* Image */}
                      <div style={{width:'120px',height:'100px',flexShrink:0,background:'var(--bg-secondary)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                        {a.images?.[0]
                          ? <img src={a.images[0]} alt={a.titre} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                          : <span style={{fontSize:'2rem'}}>{CAT_ICONS[a.categorie]||'📦'}</span>}
                      </div>
                      {/* Infos */}
                      <div style={{flex:1,padding:'14px 0',minWidth:0}}>
                        <div style={{display:'flex',gap:'6px',marginBottom:'5px',flexWrap:'wrap'}}>
                          {a.vendeur_certifie && <span style={{display:'inline-flex',alignItems:'center',gap:'3px',padding:'2px 7px',borderRadius:'5px',fontSize:'10px',fontWeight:700,color:'#22c55e',background:'rgba(34,197,94,0.1)'}}><BadgeCheck size={9}/>Vérifié</span>}
                          {a.categorie && <span style={{padding:'2px 7px',borderRadius:'5px',fontSize:'10px',fontWeight:700,color:'white',background:CAT_COLORS[a.categorie]||'var(--orange)'}}>{a.categorie}</span>}
                        </div>
                        <h3 style={{fontSize:'14px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 4px 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.titre}</h3>
                        {a.description_courte && <p style={{fontSize:'12px',color:'var(--text-secondary)',margin:'0 0 6px 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.description_courte}</p>}
                        <div style={{display:'flex',gap:'12px',fontSize:'11px',color:'var(--text-secondary)'}}>
                          {a.localisation && <span style={{display:'inline-flex',alignItems:'center',gap:'3px'}}><MapPin size={9}/>{a.localisation}</span>}
                          {a.livraison && <span style={{color:'#22c55e',display:'inline-flex',alignItems:'center',gap:'3px'}}><Truck size={9}/>Livraison</span>}
                          {a.vendeur_nom && <span>par {a.vendeur_nom}</span>}
                        </div>
                      </div>
                      {/* Prix + action */}
                      <div style={{padding:'14px 20px',textAlign:'right',flexShrink:0}}>
                        <div style={{fontSize:'16px',fontWeight:900,color:'var(--orange)',marginBottom:'4px'}}>{formatPrix(a.prix, a.prix_type)}</div>
                        {a.negociable && <div style={{fontSize:'10px',color:'#f59e0b',fontWeight:600,marginBottom:'8px'}}>Négociable</div>}
                        <div style={{display:'flex',gap:'6px',justifyContent:'flex-end'}}>
                          <button onClick={e=>addToCart(e,a)} style={{padding:'6px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',cursor:'pointer',display:'flex',alignItems:'center',gap:'4px',fontSize:'11px',fontWeight:600,color:'var(--text-secondary)'}}>
                            <ShoppingCart size={11}/>Panier
                          </button>
                          <span style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'6px 12px',borderRadius:'8px',background:'var(--orange)',color:'white',fontSize:'11px',fontWeight:700}}>
                            Voir <ChevronRight size={11}/>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer/>
    </div>
  )
}