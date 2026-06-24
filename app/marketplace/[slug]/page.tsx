'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { SECTEURS } from '@/lib/secteurs-data'
import { ChevronRight, MapPin, Phone, Mail, MessageCircle, ShoppingCart, Heart, Share2, BadgeCheck, Star, Package, Truck, Shield, FileText, ChevronLeft, Download, Eye, ZoomIn } from 'lucide-react'

function formatPrix(p: number) {
  return p ? p.toLocaleString('fr-FR') + ' F CFA' : 'Prix sur demande'
}

export default function ProduitPage() {
  const params  = useParams()
  const slug    = params.slug as string

  const [produit,    setProduit]    = useState<any>(null)
  const [loading,    setLoading]    = useState(true)
  const [notFound,   setNotFound]   = useState(false)
  const [imgIdx,     setImgIdx]     = useState(0)
  const [activeTab,  setActiveTab]  = useState<'specs'|'docs'|'avis'>('specs')
  const [liked,      setLiked]      = useState(false)
  const [showContact,setShowContact]= useState(false)
  const [similarProds,setSimilar]   = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('marketplace_annonces')
        .select('*')
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .eq('status', 'approved')
        .single()
      if (!data) { setNotFound(true); setLoading(false); return }
      setProduit(data)
      await supabase.from('marketplace_annonces').update({ vues: (data.vues||0)+1 }).eq('id', data.id)
      const { data: sim } = await supabase
        .from('marketplace_annonces')
        .select('id, titre, slug, prix, images, categorie, vendeur_certifie, marque')
        .eq('categorie', data.categorie)
        .eq('status', 'approved')
        .neq('id', data.id)
        .limit(4)
      setSimilar(sim || [])
      setLoading(false)
    }
    load()
  }, [slug])

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('ts_cart') || '[]')
    const exists = cart.find((i:any) => i.id === produit.id)
    if (!exists) {
      cart.push({ id:produit.id, titre:produit.titre, prix:produit.prix, image:produit.images?.[0], quantite:1 })
      localStorage.setItem('ts_cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cart_updated'))
    }
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',color:'var(--text-secondary)'}}>Chargement du produit...</div>
    </div>
  )

  if (notFound) return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',flexDirection:'column',gap:'16px'}}>
        <p style={{color:'var(--text-secondary)',fontSize:'1rem'}}>Produit introuvable</p>
        <Link href="/marketplace" style={{padding:'10px 24px',borderRadius:'12px',background:'var(--orange)',color:'white',textDecoration:'none',fontWeight:700}}>Retour marketplace</Link>
      </div>
    </div>
  )

  const imgs     = produit.images?.length ? produit.images : ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80']
  const specs    = produit.specifications || {}
  const hasSpecs = Object.keys(specs).length > 0
  const certifs  = produit.certifications || []
  const docs     = produit.documents || []
  const tags     = produit.tags || []
  const secteur  = SECTEURS.find(s => s.slug === produit.secteur_slug)

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'24px 24px 96px'}}>

        {/* Fil d'ariane */}
        <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'var(--text-secondary)',marginBottom:'24px',paddingTop:'80px',flexWrap:'wrap'}}>
          <Link href="/" style={{color:'var(--text-secondary)',textDecoration:'none'}}>Accueil</Link>
          <ChevronRight size={12}/>
          <Link href="/marketplace" style={{color:'var(--text-secondary)',textDecoration:'none'}}>Marketplace</Link>
          <ChevronRight size={12}/>
          {produit.categorie && <><Link href={`/marketplace?cat=${produit.categorie}`} style={{color:'var(--text-secondary)',textDecoration:'none'}}>{produit.categorie}</Link><ChevronRight size={12}/></>}
          <span style={{color:'var(--text-primary)',fontWeight:600}}>{produit.titre}</span>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:'40px',alignItems:'start'}}>

          {/* ── COLONNE GAUCHE ── */}
          <div>

            {/* Galerie images */}
            <div style={{borderRadius:'20px',overflow:'hidden',border:'1px solid var(--border)',marginBottom:'24px',background:'var(--bg-card)'}}>
              {/* Image principale */}
              <div style={{position:'relative',height:'420px',background:'var(--bg-secondary)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                <img src={imgs[imgIdx]} alt={produit.titre} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain',padding:'20px'}}/>
                {/* Badges */}
                <div style={{position:'absolute',top:'16px',left:'16px',display:'flex',flexDirection:'column',gap:'6px'}}>
                  {produit.vendeur_certifie && (
                    <span style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'4px 10px',borderRadius:'8px',fontSize:'10px',fontWeight:700,color:'white',background:'#22c55e'}}>
                      <BadgeCheck size={11}/> Vendeur vérifié
                    </span>
                  )}
                  {produit.negociable && (
                    <span style={{padding:'4px 10px',borderRadius:'8px',fontSize:'10px',fontWeight:700,color:'white',background:'#f59e0b'}}>Négociable</span>
                  )}
                </div>
                {/* Boutons galerie */}
                {imgs.length > 1 && (
                  <>
                    <button onClick={()=>setImgIdx(i=>Math.max(0,i-1))} disabled={imgIdx===0}
                      style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',width:'36px',height:'36px',borderRadius:'50%',border:'1px solid var(--border)',background:'var(--bg-card)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:imgIdx===0?0.3:1}}>
                      <ChevronLeft size={16} style={{color:'var(--text-primary)'}}/>
                    </button>
                    <button onClick={()=>setImgIdx(i=>Math.min(imgs.length-1,i+1))} disabled={imgIdx===imgs.length-1}
                      style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',width:'36px',height:'36px',borderRadius:'50%',border:'1px solid var(--border)',background:'var(--bg-card)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:imgIdx===imgs.length-1?0.3:1}}>
                      <ChevronRight size={16} style={{color:'var(--text-primary)'}}/>
                    </button>
                  </>
                )}
              </div>
              {/* Miniatures */}
              {imgs.length > 1 && (
                <div style={{display:'flex',gap:'8px',padding:'12px',borderTop:'1px solid var(--border)',overflowX:'auto'}}>
                  {imgs.map((img:string, i:number) => (
                    <button key={i} onClick={()=>setImgIdx(i)}
                      style={{width:'64px',height:'64px',borderRadius:'10px',overflow:'hidden',border:`2px solid ${i===imgIdx?'var(--orange)':'var(--border)'}`,flexShrink:0,cursor:'pointer',padding:0,background:'var(--bg-secondary)'}}>
                      <img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Titre + infos */}
            <div style={{marginBottom:'24px'}}>
              <div style={{display:'flex',gap:'8px',marginBottom:'10px',flexWrap:'wrap'}}>
                {produit.categorie && <span style={{padding:'4px 10px',borderRadius:'8px',fontSize:'11px',fontWeight:700,color:'var(--orange)',background:'rgba(212,80,15,0.1)',border:'1px solid rgba(212,80,15,0.2)'}}>{produit.categorie}</span>}
                {secteur && <span style={{padding:'4px 10px',borderRadius:'8px',fontSize:'11px',fontWeight:700,color:secteur.couleur,background:secteur.couleur+'15',border:'1px solid '+secteur.couleur+'25'}}>{secteur.nom}</span>}
                {tags.map((t:string) => <span key={t} style={{padding:'4px 10px',borderRadius:'8px',fontSize:'11px',fontWeight:600,color:'var(--text-secondary)',background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>{t}</span>)}
              </div>
              {(produit.marque || produit.modele) && (
                <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:'0 0 6px 0',fontWeight:600}}>
                  {produit.marque && <span>{produit.marque}</span>}
                  {produit.marque && produit.modele && ' · '}
                  {produit.modele && <span>Modèle {produit.modele}</span>}
                  {produit.reference && <span style={{marginLeft:'8px',color:'var(--text-secondary)',opacity:0.7}}>Réf: {produit.reference}</span>}
                </p>
              )}
              <h1 style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:900,color:'var(--text-primary)',margin:'0 0 12px 0',lineHeight:1.2}}>{produit.titre}</h1>
              {produit.description_courte && (
                <p style={{fontSize:'15px',color:'var(--text-secondary)',margin:'0 0 12px 0',lineHeight:1.75}}>{produit.description_courte}</p>
              )}
              {/* Note */}
              {produit.note > 0 && (
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
                  <div style={{display:'flex',gap:'2px'}}>
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} style={{color:i<=Math.round(produit.note)?'#f59e0b':'var(--border)'}} fill={i<=Math.round(produit.note)?'#f59e0b':'none'}/>)}
                  </div>
                  <span style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)'}}>{produit.note}</span>
                  <span style={{fontSize:'12px',color:'var(--text-secondary)'}}>({produit.nb_avis || 0} avis)</span>
                </div>
              )}
              <div style={{display:'flex',gap:'16px',fontSize:'12px',color:'var(--text-secondary)',flexWrap:'wrap'}}>
                <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><Eye size={12}/>{produit.vues||0} vues</span>
                <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><MapPin size={12}/>{produit.localisation||'Bénin'}</span>
                {produit.livraison && <span style={{display:'inline-flex',alignItems:'center',gap:'4px',color:'#22c55e'}}><Truck size={12}/>Livraison disponible</span>}
                {produit.garantie && <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><Shield size={12}/>Garantie {produit.garantie}</span>}
              </div>
            </div>

            {/* Tabs spécs / docs / avis */}
            <div style={{border:'1px solid var(--border)',borderRadius:'16px',overflow:'hidden'}}>
              {/* Tab headers */}
              <div style={{display:'flex',borderBottom:'1px solid var(--border)',background:'var(--bg-card)'}}>
                {[
                  {id:'specs' as const, label:'Spécifications techniques', icon:Package},
                  {id:'docs'  as const, label:'Documents',                 icon:FileText},
                  {id:'avis'  as const, label:`Avis (${produit.nb_avis||0})`, icon:Star},
                ].map(t => {
                  const Icon = t.icon
                  return (
                    <button key={t.id} onClick={()=>setActiveTab(t.id)}
                      style={{display:'flex',alignItems:'center',gap:'6px',padding:'14px 20px',fontSize:'13px',fontWeight:activeTab===t.id?700:500,border:'none',borderBottom:'2px solid',cursor:'pointer',background:'transparent',transition:'all 0.2s',
                        color: activeTab===t.id ? 'var(--orange)' : 'var(--text-secondary)',
                        borderBottomColor: activeTab===t.id ? 'var(--orange)' : 'transparent',
                      }}>
                      <Icon size={13}/>{t.label}
                    </button>
                  )
                })}
              </div>

              {/* Tab content */}
              <div style={{padding:'24px',background:'var(--bg-card)'}}>

                {/* SPÉCIFICATIONS */}
                {activeTab==='specs' && (
                  <div>
                    {/* Description longue */}
                    {produit.description && (
                      <div style={{marginBottom:'24px'}}>
                        <h3 style={{fontSize:'14px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 10px 0'}}>Description</h3>
                        <p style={{fontSize:'14px',color:'var(--text-secondary)',lineHeight:1.8,margin:0}}>{produit.description}</p>
                      </div>
                    )}

                    {/* Caractéristiques */}
                    {produit.caracteristiques?.length > 0 && (
                      <div style={{marginBottom:'24px'}}>
                        <h3 style={{fontSize:'14px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 12px 0'}}>Points clés</h3>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                          {produit.caracteristiques.map((c:string, i:number) => (
                            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'8px',fontSize:'13px',color:'var(--text-secondary)'}}>
                              <BadgeCheck size={14} style={{color:'var(--orange)',flexShrink:0,marginTop:'1px'}}/>
                              {c}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tableau specs style Teltonika */}
                    {hasSpecs && (
                      <div>
                        <h3 style={{fontSize:'14px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 12px 0'}}>Spécifications détaillées</h3>
                        <div style={{border:'1px solid var(--border)',borderRadius:'12px',overflow:'hidden'}}>
                          {Object.entries(specs).map(([cat, values]: [string, any], ci) => (
                            <div key={cat}>
                              {/* Catégorie */}
                              <div style={{padding:'10px 16px',background:`rgba(212,80,15,0.06)`,borderBottom:'1px solid var(--border)',fontSize:'11px',fontWeight:900,color:'var(--orange)',textTransform:'uppercase',letterSpacing:'0.08em'}}>
                                {cat}
                              </div>
                              {/* Paramètres */}
                              {Object.entries(values as Record<string,string>).map(([key, val], i) => (
                                <div key={key} style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:'1px solid var(--border)',background:i%2===0?'transparent':'rgba(255,255,255,0.02)'}}>
                                  <div style={{padding:'10px 16px',fontSize:'13px',color:'var(--text-secondary)',fontWeight:500,borderRight:'1px solid var(--border)'}}>{key}</div>
                                  <div style={{padding:'10px 16px',fontSize:'13px',color:'var(--text-primary)',fontWeight:600}}>{val}</div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!hasSpecs && !produit.description && !produit.caracteristiques?.length && (
                      <p style={{color:'var(--text-secondary)',fontSize:'14px',textAlign:'center',padding:'24px 0',opacity:0.6}}>Aucune spécification renseignée</p>
                    )}

                    {/* Certifications */}
                    {certifs.length > 0 && (
                      <div style={{marginTop:'24px',padding:'16px',borderRadius:'12px',background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.2)'}}>
                        <h3 style={{fontSize:'13px',fontWeight:700,color:'#22c55e',margin:'0 0 10px 0',display:'flex',alignItems:'center',gap:'6px'}}><BadgeCheck size={14}/>Certifications & Normes</h3>
                        <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                          {certifs.map((c:string) => (
                            <span key={c} style={{padding:'4px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:700,color:'#22c55e',background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)'}}>{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* DOCUMENTS */}
                {activeTab==='docs' && (
                  <div>
                    {docs.length === 0 ? (
                      <p style={{color:'var(--text-secondary)',fontSize:'14px',textAlign:'center',padding:'24px 0',opacity:0.6}}>Aucun document disponible</p>
                    ) : (
                      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                        {docs.map((doc:string, i:number) => (
                          <a key={i} href={doc} target="_blank" rel="noopener noreferrer"
                            style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px 16px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-secondary)',textDecoration:'none',transition:'all 0.2s'}}
                            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--orange)'}
                            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--border)'}>
                            <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'rgba(239,68,68,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                              <FileText size={18} style={{color:'#ef4444'}}/>
                            </div>
                            <div style={{flex:1}}>
                              <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:0}}>Document {i+1}</p>
                              <p style={{fontSize:'11px',color:'var(--text-secondary)',margin:'2px 0 0 0'}}>Cliquez pour télécharger</p>
                            </div>
                            <Download size={14} style={{color:'var(--orange)'}}/>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* AVIS */}
                {activeTab==='avis' && (
                  <div style={{textAlign:'center',padding:'32px 0'}}>
                    {produit.note > 0 ? (
                      <div>
                        <div style={{fontSize:'3rem',fontWeight:900,color:'var(--text-primary)',lineHeight:1}}>{produit.note}</div>
                        <div style={{display:'flex',justifyContent:'center',gap:'4px',margin:'8px 0'}}>
                          {[1,2,3,4,5].map(i => <Star key={i} size={18} style={{color:i<=Math.round(produit.note)?'#f59e0b':'var(--border)'}} fill={i<=Math.round(produit.note)?'#f59e0b':'none'}/>)}
                        </div>
                        <p style={{fontSize:'13px',color:'var(--text-secondary)'}}>Basé sur {produit.nb_avis||0} avis</p>
                      </div>
                    ) : (
                      <p style={{color:'var(--text-secondary)',opacity:0.6}}>Aucun avis pour le moment</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── COLONNE DROITE STICKY ── */}
          <aside style={{position:'sticky',top:'90px'}}>

            {/* Prix + actions */}
            <div style={{borderRadius:'20px',border:'1px solid var(--border)',background:'var(--bg-card)',padding:'24px',marginBottom:'16px'}}>
              <div style={{marginBottom:'20px'}}>
                <div style={{fontSize:'2rem',fontWeight:900,color:'var(--orange)',lineHeight:1}}>{formatPrix(produit.prix)}</div>
                {produit.unite && produit.prix && <div style={{fontSize:'12px',color:'var(--text-secondary)',marginTop:'3px'}}>par {produit.unite}</div>}
                {produit.negociable && <div style={{fontSize:'12px',color:'#f59e0b',fontWeight:600,marginTop:'4px'}}>Prix négociable</div>}
              </div>

              {/* Stock */}
              {produit.stock !== null && produit.stock !== undefined && (
                <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'16px',fontSize:'13px'}}>
                  <div style={{width:'8px',height:'8px',borderRadius:'50%',background:produit.stock>0?'#22c55e':'#ef4444'}}/>
                  <span style={{color:produit.stock>0?'#22c55e':'#ef4444',fontWeight:600}}>
                    {produit.stock>0 ? `${produit.stock} en stock` : 'Rupture de stock'}
                  </span>
                </div>
              )}

              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                <button onClick={()=>setShowContact(!showContact)}
                  style={{width:'100%',padding:'13px',borderRadius:'13px',border:'none',background:'var(--orange)',color:'white',fontSize:'14px',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(212,80,15,0.3)'}}>
                  📞 Contacter le vendeur
                </button>
                <button onClick={addToCart}
                  style={{width:'100%',padding:'12px',borderRadius:'13px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'14px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                  <ShoppingCart size={15}/>Ajouter au panier
                </button>
                <div style={{display:'flex',gap:'8px'}}>
                  <button onClick={()=>setLiked(!liked)}
                    style={{flex:1,padding:'10px',borderRadius:'11px',border:'1px solid var(--border)',background:'var(--bg-secondary)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',fontSize:'12px',fontWeight:600,color:liked?'#ef4444':'var(--text-secondary)'}}>
                    <Heart size={14} fill={liked?'#ef4444':'none'} style={{color:liked?'#ef4444':'var(--text-secondary)'}}/>
                    {liked ? 'Enregistré' : 'Enregistrer'}
                  </button>
                  <button onClick={()=>navigator.share?.({title:produit.titre,url:window.location.href})}
                    style={{flex:1,padding:'10px',borderRadius:'11px',border:'1px solid var(--border)',background:'var(--bg-secondary)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',fontSize:'12px',fontWeight:600,color:'var(--text-secondary)'}}>
                    <Share2 size={14}/>Partager
                  </button>
                </div>
              </div>

              {/* Infos contact */}
              {showContact && (
                <div style={{marginTop:'16px',padding:'16px',borderRadius:'12px',background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
                  <p style={{fontSize:'12px',fontWeight:700,color:'var(--text-secondary)',margin:'0 0 10px 0',textTransform:'uppercase',letterSpacing:'0.06em'}}>Coordonnées</p>
                  {produit.vendeur_nom && <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 8px 0'}}>{produit.vendeur_nom}{produit.vendeur_organisation ? ` · ${produit.vendeur_organisation}` : ''}</p>}
                  <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                    {produit.vendeur_telephone && (
                      <a href={`tel:${produit.vendeur_telephone}`} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 12px',borderRadius:'9px',border:'1px solid var(--border)',background:'var(--bg-card)',textDecoration:'none',fontSize:'13px',color:'var(--text-primary)'}}>
                        <Phone size={13} style={{color:'#22c55e'}}/>{produit.vendeur_telephone}
                      </a>
                    )}
                    {produit.vendeur_whatsapp && (
                      <a href={`https://wa.me/${produit.vendeur_whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                        style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 12px',borderRadius:'9px',border:'1px solid rgba(37,211,102,0.3)',background:'rgba(37,211,102,0.06)',textDecoration:'none',fontSize:'13px',color:'#25D366',fontWeight:600}}>
                        <MessageCircle size={13}/>WhatsApp
                      </a>
                    )}
                    {produit.vendeur_email && (
                      <a href={`mailto:${produit.vendeur_email}`}
                        style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 12px',borderRadius:'9px',border:'1px solid var(--border)',background:'var(--bg-card)',textDecoration:'none',fontSize:'13px',color:'var(--text-primary)'}}>
                        <Mail size={13} style={{color:'var(--orange)'}}/>{produit.vendeur_email}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Vendeur */}
            <div style={{borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)',padding:'18px',marginBottom:'16px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}>
                <div style={{width:'44px',height:'44px',borderRadius:'50%',background:'var(--orange)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:700,color:'white',flexShrink:0}}>
                  {(produit.vendeur_nom?.[0]||'V').toUpperCase()}
                </div>
                <div>
                  <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:0}}>{produit.vendeur_nom||'Vendeur'}</p>
                  {produit.vendeur_organisation && <p style={{fontSize:'11px',color:'var(--text-secondary)',margin:'2px 0 0 0'}}>{produit.vendeur_organisation}</p>}
                </div>
                {produit.vendeur_certifie && <BadgeCheck size={18} style={{color:'#22c55e',marginLeft:'auto',flexShrink:0}}/>}
              </div>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                {produit.vendeur_certifie && (
                  <span style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'3px 8px',borderRadius:'6px',fontSize:'10px',fontWeight:700,color:'#22c55e',background:'rgba(34,197,94,0.1)'}}>
                    <BadgeCheck size={10}/> Vérifié Think Safety
                  </span>
                )}
                {produit.localisation && (
                  <span style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'3px 8px',borderRadius:'6px',fontSize:'10px',fontWeight:600,color:'var(--text-secondary)',background:'var(--bg-secondary)'}}>
                    <MapPin size={10}/>{produit.localisation}
                  </span>
                )}
              </div>
            </div>

            {/* Sécurité */}
            <div style={{padding:'14px 16px',borderRadius:'14px',background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.15)'}}>
              {[
                {icon:'🔒', text:'Vendeurs vérifiés par Think Safety'},
                {icon:'📦', text:'Produits certifiés aux normes HSE'},
                {icon:'💬', text:'Support en cas de litige'},
              ].map((s,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:i<2?'8px':0,fontSize:'12px',color:'var(--text-secondary)'}}>
                  <span>{s.icon}</span>{s.text}
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* Produits similaires */}
        {similarProds.length > 0 && (
          <div style={{marginTop:'48px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
              <h2 style={{fontSize:'1.2rem',fontWeight:900,color:'var(--text-primary)',margin:0}}>Produits similaires</h2>
              <Link href={`/marketplace?cat=${produit.categorie}`} style={{fontSize:'13px',color:'var(--orange)',textDecoration:'none',fontWeight:600,display:'flex',alignItems:'center',gap:'4px'}}>
                Voir tout <ChevronRight size={13}/>
              </Link>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'16px'}}>
              {similarProds.map(p => (
                <Link key={p.id} href={`/marketplace/${p.slug||p.id}`} style={{textDecoration:'none'}}>
                  <div style={{borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)',overflow:'hidden',transition:'all 0.2s'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-3px)';(e.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(0)';(e.currentTarget as HTMLElement).style.boxShadow='none'}}>
                    <div style={{height:'160px',background:'var(--bg-secondary)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.titre} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        : <span style={{fontSize:'2.5rem'}}>📦</span>}
                    </div>
                    <div style={{padding:'14px'}}>
                      {p.marque && <p style={{fontSize:'10px',fontWeight:700,color:'var(--text-secondary)',margin:'0 0 3px 0',textTransform:'uppercase'}}>{p.marque}</p>}
                      <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 6px 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.titre}</p>
                      <p style={{fontSize:'14px',fontWeight:900,color:'var(--orange)',margin:0}}>{formatPrix(p.prix)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  )
}