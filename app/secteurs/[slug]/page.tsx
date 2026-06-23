'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SECTEURS } from '@/lib/secteurs-data'
import { supabase } from '@/lib/supabase'
import { Play, FileText, Image, BookOpen, ArrowLeft, Clock, ChevronRight, Shield, Users, Filter, CheckCircle, Lock } from 'lucide-react'

const IMGS: Record<string,string> = {
  'construction-btp':         'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=80',
  'industrie-manufacturiere': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400&q=80',
  'sante-medical':            'https://images.unsplash.com/photo-1584515933487-779824d29309?w=1400&q=80',
  'agriculture':              'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1400&q=80',
  'transport-logistique':     'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1400&q=80',
  'mines-carrieres':          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1400&q=80',
  'energie':                  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1400&q=80',
  'chimie-pharmacie':         'https://images.unsplash.com/photo-1616400619175-5beda3a17896?w=1400&q=80',
  'bureaux-tertiaire':        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80',
  'restauration-hotellerie':  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=80',
  'commerce-distribution':    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1400&q=80',
  'education-formation':      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1400&q=80',
  'sport-loisirs':            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80',
  'numerique-it':             'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=80',
  'maritime-peche':           'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=1400&q=80',
  'aerien':                   'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=80',
  'foret-environnement':      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&q=80',
  'securite-defense':         'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1400&q=80',
}

const TYPE_ICONS: Record<string,any> = { video:Play, document:FileText, image:Image, text:BookOpen }
const TYPE_LABELS: Record<string,string> = { video:'Vidéo', document:'Document', image:'Images', text:'Cours texte' }

