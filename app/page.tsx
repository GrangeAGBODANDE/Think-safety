'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronRight, Play, AlertTriangle, ArrowRight, Clock, Shield, Zap, BookOpen, Bell } from 'lucide-react'

const SECTEURS = [
  { slug: 'construction-btp',         nom: 'Construction & BTP',       img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', color: '#E67E22' },
  { slug: 'sante-medical',            nom: 'Sante Medical',             img: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80', color: '#E74C3C' },
  { slug: 'industrie-manufacturiere', nom: 'Industrie',                 img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80', color: '#2980B9' },
  { slug: 'transport-logistique',     nom: 'Transport',                 img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80', color: '#27AE60' },
  { slug: 'agriculture',              nom: 'Agriculture',               img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80', color: '#16A085' },
  { slug: 'mines-carrieres',          nom: 'Mines',                     img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80', color: '#8E44AD' },
  { slug: 'petrole-gaz',              nom: 'Petrole & Gaz',             img: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&q=80', color: '#D35400' },
  { slug: 'bureaux-services',         nom: 'Bureaux',                   img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80', color: '#2C3E50' },
  { slug: 'education-formation',      nom: 'Education',                 img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80', color: '#1ABC9C' },
]

export default function HomePage() {
  const [hero, setHero] = useState<any>(null)
  const [selection, setSelection] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [alerte, setAlerte] = useState<any>(null)
  const [imgIndex, setImgIndex] = useState(0)

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
      const { data: v } = await supabase.from('course_lessons').select('id,titre,youtube_url,duree_minutes,course_id,courses(slug,titre,image_couverture,secteur_slug)').eq('type','video').not('youtube_url','is',null).limit(5)
      setVideos(v || [])
      const { data: a } = await supabase.from('alertes').select('*').eq('statut','active').order('created_at',{ascending:false}).limit(1)
      if (a?.length) setAlerte(a[0])
    }
    load()
  }, [])

  function ytId(url: string) {
    const m = (url||'').match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return m ? m[1] : null
  }

  return (
    <div className="min-h-screen" style={{background:'var(--bg-main)'}}>
      <Navbar />
      <div className="pt-16">

        {alerte && (
          <Link href="/alertes" className="flex items-center gap-3 px-6 py-3 hover:no-underline hover:opacity-90 transition-opacity" style={{background:'#c0392b'}}>
            <AlertTriangle size={15} className="text-white flex-shrink-0" />
            <span className="text-white text-sm font-semibold flex-1">Alerte : {alerte.titre}</span>
            <span className="text-white/80 text-xs flex-shrink-0">Voir details</span>
            <ChevronRight size={14} className="text-white flex-shrink-0" />
          </Link>
        )}

        {/* HERO SPLIT */}
        <div className="relative overflow-hidden" style={{minHeight:'88vh'}}>
          {heroImages.map((img,i) => (
            <div key={i} className="absolute inset-0 transition-opacity duration-1500" style={{opacity:i===imgIndex?1:0}}>
              <img src={img} alt="" className="w-full h-full object-cover" style={{filter:'brightness(0.45) saturate(0.8)'}} />
            </div>
          ))}
          <div className="absolute inset-0" style={{background:'linear-gradient(to right, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.7) 55%, rgba(15,23,42,0.1) 100%)'}} />

          <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center" style={{minHeight:'88vh'}}>
            <div style={{maxWidth:'600px'}}>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider" style={{background:'var(--orange)',color:'white'}}>
                  <Shield size={11} /> Formation securite
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{background:'rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.9)'}}>
                  <Zap size={11} /> 100% gratuit
                </div>
              </div>

              <h1 style={{color:'white',fontSize:'clamp(2.2rem,5vw,3.8rem)',fontWeight:900,lineHeight:1.1,marginBottom:'1.25rem',letterSpacing:'-0.02em'}}>
                {hero?.titre || 'La securite professionnelle accessible a tous'}
              </h1>

              <p style={{color:'rgba(255,255,255,0.75)',fontSize:'1.1rem',lineHeight:1.7,marginBottom:'2.5rem',maxWidth:'480px'}}>
                {hero?.description_courte || 'Formations certifiees, alertes en temps reel et ressources pratiques pour tous les secteurs.'}
              </p>

              <div className="flex flex-wrap gap-3 mb-12">
                <Link href={hero?'/cours/'+hero.slug:'/secteurs'} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm hover:no-underline transition-all hover:translate-y-px" style={{background:'var(--orange)',color:'white',boxShadow:'0 8px 25px rgba(212,80,15,0.45)'}}>
                  {hero?'Voir cette formation':'Commencer gratuitement'} <ArrowRight size={15} />
                </Link>
                <Link href="/secteurs" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm hover:no-underline transition-all" style={{background:'rgba(255,255,255,0.15)',color:'white',backdropFilter:'blur(10px)',border:'1px solid rgba(255,255,255,0.25)'}}>
                  <BookOpen size={15} /> Tous les secteurs
                </Link>
              </div>

              <div className="flex gap-2">
                {heroImages.map((_,i) => (
                  <button key={i} onClick={()=>setImgIndex(i)} className="rounded-full transition-all duration-300" style={{height:'3px',width:i===imgIndex?'28px':'8px',background:i===imgIndex?'var(--orange)':'rgba(255,255,255,0.4)'}} />
                ))}
              </div>
            </div>

            <div className="absolute bottom-8 right-6 hidden lg:grid grid-cols-2 gap-3" style={{width:'320px'}}>
              {[
                {icon:BookOpen,value:'500+',label:'Formations'},
                {icon:Shield,value:'18',label:'Secteurs'},
                {icon:Zap,value:'100%',label:'Gratuit'},
                {icon:Bell,value:'24/7',label:'Alertes'},
              ].map((s,i) => {
                const Icon = s.icon
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{background:'rgba(255,255,255,0.1)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,0.15)'}}>
                    <Icon size={18} style={{color:'var(--orange)',flexShrink:0}} />
                    <div>
                      <div className="text-white font-black text-lg leading-none">{s.value}</div>
                      <div className="text-white/60 text-xs mt-0.5">{s.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* TICKER SECTEURS */}
        <div className="border-y overflow-hidden" style={{borderColor:'var(--border)',background:'var(--bg-card)'}}>
          <div className="flex items-center gap-0">
            <div className="px-4 py-3 font-bold text-xs uppercase tracking-wider flex-shrink-0 border-r" style={{color:'var(--orange)',borderColor:'var(--border)',background:'var(--bg-card)'}}>Secteurs</div>
            <div className="overflow-hidden flex-1 py-2.5 px-4">
              <div className="flex gap-4 items-center" style={{animation:'scroll 20s linear infinite',whiteSpace:'nowrap',width:'max-content'}}>
                {[...SECTEURS,...SECTEURS].map((s,i) => (
                  <Link key={i} href={'/secteurs/'+s.slug} className="inline-flex items-center gap-1.5 text-xs font-medium hover:no-underline transition-colors" style={{color:'var(--text-secondary)'}}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:s.color}} />
                    {s.nom}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SELECTION MAGAZINE */}
        {selection.length > 0 && (
          <section className="py-14" style={{background:'var(--bg-main)'}}>
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'var(--orange)'}}>A la une</p>
                  <h2 className="text-2xl font-black" style={{color:'var(--text-primary)'}}>Formations en vedette</h2>
                </div>
                <Link href="/secteurs" className="text-sm font-semibold flex items-center gap-1 hover:underline" style={{color:'var(--orange)'}}>Voir tout <ArrowRight size={13} /></Link>
              </div>

              <div className="grid lg:grid-cols-12 gap-5">
                {selection[0] && (
                  <Link href={'/cours/'+selection[0].slug} className="lg:col-span-7 group relative overflow-hidden rounded-2xl hover:no-underline" style={{minHeight:'380px',background:'var(--bg-secondary)'}}>
                    {selection[0].image_couverture && <img src={selection[0].image_couverture} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                    <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.3) 50%,transparent 100%)'}} />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{background:'var(--orange)'}}>{selection[0].secteur_slug?.replace(/-/g,' ')}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-black text-white mb-2 group-hover:text-orange-300 transition-colors">{selection[0].titre}</h3>
                      <p className="text-white/70 text-sm line-clamp-2">{selection[0].description_courte}</p>
                      <div className="mt-3 flex items-center gap-1 text-xs font-semibold" style={{color:'var(--orange)'}}>Decouvrir <ArrowRight size={11} /></div>
                    </div>
                  </Link>
                )}

                <div className="lg:col-span-5 flex flex-col gap-4">
                  {selection.slice(1,4).map(c => (
                    <Link key={c.id} href={'/cours/'+c.slug} className="group flex gap-4 p-4 rounded-2xl border hover:no-underline transition-all hover:shadow-md" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                      <div className="w-24 h-18 rounded-xl overflow-hidden flex-shrink-0" style={{background:'var(--bg-secondary)',height:'72px'}}>
                        {c.image_couverture && <img src={c.image_couverture} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{color:'var(--orange)'}}>{c.secteur_slug?.replace(/-/g,' ')}</span>
                        <h3 className="font-bold text-sm mt-0.5 line-clamp-2 group-hover:text-orange-500 transition-colors" style={{color:'var(--text-primary)'}}>{c.titre}</h3>
                        <p className="text-xs mt-1 line-clamp-1" style={{color:'var(--text-secondary)'}}>{c.description_courte}</p>
                      </div>
                      <ChevronRight size={16} className="flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform" style={{color:'var(--text-secondary)'}} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTEURS GRID */}
        <section className="py-14 border-t" style={{borderColor:'var(--border)',background:'var(--bg-secondary)'}}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'var(--orange)'}}>Explorer par domaine</p>
                <h2 className="text-2xl font-black" style={{color:'var(--text-primary)'}}>Tous les secteurs</h2>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {SECTEURS.map(s => (
                <Link key={s.slug} href={'/secteurs/'+s.slug} className="group relative overflow-hidden rounded-xl hover:no-underline" style={{aspectRatio:'4/3',background:s.color}}>
                  <img src={s.img} alt={s.nom} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 mix-blend-multiply" />
                  <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.1) 100%)'}} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background:'rgba(212,80,15,0.3)'}} />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-white text-xs font-bold leading-tight">{s.nom}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* VIDEOS */}
        {videos.length > 0 && (
          <section className="py-14 border-t" style={{borderColor:'var(--border)',background:'var(--bg-main)'}}>
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:'var(--orange)'}}>Apprendre en video</p>
                  <h2 className="text-2xl font-black" style={{color:'var(--text-primary)'}}>Videos de formation</h2>
                </div>
                <Link href="/secteurs" className="text-sm font-semibold flex items-center gap-1 hover:underline" style={{color:'var(--orange)'}}>Tout voir <ArrowRight size={13} /></Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {videos.map((v,i) => {
                  const id=ytId(v.youtube_url); const thumb=id?'https://img.youtube.com/vi/'+id+'/mqdefault.jpg':(v.courses as any)?.image_couverture; const cSlug=(v.courses as any)?.slug; const isBig=i===0
                  return (
                    <Link key={v.id} href={'/cours/'+cSlug+'?lecon='+v.id} className={'group hover:no-underline overflow-hidden rounded-2xl border transition-all hover:shadow-lg '+(isBig?'sm:col-span-2 lg:col-span-1':'')} style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                      <div className="relative overflow-hidden" style={{aspectRatio:'16/9',background:'var(--bg-secondary)'}}>
                        {thumb && <img src={thumb} alt={v.titre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'rgba(0,0,0,0.3)'}}>
                          <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl" style={{background:'var(--orange)'}}>
                            <Play size={18} className="text-white" fill="white" style={{marginLeft:'2px'}} />
                          </div>
                        </div>
                        {v.duree_minutes>0 && <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs font-medium text-white flex items-center gap-1" style={{background:'rgba(0,0,0,0.7)'}}><Clock size={9} />{v.duree_minutes}min</div>}
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{color:'var(--orange)'}}>{(v.courses as any)?.secteur_slug?.replace(/-/g,' ')}</p>
                        <h4 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors" style={{color:'var(--text-primary)'}}>{v.titre}</h4>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-20 relative overflow-hidden" style={{background:'var(--orange)'}}>
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 20% 50%, white 1px, transparent 1px),radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',backgroundSize:'40px 40px'}} />
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <Shield size={40} className="text-white/30 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">La securite commence par la formation</h2>
            <p className="text-white/85 text-lg mb-8 max-w-lg mx-auto">Acces gratuit. Alertes en temps reel. Marketplace EPI certifie.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/secteurs" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm hover:no-underline transition-all hover:scale-105 hover:shadow-xl" style={{background:'white',color:'var(--orange)'}}>Commencer maintenant <ArrowRight size={15} /></Link>
              <Link href="/alertes" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm hover:no-underline border-2 border-white/50 text-white hover:border-white transition-all">
                <Bell size={15} /> Voir les alertes
              </Link>
            </div>
          </div>
        </section>

        {/* 3 ACTIONS */}
        <section className="py-14" style={{background:'var(--bg-secondary)'}}>
          <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-3 gap-6">
            {[
              {icon:BookOpen,titre:'Formations gratuites',desc:'Des formations pour chaque secteur professionnel, accessibles a tous sans inscription.',href:'/secteurs',cta:'Explorer'},
              {icon:Bell,titre:'Alertes securite',desc:'Restez informe en temps reel des incidents et alertes de securite dans votre secteur.',href:'/alertes',cta:'Voir les alertes'},
              {icon:Shield,titre:'Marketplace EPI',desc:'Equipements de protection certifies, disponibles pour toutes les industries.',href:'/marketplace',cta:'Acceder'},
            ].map((item,i) => {
              const Icon = item.icon
              return (
                <Link key={i} href={item.href} className="group p-6 rounded-2xl border hover:no-underline transition-all hover:shadow-lg hover:border-orange-500/40 hover:-translate-y-1" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110" style={{background:'rgba(212,80,15,0.1)'}}>
                    <Icon size={20} style={{color:'var(--orange)'}} />
                  </div>
                  <h3 className="font-bold text-base mb-2 group-hover:text-orange-500 transition-colors" style={{color:'var(--text-primary)'}}>{item.titre}</h3>
                  <p className="text-sm leading-relaxed mb-4" style={{color:'var(--text-secondary)'}}>{item.desc}</p>
                  <div className="flex items-center gap-1 text-sm font-bold group-hover:gap-2 transition-all" style={{color:'var(--orange)'}}>{item.cta} <ArrowRight size={13} /></div>
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
