'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronRight, Play, AlertTriangle, Shield, Clock, ArrowRight } from 'lucide-react'

const SECTEURS = [
  { slug: 'construction-btp',         nom: 'Construction & BTP',       img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80' },
  { slug: 'sante-medical',            nom: 'Sante Medical',             img: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80' },
  { slug: 'industrie-manufacturiere', nom: 'Industrie',                 img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80' },
  { slug: 'transport-logistique',     nom: 'Transport',                 img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80' },
  { slug: 'agriculture',              nom: 'Agriculture',               img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80' },
  { slug: 'mines-carrieres',          nom: 'Mines',                     img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80' },
  { slug: 'petrole-gaz',              nom: 'Petrole Gaz',               img: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80' },
  { slug: 'bureaux-services',         nom: 'Bureaux',                   img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80' },
  { slug: 'education-formation',      nom: 'Education',                 img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80' },
]

const STATS = [
  { value: '500+', label: 'Formations disponibles' },
  { value: '18',   label: 'Secteurs couverts' },
  { value: '100%', label: 'Gratuit' },
  { value: '24/7', label: 'Alertes temps reel' },
]

export default function HomePage() {
  const [hero, setHero] = useState<any>(null)
  const [selection, setSelection] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [alerte, setAlerte] = useState<any>(null)
  const [imgIndex, setImgIndex] = useState(0)

  const heroImages = [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80',
    'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1600&q=80',
  ]

  useEffect(() => {
    const interval = setInterval(() => setImgIndex(i => (i + 1) % heroImages.length), 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function load() {
      const { data: courses } = await supabase
        .from('courses').select('id,slug,titre,description_courte,image_couverture,secteur_slug')
        .eq('statut','published').order('created_at',{ascending:false}).limit(5)
      if (courses?.length) { setHero(courses[0]); setSelection(courses.slice(1,5)) }
      const { data: vids } = await supabase
        .from('course_lessons').select('id,titre,youtube_url,duree_minutes,course_id,courses(slug,titre,image_couverture,secteur_slug)')
        .eq('type','video').not('youtube_url','is',null).limit(6)
      setVideos(vids || [])
      const { data: al } = await supabase.from('alertes').select('*').eq('statut','active').order('created_at',{ascending:false}).limit(1)
      if (al?.length) setAlerte(al[0])
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
          <Link href="/alertes" className="flex items-center gap-3 px-4 py-2.5 hover:no-underline hover:opacity-90" style={{background:'var(--danger)'}}>
            <AlertTriangle size={15} className="text-white flex-shrink-0" />
            <span className="text-white text-sm font-medium flex-1 truncate">{alerte.titre}</span>
            <ChevronRight size={14} className="text-white flex-shrink-0" />
          </Link>
        )}

        <div className="relative overflow-hidden" style={{minHeight:'92vh',background:'#030303'}}>
          {heroImages.map((img, i) => (
            <div key={i} className="absolute inset-0 transition-opacity duration-1000" style={{opacity:i===imgIndex?1:0}}>
              <img src={img} alt="" className="w-full h-full object-cover" style={{filter:'brightness(0.25) saturate(0.6)'}} />
            </div>
          ))}
          <div className="absolute inset-0" style={{background:'linear-gradient(135deg,rgba(0,0,0,0.97) 0%,rgba(0,0,0,0.7) 50%,rgba(212,80,15,0.08) 100%)'}} />
          <div className="absolute inset-0 opacity-5" style={{backgroundImage:'linear-gradient(var(--orange) 1px,transparent 1px),linear-gradient(90deg,var(--orange) 1px,transparent 1px)',backgroundSize:'60px 60px'}} />

          <div className="relative max-w-7xl mx-auto px-6 flex flex-col justify-center" style={{minHeight:'92vh'}}>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border" style={{borderColor:'rgba(212,80,15,0.4)',background:'rgba(212,80,15,0.1)'}}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{background:'var(--orange)'}} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{color:'var(--orange)'}}>Plateforme de formation securite</span>
              </div>
              <h1 style={{color:'white',fontSize:'clamp(2.5rem,6vw,4.5rem)',fontWeight:900,lineHeight:1.05,letterSpacing:'-0.02em',marginBottom:'1.5rem'}}>
                {hero?.titre || 'Protegez vos equipes. Formez-les.'}
              </h1>
              <p className="text-lg leading-relaxed mb-8 max-w-xl" style={{color:'rgba(255,255,255,0.65)'}}>
                {hero?.description_courte || 'La premiere plateforme africaine de formation en securite au travail. Gratuite et adaptee a tous les secteurs.'}
              </p>
              <div className="flex items-center gap-4 flex-wrap mb-16">
                <Link href={hero?'/cours/'+hero.slug:'/secteurs'} className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm hover:no-underline hover:scale-105 transition-all" style={{background:'var(--orange)',color:'white',boxShadow:'0 0 30px rgba(212,80,15,0.4)'}}>
                  {hero?'Voir la formation':'Explorer les formations'} <ArrowRight size={16} />
                </Link>
                <Link href="/secteurs" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm hover:no-underline border hover:border-orange-500 transition-all" style={{borderColor:'rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.8)'}}>
                  Tous les secteurs
                </Link>
              </div>
              <div className="flex gap-2">
                {heroImages.map((_,i) => (
                  <button key={i} onClick={()=>setImgIndex(i)} className="h-1 rounded-full transition-all duration-300" style={{width:i===imgIndex?'32px':'8px',background:i===imgIndex?'var(--orange)':'rgba(255,255,255,0.3)'}} />
                ))}
              </div>
            </div>
            <div className="absolute bottom-10 left-6 right-6 max-w-5xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STATS.map((s,i) => (
                  <div key={i} className="px-4 py-3 rounded-2xl border" style={{background:'rgba(0,0,0,0.6)',borderColor:'rgba(255,255,255,0.08)'}}>
                    <div className="text-[10px] uppercase tracking-wider mb-1" style={{color:'rgba(255,255,255,0.5)'}}>{s.label}</div>
                    <div className="text-2xl font-black text-white">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="py-4 border-y overflow-hidden" style={{borderColor:'var(--border)',background:'var(--bg-card)'}}>
          <div className="flex gap-6 items-center" style={{animation:'scroll 25s linear infinite',whiteSpace:'nowrap',width:'max-content'}}>
            {[...SECTEURS,...SECTEURS].map((s,i) => (
              <Link key={i} href={'/secteurs/'+s.slug} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium hover:no-underline flex-shrink-0 transition-all" style={{background:'var(--bg-secondary)',color:'var(--text-secondary)',border:'1px solid var(--border)'}}>
                {s.nom} <ChevronRight size={10} />
              </Link>
            ))}
          </div>
        </div>

        {selection.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-14">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:'var(--orange)'}}>Formations en vedette</p>
                <h2 className="text-3xl font-black" style={{color:'var(--text-primary)'}}>Notre selection</h2>
              </div>
              <Link href="/secteurs" className="hidden sm:flex items-center gap-2 text-sm font-semibold hover:underline" style={{color:'var(--orange)'}}>Tout voir <ArrowRight size={14} /></Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {selection[0] && (
                <Link href={'/cours/'+selection[0].slug} className="lg:col-span-3 group hover:no-underline relative overflow-hidden rounded-2xl" style={{minHeight:'400px',background:'var(--bg-secondary)'}}>
                  {selection[0].image_couverture?<img src={selection[0].image_couverture} alt={selection[0].titre} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />:<div className="absolute inset-0 flex items-center justify-center text-8xl">shield</div>}
                  <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.4) 50%,transparent 100%)'}} />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{color:'var(--orange)'}}>{selection[0].secteur_slug?.replace(/-/g,' ')}</p>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">{selection[0].titre}</h3>
                    <p className="text-sm text-white/70 line-clamp-2">{selection[0].description_courte}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold" style={{color:'var(--orange)'}}>Decouvrir <ArrowRight size={12} /></div>
                  </div>
                </Link>
              )}
              <div className="lg:col-span-2 flex flex-col gap-4">
                {selection.slice(1,4).map(c => (
                  <Link key={c.id} href={'/cours/'+c.slug} className="group hover:no-underline flex gap-3 p-3 rounded-2xl border transition-all hover:border-orange-500/50" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                    <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{background:'var(--bg-secondary)'}}>
                      {c.image_couverture?<img src={c.image_couverture} alt={c.titre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />:null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{color:'var(--orange)'}}>{c.secteur_slug?.replace(/-/g,' ')}</p>
                      <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors" style={{color:'var(--text-primary)'}}>{c.titre}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-14 border-t" style={{borderColor:'var(--border)'}}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:'var(--orange)'}}>Tous les domaines</p>
              <h2 className="text-3xl font-black" style={{color:'var(--text-primary)'}}>Choisissez votre secteur</h2>
            </div>
            <div className="grid grid-cols-4 gap-3" style={{height:'520px'}}>
              {SECTEURS.slice(0,2).map(s => (
                <Link key={s.slug} href={'/secteurs/'+s.slug} className="relative overflow-hidden rounded-2xl group hover:no-underline col-span-2" style={{background:'var(--bg-secondary)'}}>
                  <img src={s.img} alt={s.nom} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.1) 100%)'}} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background:'rgba(212,80,15,0.2)'}} />
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                    <div><h3 className="text-white text-lg font-bold">{s.nom}</h3><p className="text-white/60 text-xs mt-0.5">Voir les formations</p></div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{background:'var(--orange)'}}><ArrowRight size={14} className="text-white" /></div>
                  </div>
                </Link>
              ))}
              {SECTEURS.slice(2,9).map(s => (
                <Link key={s.slug} href={'/secteurs/'+s.slug} className="relative overflow-hidden rounded-2xl group hover:no-underline" style={{background:'var(--bg-secondary)'}}>
                  <img src={s.img} alt={s.nom} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.1) 100%)'}} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background:'rgba(212,80,15,0.2)'}} />
                  <div className="absolute bottom-0 left-0 right-0 p-3"><h3 className="text-white text-xs font-bold">{s.nom}</h3></div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {videos.length > 0 && (
          <section className="py-14 border-t" style={{borderColor:'var(--border)',background:'var(--bg-card)'}}>
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:'var(--orange)'}}>Ressources videos</p>
                  <h2 className="text-3xl font-black" style={{color:'var(--text-primary)'}}>Videos de formation</h2>
                </div>
                <Link href="/secteurs" className="hidden sm:flex items-center gap-2 text-sm font-semibold hover:underline" style={{color:'var(--orange)'}}>Tout voir <ArrowRight size={14} /></Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {videos.map((v,i) => {
                  const id=ytId(v.youtube_url); const thumb=id?'https://img.youtube.com/vi/'+id+'/mqdefault.jpg':(v.courses as any)?.image_couverture; const cSlug=(v.courses as any)?.slug; const isBig=i===0
                  return (
                    <Link key={v.id} href={'/cours/'+cSlug+'?lecon='+v.id} className={'group hover:no-underline relative overflow-hidden rounded-2xl '+(isBig?'sm:col-span-2':'')} style={{background:'var(--bg-secondary)',aspectRatio:'16/9'}}>
                      {thumb&&<img src={thumb} alt={v.titre} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                      <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.2) 60%,transparent 100%)'}} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={'rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 '+(isBig?'w-16 h-16':'w-10 h-10 opacity-0 group-hover:opacity-100')} style={{background:'rgba(212,80,15,0.95)'}}>
                          <Play size={isBig?24:16} className="text-white" fill="white" style={{marginLeft:isBig?'4px':'2px'}} />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className={'font-bold text-white line-clamp-2 '+(isBig?'text-lg':'text-xs')}>{v.titre}</h4>
                        {v.duree_minutes>0&&<div className="flex items-center gap-1 mt-1 text-white/60" style={{fontSize:'10px'}}><Clock size={9} />{v.duree_minutes}min</div>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0" style={{background:'linear-gradient(135deg,var(--orange) 0%,#c0390a 100%)'}} />
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'30px 30px'}} />
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">La securite au travail commence par la formation</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">Acces gratuit a toutes les formations. Alertes en temps reel. Marketplace EPI.</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/secteurs" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm hover:no-underline hover:scale-105 transition-all" style={{background:'white',color:'var(--orange)'}}>Commencer gratuitement <ArrowRight size={16} /></Link>
              <Link href="/marketplace" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm hover:no-underline border-2 border-white text-white hover:bg-white/10 transition-all">Marketplace EPI</Link>
            </div>
          </div>
        </section>

        <section className="py-14 border-t" style={{borderColor:'var(--border)'}}>
          <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-3 gap-6">
            {[
              {titre:'Formations gratuites',desc:'Des centaines de formations en securite pour tous les secteurs.',href:'/secteurs',cta:'Explorer'},
              {titre:'Alertes securite',desc:'Restez informe des dernieres alertes et incidents declares.',href:'/alertes',cta:'Voir les alertes'},
              {titre:'Marketplace EPI',desc:'Trouvez vos equipements de protection certifies.',href:'/marketplace',cta:'Acceder'},
            ].map((item,i) => (
              <Link key={i} href={item.href} className="group p-6 rounded-2xl border hover:no-underline transition-all hover:border-orange-500/50" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                <h3 className="font-bold text-base mb-2 group-hover:text-orange-500 transition-colors" style={{color:'var(--text-primary)'}}>{item.titre}</h3>
                <p className="text-sm mb-4 leading-relaxed" style={{color:'var(--text-secondary)'}}>{item.desc}</p>
                <div className="flex items-center gap-1 text-sm font-bold" style={{color:'var(--orange)'}}>{item.cta} <ArrowRight size={14} /></div>
              </Link>
            ))}
          </div>
        </section>

      </div>
      <style>{'@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}'}</style>
      <Footer />
    </div>
  )
}
