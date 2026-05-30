'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronRight, Play, AlertTriangle, ArrowRight, Clock, Shield, Zap, BookOpen, Bell, Lock } from 'lucide-react'

const SECTEURS = [
  { slug: 'construction-btp',         nom: 'Construction & BTP',  img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80' },
  { slug: 'sante-medical',            nom: 'Sante & Medical',      img: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80' },
  { slug: 'industrie-manufacturiere', nom: 'Industrie',            img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80' },
  { slug: 'transport-logistique',     nom: 'Transport',            img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80' },
  { slug: 'agriculture',              nom: 'Agriculture',          img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80' },
  { slug: 'mines-carrieres',          nom: 'Mines & Carrieres',    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80' },
  { slug: 'petrole-gaz',              nom: 'Petrole & Gaz',        img: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&q=80' },
  { slug: 'bureaux-services',         nom: 'Bureaux & Services',   img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80' },
  { slug: 'education-formation',      nom: 'Education',            img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80' },
]

const VIDEO_PLACEHOLDERS = [
  { secteur: 'Construction & BTP',  titre: 'Securite sur chantier - Fondamentaux', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80' },
  { secteur: 'Industrie',           titre: 'Gestes et postures en atelier',         img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80' },
  { secteur: 'Transport',           titre: 'Conduite securisee et prevention',      img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80' },
]

export default function HomePage() {
  const [hero, setHero] = useState<any>(null)
  const [selection, setSelection] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [alerte, setAlerte] = useState<any>(null)
  const [imgIndex, setImgIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const heroImages = [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400&q=80',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1400&q=80',
  ]

  useEffect(() => {
    const t = setInterval(() => setImgIndex(i => (i+1) % heroImages.length), 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from('courses').select('id,slug,titre,description_courte,image_couverture,secteur_slug').eq('statut','published').order('created_at',{ascending:false}).limit(5)
      if (c?.length) { setHero(c[0]); setSelection(c.slice(1,5)) }
      const { data: v } = await supabase.from('course_lessons').select('id,titre,youtube_url,duree_minutes,course_id,courses(slug,titre,image_couverture,secteur_slug)').eq('type','video').not('youtube_url','is',null).limit(6)
      setVideos(v || [])
      const { data: a } = await supabase.from('alertes').select('*').eq('statut','active').order('created_at',{ascending:false}).limit(1)
      if (a?.length) setAlerte(a[0])
      setTimeout(() => setLoaded(true), 100)
    }
    load()
  }, [])

  function ytId(url: string) {
    const m = (url||'').match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return m ? m[1] : null
  }

  const fadeIn = (delay: string) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.6s ease '+delay+', transform 0.6s ease '+delay,
  })

  return (
    <div className="min-h-screen" style={{background:'var(--bg-main)'}}>
      <Navbar />
      <div className="pt-16">

        {alerte && (
          <Link href="/alertes" className="flex items-center gap-3 px-6 py-3 hover:no-underline hover:opacity-90 transition-opacity" style={{background:'#c0392b'}}>
            <AlertTriangle size={14} className="text-white flex-shrink-0" />
            <span className="text-white text-sm font-semibold flex-1">Alerte securite : {alerte.titre}</span>
            <span className="text-white text-xs underline flex-shrink-0">Voir les details</span>
          </Link>
        )}

        {/* ── HERO ───────────────────────────────── */}
        <div className="relative overflow-hidden" style={{minHeight:'90vh',background:'#0f172a'}}>
          {heroImages.map((img,i) => (
            <div key={i} className="absolute inset-0 transition-opacity duration-1000" style={{opacity:i===imgIndex?1:0}}>
              <img src={img} alt="" className="w-full h-full object-cover" style={{filter:'brightness(0.35)'}} />
            </div>
          ))}
          <div className="absolute inset-0" style={{background:'linear-gradient(110deg,rgba(10,18,35,0.97) 0%,rgba(10,18,35,0.75) 50%,rgba(10,18,35,0.2) 100%)'}} />
          <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)',backgroundSize:'50px 50px'}} />

          <div className="relative max-w-7xl mx-auto px-6 flex flex-col justify-center" style={{minHeight:'90vh'}}>
            <div style={{maxWidth:'580px'}}>
              <div className="flex flex-wrap items-center gap-2 mb-7" style={fadeIn('0s')}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest" style={{background:'var(--orange)',color:'white'}}>
                  <Shield size={10} /> Securite au travail
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border" style={{borderColor:'rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.85)'}}>
                  <Zap size={10} style={{color:'#facc15'}} /> 100% gratuit
                </span>
              </div>

              <h1 style={{...fadeIn('0.1s'),color:'white',fontSize:'clamp(2rem,5vw,3.6rem)',fontWeight:900,lineHeight:1.08,marginBottom:'1.2rem',letterSpacing:'-0.025em'}}>
                {hero?.titre || (<>La securite professionnelle,<br /><span style={{color:'var(--orange)'}}>accessible a tous</span></>)}
              </h1>

              <p style={{...fadeIn('0.2s'),color:'rgba(255,255,255,0.7)',fontSize:'1.05rem',lineHeight:1.75,marginBottom:'2rem',maxWidth:'460px'}}>
                {hero?.description_courte || 'Formations certifiees, alertes securite en temps reel et ressources pratiques pour proteger vos equipes.'}
              </p>

              <div className="flex flex-wrap gap-3 mb-14" style={fadeIn('0.3s')}>
                <Link href={hero?'/cours/'+hero.slug:'/secteurs'} className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm hover:no-underline transition-all hover:scale-105" style={{background:'var(--orange)',color:'white',boxShadow:'0 6px 24px rgba(212,80,15,0.5)'}}>
                  {hero?'Voir cette formation':'Commencer gratuitement'} <ArrowRight size={15} />
                </Link>
                <Link href="/secteurs" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm hover:no-underline transition-all border hover:border-white/40" style={{background:'rgba(255,255,255,0.08)',color:'white',border:'1px solid rgba(255,255,255,0.18)'}}>
                  <BookOpen size={14} /> Tous les secteurs
                </Link>
              </div>

              <div className="flex gap-2" style={fadeIn('0.4s')}>
                {heroImages.map((_,i) => (
                  <button key={i} onClick={()=>setImgIndex(i)} className="rounded-full transition-all duration-500" style={{height:'3px',width:i===imgIndex?'32px':'8px',background:i===imgIndex?'var(--orange)':'rgba(255,255,255,0.3)'}} />
                ))}
              </div>
            </div>

            {/* STATS — fond fonce, texte BLANC */}
            <div className="absolute bottom-8 right-6 hidden lg:grid grid-cols-2 gap-2.5" style={{width:'300px',...fadeIn('0.5s')}}>
              {[
                {icon:BookOpen,value:'500+',label:'Formations'},
                {icon:Shield,value:'18',label:'Secteurs'},
                {icon:Zap,value:'100%',label:'Gratuit'},
                {icon:Bell,value:'24/7',label:'Alertes'},
              ].map((s,i) => {
                const Icon = s.icon
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{background:'rgba(255,255,255,0.07)',backdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.1)'}}>
                    <Icon size={17} style={{color:'var(--orange)',flexShrink:0}} />
                    <div>
                      <div style={{color:'white',fontWeight:900,fontSize:'1.2rem',lineHeight:1}}>{s.value}</div>
                      <div style={{color:'rgba(255,255,255,0.6)',fontSize:'11px',marginTop:'2px'}}>{s.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── TICKER ─────────────────────────────── */}
        <div className="border-y overflow-hidden" style={{borderColor:'var(--border)',background:'var(--bg-card)'}}>
          <div className="flex items-center">
            <div className="flex-shrink-0 px-5 py-3 font-black text-xs uppercase tracking-widest border-r" style={{color:'var(--orange)',borderColor:'var(--border)'}}>
              Secteurs
            </div>
            <div className="overflow-hidden flex-1 py-3 px-4">
              <div className="flex gap-6 items-center" style={{animation:'scroll 22s linear infinite',whiteSpace:'nowrap',width:'max-content'}}>
                {[...SECTEURS,...SECTEURS].map((s,i) => (
                  <Link key={i} href={'/secteurs/'+s.slug} className="inline-flex items-center gap-2 text-xs font-semibold hover:no-underline transition-colors hover:text-orange-500 flex-shrink-0" style={{color:'var(--text-secondary)'}}>
                    <ChevronRight size={11} style={{color:'var(--orange)'}} />{s.nom}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── SELECTION MAGAZINE ─────────────────── */}
        {selection.length > 0 && (
          <section className="py-16" style={{background:'var(--bg-main)'}}>
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest mb-1" style={{color:'var(--orange)'}}>A la une</p>
                  <h2 className="text-2xl font-black" style={{color:'var(--text-primary)'}}>Formations en vedette</h2>
                </div>
                <Link href="/secteurs" className="text-sm font-bold flex items-center gap-1.5 hover:underline" style={{color:'var(--orange)'}}>Voir tout <ArrowRight size={13} /></Link>
              </div>
              <div className="grid lg:grid-cols-12 gap-5">
                {selection[0] && (
                  <Link href={'/cours/'+selection[0].slug} className="lg:col-span-7 group relative overflow-hidden rounded-2xl hover:no-underline" style={{minHeight:'400px',background:'var(--bg-secondary)'}}>
                    {selection[0].image_couverture && <img src={selection[0].image_couverture} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                    <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.4) 55%,transparent 100%)'}} />
                    <div className="absolute top-5 left-5">
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wide" style={{background:'var(--orange)'}}>{selection[0].secteur_slug?.replace(/-/g,' ')}</span>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{boxShadow:'inset 0 0 0 2px rgba(212,80,15,0.6)'}} />
                    <div className="absolute bottom-0 left-0 right-0 p-7">
                      <h3 className="text-xl font-black text-white mb-2.5 group-hover:text-orange-300 transition-colors leading-tight">{selection[0].titre}</h3>
                      <p className="text-white/65 text-sm line-clamp-2 leading-relaxed">{selection[0].description_courte}</p>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-all group-hover:gap-3" style={{background:'rgba(212,80,15,0.9)',color:'white'}}>
                        Decouvrir <ArrowRight size={13} />
                      </div>
                    </div>
                  </Link>
                )}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  {selection.slice(1,4).map((c,i) => (
                    <Link key={c.id} href={'/cours/'+c.slug} className="group flex gap-4 p-4 rounded-2xl border hover:no-underline transition-all hover:shadow-md hover:border-orange-400/40" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                      <div className="w-[88px] flex-shrink-0 rounded-xl overflow-hidden" style={{height:'66px',background:'var(--bg-secondary)'}}>
                        {c.image_couverture && <img src={c.image_couverture} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{color:'var(--orange)'}}>{c.secteur_slug?.replace(/-/g,' ')}</p>
                        <h3 className="font-bold text-sm line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors" style={{color:'var(--text-primary)'}}>{c.titre}</h3>
                        <p className="text-xs mt-1 line-clamp-1" style={{color:'var(--text-secondary)'}}>{c.description_courte}</p>
                      </div>
                      <ArrowRight size={15} className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" style={{color:'var(--orange)'}} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── SECTEURS — GRID PROPRE ─────────────── */}
        <section className="py-14 border-t" style={{borderColor:'var(--border)',background:'var(--bg-secondary)'}}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-1" style={{color:'var(--orange)'}}>Explorer par domaine</p>
                <h2 className="text-2xl font-black" style={{color:'var(--text-primary)'}}>Choisissez votre secteur</h2>
              </div>
              <Link href="/secteurs" className="text-sm font-bold flex items-center gap-1.5 hover:underline" style={{color:'var(--orange)'}}>Voir tout <ArrowRight size={13} /></Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {SECTEURS.map(s => (
                <Link key={s.slug} href={'/secteurs/'+s.slug} className="group relative overflow-hidden rounded-2xl hover:no-underline transition-all hover:-translate-y-1 hover:shadow-xl" style={{aspectRatio:'4/3'}}>
                  <img src={s.img} alt={s.nom} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.25) 55%,rgba(0,0,0,0.05) 100%)'}} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{background:'linear-gradient(to top,rgba(212,80,15,0.55) 0%,rgba(212,80,15,0.1) 60%,transparent 100%)'}} />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-xs font-bold leading-tight drop-shadow-sm">{s.nom}</p>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all w-7 h-7 rounded-full flex items-center justify-center" style={{background:'var(--orange)'}}>
                    <ArrowRight size={12} className="text-white" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── VIDEOS ─────────────────────────────── */}
        <section className="py-16 border-t" style={{borderColor:'var(--border)',background:'var(--bg-main)'}}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-1" style={{color:'var(--orange)'}}>Apprendre en video</p>
                <h2 className="text-2xl font-black" style={{color:'var(--text-primary)'}}>Videos de formation</h2>
              </div>
              {videos.length > 0 && <Link href="/secteurs" className="text-sm font-bold flex items-center gap-1.5 hover:underline" style={{color:'var(--orange)'}}>Tout voir <ArrowRight size={13} /></Link>}
            </div>

            {videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {videos.slice(0,3).map((v,i) => {
                  const id=ytId(v.youtube_url); const thumb=id?'https://img.youtube.com/vi/'+id+'/mqdefault.jpg':(v.courses as any)?.image_couverture; const cSlug=(v.courses as any)?.slug
                  return (
                    <Link key={v.id} href={'/cours/'+cSlug+'?lecon='+v.id} className="group hover:no-underline overflow-hidden rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 hover:border-orange-400/40" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                      <div className="relative overflow-hidden" style={{aspectRatio:'16/9',background:'var(--bg-secondary)'}}>
                        {thumb && <img src={thumb} alt={v.titre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background:'rgba(0,0,0,0.35)'}}>
                          <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110" style={{background:'var(--orange)'}}>
                            <Play size={20} className="text-white" fill="white" style={{marginLeft:'3px'}} />
                          </div>
                        </div>
                        {v.duree_minutes>0 && <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-xs font-semibold text-white flex items-center gap-1" style={{background:'rgba(0,0,0,0.75)'}}><Clock size={9} />{v.duree_minutes}min</div>}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" style={{boxShadow:'inset 0 0 0 2px rgba(212,80,15,0.5)'}} />
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{color:'var(--orange)'}}>{(v.courses as any)?.secteur_slug?.replace(/-/g,' ')}</p>
                        <h4 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors" style={{color:'var(--text-primary)'}}>{v.titre}</h4>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {VIDEO_PLACEHOLDERS.map((p,i) => (
                    <div key={i} className="overflow-hidden rounded-2xl border" style={{background:'var(--bg-card)',borderColor:'var(--border)',opacity:0.7}}>
                      <div className="relative overflow-hidden" style={{aspectRatio:'16/9',background:'var(--bg-secondary)'}}>
                        <img src={p.img} alt="" className="w-full h-full object-cover" style={{filter:'brightness(0.4) saturate(0.3)'}} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center" style={{borderColor:'rgba(255,255,255,0.3)'}}>
                            <Lock size={18} className="text-white/60" />
                          </div>
                          <span className="text-white/60 text-xs font-semibold">Bientot disponible</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{color:'var(--text-secondary)'}}>{p.secteur}</p>
                        <h4 className="font-bold text-sm leading-snug" style={{color:'var(--text-secondary)'}}>{p.titre}</h4>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 text-center py-8 rounded-2xl border" style={{borderColor:'var(--border)',background:'var(--bg-secondary)'}}>
                  <Play size={32} className="mx-auto mb-3" style={{color:'var(--orange)',opacity:0.5}} />
                  <p className="font-bold mb-1" style={{color:'var(--text-primary)'}}>Videos de formation a venir</p>
                  <p className="text-sm max-w-xs mx-auto" style={{color:'var(--text-secondary)'}}>Notre equipe prepare des contenus video de qualite pour chaque secteur. Revenez bientot !</p>
                  <Link href="/secteurs" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-sm font-bold hover:no-underline hover:opacity-90 transition-opacity" style={{background:'var(--orange)',color:'white'}}>
                    Explorer les formations texte <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── CTA ────────────────────────────────── */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0" style={{background:'linear-gradient(135deg,#d4500f 0%,#e85d04 50%,#c0390a 100%)'}} />
          <div className="absolute inset-0 opacity-[0.07]" style={{backgroundImage:'radial-gradient(circle,white 1.5px,transparent 1.5px)',backgroundSize:'32px 32px'}} />
          <div className="absolute top-0 left-0 right-0 h-px" style={{background:'linear-gradient(to right,transparent,rgba(255,255,255,0.3),transparent)'}} />
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{background:'rgba(255,255,255,0.15)'}}>
              <Shield size={28} className="text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">La securite commence<br />par la formation</h2>
            <p className="text-white/80 text-lg mb-10 max-w-md mx-auto">Acces gratuit. Alertes en temps reel. Equipements certifies.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/secteurs" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-black text-sm hover:no-underline transition-all hover:scale-105" style={{background:'white',color:'var(--orange)',boxShadow:'0 8px 30px rgba(0,0,0,0.2)'}}>
                Commencer maintenant <ArrowRight size={15} />
              </Link>
              <Link href="/alertes" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm hover:no-underline border-2 text-white transition-all hover:bg-white/10" style={{borderColor:'rgba(255,255,255,0.4)'}}>
                <Bell size={15} /> Alertes securite
              </Link>
            </div>
          </div>
        </section>

        {/* ── 3 ACTIONS ──────────────────────────── */}
        <section className="py-14 border-t" style={{borderColor:'var(--border)',background:'var(--bg-secondary)'}}>
          <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-3 gap-6">
            {[
              {icon:BookOpen,titre:'Formations gratuites',desc:'Acces libre a des centaines de formations pour chaque secteur professionnel.',href:'/secteurs',cta:'Explorer'},
              {icon:Bell,titre:'Alertes securite',desc:'Notifications en temps reel des incidents et risques dans votre domaine.',href:'/alertes',cta:'Voir les alertes'},
              {icon:Shield,titre:'Marketplace EPI',desc:'Equipements de protection certifies, commandez directement depuis la plateforme.',href:'/marketplace',cta:'Acceder'},
            ].map((item,i) => {
              const Icon = item.icon
              return (
                <Link key={i} href={item.href} className="group p-6 rounded-2xl border hover:no-underline transition-all hover:shadow-lg hover:-translate-y-1 hover:border-orange-400/40" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all group-hover:scale-110 group-hover:rotate-3" style={{background:'linear-gradient(135deg,rgba(212,80,15,0.15),rgba(212,80,15,0.05))'}}>
                    <Icon size={22} style={{color:'var(--orange)'}} />
                  </div>
                  <h3 className="font-black text-base mb-2.5 group-hover:text-orange-500 transition-colors" style={{color:'var(--text-primary)'}}>{item.titre}</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{color:'var(--text-secondary)'}}>{item.desc}</p>
                  <div className="flex items-center gap-1.5 text-sm font-bold group-hover:gap-3 transition-all" style={{color:'var(--orange)'}}>{item.cta} <ArrowRight size={13} /></div>
                </Link>
              )
            })}
          </div>
        </section>

      </div>

      <style>{'@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}'}</style>
      <Footer />
    </div>
  )
}
