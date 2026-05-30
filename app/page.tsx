'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronRight, Play, AlertTriangle, Shield, Clock } from 'lucide-react'

const SECTEURS = [
  { slug: 'construction-btp',         nom: 'Construction & BTP',       img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80' },
  { slug: 'sante-medical',            nom: 'Sante & Medical',           img: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80' },
  { slug: 'industrie-manufacturiere', nom: 'Industrie Manufacturiere',  img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80' },
  { slug: 'transport-logistique',     nom: 'Transport & Logistique',    img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80' },
  { slug: 'agriculture',              nom: 'Agriculture',               img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80' },
  { slug: 'mines-carrieres',          nom: 'Mines & Carrieres',         img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80' },
  { slug: 'petrole-gaz',              nom: 'Petrole & Gaz',             img: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&q=80' },
  { slug: 'bureaux-services',         nom: 'Bureaux & Services',        img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80' },
  { slug: 'education-formation',      nom: 'Education & Formation',     img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80' },
]

export default function HomePage() {
  const [hero, setHero] = useState<any>(null)
  const [selection, setSelection] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [alerte, setAlerte] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: courses } = await supabase
        .from('courses').select('id,slug,titre,description_courte,image_couverture,secteur_slug')
        .eq('statut', 'published').order('created_at', { ascending: false }).limit(5)
      if (courses?.length) { setHero(courses[0]); setSelection(courses.slice(1,4)) }
      const { data: vids } = await supabase
        .from('course_lessons').select('id,titre,youtube_url,duree_minutes,course_id,courses(slug,titre,image_couverture,secteur_slug)')
        .eq('type','video').not('youtube_url','is',null).limit(5)
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
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      <Navbar />
      <div className="pt-16">

        {alerte && (
          <Link href="/alertes" className="flex items-center gap-3 px-4 py-2.5 hover:no-underline hover:opacity-90" style={{ background: 'var(--danger)' }}>
            <AlertTriangle size={15} className="text-white flex-shrink-0" />
            <span className="text-white text-sm font-medium flex-1">{alerte.titre}</span>
            <ChevronRight size={14} className="text-white flex-shrink-0" />
          </Link>
        )}

        <div className="relative overflow-hidden" style={{ minHeight: '420px', background: '#050505' }}>
          {hero?.image_couverture && <img src={hero.image_couverture} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.28)' }} />}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)' }} />
          <div className="relative max-w-6xl mx-auto px-6 flex flex-col justify-center" style={{ minHeight: '420px' }}>
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full" style={{ background: 'var(--orange)', color: 'white' }}>
                <Shield size={11} />{hero ? 'A la une' : 'Plateforme de formation'}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 font-display" style={{ color: 'white' }}>
                {hero?.titre || 'La securite au travail, pour tous les secteurs'}
              </h1>
              <p className="text-base leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.72)' }}>
                {hero?.description_courte || 'Formations gratuites, alertes en temps reel et ressources pratiques pour proteger vos equipes.'}
              </p>
              <Link href={hero ? `/cours/${hero.slug}` : '/secteurs'} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm hover:no-underline hover:opacity-90" style={{ background: 'var(--orange)', color: 'white' }}>
                {hero ? 'Decouvrir' : 'Explorer les formations'} <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {selection.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>Notre selection</h2>
              <Link href="/secteurs" className="text-sm flex items-center gap-1 hover:underline" style={{ color: 'var(--orange)' }}>Voir plus <ChevronRight size={14} /></Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {selection.map(c => (
                <Link key={c.id} href={`/cours/${c.slug}`} className="group hover:no-underline">
                  <div className="overflow-hidden rounded-xl mb-3" style={{ aspectRatio: '16/9', background: 'var(--bg-secondary)' }}>
                    {c.image_couverture ? <img src={c.image_couverture} alt={c.titre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center text-5xl">shield</div>}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--orange)' }}>{c.secteur_slug?.replace(/-/g,' ')}</p>
                  <h3 className="font-semibold text-sm leading-snug group-hover:text-orange-500 transition-colors" style={{ color: 'var(--text-primary)' }}>{c.titre}</h3>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{c.description_courte}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="max-w-6xl mx-auto px-4 py-8 border-t" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold mb-5 font-display" style={{ color: 'var(--text-primary)' }}>Choisissez la rubrique qui vous interesse</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SECTEURS.map(s => (
              <Link key={s.slug} href={`/secteurs/${s.slug}`} className="relative overflow-hidden rounded-xl group hover:no-underline" style={{ aspectRatio: '3/2' }}>
                <img src={s.img} alt={s.nom} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)' }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(212,80,15,0.18)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs font-bold drop-shadow">{s.nom}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {videos.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 py-8 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>Videos</h2>
              <Link href="/secteurs" className="text-sm flex items-center gap-1 hover:underline" style={{ color: 'var(--orange)' }}>Tout voir <ChevronRight size={14} /></Link>
            </div>
            {(() => {
              const v=videos[0]; const id=ytId(v.youtube_url); const thumb=id ? 'https://img.youtube.com/vi/'+id+'/maxresdefault.jpg' : (v.courses as any)?.image_couverture; const cSlug=(v.courses as any)?.slug
              return (
                <Link href={'/cours/'+cSlug+'?lecon='+v.id} className="flex flex-col md:flex-row gap-5 mb-6 group hover:no-underline">
                  <div className="relative overflow-hidden rounded-xl md:w-3/5 flex-shrink-0" style={{ aspectRatio:'16/9', background:'var(--bg-secondary)' }}>
                    {thumb&&<img src={thumb} alt={v.titre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110" style={{ background:'rgba(212,80,15,0.95)' }}>
                        <Play size={26} className="text-white" fill="white" style={{ marginLeft:'4px' }}/>
                      </div>
                    </div>
                    {v.duree_minutes>0&&<div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs font-medium text-white flex items-center gap-1" style={{ background:'rgba(0,0,0,0.7)' }}><Clock size={10}/>{v.duree_minutes}min</div>}
                  </div>
                  <div className="flex flex-col justify-center py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color:'var(--orange)' }}>{(v.courses as any)?.secteur_slug?.replace(/-/g,' ')}</p>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors" style={{ color:'var(--text-primary)' }}>{v.titre}</h3>
                    <p className="text-sm" style={{ color:'var(--text-secondary)' }}>{(v.courses as any)?.titre}</p>
                  </div>
                </Link>
              )
            })()}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {videos.slice(1).map(v=>{
                const id=ytId(v.youtube_url); const thumb=id ? 'https://img.youtube.com/vi/'+id+'/mqdefault.jpg' : null; const cSlug=(v.courses as any)?.slug
                return (
                  <Link key={v.id} href={'/cours/'+cSlug+'?lecon='+v.id} className="group hover:no-underline">
                    <div className="relative overflow-hidden rounded-xl mb-2" style={{ aspectRatio:'16/9', background:'var(--bg-secondary)' }}>
                      {thumb&&<img src={thumb} alt={v.titre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" style={{ background:'rgba(0,0,0,0.35)' }}>
                        <Play size={20} className="text-white" fill="white"/>
                      </div>
                      {v.duree_minutes>0&&<div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-white" style={{ background:'rgba(0,0,0,0.7)' }}>{v.duree_minutes}min</div>}
                    </div>
                    <h4 className="text-xs font-medium line-clamp-2 group-hover:text-orange-500 transition-colors" style={{ color:'var(--text-primary)' }}>{v.titre}</h4>
                    <p className="text-[10px] mt-0.5" style={{ color:'var(--text-secondary)' }}>{(v.courses as any)?.titre}</p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <section className="border-t py-12" style={{ borderColor:'var(--border)' }}>
          <div className="max-w-5xl mx-auto px-4 grid sm:grid-cols-3 gap-8 text-center">
            {[
              {emoji:'📚',titre:'Suivre une formation',desc:'Acces gratuit a toutes les formations par secteur.',href:'/secteurs',cta:'Voir les formations'},
              {emoji:'🚨',titre:'Alertes securite',desc:'Consultez les dernieres alertes et incidents declares.',href:'/alertes',cta:'Voir les alertes'},
              {emoji:'🛒',titre:'Marketplace EPI',desc:'Equipements de protection certifies pour votre secteur.',href:'/marketplace',cta:'Explorer'},
            ].map((item,i)=>(
              <div key={i}>
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="font-bold text-sm mb-2" style={{ color:'var(--text-primary)' }}>{item.titre}</h3>
                <p className="text-xs mb-4" style={{ color:'var(--text-secondary)' }}>{item.desc}</p>
                <Link href={item.href} className="text-sm font-semibold hover:underline" style={{ color:'var(--orange)' }}>{item.cta}</Link>
              </div>
            ))}
          </div>
        </section>

      </div>
      <Footer />
    </div>
  )
}
