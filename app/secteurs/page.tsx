'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SECTEURS } from '@/lib/secteurs-data'
import { Search, ArrowRight, BookOpen, Shield } from 'lucide-react'

const IMGS: Record<string, string> = {
  'construction-btp':         'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=80',
  'industrie-manufacturiere': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=700&q=80',
  'sante-medical':            'https://images.unsplash.com/photo-1584515933487-779824d29309?w=700&q=80',
  'agriculture':              'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=700&q=80',
  'transport-logistique':     'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=700&q=80',
  'mines-carrieres':          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=700&q=80',
  'energie':                  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=700&q=80',
  'chimie-pharmacie':         'https://images.unsplash.com/photo-1616400619175-5beda3a17896?w=700&q=80',
  'bureaux-tertiaire':        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80',
  'restauration-hotellerie':  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=80',
  'commerce-distribution':    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=700&q=80',
  'education-formation':      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=700&q=80',
  'sport-loisirs':            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80',
  'numerique-it':             'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80',
  'maritime-peche':           'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=700&q=80',
  'aerien':                   'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=700&q=80',
  'foret-environnement':      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=80',
  'securite-defense':         'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=700&q=80',
}

export default function SecteursPage() {
  const [search, setSearch] = useState('')
  const filtered = SECTEURS.filter(s =>
    s.nom.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  )
  const total = SECTEURS.reduce((a, s) => a + s.nb_contenus, 0)

  return (
    <div className="min-h-screen" style={{background:'var(--bg-main)'}}>
      <Navbar />

      {/* HERO */}
      <section style={{paddingTop:'96px',paddingBottom:'64px',background:'linear-gradient(135deg,#0a1628 0%,#0d1f3c 100%)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,opacity:0.04,backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',backgroundSize:'56px 56px'}}/>
        <div style={{position:'absolute',top:'-20%',right:'-10%',width:'400px',height:'400px',borderRadius:'50%',background:'radial-gradient(circle,rgba(212,80,15,0.12),transparent 65%)',filter:'blur(60px)'}}/>
        <div style={{maxWidth:'720px',margin:'0 auto',padding:'0 24px',textAlign:'center',position:'relative'}}>
          <span style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'8px 18px',borderRadius:'99px',fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.08em',color:'white',background:'rgba(212,80,15,0.25)',border:'1px solid rgba(212,80,15,0.4)',marginBottom:'24px'}}>
            <Shield size={11}/> Tous les domaines
          </span>
          <h1 style={{fontSize:'clamp(2.4rem,5vw,3.8rem)',fontWeight:900,color:'white',lineHeight:1.05,letterSpacing:'-0.03em',marginBottom:'16px'}}>
            {filtered.length} Secteur{filtered.length > 1 ? 's' : ''} d&apos;activité
          </h1>
          <p style={{fontSize:'1rem',color:'rgba(255,255,255,0.6)',marginBottom:'40px',lineHeight:1.7}}>
            Chaque secteur dispose de vidéos, documents, FAQ et alertes dédiés. Toutes les ressources sont gratuites et accessibles immédiatement.
          </p>
          <div style={{position:'relative',maxWidth:'480px',margin:'0 auto'}}>
            <Search size={16} style={{position:'absolute',left:'16px',top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)',pointerEvents:'none'}}/>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un secteur..."
              style={{width:'100%',padding:'14px 16px 14px 44px',borderRadius:'16px',border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.07)',color:'white',fontSize:'14px',outline:'none',backdropFilter:'blur(10px)',boxSizing:'border-box'}}/>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{padding:'14px 0',background:'var(--bg-card)',borderBottom:'1px solid var(--border)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'center',gap:'48px',flexWrap:'wrap'}}>
          {[
            {val:SECTEURS.length,suf:'',label:'Secteurs couverts'},
            {val:total,suf:'+',label:'Ressources gratuites'},
            {val:'100',suf:'%',label:'Accès gratuit'},
          ].map((s,i) => (
            <div key={i} style={{textAlign:'center'}}>
              <span style={{fontSize:'1.4rem',fontWeight:900,color:'var(--orange)'}}>{s.val}{s.suf}</span>
              <div style={{fontSize:'11px',color:'var(--text-secondary)',marginTop:'2px'}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GRID */}
      <main style={{maxWidth:'1280px',margin:'0 auto',padding:'60px 24px 96px'}}>
        {filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'80px 0'}}>
            <p style={{fontSize:'1.1rem',color:'var(--text-secondary)',marginBottom:'16px'}}>Aucun résultat pour &quot;{search}&quot;</p>
            <button onClick={()=>setSearch('')} style={{padding:'10px 24px',borderRadius:'12px',border:'none',background:'var(--orange)',color:'white',fontWeight:700,cursor:'pointer',fontSize:'14px'}}>
              Réinitialiser
            </button>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:'24px'}}>
            {filtered.map(s => {
              const img = IMGS[s.slug]
              return (
                <Link key={s.slug} href={`/secteurs/${s.slug}`} style={{textDecoration:'none',display:'block'}}>
                  <div className="hover-lift" style={{borderRadius:'24px',overflow:'hidden',border:'1px solid var(--border)',background:'var(--bg-card)',transition:'all 0.3s ease',height:'100%'}}>

                    {/* IMAGE */}
                    <div style={{height:'190px',position:'relative',overflow:'hidden',background:img?'#0d1b35':`linear-gradient(135deg,${s.couleur}40,${s.couleur}15)`}}>
                      {img && <img src={img} alt={s.nom} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.6s ease'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLImageElement).style.transform='scale(1.06)'}
                        onMouseLeave={e=>(e.currentTarget as HTMLImageElement).style.transform='scale(1)'}/>}
                      <div style={{position:'absolute',inset:0,background:img?'linear-gradient(to top,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.15) 60%,transparent 100%)':'none'}}/>
                      {!img && <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3rem'}}>{s.icon}</div>}
                      <div style={{position:'absolute',top:'12px',right:'12px',padding:'4px 10px',borderRadius:'99px',fontSize:'10px',fontWeight:900,color:'white',background:'rgba(0,0,0,0.55)',backdropFilter:'blur(8px)'}}>
                        {s.nb_contenus} ressources
                      </div>
                      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'3px',background:`linear-gradient(to right,${s.couleur},transparent)`}}/>
                    </div>

                    {/* CONTENU */}
                    <div style={{padding:'20px 20px 18px 20px'}}>
                      <h3 style={{fontSize:'15px',fontWeight:900,color:'var(--text-primary)',margin:'0 0 8px 0',lineHeight:1.3}}>{s.nom}</h3>
                      <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:'0 0 14px 0',lineHeight:1.7,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{s.description}</p>

                      {/* TAGS */}
                      <div style={{display:'flex',flexWrap:'wrap',gap:'5px',marginBottom:'16px'}}>
                        {s.risques.slice(0,3).map(r => (
                          <span key={r} style={{padding:'3px 8px',borderRadius:'6px',fontSize:'10px',fontWeight:600,color:s.couleur,background:s.couleur+'18',border:'1px solid '+s.couleur+'28'}}>{r}</span>
                        ))}
                      </div>

                      {/* FOOTER CARTE */}
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:'12px',borderTop:'1px solid var(--border)'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',fontWeight:600,color:'var(--text-secondary)'}}>
                          <BookOpen size={12} style={{color:'var(--orange)',flexShrink:0}}/>
                          {s.nb_contenus} formations gratuites
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',fontWeight:700,color:'var(--orange)'}}>
                          Accéder <ArrowRight size={12}/>
                        </div>
                      </div>
                    </div>

                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}