'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight, Bell, AlertTriangle, BookOpen, Shield, Play, Clock, ChevronRight, Lock, Users, Zap, CheckCircle } from 'lucide-react'

const HeroScene3D = dynamic(() => import('@/components/HeroScene3D'), {
  ssr: false,
  loading: () => (
    <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'transparent'}}>
      <div style={{width:'44px',height:'44px',border:'3px solid rgba(212,80,15,0.2)',borderTop:'3px solid var(--orange)',borderRadius:'50%',animation:'sp 0.9s linear infinite'}} />
    </div>
  )
})

const SECTEURS = [
  {slug:'construction-btp',nom:'Construction & BTP',img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80'},
  {slug:'sante-medical',nom:'Sante & Medical',img:'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500&q=80'},
  {slug:'industrie-manufacturiere',nom:'Industrie',img:'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80'},
  {slug:'transport-logistique',nom:'Transport',img:'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&q=80'},
  {slug:'agriculture',nom:'Agriculture',img:'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&q=80'},
  {slug:'mines-carrieres',nom:'Mines',img:'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80'},
  {slug:'petrole-gaz',nom:'Petrole & Gaz',img:'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&q=80'},
  {slug:'bureaux-services',nom:'Bureaux & Services',img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80'},
  {slug:'education-formation',nom:'Education',img:'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&q=80'},
]

export default function HomePage() {
  const [courses,setCourses]=useState<any[]>([])
  const [videos,setVideos]=useState<any[]>([])
  const [alerte,setAlerte]=useState<any>(null)
  const [loaded,setLoaded]=useState(false)

  useEffect(()=>{
    async function load(){
      const {data:c}=await supabase.from('courses').select('id,slug,titre,description_courte,image_couverture,secteur_slug').eq('statut','published').order('created_at',{ascending:false}).limit(6)
      setCourses(c||[])
      const {data:v}=await supabase.from('course_lessons').select('id,titre,youtube_url,duree_minutes,course_id,courses(slug,titre,secteur_slug)').eq('type','video').not('youtube_url','is',null).limit(3)
      setVideos(v||[])
      const {data:a}=await supabase.from('alertes').select('*').eq('statut','active').limit(1)
      if(a?.length)setAlerte(a[0])
      setTimeout(()=>setLoaded(true),200)
    }
    load()
  },[])

  function ytId(url:string){const m=(url||'').match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);return m?m[1]:null}
  const show=(d=0)=>({opacity:loaded?1:0,transform:loaded?'translateY(0)':'translateY(24px)',transition:'opacity 0.7s ease '+d+'ms, transform 0.7s ease '+d+'ms'})

  return (
    <div className="min-h-screen" style={{background:'var(--bg-main)'}}>
      <style>{`@keyframes sp{to{transform:rotate(360deg)}} @keyframes hint{0%,100%{opacity:0.5;transform:translateX(-50%)}50%{opacity:1;transform:translateX(-50%) translateY(4px)}}`}</style>
      <Navbar />

      {alerte&&<Link href="/alertes" className="flex items-center gap-3 px-6 py-2.5 hover:no-underline hover:opacity-90" style={{background:'#c0392b',paddingTop:'68px'}}><AlertTriangle size={14} className="text-white flex-shrink-0"/><span className="text-white text-sm font-bold flex-1">Alerte : {alerte.titre}</span><ChevronRight size={14} className="text-white"/></Link>}

      {/* HERO */}
      <section style={{minHeight:'100vh',paddingTop:'64px',background:'var(--bg-main)',position:'relative',overflow:'hidden'}}>
        <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse 55% 55% at 75% 55%,rgba(212,80,15,0.08) 0%,transparent 70%)'}}/>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-8 items-center" style={{minHeight:'calc(100vh - 64px)'}}>
          <div className="py-16 lg:py-0 z-10">
            <div style={show(0)}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider mb-6 text-white" style={{background:'var(--orange)',boxShadow:'0 4px 20px rgba(212,80,15,0.4)'}}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>Plateforme de formation
              </span>
            </div>
            <h1 style={{...show(80),color:'var(--text-primary)',fontSize:'clamp(2.4rem,5vw,4rem)',fontWeight:900,lineHeight:1.06,letterSpacing:'-0.03em',marginBottom:'20px'}}>
              La securite au travail,<br/>
              <span style={{background:'linear-gradient(90deg,var(--orange),#f97316)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>accessible a tous</span>
            </h1>
            <p style={{...show(160),color:'var(--text-secondary)',fontSize:'1.05rem',lineHeight:1.8,marginBottom:'32px',maxWidth:'440px'}}>
              Formations certifiees gratuites, alertes en temps reel et ressources pratiques.<br/>
              <span style={{fontSize:'12px',fontStyle:'italic',opacity:0.7}}>Cliquez sur les objets 3D pour interagir</span>
            </p>
            <div className="flex flex-wrap gap-3 mb-8" style={show(240)}>
              <Link href="/secteurs" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm text-white hover:no-underline transition-all hover:scale-105" style={{background:'var(--orange)',boxShadow:'0 8px 28px rgba(212,80,15,0.4)'}}>
                Explorer les formations <ArrowRight size={15}/>
              </Link>
              <Link href="/marketplace" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm hover:no-underline transition-all border" style={{color:'var(--text-primary)',borderColor:'var(--border)',background:'var(--bg-card)'}}>
                <Shield size={14} style={{color:'var(--orange)'}}/>Marketplace EPI
              </Link>
            </div>
            <div className="flex items-center gap-8" style={show(320)}>
              {[{v:'500+',l:'Formations'},{v:'18',l:'Secteurs'},{v:'12k+',l:'Apprenants'}].map((s,i)=>(
                <div key={i}><div className="text-xl font-black" style={{color:'var(--text-primary)'}}>{s.v}</div><div className="text-xs" style={{color:'var(--text-secondary)'}}>{s.l}</div></div>
              ))}
            </div>
          </div>
          <div style={{height:'520px',position:'relative'}}>
            <HeroScene3D />
            <div style={{position:'absolute',bottom:'12px',left:'50%',fontSize:'10px',letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--text-secondary)',opacity:0.5,animation:'hint 2.5s ease-in-out infinite',whiteSpace:'nowrap'}}>
              Cliquez sur les objets 3D
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-10 border-y" style={{borderColor:'var(--border)',background:'var(--bg-card)'}}>
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            {icon:BookOpen,val:'500+',label:'Formations disponibles',color:'var(--orange)'},
            {icon:Shield,val:'18',label:'Secteurs professionnels',color:'#2563eb'},
            {icon:Users,val:'12k+',label:'Apprenants actifs',color:'#16a34a'},
            {icon:Bell,val:'24/7',label:'Alertes en temps reel',color:'#9333ea'},
          ].map((s,i)=>{const Icon=s.icon;return(
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1" style={{background:s.color+'18'}}><Icon size={22} style={{color:s.color}}/></div>
              <div className="text-2xl font-black" style={{color:'var(--text-primary)'}}>{s.val}</div>
              <div className="text-xs font-medium" style={{color:'var(--text-secondary)'}}>{s.label}</div>
            </div>
          )})}
        </div>
      </section>

      {/* FORMATIONS */}
      {courses.length>0&&(
        <section className="py-16" style={{background:'var(--bg-main)'}}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div><div className="flex items-center gap-2 mb-2"><div className="h-px w-8" style={{background:'var(--orange)'}}/><p className="text-xs font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>A la une</p></div><h2 className="text-3xl font-black" style={{color:'var(--text-primary)'}}>Formations en vedette</h2></div>
              <Link href="/secteurs" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:no-underline" style={{background:'rgba(212,80,15,0.1)',color:'var(--orange)',border:'1px solid rgba(212,80,15,0.2)'}}>Tout voir <ArrowRight size={13}/></Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((c,i)=>(
                <Link key={c.id} href={'/cours/'+c.slug} className="group overflow-hidden rounded-3xl border hover:no-underline transition-all hover:shadow-xl hover:-translate-y-1" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                  <div className="relative overflow-hidden" style={{aspectRatio:'16/9',background:'var(--bg-secondary)'}}>
                    {c.image_couverture?<img src={c.image_couverture} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>:<div className="w-full h-full flex items-center justify-center"><Shield size={40} style={{color:'var(--border)'}}/></div>}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" style={{boxShadow:'inset 0 0 0 2px var(--orange)'}}/>
                    {i===0&&<div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black text-white uppercase" style={{background:'var(--orange)'}}>Populaire</div>}
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{color:'var(--orange)'}}>{c.secteur_slug?.replace(/-/g,' ')}</p>
                    <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors" style={{color:'var(--text-primary)'}}>{c.titre}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 text-xs" style={{color:'var(--text-secondary)'}}><CheckCircle size={11} style={{color:'#16a34a'}}/>Gratuit</div>
                      <div className="text-xs font-bold" style={{color:'var(--orange)'}}>Voir →</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTEURS */}
      <section className="py-16 border-t" style={{borderColor:'var(--border)',background:'var(--bg-secondary)'}}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div><div className="flex items-center gap-2 mb-2"><div className="h-px w-8" style={{background:'var(--orange)'}}/><p className="text-xs font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>9 domaines</p></div><h2 className="text-3xl font-black" style={{color:'var(--text-primary)'}}>Choisissez votre secteur</h2></div>
            <Link href="/secteurs" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:no-underline" style={{background:'rgba(212,80,15,0.1)',color:'var(--orange)',border:'1px solid rgba(212,80,15,0.2)'}}>Voir tout <ArrowRight size={13}/></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {SECTEURS.slice(0,2).map(s=>(
              <Link key={s.slug} href={'/secteurs/'+s.slug} className="group relative overflow-hidden rounded-3xl hover:no-underline transition-all hover:-translate-y-1 hover:shadow-2xl" style={{aspectRatio:'3/2',background:'var(--bg-secondary)'}}>
                <img src={s.img} alt={s.nom} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.15) 70%,transparent 100%)'}}/>
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" style={{boxShadow:'inset 0 0 0 2px var(--orange)'}}/>
                <div className="absolute bottom-0 left-0 right-0 p-3.5"><p className="text-white text-xs font-black">{s.nom}</p></div>
              </Link>
            ))}
            {SECTEURS.slice(2).map(s=>(
              <Link key={s.slug} href={'/secteurs/'+s.slug} className="group relative overflow-hidden rounded-2xl hover:no-underline transition-all hover:-translate-y-1 hover:shadow-xl" style={{aspectRatio:'4/3',background:'var(--bg-secondary)'}}>
                <img src={s.img} alt={s.nom} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.82) 0%,transparent 100%)'}}/>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{boxShadow:'inset 0 0 0 2px var(--orange)'}}/>
                <div className="absolute bottom-0 left-0 right-0 p-2.5"><p className="text-white text-[11px] font-black">{s.nom}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section className="py-16 border-t" style={{borderColor:'var(--border)',background:'var(--bg-main)'}}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12"><div className="flex items-center justify-center gap-2 mb-2"><div className="h-px w-8" style={{background:'var(--orange)'}}/><p className="text-xs font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>Simple</p><div className="h-px w-8" style={{background:'var(--orange)'}}/></div><h2 className="text-3xl font-black" style={{color:'var(--text-primary)'}}>Comment ca marche ?</h2></div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {n:'01',icon:BookOpen,titre:'Choisissez votre secteur',desc:'Parcourez les 9 domaines et selectionnez celui qui correspond a votre metier.',color:'var(--orange)'},
              {n:'02',icon:Play,titre:'Suivez les formations',desc:'Regardez les videos, lisez les ressources et progressez a votre rythme.',color:'#2563eb'},
              {n:'03',icon:Shield,titre:'Protegez vos equipes',desc:'Appliquez les bonnes pratiques et utilisez les alertes pour prevenir les accidents.',color:'#16a34a'},
            ].map((s,i)=>{const Icon=s.icon;return(
              <div key={i} className="relative p-7 rounded-3xl border text-center" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white" style={{background:'var(--orange)'}}>{s.n}</div>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mt-4 mb-5" style={{background:s.color+'15',border:'1px solid '+s.color+'30'}}><Icon size={26} style={{color:s.color}}/></div>
                <h3 className="font-black text-base mb-2" style={{color:'var(--text-primary)'}}>{s.titre}</h3>
                <p className="text-sm leading-relaxed" style={{color:'var(--text-secondary)'}}>{s.desc}</p>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* VIDEOS */}
      <section className="py-16 border-t" style={{borderColor:'var(--border)',background:'var(--bg-secondary)'}}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div><div className="flex items-center gap-2 mb-2"><div className="h-px w-8" style={{background:'var(--orange)'}}/><p className="text-xs font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>En video</p></div><h2 className="text-3xl font-black" style={{color:'var(--text-primary)'}}>Videos de formation</h2></div>
            {videos.length>0&&<Link href="/secteurs" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:no-underline" style={{background:'rgba(212,80,15,0.1)',color:'var(--orange)',border:'1px solid rgba(212,80,15,0.2)'}}>Voir tout <ArrowRight size={13}/></Link>}
          </div>
          {videos.length>0?(
            <div className="grid sm:grid-cols-3 gap-5">
              {videos.map(v=>{const id=ytId(v.youtube_url);const thumb=id?'https://img.youtube.com/vi/'+id+'/mqdefault.jpg':null;const cSlug=(v.courses as any)?.slug;return(
                <Link key={v.id} href={'/cours/'+cSlug+'?lecon='+v.id} className="group overflow-hidden rounded-3xl border hover:no-underline transition-all hover:shadow-xl hover:-translate-y-1" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                  <div className="relative overflow-hidden" style={{aspectRatio:'16/9',background:'var(--bg-secondary)'}}>
                    {thumb&&<img src={thumb} alt={v.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"/>}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'rgba(0,0,0,0.35)'}}><div className="w-14 h-14 rounded-full flex items-center justify-center" style={{background:'var(--orange)'}}><Play size={20} className="text-white" fill="white" style={{marginLeft:'3px'}}/></div></div>
                    {v.duree_minutes>0&&<div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1.5" style={{background:'rgba(0,0,0,0.7)'}}><Clock size={10}/>{v.duree_minutes}min</div>}
                  </div>
                  <div className="p-5"><p className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{color:'var(--orange)'}}>{(v.courses as any)?.secteur_slug?.replace(/-/g,' ')}</p><h4 className="font-bold text-sm line-clamp-2 group-hover:text-orange-500 transition-colors" style={{color:'var(--text-primary)'}}>{v.titre}</h4></div>
                </Link>
              )})}
            </div>
          ):(
            <div className="py-12 rounded-3xl border text-center" style={{borderColor:'rgba(212,80,15,0.2)',background:'rgba(212,80,15,0.04)'}}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'rgba(212,80,15,0.1)'}}><Play size={24} style={{color:'var(--orange)'}}/></div>
              <h3 className="font-black text-lg mb-2" style={{color:'var(--text-primary)'}}>Videos de formation a venir</h3>
              <p className="text-sm mb-5 max-w-sm mx-auto" style={{color:'var(--text-secondary)'}}>Notre equipe prepare des contenus video pour chaque secteur.</p>
              <Link href="/secteurs" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white hover:no-underline hover:opacity-90" style={{background:'var(--orange)'}}>Explorer les formations <ArrowRight size={14}/></Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0" style={{background:'linear-gradient(135deg,#b84500 0%,var(--orange) 40%,#e06010 100%)'}}/>
        <div className="absolute inset-0 opacity-[0.08]" style={{backgroundImage:'radial-gradient(circle,white 1.5px,transparent 1.5px)',backgroundSize:'28px 28px'}}/>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">La securite commence<br/>par la formation</h2>
          <p className="text-white/80 text-lg mb-10 max-w-md mx-auto">Acces 100% gratuit. Alertes en temps reel. Equipements certifies.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/secteurs" className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl font-black text-sm hover:no-underline hover:scale-105 transition-all" style={{background:'white',color:'var(--orange)'}}>Commencer maintenant <ArrowRight size={15}/></Link>
            <Link href="/alertes" className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl font-bold text-sm hover:no-underline border-2 border-white/40 text-white hover:bg-white/15 transition-all"><Bell size={15}/>Alertes securite</Link>
          </div>
        </div>
      </section>

      {/* 3 SERVICES */}
      <section className="py-16 border-t" style={{borderColor:'var(--border)',background:'var(--bg-main)'}}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12"><div className="flex items-center justify-center gap-2 mb-2"><div className="h-px w-8" style={{background:'var(--orange)'}}/><p className="text-xs font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>Notre plateforme</p><div className="h-px w-8" style={{background:'var(--orange)'}}/></div><h2 className="text-3xl font-black" style={{color:'var(--text-primary)'}}>Tout ce dont vous avez besoin</h2></div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {icon:BookOpen,titre:'Formations gratuites',desc:'Acces libre a des centaines de formations pour chaque secteur professionnel.',href:'/secteurs',cta:'Explorer',color:'#2563eb'},
              {icon:Bell,titre:'Alertes securite',desc:'Notifications en temps reel des incidents, risques et nouvelles reglementations.',href:'/alertes',cta:'Voir les alertes',color:'#dc2626'},
              {icon:Shield,titre:'Marketplace EPI',desc:'Equipements de protection certifies livres directement sur site.',href:'/marketplace',cta:'Acceder',color:'#16a34a'},
            ].map((item,i)=>{const Icon=item.icon;return(
              <Link key={i} href={item.href} className="group p-7 rounded-3xl border hover:no-underline transition-all hover:shadow-xl hover:-translate-y-1.5" style={{background:'var(--bg-card)',borderColor:'var(--border)'}}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all" style={{background:item.color+'15',border:'1px solid '+item.color+'25'}}><Icon size={24} style={{color:item.color}}/></div>
                <h3 className="font-black text-lg mb-3 group-hover:text-orange-500 transition-colors" style={{color:'var(--text-primary)'}}>{item.titre}</h3>
                <p className="text-sm leading-relaxed mb-6" style={{color:'var(--text-secondary)',lineHeight:'1.75'}}>{item.desc}</p>
                <div className="flex items-center gap-2 text-sm font-black group-hover:gap-3 transition-all" style={{color:'var(--orange)'}}>{item.cta}<ArrowRight size={13} className="group-hover:translate-x-1 transition-transform"/></div>
              </Link>
            )})}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
