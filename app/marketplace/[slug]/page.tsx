'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { SECTEURS } from '@/lib/secteurs-data'
import {
  ChevronRight, ChevronDown, ChevronUp, MapPin, Phone, Mail,
  MessageCircle, ShoppingCart, Heart, Share2, BadgeCheck, Star,
  Package, Truck, Shield, FileText, Download, Eye, Play,
  CheckCircle, ExternalLink, ArrowLeft, ZoomIn
} from 'lucide-react'

function formatPrix(p: number, type?: string) {
  if (!p) return 'Prix sur demande'
  const f = p.toLocaleString('fr-FR') + ' F CFA'
  if (type==='location') return f + ' / jour'
  if (type==='abonnement') return f + ' / mois'
  return f
}

// Composant accordion style Teltonika
function Accordion({ title, children, defaultOpen=false }: { title:string; children:React.ReactNode; defaultOpen?:boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{borderBottom:'1px solid var(--border)'}}>
      <button onClick={()=>setOpen(!open)}
        style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 0',background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>
        <span style={{fontSize:'1rem',fontWeight:700,color:'var(--text-primary)'}}>{title}</span>
        {open ? <ChevronUp size={18} style={{color:'var(--text-secondary)',flexShrink:0}}/> : <ChevronDown size={18} style={{color:'var(--text-secondary)',flexShrink:0}}/>}
      </button>
      {open && <div style={{paddingBottom:'24px'}}>{children}</div>}
    </div>
  )
}

