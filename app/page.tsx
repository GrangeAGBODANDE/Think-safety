'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight, Bell, AlertTriangle, BookOpen, Shield, Play, Clock, ChevronRight, Lock, Users, Zap, CheckCircle, Star, TrendingUp, Award, Globe } from 'lucide-react'

const SECTEURS = [
  {slug:'construction-btp',        nom:'Construction & BTP',  img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', emoji:'🏗️', count:48},
  {slug:'sante-medical',           nom:'Sante & Medical',      img:'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80', emoji:'🏥', count:36},
  {slug:'industrie-manufacturiere',nom:'Industrie',            img:'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80', emoji:'🏭', count:52},
  {slug:'transport-logistique',    nom:'Transport',            img:'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80', emoji:'🚛', count:29},
  {slug:'agriculture',             nom:'Agriculture',          img:'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80', emoji:'🌾', count:31},
  {slug:'mines-carrieres',         nom:'Mines & Carrieres',    img:'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80', emoji:'⛏️', count:24},
  {slug:'petrole-gaz',             nom:'Petrole & Gaz',        img:'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&q=80', emoji:'⚡', count:27},
  {slug:'bureaux-services',        nom:'Bureaux & Services',   img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80', emoji:'🏢', count:41},
  {slug:'education-formation',     nom:'Education',            img:'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80', emoji:'📚', count:33},
]

const TEMOIGNAGES = [
  {nom:'Jean-Michel D.',titre:'Chef de chantier BTP',texte:'Grace a Think Safety, nos equipes sont mieux preparees. Notre taux d'incidents a baisse de 40% en 6 mois.', stars:5},
  {nom:'Marie K.',titre:'Responsable HSE',texte:'Les alertes en temps reel nous ont permis d'eviter un incident majeur. Je recommande a toutes les entreprises.', stars:5},
  {nom:'Kofi A.',titre:'Directeur Operations',texte:'Les formations sont precises, adaptees a notre secteur et facilement accessibles. Un outil indispensable.', stars:5},
]

export default function HomePage() {
  const [courses, setCourses] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [alerte, setAlerte] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      const {data:c} = await supabase.from('courses').select('id,slug,titre,description_courte,image_couverture,secteur_slug').eq('statut','published').order('created_at',{ascending:false}).limit(6)
      setCourses(c||[])
      const {data:v} = await supabase.from('course_lessons').select('id,titre,youtube_url,duree_minutes,course_id,courses(slug,titre,secteur_slug)').eq('type','video').not('youtube_url','is',null).limit(3)
      setVideos(v||[])
      const {data:a} = await supabase.from('alertes').select('*').eq('statut','active').limit(1)
      if (a?.length) setAlerte(a[0])
      setTimeout(()=>setLoaded(true),150)
    }
    load()
  },[])

  function ytId(url:string){const m=(url||'').match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);return m?m[1]:null}
  const show=(d=0,y=20)=>({opacity:loaded?1:0,transform:loaded?'translateY(0)':'translateY('+y+'px)',transition:'opacity 0.7s ease '+d+'ms, transform 0.7s ease '+d+'ms'})

  return (
    <div className="min-h-screen" style={{background:'var(--bg-main)'}}>
      <Navbar/>

      {alerte&&(
        <Link href="/alertes" className="flex items-center gap-3 px-6 py-2.5 hover:no-underline hover:opacity-90 transition-opacity" style={{background:'#c0392b',paddingTop:'66px'}}>
          <AlertTriangle size={14} className="text-white animate-pulse flex-shrink-0"/>
          <span className="text-white text-sm font-bold flex-1 truncate">Alerte securite : {alerte.titre}</span>
          <span className="text-white/70 text-xs flex-shrink-0">Voir les details →</span>
        </Link>
      )}

      {/* ═══════════════════════════════════════════════
          HERO — Split layout avec image
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{background:'linear-gradient(135deg,#0a1628 0%,#0d1f3c 100%)',paddingTop:'64px',minHeight:'100vh',display:'flex',alignItems:'center'}}>
        {/* Grille deco */}
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',backgroundSize:'56px 56px'}}/>
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(212,80,15,0.15),transparent 70%)',filter:'blur(60px)'}}/>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(59,130,246,0.08),transparent 70%)',filter:'blur(60px)'}}/>

        <div className="relative max-w-7xl mx-auto px-6 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Texte */}
            <div>
              <div style={show(0)}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider text-white mb-7" style={{background:'rgba(212,80,15,0.25)',border:'1px solid rgba(212,80,15,0.4)'}}>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"/>
                  Plateforme de formation professionnelle
                </span>
              </div>
              <h1 style={{...show(80),color:'white',fontSize:'clamp(2.8rem,5.5vw,4.5rem)',fontWeight:900,lineHeight:1.04,letterSpacing:'-0.03em',marginBottom:'24px'}}>
                Formez vos equipes.<br/>
                <span style={{background:'linear-gradient(90deg,#f97316,var(--orange))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Protegez vos salaries.</span>
              </h1>
              <p style={{...show(160),color:'rgba(255,255,255,0.65)',fontSize:'1.1rem',lineHeight:1.8,marginBottom:'36px',maxWidth:'480px'}}>
                La premiere plateforme africaine de formation en securite au travail. Gratuit, certifie, accessible a tous les secteurs.
              </p>
              <div className="flex flex-wrap gap-3 mb-12" style={show(240)}>
                <Link href="/secteurs" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm text-white hover:no-underline transition-all hover:scale-105" style={{background:'var(--orange)',boxShadow:'0 8px 32px rgba(212,80,15,0.4)'}}>
                  Explorer les formations <ArrowRight size={16}/>
                </Link>
                <Link href="/marketplace" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm hover:no-underline transition-all" style={{background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.9)',border:'1px solid rgba(255,255,255,0.15)'}}>
                  <Shield size={15}/>Marketplace EPI
                </Link>
              </div>
              <div className="flex items-center gap-6 flex-wrap" style={show(320)}>
                {[{v:'500+',l:'Formations',icon:BookOpen},{v:'18',l:'Secteurs',icon:Globe},{v:'12k+',l:'Apprenants',icon:Users},{v:'100%',l:'Gratuit',icon:Award}].map((s,i)=>{const Icon=s.icon;return(
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'rgba(212,80,15,0.2)'}}><Icon size={15} style={{color:'var(--orange)'}}/></div>
                    <div><div className="text-white font-black text-lg leading-none">{s.v}</div><div className="text-xs" style={{color:'rgba(255,255,255,0.45)'}}>{s.l}</div></div>
                  </div>
                )})}
              </div>
            </div>

            {/* Visuel droit — Mosaic de secteurs */}
            <div className="hidden lg:block" style={show(200)}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80',label:'Construction & BTP',span:'col-span-2'},
                  {img:'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500&q=80',label:'Sante & Medical'},
                  {img:'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80',label:'Industrie'},
                ].map((item,i)=>(
                  <div key={i} className={'relative overflow-hidden rounded-3xl '+item.span} style={{height:i===0?'240px':'140px'}}>
                    <img src={item.img} alt={item.label} className="w-full h-full object-cover"/>
                    <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.1) 60%,transparent 100%)'}}/>
                    <div className="absolute bottom-3 left-4">
                      <p className="text-white text-xs font-black uppercase tracking-wider">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Badge flottant */}
              <div className="mt-3 flex items-center gap-3 p-4 rounded-2xl" style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)'}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(74,222,128,0.2)'}}>
                  <CheckCircle size={20} style={{color:'#4ade80'}}/>
                </div>
                <div>
                  <p className="text-white text-sm font-black">Formations certifiees</p>
                  <p className="text-xs" style={{color:'rgba(255,255,255,0.5)'}}>Reconnues en Afrique de l Ouest</p>
                </div>
                <div className="ml-auto flex -space-x-2">
                  {['#f97316','#60a5fa','#4ade80','#c084fc'].map((c,i)=><div key={i} className="w-7 h-7 rounded-full border-2 border-gray-800" style={{background:c}}/>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          BANDE DE CONFIANCE
      ═══════════════════════════════════════════════ */}
      <section className="py-6 border-y" style={{borderColor:'var(--border)',background:'var(--bg-card)'}}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-8 flex-wrap">
          {[
            {icon:CheckCircle,label:'Formations certifiees',color:'#4ade80'},
            {icon:Shield,label:'Securite validee',color:'var(--orange)'},
            {icon:Globe,label:'Disponible en Afrique',color:'#60a5fa'},
            {icon:Users,label:'12 000+ apprenants',color:'#c084fc'},
            {icon:Zap,label:'Alertes temps reel',color:'#facc15'},
          ].map((s,i)=>{const Icon=s.icon;return(
            <div key={i} className="flex items-center gap-2">
              <Icon size={15} style={{color:s.color,flexShrink:0}}/>
              <span className="text-sm font-semibold" style={{color:'var(--text-secondary)'}}>{s.label}</span>
            </div>
          )})}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURES — 3 avantages
      ═══════════════════════════════════════════════ */}
      <section className="py-20" style={{background:'var(--bg-main)'}}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{color:'var(--orange)'}}>Pourquoi Think Safety</p>
            <h2 className="text-4xl font-black" style={{color:'var(--text-primary)'}}>La plateforme pensee pour l Afrique</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {icon:BookOpen,titre:'Formations gratuites',desc:'Acces illimite a 500+ formations certifiees dans tous les secteurs. Sans abonnement, sans carte bancaire.',color:'#f97316',gradient:'rgba(249,115,22,0.1)'},
              {icon:Bell,    titre:'Alertes en temps reel',desc:'Systeme d alertes instantanees pour vous informer des risques et incidents dans votre secteur et region.',color:'#ef4444',gradient:'rgba(239,68,68,0.1)'},
              {icon:Award,   titre:'Certifications reconnues',desc:'Nos formations sont validees par des experts en securite. Obtenez des certifications valorisees par les employeurs.',color:'#4ade80',gradient:'rgba(74,222,128,0.1)'},
            ].map((f,i)=>{const Icon=f.icon;return(
              <div key={i} className="relative p-8 rounded-3xl border transition-all hover:-translate-y-1 hover:shadow-xl" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl" style={{background:'linear-gradient(90deg,'+f.color+',transparent)'}}/>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{background:f.gradient}}>
                  <Icon size={26} style={{color:f.color}}/>
                </div>
                <h3 className="text-xl font-black mb-3" style={{color:'var(--text-primary)'}}>{f.titre}</h3>
                <p className="text-sm leading-relaxed" style={{color:'var(--text-secondary)',lineHeight:'1.8'}}>{f.desc}</p>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* FORMATIONS EN VEDETTE */}
      {courses.length>0&&(
        <section className="py-20 border-t" style={{borderColor:'var(--border)',background:'var(--bg-secondary)'}}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{color:'var(--orange)'}}>Catalogue</p>
                <h2 className="text-4xl font-black" style={{color:'var(--text-primary)'}}>Formations en vedette</h2>
              </div>
              <Link href="/secteurs" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold hover:no-underline transition-all hover:scale-105" style={{background:'rgba(212,80,15,0.1)',color:'var(--orange)',border:'1px solid rgba(212,80,15,0.25)'}}>
                Voir tout le catalogue <ArrowRight size={14}/>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c,i)=>(
                <Link key={c.id} href={'/cours/'+c.slug} className="group overflow-hidden rounded-3xl border hover:no-underline transition-all hover:shadow-2xl hover:-translate-y-1" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                  <div className="relative overflow-hidden" style={{aspectRatio:'16/9',background:'var(--bg-secondary)'}}>
                    {c.image_couverture?<img src={c.image_couverture} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>:<div className="w-full h-full flex items-center justify-center text-5xl">🛡️</div>}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'rgba(212,80,15,0.12)'}}/>
                    {i===0&&<div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wide" style={{background:'var(--orange)'}}>Populaire</div>}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full" style={{background:'rgba(0,0,0,0.6)'}}>
                      {[1,2,3,4,5].map(n=><Star key={n} size={9} style={{color:'#facc15'}} fill="#facc15"/>)}
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{color:'var(--orange)'}}>{c.secteur_slug?.replace(/-/g,' ')}</p>
                    <h3 className="font-black text-base leading-snug line-clamp-2 mb-3 group-hover:text-orange-500 transition-colors" style={{color:'var(--text-primary)'}}>{c.titre}</h3>
                    <p className="text-sm line-clamp-2 mb-4" style={{color:'var(--text-secondary)'}}>{c.description_courte}</p>
                    <div className="flex items-center justify-between pt-3 border-t" style={{borderColor:'var(--border)'}}>
                      <div className="flex items-center gap-1.5 text-xs font-semibold" style={{color:'#4ade80'}}><CheckCircle size={12}/>100% Gratuit</div>
                      <div className="text-xs font-black" style={{color:'var(--orange)'}}>Voir la formation →</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTEURS */}
      <section className="py-20 border-t" style={{borderColor:'var(--border)',background:'var(--bg-main)'}}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{color:'var(--orange)'}}>9 domaines couverts</p>
              <h2 className="text-4xl font-black" style={{color:'var(--text-primary)'}}>Votre secteur, vos formations</h2>
            </div>
            <Link href="/secteurs" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold hover:no-underline transition-all hover:scale-105" style={{background:'rgba(212,80,15,0.1)',color:'var(--orange)',border:'1px solid rgba(212,80,15,0.25)'}}>
              Tous les secteurs <ArrowRight size={14}/>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {SECTEURS.slice(0,2).map(s=>(
              <Link key={s.slug} href={'/secteurs/'+s.slug} className="group relative overflow-hidden rounded-3xl hover:no-underline transition-all hover:-translate-y-1.5 hover:shadow-2xl sm:col-span-1" style={{aspectRatio:'1',background:'var(--bg-secondary)'}}>
                <img src={s.img} alt={s.nom} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.2) 60%,transparent 100%)'}}/>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background:'rgba(212,80,15,0.2)'}}/>
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" style={{boxShadow:'inset 0 0 0 2px var(--orange)'}}/>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-black">{s.nom}</p>
                  <p className="text-white/60 text-xs mt-0.5">{s.count} formations</p>
                </div>
                <div className="absolute top-3 right-3 text-2xl">{s.emoji}</div>
              </Link>
            ))}
            {SECTEURS.slice(2).map(s=>(
              <Link key={s.slug} href={'/secteurs/'+s.slug} className="group relative overflow-hidden rounded-2xl hover:no-underline transition-all hover:-translate-y-1 hover:shadow-xl" style={{aspectRatio:'4/3',background:'var(--bg-secondary)'}}>
                <img src={s.img} alt={s.nom} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.82) 0%,transparent 70%)'}}/>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{boxShadow:'inset 0 0 0 2px var(--orange)'}}/>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs font-black">{s.nom}</p>
                  <p className="text-white/55 text-[10px]">{s.count} formations</p>
                </div>
                <div className="absolute top-2.5 right-2.5 text-lg">{s.emoji}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section className="py-20 border-t" style={{borderColor:'var(--border)',background:'var(--bg-secondary)'}}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{color:'var(--orange)'}}>Simple et efficace</p>
            <h2 className="text-4xl font-black" style={{color:'var(--text-primary)'}}>Comment ca marche ?</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 relative">
            <div className="absolute top-10 left-[20%] right-[20%] h-px hidden sm:block" style={{background:'linear-gradient(to right,transparent,rgba(212,80,15,0.4),transparent)'}}/>
            {[
              {n:'01',icon:BookOpen,titre:'Choisissez votre secteur',desc:'Parcourez les 9 domaines professionnels et trouvez les formations adaptees a votre metier.',color:'var(--orange)'},
              {n:'02',icon:Play,     titre:'Suivez les formations',  desc:'Videos, ressources pratiques, fiches techniques — avancez a votre propre rythme, depuis n importe quel appareil.',color:'#2563eb'},
              {n:'03',icon:Shield,   titre:'Protegez vos equipes',   desc:'Appliquez les connaissances acquises et utilisez nos alertes pour prevenir accidents et incidents.',color:'#16a34a'},
            ].map((s,i)=>{const Icon=s.icon;return(
              <div key={i} className="relative p-8 rounded-3xl border text-center hover:-translate-y-1 hover:shadow-xl transition-all" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-lg" style={{background:'var(--orange)'}}>
                  {s.n}
                </div>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mt-6 mb-5" style={{background:s.color+'18',border:'1px solid '+s.color+'30'}}>
                  <Icon size={28} style={{color:s.color}}/>
                </div>
                <h3 className="font-black text-lg mb-3" style={{color:'var(--text-primary)'}}>{s.titre}</h3>
                <p className="text-sm leading-relaxed" style={{color:'var(--text-secondary)',lineHeight:'1.8'}}>{s.desc}</p>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* VIDEOS */}
      <section className="py-20 border-t" style={{borderColor:'var(--border)',background:'var(--bg-main)'}}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{color:'var(--orange)'}}>Ressources video</p>
              <h2 className="text-4xl font-black" style={{color:'var(--text-primary)'}}>Apprenez en video</h2>
            </div>
            {videos.length>0&&<Link href="/secteurs" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold hover:no-underline" style={{background:'rgba(212,80,15,0.1)',color:'var(--orange)',border:'1px solid rgba(212,80,15,0.25)'}}>Voir tout <ArrowRight size={14}/></Link>}
          </div>
          {videos.length>0?(
            <div className="grid sm:grid-cols-3 gap-6">
              {videos.map(v=>{const id=ytId(v.youtube_url);const thumb=id?'https://img.youtube.com/vi/'+id+'/mqdefault.jpg':null;const cSlug=(v.courses as any)?.slug;return(
                <Link key={v.id} href={'/cours/'+cSlug+'?lecon='+v.id} className="group overflow-hidden rounded-3xl border hover:no-underline transition-all hover:shadow-2xl hover:-translate-y-1" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                  <div className="relative overflow-hidden" style={{aspectRatio:'16/9',background:'var(--bg-secondary)'}}>
                    {thumb&&<img src={thumb} alt={v.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'rgba(0,0,0,0.35)'}}>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl" style={{background:'var(--orange)'}}><Play size={20} className="text-white" fill="white" style={{marginLeft:'3px'}}/></div>
                    </div>
                    {v.duree_minutes>0&&<div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1.5" style={{background:'rgba(0,0,0,0.75)'}}><Clock size={10}/>{v.duree_minutes}min</div>}
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{color:'var(--orange)'}}>{(v.courses as any)?.secteur_slug?.replace(/-/g,' ')}</p>
                    <h4 className="font-black text-sm leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors" style={{color:'var(--text-primary)'}}>{v.titre}</h4>
                  </div>
                </Link>
              )})}
            </div>
          ):(
            <div className="py-14 rounded-3xl border text-center" style={{borderColor:'rgba(212,80,15,0.2)',background:'rgba(212,80,15,0.04)'}}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'rgba(212,80,15,0.1)'}}><Play size={26} style={{color:'var(--orange)'}}/></div>
              <h3 className="font-black text-xl mb-2" style={{color:'var(--text-primary)'}}>Videos de formation a venir</h3>
              <p className="text-sm mb-6 max-w-sm mx-auto" style={{color:'var(--text-secondary)'}}>Notre equipe prepare des contenus video de qualite pour chaque secteur professionnel.</p>
              <Link href="/secteurs" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm text-white hover:no-underline hover:opacity-90" style={{background:'var(--orange)'}}>Voir les formations texte <ArrowRight size={14}/></Link>
            </div>
          )}
        </div>
      </section>

      {/* TEMOIGNAGES */}
      <section className="py-20 border-t" style={{borderColor:'var(--border)',background:'var(--bg-secondary)'}}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{color:'var(--orange)'}}>Ils nous font confiance</p>
            <h2 className="text-4xl font-black" style={{color:'var(--text-primary)'}}>Ce que disent nos apprenants</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TEMOIGNAGES.map((t,i)=>(
              <div key={i} className="p-7 rounded-3xl border" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(n=><Star key={n} size={14} style={{color:'#facc15'}} fill="#facc15"/>)}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{color:'var(--text-secondary)',lineHeight:'1.8',fontStyle:'italic'}}>"{t.texte}"</p>
                <div className="flex items-center gap-3 pt-4 border-t" style={{borderColor:'var(--border)'}}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white" style={{background:'var(--orange)'}}>{t.nom[0]}</div>
                  <div>
                    <p className="font-black text-sm" style={{color:'var(--text-primary)'}}>{t.nom}</p>
                    <p className="text-xs" style={{color:'var(--text-secondary)'}}>{t.titre}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0" style={{background:'linear-gradient(135deg,#b84500 0%,var(--orange) 45%,#e06010 100%)'}}/>
        <div className="absolute inset-0 opacity-[0.07]" style={{backgroundImage:'radial-gradient(circle,white 1.5px,transparent 1.5px)',backgroundSize:'28px 28px'}}/>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(255,255,255,0.2),transparent 70%)'}}/>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 text-xs font-black uppercase tracking-wider text-white" style={{background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.25)'}}>
            <Zap size={12}/>Rejoignez 12 000+ professionnels
          </div>
          <h2 className="text-5xl font-black text-white mb-5 leading-tight" style={{textShadow:'0 4px 20px rgba(0,0,0,0.2)'}}>
            La securite au travail commence par la formation
          </h2>
          <p className="text-white/80 text-xl mb-12 max-w-lg mx-auto">100% gratuit. 500+ formations. Alertes instantanees. Equipements certifies.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/secteurs" className="inline-flex items-center gap-2.5 px-10 py-4.5 rounded-2xl font-black text-sm hover:no-underline transition-all hover:scale-105" style={{background:'white',color:'var(--orange)',boxShadow:'0 12px 40px rgba(0,0,0,0.25)'}}>
              Commencer gratuitement <ArrowRight size={16}/>
            </Link>
            <Link href="/alertes" className="inline-flex items-center gap-2.5 px-10 py-4.5 rounded-2xl font-bold text-sm hover:no-underline border-2 border-white/40 text-white hover:bg-white/15 hover:border-white/60 transition-all">
              <Bell size={15}/>Alertes securite
            </Link>
          </div>
        </div>
      </section>

      {/* 3 SERVICES */}
      <section className="py-20 border-t" style={{borderColor:'var(--border)',background:'var(--bg-main)'}}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{color:'var(--orange)'}}>Notre ecosysteme</p>
            <h2 className="text-4xl font-black" style={{color:'var(--text-primary)'}}>Tout ce dont vous avez besoin</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {icon:BookOpen,titre:'Formations gratuites',desc:'Des centaines de modules de formation professionnelle, accessibles sans inscription. Certifies par des experts.',href:'/secteurs',cta:'Explorer',color:'#2563eb'},
              {icon:Bell,    titre:'Alertes securite',    desc:'Restez informe en temps reel des incidents et risques dans votre secteur. Ne soyez jamais pris au depourvu.',href:'/alertes',cta:'Voir les alertes',color:'#dc2626'},
              {icon:Shield,  titre:'Marketplace EPI',    desc:'Equipements de protection individuelle certifies, disponibles a l achat. Livraison directe pour vos equipes.',href:'/marketplace',cta:'Acceder',color:'#16a34a'},
            ].map((item,i)=>{const Icon=item.icon;return(
              <Link key={i} href={item.href} className="group p-8 rounded-3xl border hover:no-underline transition-all hover:shadow-2xl hover:-translate-y-2" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-7 group-hover:scale-110 group-hover:rotate-3 transition-all" style={{background:item.color+'15',border:'1px solid '+item.color+'30'}}>
                  <Icon size={28} style={{color:item.color}}/>
                </div>
                <h3 className="font-black text-xl mb-3 group-hover:text-orange-500 transition-colors" style={{color:'var(--text-primary)'}}>{item.titre}</h3>
                <p className="text-sm leading-relaxed mb-7" style={{color:'var(--text-secondary)',lineHeight:'1.8'}}>{item.desc}</p>
                <div className="flex items-center gap-2 text-sm font-black group-hover:gap-3 transition-all" style={{color:'var(--orange)'}}>{item.cta}<ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/></div>
              </Link>
            )})}
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  )
}
