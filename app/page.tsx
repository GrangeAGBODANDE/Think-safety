'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronRight, Play, AlertTriangle, ArrowRight, Clock, Shield, Zap, BookOpen, Bell, Lock, Users, CheckCircle } from 'lucide-react'

const SECTEURS = [
  { slug: 'construction-btp',         nom: 'Construction & BTP',  img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=80', count: '48 formations' },
  { slug: 'sante-medical',            nom: 'Sante & Medical',      img: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=700&q=80', count: '36 formations' },
  { slug: 'industrie-manufacturiere', nom: 'Industrie',            img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=700&q=80', count: '52 formations' },
  { slug: 'transport-logistique',     nom: 'Transport',            img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=700&q=80', count: '29 formations' },
  { slug: 'agriculture',              nom: 'Agriculture',          img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=700&q=80', count: '31 formations' },
  { slug: 'mines-carrieres',          nom: 'Mines & Carrieres',    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=700&q=80', count: '24 formations' },
  { slug: 'petrole-gaz',              nom: 'Petrole & Gaz',        img: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=700&q=80', count: '27 formations' },
  { slug: 'bureaux-services',         nom: 'Bureaux & Services',   img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80', count: '41 formations' },
  { slug: 'education-formation',      nom: 'Education',            img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=700&q=80', count: '33 formations' },
]

const VIDEO_PLACEHOLDERS = [
  { secteur: 'Construction & BTP',  titre: 'Securite sur chantier - Les fondamentaux', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80' },
  { secteur: 'Industrie',           titre: 'Gestes et postures en milieu industriel',   img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80' },
  { secteur: 'Transport',           titre: 'Prevention des accidents de la route',      img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80' },
]

export default function HomePage() {
  const [hero, setHero] = useState<any>(null)
  const [selection, setSelection] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [alerte, setAlerte] = useState<any>(null)
  const [imgIndex, setImgIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const heroImages = [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80',
  ]

  useEffect(() => {
    const t = setInterval(() => setImgIndex(i => (i+1) % heroImages.length), 5500)
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
      setTimeout(() => setLoaded(true), 80)
    }
    load()
  }, [])

  function ytId(url: string) {
    const m = (url||'').match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return m ? m[1] : null
  }

  const anim = (delay = 0) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
  })

  return (
    <div className="min-h-screen" style={{background:'var(--bg-main)'}}>
      <Navbar />
      <div className="pt-16">

        {alerte && (
          <Link href="/alertes" className="flex items-center gap-3 px-6 py-3 hover:no-underline hover:opacity-90 transition-opacity" style={{background:'#c0392b'}}>
            <AlertTriangle size={14} className="text-white flex-shrink-0 animate-pulse" />
            <span className="text-white text-sm font-bold flex-1">Alerte : {alerte.titre}</span>
            <span className="text-white/80 text-xs flex-shrink-0 underline">Voir les details</span>
          </Link>
        )}

        <div className="relative overflow-hidden" style={{minHeight:'92vh',background:'#08111f'}}>
          {heroImages.map((img,i) => (
            <div key={i} className="absolute inset-0" style={{opacity:i===imgIndex?1:0,transition:'opacity 1.2s ease'}}>
              <img src={img} alt="" className="w-full h-full object-cover" style={{filter:'brightness(0.3) saturate(0.7)'}} />
            </div>
          ))}
          <div className="absolute inset-0" style={{background:'linear-gradient(115deg,rgba(6,12,25,0.98) 0%,rgba(6,12,25,0.78) 45%,rgba(6,12,25,0.15) 100%)'}} />
          <div className="absolute inset-0 opacity-[0.035]" style={{backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',backgroundSize:'48px 48px'}} />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-20 pointer-events-none" style={{background:'radial-gradient(circle,var(--orange),transparent 70%)',filter:'blur(60px)'}} />

          <div className="relative max-w-7xl mx-auto px-6 flex flex-col justify-center" style={{minHeight:'92vh',paddingTop:'3rem',paddingBottom:'6rem'}}>
            <div style={{maxWidth:'600px'}}>
              <div className="flex flex-wrap items-center gap-2 mb-7" style={anim(0)}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider" style={{background:'var(--orange)',color:'white',boxShadow:'0 4px 18px rgba(212,80,15,0.5)'}}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Plateforme de formation
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border" style={{borderColor:'rgba(255,255,255,0.15)',color:'rgba(255,255,255,0.8)'}}>
                  <CheckCircle size={11} style={{color:'#4ade80'}} /> Acces 100% gratuit
                </span>
              </div>
              <h1 style={{...anim(100),color:'white',fontSize:'clamp(2.2rem,5.5vw,4rem)',fontWeight:900,lineHeight:1.06,marginBottom:'1.3rem',letterSpacing:'-0.028em'}}>
                {hero?.titre || (<>La securite au travail,<br /><span style={{color:'var(--orange)',textShadow:'0 0 40px rgba(212,80,15,0.4)'}}>accessible a tous</span></>)}
              </h1>
              <p style={{...anim(180),color:'rgba(255,255,255,0.68)',fontSize:'1.08rem',lineHeight:1.78,marginBottom:'2.2rem',maxWidth:'470px'}}>
                {hero?.description_courte || 'Formations certifiees, alertes securite en temps reel et ressources pratiques pour proteger vos equipes.'}
              </p>
              <div className="flex flex-wrap gap-3 mb-14" style={anim(250)}>
                <Link href={hero?'/cours/'+hero.slug:'/secteurs'} className="group inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-black text-sm hover:no-underline transition-all hover:scale-105 relative overflow-hidden" style={{background:'var(--orange)',color:'white',boxShadow:'0 8px 28px rgba(212,80,15,0.5)'}}>
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'linear-gradient(135deg,rgba(255,255,255,0.15),transparent)'}} />
                  {hero?'Voir cette formation':'Commencer gratuitement'}
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/secteurs" className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-bold text-sm hover:no-underline transition-all border hover:border-white/30 hover:bg-white/10" style={{background:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.88)',border:'1px solid rgba(255,255,255,0.14)'}}>
                  <BookOpen size={14} /> Parcourir les secteurs
                </Link>
              </div>
              <div className="flex gap-2" style={anim(320)}>
                {heroImages.map((_,i) => (
                  <button key={i} onClick={()=>setImgIndex(i)} className="rounded-full transition-all duration-500" style={{height:'3px',width:i===imgIndex?'36px':'8px',background:i===imgIndex?'var(--orange)':'rgba(255,255,255,0.25)'}} />
                ))}
              </div>
            </div>
            <div className="absolute bottom-10 right-6 hidden lg:grid grid-cols-2 gap-2.5" style={{width:'310px',...anim(400)}}>
              {[
                {icon:BookOpen,value:'500+',label:'Formations'},
                {icon:Shield,value:'18',label:'Secteurs'},
                {icon:Users,value:'12k+',label:'Apprenants'},
                {icon:Bell,value:'24/7',label:'Alertes'},
              ].map((s,i) => {
                const Icon = s.icon
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all hover:scale-105" style={{background:'rgba(255,255,255,0.07)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)'}}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(212,80,15,0.25)'}}>
                      <Icon size={16} style={{color:'var(--orange)'}} />
                    </div>
                    <div>
                      <div style={{color:'white',fontWeight:900,fontSize:'1.25rem',lineHeight:1}}>{s.value}</div>
                      <div style={{color:'rgba(255,255,255,0.55)',fontSize:'10px',marginTop:'3px',textTransform:'uppercase',letterSpacing:'0.05em'}}>{s.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="border-y overflow-hidden" style={{borderColor:'var(--border)',background:'var(--bg-card)'}}>
          <div className="flex items-stretch">
            <div className="flex-shrink-0 flex items-center px-5 py-3 border-r" style={{borderColor:'var(--border)'}}>
              <span className="font-black text-xs uppercase tracking-widest" style={{color:'var(--orange)'}}>Secteurs</span>
            </div>
            <div className="overflow-hidden flex-1 py-3 px-4">
              <div className="flex gap-8 items-center" style={{animation:'scroll 22s linear infinite',whiteSpace:'nowrap',width:'max-content'}}>
                {[...SECTEURS,...SECTEURS].map((s,i) => (
                  <Link key={i} href={'/secteurs/'+s.slug} className="inline-flex items-center gap-2 text-xs font-semibold hover:no-underline group flex-shrink-0" style={{color:'var(--text-secondary)'}}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 group-hover:scale-150 transition-transform" style={{background:'var(--orange)'}} />
                    <span className="group-hover:text-orange-500 transition-colors">{s.nom}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selection.length > 0 && (
          <section className="py-16" style={{background:'var(--bg-main)'}}>
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-2"><div className="h-px w-8" style={{background:'var(--orange)'}} /><p className="text-xs font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>A la une</p></div>
                  <h2 className="text-3xl font-black" style={{color:'var(--text-primary)'}}>Formations en vedette</h2>
                </div>
                <Link href="/secteurs" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:no-underline transition-all hover:scale-105" style={{background:'rgba(212,80,15,0.1)',color:'var(--orange)',border:'1px solid rgba(212,80,15,0.2)'}}>Tout voir <ArrowRight size={13} /></Link>
              </div>
              <div className="grid lg:grid-cols-12 gap-5">
                {selection[0] && (
                  <Link href={'/cours/'+selection[0].slug} className="lg:col-span-7 group relative overflow-hidden rounded-3xl hover:no-underline" style={{minHeight:'420px',background:'var(--bg-secondary)'}}>
                    {selection[0].image_couverture && <img src={selection[0].image_couverture} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                    <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.96) 0%,rgba(0,0,0,0.5) 50%,transparent 100%)'}} />
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{boxShadow:'inset 0 0 0 2px var(--orange)'}} />
                    <div className="absolute top-5 left-5"><span className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide text-white" style={{background:'var(--orange)'}}>{selection[0].secteur_slug?.replace(/-/g,' ')}</span></div>
                    <div className="absolute bottom-0 left-0 right-0 p-7">
                      <h3 className="text-2xl font-black text-white mb-3 leading-tight group-hover:text-orange-300 transition-colors">{selection[0].titre}</h3>
                      <p className="text-white/65 text-sm line-clamp-2 mb-5">{selection[0].description_courte}</p>
                      <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all group-hover:gap-4" style={{background:'var(--orange)'}}>Decouvrir <ArrowRight size={14} /></div>
                    </div>
                  </Link>
                )}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  {selection.slice(1,4).map(c => (
                    <Link key={c.id} href={'/cours/'+c.slug} className="group flex gap-4 p-4 rounded-2xl border hover:no-underline transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-orange-400/50" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                      <div className="relative flex-shrink-0 rounded-2xl overflow-hidden" style={{width:'90px',height:'70px',background:'var(--bg-secondary)'}}>
                        {c.image_couverture && <img src={c.image_couverture} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{color:'var(--orange)'}}>{c.secteur_slug?.replace(/-/g,' ')}</p>
                        <h3 className="font-bold text-sm line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors" style={{color:'var(--text-primary)'}}>{c.titre}</h3>
                        <p className="text-xs mt-1 line-clamp-1" style={{color:'var(--text-secondary)'}}>{c.description_courte}</p>
                      </div>
                      <ArrowRight size={15} className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" style={{color:'var(--orange)'}} />
                    </Link>
                  ))}
                  <Link href="/secteurs" className="mt-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold hover:no-underline transition-all hover:scale-[1.02]" style={{background:'rgba(212,80,15,0.08)',color:'var(--orange)',border:'1.5px dashed rgba(212,80,15,0.3)'}}>
                    <BookOpen size={14} /> Voir toutes les formations
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="py-10 border-y" style={{borderColor:'var(--border)',background:'linear-gradient(135deg,var(--orange) 0%,#c0390a 100%)'}}>
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              {val:'500+',label:'Formations disponibles',icon:BookOpen},
              {val:'18',label:'Secteurs couverts',icon:Shield},
              {val:'12k+',label:'Apprenants actifs',icon:Users},
              {val:'24/7',label:'Alertes en temps reel',icon:Bell},
            ].map((s,i) => {
              const Icon = s.icon
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1" style={{background:'rgba(255,255,255,0.15)'}}><Icon size={18} className="text-white" /></div>
                  <div className="text-3xl font-black text-white leading-none">{s.val}</div>
                  <div className="text-xs font-semibold text-white/75">{s.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        <section className="py-16" style={{background:'var(--bg-secondary)'}}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2"><div className="h-px w-8" style={{background:'var(--orange)'}} /><p className="text-xs font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>18 domaines</p></div>
                <h2 className="text-3xl font-black" style={{color:'var(--text-primary)'}}>Choisissez votre secteur</h2>
              </div>
              <Link href="/secteurs" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:no-underline transition-all hover:scale-105" style={{background:'rgba(212,80,15,0.1)',color:'var(--orange)',border:'1px solid rgba(212,80,15,0.2)'}}>Voir tout <ArrowRight size={13} /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {SECTEURS.slice(0,2).map(s => (
                <Link key={s.slug} href={'/secteurs/'+s.slug} className="group relative overflow-hidden rounded-3xl hover:no-underline sm:col-span-1 transition-all hover:-translate-y-1 hover:shadow-2xl" style={{aspectRatio:'3/2',background:'#111'}}>
                  <img src={s.img} alt={s.nom} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.2) 60%,transparent 100%)'}} />
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{boxShadow:'inset 0 0 0 2px rgba(212,80,15,0.7)'}} />
                  <div className="absolute bottom-0 left-0 right-0 p-3.5">
                    <p className="text-white text-xs font-black leading-tight mb-0.5">{s.nom}</p>
                    <p className="text-white/60 text-[10px]">{s.count}</p>
                  </div>
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{background:'var(--orange)'}}><ArrowRight size={12} className="text-white" /></div>
                </Link>
              ))}
              {SECTEURS.slice(2,9).map(s => (
                <Link key={s.slug} href={'/secteurs/'+s.slug} className="group relative overflow-hidden rounded-2xl hover:no-underline transition-all hover:-translate-y-1 hover:shadow-xl" style={{aspectRatio:'4/3',background:'#111'}}>
                  <img src={s.img} alt={s.nom} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.12) 70%,transparent 100%)'}} />
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{boxShadow:'inset 0 0 0 2px rgba(212,80,15,0.6)'}} />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-white text-[11px] font-black leading-tight">{s.nom}</p>
                    <p className="text-white/55 text-[9px] mt-0.5">{s.count}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 border-t" style={{borderColor:'var(--border)',background:'var(--bg-main)'}}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2"><div className="h-px w-8" style={{background:'var(--orange)'}} /><p className="text-xs font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>Apprendre en video</p></div>
                <h2 className="text-3xl font-black" style={{color:'var(--text-primary)'}}>Videos de formation</h2>
              </div>
              {videos.length > 0 && <Link href="/secteurs" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:no-underline transition-all hover:scale-105" style={{background:'rgba(212,80,15,0.1)',color:'var(--orange)',border:'1px solid rgba(212,80,15,0.2)'}}>Tout voir <ArrowRight size={13} /></Link>}
            </div>
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {videos.slice(0,3).map(v => {
                  const id=ytId(v.youtube_url); const thumb=id?'https://img.youtube.com/vi/'+id+'/mqdefault.jpg':(v.courses as any)?.image_couverture; const cSlug=(v.courses as any)?.slug
                  return (
                    <Link key={v.id} href={'/cours/'+cSlug+'?lecon='+v.id} className="group hover:no-underline overflow-hidden rounded-3xl border transition-all hover:shadow-xl hover:-translate-y-1" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                      <div className="relative overflow-hidden" style={{aspectRatio:'16/9',background:'var(--bg-secondary)'}}>
                        {thumb && <img src={thumb} alt={v.titre} className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105" />}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background:'rgba(0,0,0,0.35)'}}>
                          <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl" style={{background:'var(--orange)'}}><Play size={20} className="text-white" fill="white" style={{marginLeft:'3px'}} /></div>
                        </div>
                        {v.duree_minutes>0 && <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1.5" style={{background:'rgba(0,0,0,0.75)'}}><Clock size={10} />{v.duree_minutes}min</div>}
                        <div className="absolute inset-0 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{boxShadow:'inset 0 0 0 2px rgba(212,80,15,0.5)'}} />
                      </div>
                      <div className="p-5">
                        <p className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{color:'var(--orange)'}}>{(v.courses as any)?.secteur_slug?.replace(/-/g,' ')}</p>
                        <h4 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors" style={{color:'var(--text-primary)'}}>{v.titre}</h4>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6 opacity-60">
                  {VIDEO_PLACEHOLDERS.map((p,i) => (
                    <div key={i} className="overflow-hidden rounded-3xl border" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                      <div className="relative overflow-hidden" style={{aspectRatio:'16/9'}}>
                        <img src={p.img} alt="" className="w-full h-full object-cover" style={{filter:'brightness(0.3) saturate(0.2)'}} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{borderColor:'rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.05)'}}><Lock size={18} className="text-white/50" /></div>
                          <span className="text-white/50 text-xs font-semibold px-3 py-1 rounded-full" style={{background:'rgba(255,255,255,0.08)'}}>Bientot disponible</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{color:'var(--text-secondary)'}}>{p.secteur}</p>
                        <h4 className="font-bold text-sm" style={{color:'var(--text-secondary)'}}>{p.titre}</h4>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="py-10 px-6 rounded-3xl border text-center" style={{borderColor:'rgba(212,80,15,0.2)',background:'rgba(212,80,15,0.04)'}}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'rgba(212,80,15,0.1)'}}><Play size={24} style={{color:'var(--orange)'}} /></div>
                  <h3 className="font-black text-lg mb-2" style={{color:'var(--text-primary)'}}>Videos de formation a venir</h3>
                  <p className="text-sm mb-6 max-w-sm mx-auto" style={{color:'var(--text-secondary)'}}>Notre equipe prepare des contenus video de haute qualite pour chaque secteur.</p>
                  <Link href="/secteurs" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm hover:no-underline transition-all hover:scale-105" style={{background:'var(--orange)',color:'white'}}>Explorer les formations <ArrowRight size={14} /></Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0" style={{background:'linear-gradient(135deg,#b84500 0%,var(--orange) 40%,#e06010 100%)'}} />
          <div className="absolute inset-0 opacity-[0.08]" style={{backgroundImage:'radial-gradient(circle,white 1.5px,transparent 1.5px)',backgroundSize:'28px 28px'}} />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20 pointer-events-none" style={{background:'radial-gradient(circle,rgba(255,255,255,0.4),transparent 70%)'}} />
          <div className="absolute -bottom-20 -left-10 w-60 h-60 rounded-full opacity-15 pointer-events-none" style={{background:'radial-gradient(circle,rgba(255,255,255,0.3),transparent 70%)'}} />
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-black uppercase tracking-wider" style={{background:'rgba(255,255,255,0.15)',color:'white'}}><Shield size={12} /> Rejoignez la communaute</div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">La securite commence<br />par la formation</h2>
            <p className="text-white/80 text-lg mb-10 max-w-md mx-auto">Acces 100% gratuit. Alertes en temps reel. Equipements certifies.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/secteurs" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-sm hover:no-underline transition-all hover:scale-105" style={{background:'white',color:'var(--orange)',boxShadow:'0 8px 32px rgba(0,0,0,0.25)'}}>Commencer maintenant <ArrowRight size={15} /></Link>
              <Link href="/alertes" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-sm hover:no-underline border-2 border-white/40 text-white transition-all hover:bg-white/15 hover:border-white/70"><Bell size={15} /> Alertes securite</Link>
            </div>
          </div>
        </section>

        <section className="py-16 border-t" style={{borderColor:'var(--border)',background:'var(--bg-secondary)'}}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-2"><div className="h-px w-8" style={{background:'var(--orange)'}} /><p className="text-xs font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>Notre plateforme</p><div className="h-px w-8" style={{background:'var(--orange)'}} /></div>
              <h2 className="text-3xl font-black" style={{color:'var(--text-primary)'}}>Tout ce dont vous avez besoin</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {icon:BookOpen,titre:'Formations gratuites',desc:'Acces libre a des centaines de formations certifiees pour chaque secteur professionnel.',href:'/secteurs',cta:'Explorer les formations',color:'#2563eb'},
                {icon:Bell,titre:'Alertes securite',desc:'Notifications en temps reel des incidents, risques et nouvelles reglementations.',href:'/alertes',cta:'Voir les alertes',color:'#dc2626'},
                {icon:Shield,titre:'Marketplace EPI',desc:'Equipements de protection certifies. Commandez directement depuis la plateforme.',href:'/marketplace',cta:'Acceder au marketplace',color:'#16a34a'},
              ].map((item,i) => {
                const Icon = item.icon
                return (
                  <Link key={i} href={item.href} className="group p-7 rounded-3xl border hover:no-underline transition-all hover:shadow-xl hover:-translate-y-1.5" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:rotate-3" style={{background:item.color+'18',border:'1px solid '+item.color+'30'}}><Icon size={24} style={{color:item.color}} /></div>
                    <h3 className="font-black text-lg mb-3 group-hover:text-orange-500 transition-colors" style={{color:'var(--text-primary)'}}>{item.titre}</h3>
                    <p className="text-sm leading-relaxed mb-6" style={{color:'var(--text-secondary)',lineHeight:'1.75'}}>{item.desc}</p>
                    <div className="flex items-center gap-2 text-sm font-black transition-all group-hover:gap-3" style={{color:'var(--orange)'}}>{item.cta} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

      </div>
      <style>{'@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}'}</style>
      <Footer />
    </div>
  )
}