export default function ProduitPage() {
  const params = useParams()
  const slug   = params.slug as string

  const [produit,     setProduit]     = useState<any>(null)
  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)
  const [imgIdx,      setImgIdx]      = useState(0)
  const [activeTab,   setActiveTab]   = useState('specs')
  const [liked,       setLiked]       = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [similar,     setSimilar]     = useState<any[]>([])
  const [cartMsg,     setCartMsg]     = useState('')
  const [stickyActive,setStickyActive]= useState(false)

  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => {
      if (tabsRef.current) {
        setStickyActive(tabsRef.current.getBoundingClientRect().top <= 64)
      }
    }
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    async function load() {
      // Chercher par slug d'abord
      let { data } = await supabase
        .from('marketplace_annonces').select('*')
        .eq('slug', slug).eq('status','approved').maybeSingle()

      if (!data) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (uuidRegex.test(slug)) {
          const { data: byId } = await supabase
            .from('marketplace_annonces').select('*')
            .eq('id', slug).eq('status','approved').maybeSingle()
          data = byId
        }
      }

      if (!data) { setNotFound(true); setLoading(false); return }
      setProduit(data)
      await supabase.from('marketplace_annonces').update({ vues:(data.vues||0)+1 }).eq('id', data.id)

      const { data: sim } = await supabase
        .from('marketplace_annonces').select('id,titre,slug,prix,prix_type,images,categorie,vendeur_certifie,marque,localisation')
        .eq('categorie', data.categorie).eq('status','approved').neq('id', data.id).limit(4)
      setSimilar(sim||[])
      setLoading(false)
    }
    load()
  }, [slug])

  const addToCart = (e?: React.MouseEvent) => {
    e?.preventDefault(); e?.stopPropagation()
    if (!produit) return
    const cart = JSON.parse(localStorage.getItem('ts_cart')||'[]')
    const exists = cart.find((i:any)=>i.id===produit.id)
    if (!exists) cart.push({ id:produit.id, titre:produit.titre, prix:produit.prix, image:produit.images?.[0], quantite:1 })
    localStorage.setItem('ts_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart_updated'))
    setCartMsg('Ajouté au panier !')
    setTimeout(()=>setCartMsg(''), 2500)
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'80vh',color:'var(--text-secondary)'}}>
        Chargement du produit...
      </div>
    </div>
  )

  if (notFound) return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'80vh',flexDirection:'column',gap:'16px'}}>
        <div style={{textAlign:'center'}}>
          <p style={{fontSize:'1.1rem',fontWeight:700,color:'var(--text-primary)',marginBottom:'8px'}}>Produit introuvable</p>
          <p style={{fontSize:'14px',color:'var(--text-secondary)',marginBottom:'24px'}}>Ce produit n&apos;existe pas ou n&apos;est plus disponible.</p>
          <Link href="/marketplace" style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'11px 22px',borderRadius:'12px',background:'var(--orange)',color:'white',textDecoration:'none',fontSize:'14px',fontWeight:700}}>
            <ArrowLeft size={14}/> Retour marketplace
          </Link>
        </div>
      </div>
    </div>
  )

  const imgs    = produit.images?.length ? produit.images : []
  const specs   = produit.specifications || {}
  const certifs = produit.certifications || []
  const docs    = produit.documents || []
  const caracts = produit.caracteristiques || []
  const tags    = produit.tags || []
  const secteur = SECTEURS.find(s=>s.slug===produit.secteur_slug)
  const hasSpecs = Object.keys(specs).length > 0

  const TABS = [
    { id:'overview',  label:'Vue d\'ensemble' },
    { id:'specs',     label:'Spécifications' },
    { id:'docs',      label:'Documents' },
    { id:'support',   label:'Support' },
    { id:'ordering',  label:'Commander' },
  ]

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>

      {/* Notification panier */}
      {cartMsg && (
        <div style={{position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',zIndex:100,padding:'12px 20px',borderRadius:'12px',background:'#22c55e',color:'white',fontSize:'13px',fontWeight:700,boxShadow:'0 8px 24px rgba(0,0,0,0.2)',display:'flex',alignItems:'center',gap:'8px'}}>
          <ShoppingCart size={15}/>{cartMsg}
        </div>
      )}

      {/* ══ HERO PRODUIT ══ */}
      <div style={{paddingTop:'64px',background:'var(--bg-main)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'24px 24px 0'}}>

          {/* Fil d'ariane */}
          <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'var(--text-secondary)',marginBottom:'24px',flexWrap:'wrap'}}>
            <Link href="/" style={{color:'var(--text-secondary)',textDecoration:'none'}}>Accueil</Link>
            <ChevronRight size={11}/>
            <Link href="/marketplace" style={{color:'var(--text-secondary)',textDecoration:'none'}}>Marketplace</Link>
            {produit.categorie && <><ChevronRight size={11}/><Link href={`/marketplace?cat=${produit.categorie}`} style={{color:'var(--text-secondary)',textDecoration:'none'}}>{produit.categorie}</Link></>}
            <ChevronRight size={11}/>
            <span style={{color:'var(--text-primary)',fontWeight:600}}>{produit.titre}</span>
          </div>

          {/* Layout 2 colonnes */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 400px',gap:'48px',alignItems:'start',paddingBottom:'48px'}}>

            {/* GALERIE */}
            <div>
              {/* Image principale */}
              <div style={{borderRadius:'20px',overflow:'hidden',border:'1px solid var(--border)',background:'var(--bg-card)',marginBottom:'12px',position:'relative'}}>
                <div style={{height:'480px',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-secondary)',position:'relative',overflow:'hidden'}}>
                  {imgs.length > 0
                    ? <img src={imgs[imgIdx]} alt={produit.titre} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain',padding:'32px',transition:'opacity 0.2s'}}/>
                    : <div style={{fontSize:'5rem',opacity:0.3}}>📦</div>
                  }
                  {/* Zoom */}
                  {imgs.length > 0 && (
                    <button style={{position:'absolute',bottom:'12px',right:'12px',width:'36px',height:'36px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-card)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <ZoomIn size={15} style={{color:'var(--text-secondary)'}}/>
                    </button>
                  )}
                  {/* Badges */}
                  <div style={{position:'absolute',top:'16px',left:'16px',display:'flex',flexDirection:'column',gap:'6px'}}>
                    {produit.vendeur_certifie && (
                      <span style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'5px 10px',borderRadius:'8px',fontSize:'11px',fontWeight:700,color:'white',background:'#22c55e',boxShadow:'0 2px 8px rgba(34,197,94,0.4)'}}>
                        <BadgeCheck size={11}/> Vendeur vérifié
                      </span>
                    )}
                    {produit.stock > 0 && (
                      <span style={{padding:'4px 10px',borderRadius:'8px',fontSize:'11px',fontWeight:700,color:'white',background:'rgba(0,0,0,0.6)'}}>
                        {produit.stock} en stock
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Miniatures */}
              {imgs.length > 1 && (
                <div style={{display:'flex',gap:'8px',overflowX:'auto',paddingBottom:'4px'}}>
                  {imgs.map((img:string, i:number) => (
                    <button key={i} onClick={()=>setImgIdx(i)}
                      style={{width:'72px',height:'72px',borderRadius:'12px',overflow:'hidden',border:`2px solid ${i===imgIdx?'var(--orange)':'var(--border)'}`,flexShrink:0,cursor:'pointer',padding:0,background:'var(--bg-secondary)',transition:'border-color 0.15s'}}>
                      <img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* INFOS PRODUIT */}
            <div style={{position:'sticky',top:'90px'}}>
              {/* Catégorie + secteur */}
              <div style={{display:'flex',gap:'8px',marginBottom:'12px',flexWrap:'wrap'}}>
                {produit.categorie && (
                  <span style={{padding:'4px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:700,color:'var(--orange)',background:'rgba(212,80,15,0.1)',border:'1px solid rgba(212,80,15,0.2)'}}>{produit.categorie}</span>
                )}
                {secteur && (
                  <span style={{padding:'4px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:700,color:secteur.couleur,background:secteur.couleur+'15',border:'1px solid '+secteur.couleur+'25'}}>{secteur.nom}</span>
                )}
              </div>

              {/* Marque + modèle */}
              {(produit.marque||produit.modele) && (
                <p style={{fontSize:'14px',color:'var(--text-secondary)',fontWeight:600,margin:'0 0 8px 0',letterSpacing:'0.02em',textTransform:'uppercase'}}>
                  {produit.marque}{produit.marque&&produit.modele?' · ':''}{produit.modele}
                  {produit.reference && <span style={{marginLeft:'8px',opacity:0.6,fontSize:'12px'}}>Réf: {produit.reference}</span>}
                </p>
              )}

              {/* Titre */}
              <h1 style={{fontSize:'clamp(1.5rem,3vw,2.2rem)',fontWeight:900,color:'var(--text-primary)',margin:'0 0 14px 0',lineHeight:1.15,letterSpacing:'-0.02em'}}>{produit.titre}</h1>

              {/* Description courte */}
              {produit.description_courte && (
                <p style={{fontSize:'15px',color:'var(--text-secondary)',margin:'0 0 16px 0',lineHeight:1.75}}>{produit.description_courte}</p>
              )}

              {/* Points clés */}
              {caracts.length > 0 && (
                <div style={{marginBottom:'20px'}}>
                  {caracts.slice(0,4).map((c:string, i:number) => (
                    <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'8px',marginBottom:'6px',fontSize:'14px',color:'var(--text-secondary)'}}>
                      <CheckCircle size={14} style={{color:'var(--orange)',flexShrink:0,marginTop:'2px'}}/>
                      {c}
                    </div>
                  ))}
                </div>
              )}

              {/* Infos rapides */}
              <div style={{display:'flex',gap:'12px',marginBottom:'20px',flexWrap:'wrap',fontSize:'12px',color:'var(--text-secondary)'}}>
                {produit.localisation && <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><MapPin size={11}/>{produit.localisation}</span>}
                {produit.livraison && <span style={{display:'inline-flex',alignItems:'center',gap:'4px',color:'#22c55e'}}><Truck size={11}/>Livraison disponible</span>}
                {produit.garantie && <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><Shield size={11}/>Garantie {produit.garantie}</span>}
                <span style={{display:'inline-flex',alignItems:'center',gap:'4px'}}><Eye size={11}/>{produit.vues||0} vues</span>
              </div>

              {/* Note */}
              {produit.note > 0 && (
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'20px'}}>
                  {[1,2,3,4,5].map(i=><Star key={i} size={15} style={{color:i<=Math.round(produit.note)?'#f59e0b':'var(--border)'}} fill={i<=Math.round(produit.note)?'#f59e0b':'none'}/>)}
                  <span style={{fontSize:'14px',fontWeight:700,color:'var(--text-primary)'}}>{produit.note}</span>
                  <span style={{fontSize:'13px',color:'var(--text-secondary)'}}>({produit.nb_avis||0} avis)</span>
                </div>
              )}

              {/* Prix */}
              <div style={{padding:'20px',borderRadius:'16px',background:'var(--bg-card)',border:'1px solid var(--border)',marginBottom:'16px'}}>
                <div style={{fontSize:'2.2rem',fontWeight:900,color:'var(--orange)',lineHeight:1,marginBottom:'4px'}}>{formatPrix(produit.prix, produit.prix_type)}</div>
                {produit.unite && produit.prix && <div style={{fontSize:'12px',color:'var(--text-secondary)',marginBottom:'4px'}}>par {produit.unite}</div>}
                {produit.negociable && <div style={{fontSize:'12px',color:'#f59e0b',fontWeight:600}}>💬 Prix négociable</div>}
              </div>

              {/* CTA buttons */}
              <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'16px'}}>
                <button onClick={()=>setShowContact(!showContact)}
                  style={{width:'100%',padding:'14px',borderRadius:'13px',border:'none',background:'var(--orange)',color:'white',fontSize:'15px',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(212,80,15,0.35)',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                  <Phone size={16}/> Contacter le vendeur
                </button>
                <button onClick={addToCart}
                  style={{width:'100%',padding:'13px',borderRadius:'13px',border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-primary)',fontSize:'14px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                  <ShoppingCart size={15}/>Ajouter au panier
                </button>
                <div style={{display:'flex',gap:'8px'}}>
                  <button onClick={()=>setLiked(!liked)}
                    style={{flex:1,padding:'10px',borderRadius:'11px',border:'1px solid var(--border)',background:liked?'rgba(239,68,68,0.08)':'var(--bg-secondary)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',fontSize:'12px',fontWeight:600,color:liked?'#ef4444':'var(--text-secondary)'}}>
                    <Heart size={13} fill={liked?'#ef4444':'none'} style={{color:liked?'#ef4444':'var(--text-secondary)'}}/>
                    {liked?'Enregistré':'Enregistrer'}
                  </button>
                  <button onClick={()=>navigator.share?.({title:produit.titre,url:window.location.href})}
                    style={{flex:1,padding:'10px',borderRadius:'11px',border:'1px solid var(--border)',background:'var(--bg-secondary)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',fontSize:'12px',fontWeight:600,color:'var(--text-secondary)'}}>
                    <Share2 size={13}/>Partager
                  </button>
                </div>
              </div>

              {/* Contact déroulant */}
              {showContact && (
                <div style={{padding:'16px',borderRadius:'14px',background:'var(--bg-secondary)',border:'1px solid var(--border)',marginBottom:'16px'}}>
                  <p style={{fontSize:'11px',fontWeight:700,color:'var(--text-secondary)',margin:'0 0 10px 0',textTransform:'uppercase',letterSpacing:'0.06em'}}>
                    {produit.vendeur_nom} {produit.vendeur_organisation ? `· ${produit.vendeur_organisation}` : ''}
                  </p>
                  <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
                    {produit.vendeur_telephone && (
                      <a href={`tel:${produit.vendeur_telephone}`} style={{display:'flex',alignItems:'center',gap:'8px',padding:'9px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-card)',textDecoration:'none',fontSize:'13px',color:'var(--text-primary)',fontWeight:500}}>
                        <Phone size={13} style={{color:'#22c55e'}}/>{produit.vendeur_telephone}
                      </a>
                    )}
                    {produit.vendeur_whatsapp && (
                      <a href={`https://wa.me/${produit.vendeur_whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                        style={{display:'flex',alignItems:'center',gap:'8px',padding:'9px 12px',borderRadius:'10px',border:'1px solid rgba(37,211,102,0.3)',background:'rgba(37,211,102,0.06)',textDecoration:'none',fontSize:'13px',color:'#25D366',fontWeight:700}}>
                        <MessageCircle size={13}/>WhatsApp
                      </a>
                    )}
                    {produit.vendeur_email && (
                      <a href={`mailto:${produit.vendeur_email}`}
                        style={{display:'flex',alignItems:'center',gap:'8px',padding:'9px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-card)',textDecoration:'none',fontSize:'13px',color:'var(--text-primary)',fontWeight:500}}>
                        <Mail size={13} style={{color:'var(--orange)'}}/>{produit.vendeur_email}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Vendeur */}
              <div style={{padding:'14px',borderRadius:'13px',border:'1px solid var(--border)',background:'var(--bg-card)',display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'var(--orange)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'15px',fontWeight:700,color:'white',flexShrink:0}}>
                  {(produit.vendeur_nom?.[0]||'V').toUpperCase()}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{produit.vendeur_nom||'Vendeur'}</p>
                  {produit.vendeur_organisation && <p style={{fontSize:'11px',color:'var(--text-secondary)',margin:'2px 0 0 0'}}>{produit.vendeur_organisation}</p>}
                </div>
                {produit.vendeur_certifie && <BadgeCheck size={18} style={{color:'#22c55e',flexShrink:0}}/>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ STICKY TABS STYLE TELTONIKA ══ */}
      <div ref={tabsRef} style={{
        position:'sticky',top:'64px',zIndex:40,
        background:'var(--bg-card)',
        borderTop:'1px solid var(--border)',
        borderBottom:'1px solid var(--border)',
        boxShadow: stickyActive ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
        transition:'box-shadow 0.3s',
      }}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px',display:'flex',alignItems:'center',gap:'0',overflowX:'auto'}}>
          {/* Nom produit dans sticky */}
          {stickyActive && (
            <span style={{fontSize:'14px',fontWeight:700,color:'var(--text-primary)',marginRight:'24px',flexShrink:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:'240px'}}>
              {produit.titre}
            </span>
          )}
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setActiveTab(t.id)}
              style={{padding:'16px 20px',fontSize:'13px',fontWeight:activeTab===t.id?700:500,border:'none',borderBottom:'2px solid',cursor:'pointer',background:'transparent',whiteSpace:'nowrap',transition:'all 0.2s',
                color:           activeTab===t.id ? 'var(--orange)' : 'var(--text-secondary)',
                borderBottomColor: activeTab===t.id ? 'var(--orange)' : 'transparent',
              }}>
              {t.label}
            </button>
          ))}
          {/* CTA dans sticky */}
          {stickyActive && (
            <button onClick={()=>setShowContact(true)} style={{marginLeft:'auto',padding:'8px 18px',borderRadius:'10px',background:'var(--orange)',color:'white',border:'none',fontSize:'13px',fontWeight:700,cursor:'pointer',flexShrink:0}}>
              Contacter
            </button>
          )}
        </div>
      </div>

      {/* ══ CONTENU TABS ══ */}
      <div style={{maxWidth:'1280px',margin:'0 auto',padding:'48px 24px 96px'}}>

        {/* VUE D'ENSEMBLE */}
        {activeTab==='overview' && (
          <div style={{maxWidth:'800px'}}>
            {produit.description && (
              <div style={{marginBottom:'40px'}}>
                <h2 style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 16px 0'}}>À propos du produit</h2>
                <p style={{fontSize:'15px',color:'var(--text-secondary)',lineHeight:1.9}}>{produit.description}</p>
              </div>
            )}
            {caracts.length > 0 && (
              <div style={{marginBottom:'40px'}}>
                <h2 style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 20px 0'}}>Caractéristiques principales</h2>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  {caracts.map((c:string, i:number) => (
                    <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'10px',padding:'14px 16px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-card)',fontSize:'14px',color:'var(--text-secondary)'}}>
                      <CheckCircle size={15} style={{color:'var(--orange)',flexShrink:0,marginTop:'1px'}}/>{c}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {certifs.length > 0 && (
              <div>
                <h2 style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 16px 0'}}>Certifications & Normes</h2>
                <div style={{display:'flex',flexWrap:'wrap',gap:'10px'}}>
                  {certifs.map((c:string) => (
                    <span key={c} style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'8px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:700,color:'#22c55e',background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)'}}>
                      <BadgeCheck size={13}/>{c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SPÉCIFICATIONS style Teltonika — accordion */}
        {activeTab==='specs' && (
          <div style={{maxWidth:'900px'}}>
            <h2 style={{fontSize:'1.5rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 32px 0',textTransform:'uppercase',letterSpacing:'0.05em',textAlign:'center'}}>
              Spécifications du produit
            </h2>
            {hasSpecs ? (
              Object.entries(specs).map(([cat, rows]: [string, any], i) => (
                <Accordion key={cat} title={cat} defaultOpen={i===0}>
                  <div style={{border:'1px solid var(--border)',borderRadius:'12px',overflow:'hidden',marginTop:'12px'}}>
                    {Object.entries(rows as Record<string,string>).map(([key,val],j) => (
                      <div key={key} style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:j<Object.entries(rows).length-1?'1px solid var(--border)':'none',background:j%2===0?'transparent':'rgba(255,255,255,0.01)'}}>
                        <div style={{padding:'12px 20px',fontSize:'14px',color:'var(--text-secondary)',fontWeight:500,borderRight:'1px solid var(--border)'}}>{key}</div>
                        <div style={{padding:'12px 20px',fontSize:'14px',color:'var(--text-primary)',fontWeight:600}}>{val}</div>
                      </div>
                    ))}
                  </div>
                </Accordion>
              ))
            ) : (
              <div style={{padding:'60px 24px',textAlign:'center',border:'2px dashed var(--border)',borderRadius:'16px'}}>
                <p style={{color:'var(--text-secondary)',fontSize:'14px',marginBottom:'8px'}}>Aucune spécification renseignée par le vendeur.</p>
                <p style={{color:'var(--text-secondary)',fontSize:'12px',opacity:0.6}}>Contactez le vendeur pour obtenir la fiche technique complète.</p>
              </div>
            )}

            {/* Certifications sous les specs */}
            {certifs.length > 0 && (
              <Accordion title="Certifications & Approbations">
                <div style={{display:'flex',flexWrap:'wrap',gap:'10px',marginTop:'12px'}}>
                  {certifs.map((c:string) => (
                    <span key={c} style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'7px 14px',borderRadius:'10px',fontSize:'13px',fontWeight:700,color:'#22c55e',background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)'}}>
                      <BadgeCheck size={12}/>{c}
                    </span>
                  ))}
                </div>
              </Accordion>
            )}
          </div>
        )}

        {/* DOCUMENTS */}
        {activeTab==='docs' && (
          <div style={{maxWidth:'700px'}}>
            <h2 style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 24px 0'}}>Documents disponibles</h2>
            {docs.length === 0 ? (
              <div style={{padding:'60px 24px',textAlign:'center',border:'2px dashed var(--border)',borderRadius:'16px'}}>
                <FileText size={40} style={{color:'var(--text-secondary)',margin:'0 auto 16px',display:'block',opacity:0.3}}/>
                <p style={{color:'var(--text-secondary)',fontSize:'14px'}}>Aucun document disponible. Contactez le vendeur.</p>
              </div>
            ) : docs.map((doc:string, i:number) => (
              <a key={i} href={doc} target="_blank" rel="noopener noreferrer"
                style={{display:'flex',alignItems:'center',gap:'16px',padding:'16px 20px',borderRadius:'14px',border:'1px solid var(--border)',background:'var(--bg-card)',textDecoration:'none',marginBottom:'10px',transition:'all 0.2s'}}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--orange)'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='var(--border)'}>
                <div style={{width:'44px',height:'44px',borderRadius:'12px',background:'rgba(239,68,68,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <FileText size={20} style={{color:'#ef4444'}}/>
                </div>
                <div style={{flex:1}}>
                  <p style={{fontSize:'14px',fontWeight:700,color:'var(--text-primary)',margin:0}}>Document {i+1}</p>
                  <p style={{fontSize:'12px',color:'var(--text-secondary)',margin:'2px 0 0 0'}}>Cliquez pour télécharger</p>
                </div>
                <Download size={16} style={{color:'var(--orange)',flexShrink:0}}/>
              </a>
            ))}
          </div>
        )}

        {/* SUPPORT */}
        {activeTab==='support' && (
          <div style={{maxWidth:'900px'}}>
            <h2 style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 32px 0'}}>Support & Assistance</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'16px',marginBottom:'40px'}}>
              {[
                {icon:'📚',title:'Documentation',desc:'Consultez la fiche technique complète du produit.',action:'Voir la doc'},
                {icon:'💬',title:'Contact vendeur',desc:'Posez vos questions directement au vendeur.',action:'Contacter'},
                {icon:'🛡️',title:'Garantie',desc:produit.garantie ? `Ce produit est garanti ${produit.garantie}.` : 'Demandez les conditions de garantie au vendeur.',action:'En savoir plus'},
                {icon:'🚚',title:'Livraison',desc:produit.livraison ? 'Livraison disponible — contactez le vendeur pour les détails.' : 'Retrait en main propre — contactez le vendeur.',action:'Détails'},
              ].map((s,i) => (
                <div key={i} style={{padding:'24px',borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)',transition:'all 0.2s'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(212,80,15,0.4)';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.transform='translateY(0)'}}>
                  <div style={{fontSize:'2rem',marginBottom:'12px'}}>{s.icon}</div>
                  <h3 style={{fontSize:'14px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 6px 0'}}>{s.title}</h3>
                  <p style={{fontSize:'12px',color:'var(--text-secondary)',margin:'0 0 12px 0',lineHeight:1.6}}>{s.desc}</p>
                  <button onClick={()=>setShowContact(true)} style={{fontSize:'12px',fontWeight:700,color:'var(--orange)',background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',gap:'4px'}}>
                    {s.action} <ExternalLink size={11}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMMANDER */}
        {activeTab==='ordering' && (
          <div style={{maxWidth:'700px'}}>
            <h2 style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 24px 0'}}>Comment commander</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'16px',marginBottom:'32px'}}>
              {[
                {n:'01',title:'Contactez le vendeur',desc:'Appelez, envoyez un WhatsApp ou un email au vendeur pour confirmer la disponibilité et négocier si besoin.',icon:Phone},
                {n:'02',title:'Vérifiez les détails',desc:'Confirmez les spécifications, la quantité souhaitée, les délais de livraison et les conditions de paiement.',icon:CheckCircle},
                {n:'03',title:'Finalisez la commande',desc:'Procédez au paiement selon les modalités convenues et recevez votre confirmation.',icon:ShoppingCart},
              ].map(s => {
                const Icon = s.icon
                return (
                  <div key={s.n} style={{display:'flex',gap:'20px',padding:'20px',borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)'}}>
                    <div style={{width:'44px',height:'44px',borderRadius:'14px',background:'rgba(212,80,15,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <span style={{fontSize:'13px',fontWeight:900,color:'var(--orange)'}}>{s.n}</span>
                    </div>
                    <div>
                      <h3 style={{fontSize:'14px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 4px 0'}}>{s.title}</h3>
                      <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:0,lineHeight:1.6}}>{s.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Prix récapitulatif */}
            <div style={{padding:'24px',borderRadius:'16px',background:`linear-gradient(135deg,rgba(212,80,15,0.1),rgba(212,80,15,0.04))`,border:'1px solid rgba(212,80,15,0.25)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
                <h3 style={{fontSize:'14px',fontWeight:700,color:'var(--text-primary)',margin:0}}>Récapitulatif</h3>
                {produit.negociable && <span style={{fontSize:'11px',fontWeight:700,color:'#f59e0b',padding:'3px 8px',borderRadius:'6px',background:'rgba(245,158,11,0.12)'}}>Prix négociable</span>}
              </div>
              <div style={{fontSize:'2rem',fontWeight:900,color:'var(--orange)',marginBottom:'8px'}}>{formatPrix(produit.prix, produit.prix_type)}</div>
              {produit.unite && <p style={{fontSize:'12px',color:'var(--text-secondary)',margin:'0 0 16px 0'}}>par {produit.unite}</p>}
              <button onClick={()=>{setShowContact(true);setActiveTab('overview')}}
                style={{width:'100%',padding:'13px',borderRadius:'13px',border:'none',background:'var(--orange)',color:'white',fontSize:'14px',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(212,80,15,0.35)'}}>
                Commander maintenant
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ══ PRODUITS SIMILAIRES ══ */}
      {similar.length > 0 && (
        <div style={{background:'var(--bg-card)',borderTop:'1px solid var(--border)',padding:'48px 0'}}>
          <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'24px'}}>
              <h2 style={{fontSize:'1.2rem',fontWeight:900,color:'var(--text-primary)',margin:0}}>Produits similaires</h2>
              <Link href={`/marketplace?cat=${produit.categorie}`} style={{fontSize:'13px',color:'var(--orange)',textDecoration:'none',fontWeight:600,display:'flex',alignItems:'center',gap:'4px'}}>
                Voir tout <ChevronRight size={13}/>
              </Link>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'16px'}}>
              {similar.map(p => (
                <Link key={p.id} href={`/marketplace/${p.slug||p.id}`} style={{textDecoration:'none'}}>
                  <div style={{borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-main)',overflow:'hidden',transition:'all 0.2s'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-3px)';(e.currentTarget as HTMLElement).style.borderColor='rgba(212,80,15,0.4)'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(0)';(e.currentTarget as HTMLElement).style.borderColor='var(--border)'}}>
                    <div style={{height:'160px',background:'var(--bg-secondary)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.titre} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        : <span style={{fontSize:'2.5rem',opacity:0.5}}>📦</span>}
                    </div>
                    <div style={{padding:'14px'}}>
                      {p.marque && <p style={{fontSize:'10px',fontWeight:700,color:'var(--text-secondary)',margin:'0 0 3px 0',textTransform:'uppercase',letterSpacing:'0.04em'}}>{p.marque}</p>}
                      <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 6px 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.titre}</p>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <p style={{fontSize:'14px',fontWeight:900,color:'var(--orange)',margin:0}}>{formatPrix(p.prix, p.prix_type)}</p>
                        {p.vendeur_certifie && <BadgeCheck size={14} style={{color:'#22c55e'}}/>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer/>
    </div>
  )
}