export default function SecteurPage() {
  const params = useParams()
  const slug = params.slug as string
  const secteur = SECTEURS.find(s => s.slug === slug)

  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    supabase.from('modules')
      .select('*')
      .eq('secteur_slug', slug)
      .eq('statut', 'published')
      .order('ordre', { ascending: true })
      .then(({ data }) => { setModules(data || []); setLoading(false) })
  }, [slug])

  if (!secteur) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-main)'}}>
      <div style={{textAlign:'center'}}>
        <p style={{color:'var(--text-secondary)',marginBottom:'16px'}}>Secteur non trouvé</p>
        <Link href="/secteurs" style={{padding:'10px 24px',borderRadius:'12px',background:'var(--orange)',color:'white',textDecoration:'none',fontWeight:700}}>Voir tous les secteurs</Link>
      </div>
    </div>
  )

  const img = IMGS[secteur.slug]
  const c = secteur.couleur
  const totalDuree = modules.reduce((acc, m) => acc + (parseInt(m.duree) || 0), 0)

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar />

      {/* HERO */}
      <section style={{paddingTop:'64px',position:'relative',overflow:'hidden',minHeight:'340px',display:'flex',alignItems:'flex-end'}}>
        <div style={{position:'absolute',inset:0}}>
          {img
            ? <img src={img} alt={secteur.nom} style={{width:'100%',height:'100%',objectFit:'cover',filter:'brightness(0.28) saturate(0.6)'}}/>
            : <div style={{width:'100%',height:'100%',background:`linear-gradient(135deg,${c}30,#0a1628)`}}/>}
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(6,13,26,1) 0%,rgba(6,13,26,0.55) 60%,rgba(6,13,26,0.2) 100%)'}}/>
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:'4px',background:`linear-gradient(to right,${c},${c}50,transparent)`}}/>
        </div>
        <div style={{position:'relative',maxWidth:'1280px',margin:'0 auto',padding:'40px 24px 44px',width:'100%'}}>
          <Link href="/secteurs" style={{display:'inline-flex',alignItems:'center',gap:'6px',color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,textDecoration:'none',marginBottom:'20px'}}>
            <ArrowLeft size={14}/> Tous les secteurs
          </Link>
          <div style={{display:'flex',alignItems:'flex-end',gap:'32px',flexWrap:'wrap'}}>
            <div style={{flex:1,minWidth:'280px'}}>
              <div style={{height:'3px',width:'48px',borderRadius:'99px',background:c,marginBottom:'16px'}}/>
              <h1 style={{fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:900,color:'white',margin:'0 0 12px 0',lineHeight:1.05,letterSpacing:'-0.02em'}}>{secteur.nom}</h1>
              <p style={{fontSize:'1rem',color:'rgba(255,255,255,0.6)',margin:'0 0 16px 0',maxWidth:'560px',lineHeight:1.75}}>{secteur.description}</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                {secteur.risques.map(r => (
                  <span key={r} style={{padding:'4px 12px',borderRadius:'8px',fontSize:'11px',fontWeight:700,color:c,background:c+'22',border:'1px solid '+c+'35'}}>{r}</span>
                ))}
              </div>
            </div>
            <div style={{display:'flex',gap:'16px',flexShrink:0,flexWrap:'wrap'}}>
              {[
                {val:modules.length,label:'Modules',icon:BookOpen},
                {val:totalDuree+' min',label:'Durée totale',icon:Clock},
                {val:'100%',label:'Gratuit',icon:Shield},
              ].map((s,i) => {
                const Icon = s.icon
                return (
                  <div key={i} style={{padding:'14px 18px',borderRadius:'18px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',backdropFilter:'blur(10px)',textAlign:'center',minWidth:'90px'}}>
                    <Icon size={16} style={{color:c,marginBottom:'6px'}}/>
                    <div style={{fontSize:'1.3rem',fontWeight:900,color:'white',lineHeight:1}}>{s.val}</div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,0.45)',marginTop:'3px'}}>{s.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <main style={{maxWidth:'1280px',margin:'0 auto',padding:'40px 24px 96px'}}>
        {loading ? (
          <div style={{padding:'80px',textAlign:'center',color:'var(--text-secondary)'}}>Chargement des modules...</div>
        ) : modules.length === 0 ? (
          <div style={{padding:'80px 24px',textAlign:'center',border:'2px dashed var(--border)',borderRadius:'20px'}}>
            <BookOpen size={44} style={{color:'var(--text-secondary)',margin:'0 auto 16px',display:'block',opacity:0.4}}/>
            <h3 style={{fontSize:'1.1rem',fontWeight:700,color:'var(--text-primary)',margin:'0 0 8px 0'}}>Aucun module disponible</h3>
            <p style={{fontSize:'14px',color:'var(--text-secondary)',margin:0}}>Les formations pour ce secteur seront bientôt disponibles.</p>
          </div>
        ) : (
          <>
            <div style={{display:'grid',gridTemplateColumns:'1fr',gap:'16px'}}>
              {modules.map((m, i) => (
                <Link key={m.id} href={`/secteurs/${slug}/${m.slug}`} style={{textDecoration:'none',display:'block'}}>
                  <div style={{borderRadius:'20px',border:'1px solid var(--border)',background:'var(--bg-card)',overflow:'hidden',transition:'all 0.3s ease',cursor:'pointer'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=c+'60';(e.currentTarget as HTMLElement).style.transform='translateY(-3px)';(e.currentTarget as HTMLElement).style.boxShadow='0 12px 32px rgba(0,0,0,0.12)'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.transform='translateY(0)';(e.currentTarget as HTMLElement).style.boxShadow='none'}}>
                    <div style={{height:'3px',background:`linear-gradient(to right,${c},${c}40,transparent)`}}/>
                    <div style={{padding:'20px 24px',display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap'}}>
                      <div style={{width:'52px',height:'52px',borderRadius:'16px',background:c+'18',border:'2px solid '+c+'30',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <span style={{fontSize:'15px',fontWeight:900,color:c}}>{m.numero || String(i+1).padStart(2,'0')}</span>
                      </div>
                      <div style={{flex:1,minWidth:'200px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px',flexWrap:'wrap'}}>
                          {m.libre
                            ? <span style={{padding:'3px 10px',borderRadius:'99px',fontSize:'10px',fontWeight:700,color:'#22c55e',background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.25)'}}>Gratuit</span>
                            : <span style={{display:'inline-flex',alignItems:'center',gap:'3px',padding:'3px 10px',borderRadius:'99px',fontSize:'10px',fontWeight:700,color:'#8b5cf6',background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.25)'}}><Lock size={9}/>Membres</span>}
                          {(m.types||[]).map((t:string) => {
                            const Icon = TYPE_ICONS[t]
                            return Icon ? (
                              <span key={t} style={{display:'inline-flex',alignItems:'center',gap:'3px',padding:'3px 8px',borderRadius:'6px',fontSize:'10px',fontWeight:600,color:'var(--text-secondary)',background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
                                <Icon size={9}/>{TYPE_LABELS[t]}
                              </span>
                            ) : null
                          })}
                        </div>
                        <h3 style={{fontSize:'15px',fontWeight:900,color:'var(--text-primary)',margin:'0 0 6px 0',lineHeight:1.35}}>{m.titre}</h3>
                        <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:0,lineHeight:1.6,display:'-webkit-box',WebkitLineClamp:1,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{m.description}</p>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'20px',flexShrink:0}}>
                        <div style={{textAlign:'center'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',fontWeight:600,color:'var(--text-secondary)',marginBottom:'2px'}}>
                            <Clock size={11}/>{m.duree || '—'}
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'11px',color:'var(--text-secondary)'}}>
                            <Users size={10}/>{(m.vues||0).toLocaleString()} vues
                          </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 18px',borderRadius:'12px',background:c+'18',border:'1px solid '+c+'30',fontSize:'13px',fontWeight:700,color:c,whiteSpace:'nowrap'}}>
                          Commencer <ChevronRight size={14}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{marginTop:'32px',padding:'20px 24px',borderRadius:'16px',background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.2)',display:'flex',alignItems:'center',gap:'12px'}}>
              <CheckCircle size={18} style={{color:'#22c55e',flexShrink:0}}/>
              <p style={{fontSize:'14px',color:'var(--text-secondary)',margin:0}}>
                <strong style={{color:'var(--text-primary)'}}>Module d&apos;introduction gratuit</strong> — Les modules suivants nécessitent un compte gratuit. Inscription en 2 minutes.
              </p>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}