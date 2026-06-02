'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DonationBanner from '@/components/DonationBanner'
import { ArrowRight, Bell, AlertTriangle, BookOpen, Shield, Play, Clock, Users, Zap, CheckCircle, Star, Award, Globe, TrendingUp, Target, Heart, Eye, Lock } from 'lucide-react'

const SECTEURS = [
  {slug:'construction-btp',        nom:'Construction & BTP',  img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', emoji:'🏗️',count:48},
  {slug:'sante-medical',           nom:'Santé & Medical',      img:'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80', emoji:'🏥',count:36},
  {slug:'industrie-manufacturiere',nom:'Industrie',            img:'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80', emoji:'🏭',count:52},
  {slug:'transport-logistique',    nom:'Transport',            img:'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80', emoji:'🚛',count:29},
  {slug:'agriculture',             nom:'Agriculture',          img:'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80', emoji:'🌾',count:31},
  {slug:'mines-carrieres',         nom:'Mines & Carrières',    img:'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80', emoji:'⛏️',count:24},
  {slug:'petrole-gaz',             nom:'Pétrole & Gaz',        img:'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&q=80', emoji:'⚡',count:27},
  {slug:'bureaux-services',        nom:'Bureaux & Services',   img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80', emoji:'🏢',count:41},
  {slug:'education-formation',     nom:'Education',            img:'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80', emoji:'📚',count:33},
]

const STATS = [
  {val:500,suffix:'+',label:'Formations disponibles',icon:BookOpen,color:'#f97316'},
  {val:18, suffix:'', label:'Secteurs couverts',     icon:Globe,   color:'#3b82f6'},
  {val:12, suffix:'k+',label:'Professionnels formes', icon:Users,   color:'#22c55e'},
  {val:100,suffix:'%', label:'Accès gratuit',         icon:Award,   color:'#a855f7'},
]

const TEMOIGNAGES = [
  {nom:'Jean-Michel D.',titre:'Chef de chantier BTP',texte:'Grace a Thinks Safety, nos équipes sont mieux préparées. Notre taux d'incidents a baissé de 40% en 6 mois.',stars:5,img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'},
  {nom:'Marie K.',titre:'Responsable HSE Industrie',texte:'Les alertes en temps réel nous ont permis d'éviter un incident majeur. Je recommande à toutes les entreprises.',stars:5,img:'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80'},
  {nom:'Kofi A.',titre:'Directeur Operations Transport',texte:'Les formations sont précises, adaptées à notre secteur et facilement accessibles depuis n'importe quel appareil.',stars:5,img:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'},
]

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(()=>{
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting)setVis(true) },{threshold:0.1})
    if(ref.current)obs.observe(ref.current)
    return ()=>obs.disconnect()
  },[])
  return {ref,vis}
}

function Reveal({children,delay=0,className='',style={}}:any) {
  const {ref,vis} = useReveal()
  return (
    <div ref={ref} className={className} style={{...style,opacity:vis?1:0,transform:vis?'translateY(0)':'translateY(32px)',transition:'opacity 0.7s ease '+delay+'ms, transform 0.7s ease '+delay+'ms'}}>
      {children}
    </div>
  )
}

function CountUp({target,suffix='',duration=2000}:{target:number,suffix:string,duration?:number}) {
  const [val,setVal] = useState(0)
  const {ref,vis} = useReveal()
  useEffect(()=>{
    if(!vis)return
    const step = target/60; let cur=0
    const t = setInterval(()=>{ cur=Math.min(cur+step,target); setVal(Math.floor(cur)); if(cur>=target)clearInterval(t) },duration/60)
    return ()=>clearInterval(t)
  },[vis,target])
  return <span ref={ref}>{val}{suffix}</span>
}

export default function HomePage() {
  const [courses,setCourses] = useState<any[]>([])
  const [videos,setVideos] = useState<any[]>([])
  const [alerte,setAlerte] = useState<any>(null)
  const [loaded,setLoaded] = useState(false)
  const [heroImg,setHeroImg] = useState(0)

  const heroImages = [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80',
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600&q=80',
  ]

  useEffect(()=>{ const t=setInterval(()=>setHeroImg(i=>(i+1)%heroImages.length),6000); return()=>clearInterval(t) },[])

  useEffect(()=>{
    async function load(){
      const {data:c}=await supabase.from('courses').select('id,slug,titre,description_courte,image_couverture,secteur_slug').eq('statut','published').order('created_at',{ascending:false}).limit(6)
      setCourses(c||[])
      const {data:v}=await supabase.from('course_lessons').select('id,titre,youtube_url,duree_minutes,course_id,courses(slug,titre,secteur_slug)').eq('type','video').not('youtube_url','is',null).limit(3)
      setVideos(v||[])
      const {data:a}=await supabase.from('alertes').select('*').eq('statut','active').limit(1)
      if(a?.length)setAlerte(a[0])
      setTimeout(()=>setLoaded(true),100)
    }
    load()
  },[])

  function ytId(url:string){const m=(url||'').match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);return m?m[1]:null}

  return (
    <div className="min-h-screen" style={{background:'var(--bg-main)'}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes pulse2{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(1.05)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .hover-lift{transition:transform 0.3s ease,box-shadow 0.3s ease}
        .hover-lift:hover{transform:translateY(-6px);box-shadow:0 20px 40px rgba(0,0,0,0.15)}
        .hover-scale{transition:transform 0.3s ease}
        .hover-scale:hover{transform:scale(1.03)}
        .card-hover{transition:all 0.3s ease}
        .card-hover:hover{transform:translateY(-4px)}
      `}</style>

      <Navbar/>
      <DonationBanner/>

      {alerte&&(
        <Link href="/alertes" className="flex items-center gap-3 px-6 py-2.5 hover:no-underline hover:opacity-90 transition-opacity" style={{background:'#c0392b',paddingTop:'68px'}}>
          <AlertTriangle size={14} className="text-white flex-shrink-0" style={{animation:'pulse2 1.5s ease-in-out infinite'}}/>
          <span className="text-white text-sm font-bold flex-1 truncate">Alerte securite : {alerte.titre}</span>
          <span className="text-white text-xs underline flex-shrink-0">Voir les details →</span>
        </Link>
      )}

      {/* ═══════ HERO ═══════ */}
      <section style={{minHeight:'100vh',paddingTop:'64px',position:'relative',overflow:'hidden',background:'#0d1f3c',display:'flex',alignItems:'center'}}>
        {heroImages.map((img,i)=>(
          <div key={i} style={{position:'absolute',inset:0,opacity:i===heroImg?1:0,transition:'opacity 1.5s ease'}}>
            <img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'cover',filter:'brightness(0.38) saturate(0.75)'}}/>
          </div>
        ))}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(115deg,rgba(10,20,50,0.88) 0%,rgba(10,20,50,0.6) 50%,rgba(10,20,50,0.15) 100%)'}}/>
        <div style={{position:'absolute',top:'-20%',right:'-10%',width:'600px',height:'600px',borderRadius:'50%',background:'radial-gradient(circle,rgba(212,80,15,0.12),transparent 65%)',filter:'blur(60px)',animation:'float 10s ease-in-out infinite'}}/>
        <div style={{position:'absolute',bottom:'-10%',left:'-5%',width:'400px',height:'400px',borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,0.08),transparent 65%)',filter:'blur(60px)'}}/>
        <div style={{position:'absolute',inset:0,opacity:0.03,backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',backgroundSize:'56px 56px'}}/>

        <div style={{position:'relative',maxWidth:'1280px',margin:'0 auto',padding:'80px 24px',width:'100%'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'64px',alignItems:'center'}}>
            <div>
              <div style={{opacity:loaded?1:0,transform:loaded?'translateY(0)':'translateY(24px)',transition:'all 0.7s ease'}}>
                <span style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'8px 18px',borderRadius:'99px',fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.08em',color:'white',background:'rgba(212,80,15,0.25)',border:'1px solid rgba(212,80,15,0.4)',marginBottom:'28px'}}>
                  <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'var(--orange)',animation:'pulse2 1.5s ease-in-out infinite'}}/>
                  Plateforme mondiale de formation securite
                </span>
              </div>
              <h1 style={{opacity:loaded?1:0,transform:loaded?'translateY(0)':'translateY(24px)',transition:'all 0.7s ease 80ms',color:'white',fontSize:'clamp(2.6rem,5.5vw,4.2rem)',fontWeight:900,lineHeight:1.05,letterSpacing:'-0.03em',marginBottom:'24px'}}>
                Formez vos equipes.<br/>
                <span style={{background:'linear-gradient(90deg,#fb923c,var(--orange))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Protégez chaque</span><br/>
                professionnel.
              </h1>
              <p style={{opacity:loaded?1:0,transform:loaded?'translateY(0)':'translateY(24px)',transition:'all 0.7s ease 160ms',color:'rgba(255,255,255,0.65)',fontSize:'1.1rem',lineHeight:1.8,marginBottom:'36px',maxWidth:'460px'}}>
                Trouvez gratuitement toutes les ressources dont vous avez besoin pour vous former en sécurite au travail. 500+ modules dans 9 secteurs, accessibles à tous.
              </p>
              <div style={{opacity:loaded?1:0,transform:loaded?'translateY(0)':'translateY(24px)',transition:'all 0.7s ease 240ms',display:'flex',flexWrap:'wrap',gap:'12px',marginBottom:'48px'}}>
                <Link href="/secteurs" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'14px 32px',borderRadius:'16px',fontWeight:900,fontSize:'14px',color:'white',textDecoration:'none',background:'var(--orange)',boxShadow:'0 8px 32px rgba(212,80,15,0.45)',transition:'transform 0.2s, box-shadow 0.2s'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1.05)';(e.currentTarget as HTMLElement).style.boxShadow='0 12px 40px rgba(212,80,15,0.55)'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1)';(e.currentTarget as HTMLElement).style.boxShadow='0 8px 32px rgba(212,80,15,0.45)'}}>
                  Explorer les formations <ArrowRight size={16}/>
                </Link>
                <Link href="/alertes" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'14px 28px',borderRadius:'16px',fontWeight:700,fontSize:'14px',color:'rgba(255,255,255,0.88)',textDecoration:'none',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',transition:'all 0.2s'}}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.14)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.08)'}>
                  <Bell size={15}/>Alertes securite
                </Link>
              </div>
              <div style={{opacity:loaded?1:0,transition:'opacity 0.7s ease 320ms',display:'flex',alignItems:'center',gap:'24px',flexWrap:'wrap'}}>
                {STATS.map((s,i)=>{const Icon=s.icon;return(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.08)',flexShrink:0}}>
                      <Icon size={16} style={{color:s.color}}/>
                    </div>
                    <div>
                      <div style={{color:'white',fontWeight:900,fontSize:'1.2rem',lineHeight:1}}><CountUp target={s.val} suffix={s.suffix}/></div>
                      <div style={{color:'rgba(255,255,255,0.45)',fontSize:'10px',marginTop:'2px'}}>{s.label}</div>
                    </div>
                  </div>
                )})}
              </div>
            </div>

            {/* Mosaique d images */}
            <div className="hidden lg:block" style={{opacity:loaded?1:0,transform:loaded?'translateX(0)':'translateX(30px)',transition:'all 0.9s ease 300ms'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div style={{gridColumn:'1/-1',height:'220px',borderRadius:'24px',overflow:'hidden',position:'relative'}}>
                  <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80" alt="Construction" style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.7s ease'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='scale(1.05)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='scale(1)'}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 60%)'}}/>
                  <div style={{position:'absolute',bottom:'14px',left:'16px'}}>
                    <p style={{color:'white',fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.08em'}}>Construction & BTP</p>
                    <p style={{color:'rgba(255,255,255,0.7)',fontSize:'10px',marginTop:'2px'}}>48 formations disponibles</p>
                  </div>
                </div>
                {[
                  {img:'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&q=80',label:'Sante & Medical',count:36},
                  {img:'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80',label:'Industrie',count:52},
                ].map((item,i)=>(
                  <div key={i} style={{height:'150px',borderRadius:'18px',overflow:'hidden',position:'relative'}}>
                    <img src={item.img} alt={item.label} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.7s ease'}}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='scale(1.06)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='scale(1)'}/>
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 60%)'}}/>
                    <div style={{position:'absolute',bottom:'10px',left:'12px'}}>
                      <p style={{color:'white',fontSize:'10px',fontWeight:900}}>{item.label}</p>
                      <p style={{color:'rgba(255,255,255,0.65)',fontSize:'9px'}}>{item.count} formations</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:'12px',padding:'16px',borderRadius:'18px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',gap:'14px'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'12px',background:'rgba(74,222,128,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <CheckCircle size={20} style={{color:'#4ade80'}}/>
                </div>
                <div>
                  <p style={{color:'white',fontSize:'13px',fontWeight:900,margin:0}}>Formations certifiees</p>
                  <p style={{color:'rgba(255,255,255,0.55)',fontSize:'11px',margin:'2px 0 0 0'}}>Validees par des experts en securite internationale</p>
                </div>
                <div style={{marginLeft:'auto',display:'flex',gap:'-6px'}}>
                  {['#f97316','#60a5fa','#4ade80','#c084fc','#facc15'].map((c,i)=>(
                    <div key={i} style={{width:'28px',height:'28px',borderRadius:'50%',background:c,border:'2px solid rgba(5,16,31,0.8)',marginLeft:i>0?'-6px':'0',position:'relative',zIndex:5-i}}/>
                  ))}
                </div>
              </div>
              {/* Indicateurs */}
              <div style={{display:'flex',gap:'8px',marginTop:'10px',justifyContent:'center'}}>
                {heroImages.map((_,i)=>(
                  <button key={i} onClick={()=>setHeroImg(i)} style={{height:'3px',width:i===heroImg?'28px':'8px',borderRadius:'99px',background:i===heroImg?'var(--orange)':'rgba(255,255,255,0.25)',transition:'all 0.4s ease',border:'none',cursor:'pointer'}}/>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ BANDE CONFIANCE ═══════ */}
      <section style={{padding:'16px 0',background:'var(--bg-card)',borderBottom:'1px solid var(--border)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'center',gap:'32px',flexWrap:'wrap'}}>
          {[
            {icon:CheckCircle,label:'Formations certifiees',color:'#22c55e'},
            {icon:Globe,label:'Accessible dans le monde entier',color:'#3b82f6'},
            {icon:Shield,label:'Securite validee',color:'var(--orange)'},
            {icon:Users,label:'12 000+ professionnels',color:'#a855f7'},
            {icon:Zap,label:'Alertes en temps reel',color:'#facc15'},
            {icon:Award,label:'100% gratuit',color:'#f97316'},
          ].map((s,i)=>{const Icon=s.icon;return(
            <div key={i} style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <Icon size={14} style={{color:s.color,flexShrink:0}}/>
              <span style={{fontSize:'12px',fontWeight:600,color:'var(--text-secondary)'}}>{s.label}</span>
            </div>
          )})}
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section style={{padding:'96px 0',background:'var(--bg-main)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px'}}>
          <Reveal style={{textAlign:'center',marginBottom:'64px'}}>
            <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--orange)',marginBottom:'12px'}}>Pourquoi Think Safety</p>
            <h2 style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:900,color:'var(--text-primary)',margin:'0 0 16px 0',lineHeight:1.1}}>La securite, c est notre mission</h2>
            <p style={{fontSize:'1.05rem',color:'var(--text-secondary)',maxWidth:'560px',margin:'0 auto',lineHeight:1.8}}>
              Thinks Safety est une plateforme 100% gratuite et ouverte à tous. Trouvez les ressources adaptees a votre metier.
            </p>
          </Reveal>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'28px'}}>
            {[
              {icon:BookOpen,titre:'500+ Formations gratuites',desc:'Un catalogue complet de modules de formation couvrant tous les aspects de la sécurite professionnelle, accessibles sans abonnement.',color:'#f97316',img:'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=80'},
              {icon:Bell,    titre:'Alertes en temps réel',  desc:'Systeme de notifications instantanées pour informer vos équipes des risques émergents, incidents et nouvelles réglementations dans votre secteur.',color:'#ef4444',img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80'},
              {icon:Award,   titre:'Certifications reconnues',desc:'Obtenez des certifications valorisées par les employeurs du monde entier. Nos formations sont validées par des experts internationaux en sécurite.',color:'#22c55e',img:'https://images.unsplash.com/photo-1434030216411-0b793f4b6f6f?w=400&q=80'},
            ].map((f,i)=>{const Icon=f.icon;return(
              <Reveal key={i} delay={i*120} className="hover-lift" style={{borderRadius:'28px',overflow:'hidden',border:'1px solid var(--border)',background:'var(--bg-card)',cursor:'default'}}>
                <div style={{height:'180px',overflow:'hidden',position:'relative'}}>
                  <img src={f.img} alt={f.titre} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display='none'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.5) 100%)'}}/>
                  <div style={{position:'absolute',top:'16px',left:'16px',width:'44px',height:'44px',borderRadius:'14px',background:'white',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(0,0,0,0.15)'}}>
                    <Icon size={22} style={{color:f.color}}/>
                  </div>
                </div>
                <div style={{padding:'24px'}}>
                  <div style={{height:'3px',width:'48px',borderRadius:'99px',background:f.color,marginBottom:'16px'}}/>
                  <h3 style={{fontSize:'1.1rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 10px 0'}}>{f.titre}</h3>
                  <p style={{fontSize:'14px',color:'var(--text-secondary)',lineHeight:'1.75',margin:0}}>{f.desc}</p>
                </div>
              </Reveal>
            )})}
          </div>
        </div>
      </section>

      {/* ═══════ STATS COMPTEURS ═══════ */}
      <section style={{padding:'72px 0',background:'linear-gradient(135deg,var(--orange) 0%,#c0390a 100%)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,opacity:0.07,backgroundImage:'radial-gradient(circle,white 1.5px,transparent 1.5px)',backgroundSize:'28px 28px'}}/>
        <div style={{position:'absolute',top:'-50%',right:'-10%',width:'500px',height:'500px',borderRadius:'50%',background:'radial-gradient(circle,rgba(255,255,255,0.15),transparent 65%)'}}/>
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 24px'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'24px',textAlign:'center'}}>
            {STATS.map((s,i)=>{const Icon=s.icon;return(
              <Reveal key={i} delay={i*100}>
                <div style={{padding:'28px 16px',borderRadius:'20px',background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.2)',backdropFilter:'blur(10px)'}}>
                  <div style={{width:'52px',height:'52px',borderRadius:'16px',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px auto'}}>
                    <Icon size={24} style={{color:'white'}}/>
                  </div>
                  <div style={{fontSize:'2.5rem',fontWeight:900,color:'white',lineHeight:1,marginBottom:'6px'}}>
                    <CountUp target={s.val} suffix={s.suffix}/>
                  </div>
                  <div style={{fontSize:'13px',fontWeight:600,color:'rgba(255,255,255,0.85)'}}>{s.label}</div>
                </div>
              </Reveal>
            )})}
          </div>
        </div>
      </section>

      {/* ═══════ NOTRE VISION ═══════ */}
      <section style={{padding:'96px 0',background:'var(--bg-secondary)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'80px',alignItems:'center'}}>
            <Reveal>
              <div style={{position:'relative'}}>
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&q=80" alt="Vision" style={{width:'100%',borderRadius:'28px',objectFit:'cover',height:'480px'}}/>
                <div style={{position:'absolute',bottom:'-20px',right:'-20px',padding:'20px 24px',borderRadius:'20px',background:'var(--orange)',boxShadow:'0 16px 48px rgba(212,80,15,0.35)',animation:'float 6s ease-in-out infinite'}}>
                  <div style={{fontSize:'2rem',fontWeight:900,color:'white',lineHeight:1}}>40%</div>
                  <div style={{fontSize:'12px',color:'rgba(255,255,255,0.9)',marginTop:'4px',fontWeight:600}}>Reduction des accidents</div>
                  <div style={{fontSize:'10px',color:'rgba(255,255,255,0.7)'}}>chez nos utilisateurs</div>
                </div>
                <div style={{position:'absolute',top:'-16px',left:'-16px',padding:'14px 18px',borderRadius:'16px',background:'var(--bg-card)',border:'1px solid var(--border)',boxShadow:'0 8px 24px rgba(0,0,0,0.1)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'12px',background:'rgba(74,222,128,0.15)',display:'flex',alignItems:'center',justifyContent:'center'}}><CheckCircle size={18} style={{color:'#4ade80'}}/></div>
                    <div>
                      <p style={{fontSize:'12px',fontWeight:900,color:'var(--text-primary)',margin:0}}>Certifie</p>
                      <p style={{fontSize:'10px',color:'var(--text-secondary)',margin:'2px 0 0 0'}}>Experts internationaux</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--orange)',marginBottom:'16px'}}>Notre vision</p>
              <h2 style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:900,color:'var(--text-primary)',margin:'0 0 20px 0',lineHeight:1.1}}>
                Un monde ou chaque travailleur rentre chez lui sain et sauf
              </h2>
              <p style={{fontSize:'1rem',color:'var(--text-secondary)',lineHeight:1.85,margin:'0 0 24px 0'}}>
                Chaque année, des millions de travailleurs sont victimes d'accidents professionnels évitables. Chez Thinks Safety, nous croyons que la formation est le moyen le plus efficace de prévenir ces tragedies.
              </p>
              <p style={{fontSize:'1rem',color:'var(--text-secondary)',lineHeight:1.85,margin:'0 0 32px 0'}}>
                Thinks Safety rassemble des ressources de formation gratuites issues d'experts du monde entier. Nous ne sommes pas une école, mais un espace ouvert ou chaque professionnel peut trouver, apprendre et partager des connaissances en securité.
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:'14px',marginBottom:'36px'}}>
                {['Formation gratuite et accessible universellement','Contenu valide par des experts certifiés','Alertes et mises à jour en temps reel','Disponible dans plusieurs langues'].map((item,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <div style={{width:'24px',height:'24px',borderRadius:'8px',background:'rgba(212,80,15,0.12)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><CheckCircle size={14} style={{color:'var(--orange)'}}/></div>
                    <span style={{fontSize:'14px',color:'var(--text-primary)',fontWeight:500}}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/a-propos" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 24px',borderRadius:'14px',fontSize:'14px',fontWeight:700,color:'var(--orange)',textDecoration:'none',background:'rgba(212,80,15,0.1)',border:'1px solid rgba(212,80,15,0.25)',transition:'all 0.2s'}}
                onMouseEnter={e=>Object.assign((e.currentTarget as HTMLElement).style,{background:'rgba(212,80,15,0.18)',transform:'translateX(4px)'})}
                onMouseLeave={e=>Object.assign((e.currentTarget as HTMLElement).style,{background:'rgba(212,80,15,0.1)',transform:'translateX(0)'})}>
                En savoir plus sur nous <ArrowRight size={14}/>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════ FORMATIONS EN VEDETTE ═══════ */}
      {courses.length>0&&(
        <section style={{padding:'96px 0',background:'var(--bg-main)'}}>
          <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px'}}>
            <Reveal style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'48px',flexWrap:'wrap',gap:'16px'}}>
              <div>
                <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--orange)',marginBottom:'10px'}}>Catalogue</p>
                <h2 style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:900,color:'var(--text-primary)',margin:0,lineHeight:1.1}}>Formations en vedette</h2>
              </div>
              <Link href="/secteurs" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'10px 20px',borderRadius:'14px',fontSize:'13px',fontWeight:700,color:'var(--orange)',textDecoration:'none',background:'rgba(212,80,15,0.1)',border:'1px solid rgba(212,80,15,0.25)'}}>
                Voir tout le catalogue <ArrowRight size={13}/>
              </Link>
            </Reveal>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px'}}>
              {courses.map((c,i)=>(
                <Reveal key={c.id} delay={i*80} className="card-hover" style={{borderRadius:'24px',overflow:'hidden',border:'1px solid var(--border)',background:'var(--bg-card)',cursor:'pointer'}}>
                  <Link href={'/cours/'+c.slug} style={{textDecoration:'none',display:'block'}}>
                    <div style={{aspectRatio:'16/9',overflow:'hidden',position:'relative',background:'var(--bg-secondary)'}}>
                      {c.image_couverture?<img src={c.image_couverture} alt="" style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.7s ease'}} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='scale(1.06)'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='scale(1)'}/>:<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3rem'}}>🛡️</div>}
                      {i===0&&<div style={{position:'absolute',top:'12px',left:'12px',padding:'4px 10px',borderRadius:'99px',fontSize:'10px',fontWeight:900,color:'white',background:'var(--orange)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Populaire</div>}
                      <div style={{position:'absolute',top:'12px',right:'12px',display:'flex',gap:'2px'}}>{[1,2,3,4,5].map(n=><Star key={n} size={9} style={{color:'#facc15'}} fill="#facc15"/>)}</div>
                    </div>
                    <div style={{padding:'20px'}}>
                      <p style={{fontSize:'10px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--orange)',marginBottom:'8px'}}>{c.secteur_slug?.replace(/-/g,' ')}</p>
                      <h3 style={{fontSize:'15px',fontWeight:900,color:'var(--text-primary)',margin:'0 0 8px 0',lineHeight:1.4,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{c.titre}</h3>
                      <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:'0 0 16px 0',lineHeight:1.6,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{c.description_courte}</p>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:'12px',borderTop:'1px solid var(--border)'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',fontWeight:600,color:'#22c55e'}}><CheckCircle size={12}/>100% Gratuit</div>
                        <span style={{fontSize:'12px',fontWeight:900,color:'var(--orange)'}}>Voir →</span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ AVANTAGES ═══════ */}
      <section style={{padding:'96px 0',background:'var(--bg-secondary)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'80px',alignItems:'center'}}>
            <Reveal>
              <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--orange)',marginBottom:'16px'}}>Nos avantages</p>
              <h2 style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:900,color:'var(--text-primary)',margin:'0 0 40px 0',lineHeight:1.1}}>
                Tout ce qu il faut pour une securite optimale
              </h2>
              <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
                {[
                  {icon:Globe,     titre:'Accessible partout dans le monde',  desc:'Disponible sur tous les appareils, en ligne ou hors ligne. Aucun équipement special requis.',color:'#3b82f6'},
                  {icon:Target,    titre:'Formations adaptees a votre metier', desc:'Chaque formation est specifiquement concue pour les risques et réalites de votre secteur professionnel.',color:'var(--orange)'},
                  {icon:TrendingUp,titre:'Mises a jour regulieres',            desc:'Notre équipe d'experts met a jour en permanence les contenus selon les nouvelles reglementations.',color:'#22c55e'},
                  {icon:Heart,     titre:'Support et communauté active',       desc:'Rejoignez une communauté de professionnels de la sécurité et bénéficiez d'un support dédié.',color:'#ef4444'},
                  {icon:Eye,       titre:'Suivi de progression',               desc:'Visualisez vos avancées, obtenez vos certifications et partagez vos accomplissements.',color:'#a855f7'},
                ].map((item,i)=>{const Icon=item.icon;return(
                  <div key={i} style={{display:'flex',gap:'16px',alignItems:'flex-start',padding:'16px',borderRadius:'16px',transition:'background 0.2s',cursor:'default'}}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-card)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{width:'44px',height:'44px',borderRadius:'14px',background:item.color+'15',border:'1px solid '+item.color+'25',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <Icon size={20} style={{color:item.color}}/>
                    </div>
                    <div>
                      <h3 style={{fontSize:'15px',fontWeight:900,color:'var(--text-primary)',margin:'0 0 6px 0'}}>{item.titre}</h3>
                      <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:0,lineHeight:1.65}}>{item.desc}</p>
                    </div>
                  </div>
                )})}
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                {[
                  {img:'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80',label:'Mines & Carrieres'},
                  {img:'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80',label:'Agriculture'},
                  {img:'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&q=80',label:'Petrole & Gaz'},
                  {img:'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80',label:'Education'},
                ].map((item,i)=>(
                  <div key={i} style={{height:'200px',borderRadius:'20px',overflow:'hidden',position:'relative',background:'#1a2a4a'}} className="hover-scale">
                    <img src={item.img} alt={item.label} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 60%)'}}/>
                    <div style={{position:'absolute',bottom:'10px',left:'12px'}}>
                      <p style={{color:'white',fontSize:'11px',fontWeight:900,margin:0}}>{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════ SECTEURS ═══════ */}
      <section style={{padding:'96px 0',background:'var(--bg-main)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px'}}>
          <Reveal style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'48px',flexWrap:'wrap',gap:'16px'}}>
            <div>
              <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--orange)',marginBottom:'10px'}}>9 domaines couverts</p>
              <h2 style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:900,color:'var(--text-primary)',margin:0,lineHeight:1.1}}>Votre secteur, vos formations</h2>
            </div>
            <Link href="/secteurs" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'10px 20px',borderRadius:'14px',fontSize:'13px',fontWeight:700,color:'var(--orange)',textDecoration:'none',background:'rgba(212,80,15,0.1)',border:'1px solid rgba(212,80,15,0.25)'}}>
              Tous les secteurs <ArrowRight size={13}/>
            </Link>
          </Reveal>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'16px'}}>
            {SECTEURS.slice(0,2).map(s=>(
              <Reveal key={s.slug} className="hover-lift" style={{gridColumn:'span 1',borderRadius:'24px',overflow:'hidden',aspectRatio:'1',cursor:'pointer',position:'relative',background:'var(--bg-secondary)'}}>
                <Link href={'/secteurs/'+s.slug} style={{display:'block',width:'100%',height:'100%',textDecoration:'none',position:'relative'}}>
                  <img src={s.img} alt={s.nom} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.7s ease'}} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='scale(1.08)'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='scale(1)'}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.1) 60%,transparent 100%)'}}/>
                  <div style={{position:'absolute',top:'12px',right:'12px',fontSize:'1.6rem'}}>{s.emoji}</div>
                  <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'14px'}}>
                    <p style={{color:'white',fontSize:'15px',fontWeight:900,margin:'0 0 3px 0'}}>{s.nom}</p>
                    <p style={{color:'rgba(255,255,255,0.6)',fontSize:'10px',margin:0}}>{s.count} formations</p>
                  </div>
                </Link>
              </Reveal>
            ))}
            {SECTEURS.slice(2).map(s=>(
              <Reveal key={s.slug} className="hover-lift" style={{borderRadius:'18px',overflow:'hidden',aspectRatio:'3/4',cursor:'pointer',position:'relative',background:'var(--bg-secondary)'}}>
                <Link href={'/secteurs/'+s.slug} style={{display:'block',width:'100%',height:'100%',textDecoration:'none',position:'relative'}}>
                  <img src={s.img} alt={s.nom} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.7s ease'}} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='scale(1.08)'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='scale(1)'}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 55%)'}}/>
                  <div style={{position:'absolute',top:'8px',right:'8px',fontSize:'1.3rem'}}>{s.emoji}</div>
                  <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'10px'}}>
                    <p style={{color:'white',fontSize:'14px',fontWeight:900,margin:'0 0 3px 0'}}>{s.nom}</p>
                    <p style={{color:'rgba(255,255,255,0.55)',fontSize:'9px',margin:0}}>{s.count} formations</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ COMMENT CA MARCHE ═══════ */}
      <section style={{padding:'96px 0',background:'var(--bg-secondary)'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 24px'}}>
          <Reveal style={{textAlign:'center',marginBottom:'64px'}}>
            <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--orange)',marginBottom:'12px'}}>Simple et efficace</p>
            <h2 style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:900,color:'var(--text-primary)',margin:'0 0 16px 0',lineHeight:1.1}}>Commencez en 3 etapes</h2>
            <p style={{fontSize:'1rem',color:'var(--text-secondary)',maxWidth:'480px',margin:'0 auto',lineHeight:1.8}}>Notre plateforme est concue pour être simple, rapide et efficace.</p>
          </Reveal>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'32px',position:'relative'}}>
            <div style={{position:'absolute',top:'40px',left:'20%',right:'20%',height:'2px',background:'linear-gradient(to right,transparent,rgba(212,80,15,0.4),transparent)',display:'none'}}/>
            {[
              {n:'01',icon:BookOpen,titre:'Choisissez votre secteur',desc:'Parcourez les 9 domaines professionnels et sélectionnez les formations adaptées à votre métier et a vos besoins.',color:'var(--orange)',href:'/secteurs'},
              {n:'02',icon:Play,     titre:'Suivez les formations',  desc:'Vidéos, fiches pratiques, quiz — avancez à votre propre rythme depuis n'importe quel appareil, partout dans le monde.',color:'#3b82f6',href:'/secteurs'},
              {n:'03',icon:Shield,   titre:'Protegez vos equipes',   desc:'Mettez en pratique vos connaissances, utilisez nos alertes et partagez les formations avec vos collaborateurs.',color:'#22c55e',href:'/secteurs'},
            ].map((s,i)=>{const Icon=s.icon;return(
              <Reveal key={i} delay={i*130} className="hover-lift" style={{borderRadius:'24px',border:'1px solid var(--border)',background:'var(--bg-card)',cursor:'pointer',position:'relative',overflow:'hidden'}}>
                <div style={{height:'4px',background:s.color}}/>
                <div style={{padding:'32px 28px'}}>
                  <div style={{width:'48px',height:'48px',borderRadius:'16px',background:'rgba(5,16,31,0.8)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'20px'}}>
                    <span style={{color:'var(--orange)',fontSize:'14px',fontWeight:900}}>{s.n}</span>
                  </div>
                  <div style={{width:'56px',height:'56px',borderRadius:'18px',background:s.color+'15',border:'1px solid '+s.color+'30',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'20px'}}>
                    <Icon size={26} style={{color:s.color}}/>
                  </div>
                  <h3 style={{fontSize:'1.1rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 12px 0'}}>{s.titre}</h3>
                  <p style={{fontSize:'14px',color:'var(--text-secondary)',lineHeight:1.75,margin:'0 0 20px 0'}}>{s.desc}</p>
                  <Link href={s.href} style={{display:'inline-flex',alignItems:'center',gap:'6px',fontSize:'13px',fontWeight:700,color:s.color,textDecoration:'none'}}>
                    Commencer <ArrowRight size={13}/>
                  </Link>
                </div>
              </Reveal>
            )})}
          </div>
        </div>
      </section>

      {/* ═══════ VIDEOS ═══════ */}
      <section style={{padding:'96px 0',background:'var(--bg-main)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px'}}>
          <Reveal style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'48px',flexWrap:'wrap',gap:'16px'}}>
            <div>
              <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--orange)',marginBottom:'10px'}}>Ressources video</p>
              <h2 style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:900,color:'var(--text-primary)',margin:0,lineHeight:1.1}}>Apprenez en video</h2>
            </div>
            {videos.length>0&&<Link href="/secteurs" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'10px 20px',borderRadius:'14px',fontSize:'13px',fontWeight:700,color:'var(--orange)',textDecoration:'none',background:'rgba(212,80,15,0.1)',border:'1px solid rgba(212,80,15,0.25)'}}>Voir tout <ArrowRight size={13}/></Link>}
          </Reveal>
          {videos.length>0?(
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px'}}>
              {videos.map((v,i)=>{const id=ytId(v.youtube_url);const thumb=id?'https://img.youtube.com/vi/'+id+'/mqdefault.jpg':null;const cSlug=(v.courses as any)?.slug;return(
                <Reveal key={v.id} delay={i*100} className="card-hover" style={{borderRadius:'22px',overflow:'hidden',border:'1px solid var(--border)',background:'var(--bg-card)',cursor:'pointer'}}>
                  <Link href={'/cours/'+cSlug+'?lecon='+v.id} style={{display:'block',textDecoration:'none'}}>
                    <div style={{aspectRatio:'16/9',overflow:'hidden',position:'relative',background:'var(--bg-secondary)'}}>
                      {thumb&&<img src={thumb} alt={v.titre} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.6s'}} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='scale(1.05)'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='scale(1)'}/>}
                      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',opacity:0,transition:'opacity 0.3s',background:'rgba(0,0,0,0.35)'}} onMouseEnter={e=>{e.currentTarget.style.opacity='1'}} onMouseLeave={e=>{e.currentTarget.style.opacity='0'}}>
                        <div style={{width:'56px',height:'56px',borderRadius:'50%',background:'var(--orange)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 24px rgba(212,80,15,0.5)'}}><Play size={20} style={{color:'white',marginLeft:'3px'}} fill="white"/></div>
                      </div>
                      {v.duree_minutes>0&&<div style={{position:'absolute',bottom:'10px',right:'10px',padding:'4px 10px',borderRadius:'8px',fontSize:'11px',fontWeight:700,color:'white',background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',gap:'4px'}}><Clock size={10}/>{v.duree_minutes}min</div>}
                    </div>
                    <div style={{padding:'18px'}}>
                      <p style={{fontSize:'10px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--orange)',marginBottom:'6px'}}>{(v.courses as any)?.secteur_slug?.replace(/-/g,' ')}</p>
                      <h4 style={{fontSize:'14px',fontWeight:900,color:'var(--text-primary)',margin:0,lineHeight:1.4,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{v.titre}</h4>
                    </div>
                  </Link>
                </Reveal>
              )})}
            </div>
          ):(
            <Reveal>
              <div style={{padding:'64px 32px',borderRadius:'28px',border:'1px solid rgba(212,80,15,0.2)',background:'rgba(212,80,15,0.04)',textAlign:'center'}}>
                <div style={{width:'64px',height:'64px',borderRadius:'20px',background:'rgba(212,80,15,0.12)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px auto'}}><Play size={28} style={{color:'var(--orange)'}}/></div>
                <h3 style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 10px 0'}}>Vidéos de formation à venir</h3>
                <p style={{fontSize:'14px',color:'var(--text-secondary)',margin:'0 0 24px 0',maxWidth:'400px',marginLeft:'auto',marginRight:'auto',lineHeight:1.7}}>Notre équipe prépare des contenus vidéo de haute qualité pour chaque secteur professionnel.</p>
                <Link href="/secteurs" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 24px',borderRadius:'14px',fontSize:'14px',fontWeight:900,color:'white',textDecoration:'none',background:'var(--orange)'}}>Explorer les formations <ArrowRight size={14}/></Link>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ═══════ TEMOIGNAGES ═══════ */}
      <section style={{padding:'96px 0',background:'var(--bg-secondary)'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 24px'}}>
          <Reveal style={{textAlign:'center',marginBottom:'60px'}}>
            <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--orange)',marginBottom:'12px'}}>Ils nous font confiance</p>
            <h2 style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:900,color:'var(--text-primary)',margin:'0 0 16px 0',lineHeight:1.1}}>Ce que disent nos utilisateurs</h2>
          </Reveal>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px'}}>
            {TEMOIGNAGES.map((t,i)=>(
              <Reveal key={i} delay={i*100} className="hover-lift" style={{padding:'28px',borderRadius:'24px',border:'1px solid var(--border)',background:'var(--bg-card)',cursor:'default'}}>
                <div style={{display:'flex',gap:'2px',marginBottom:'18px'}}>{[1,2,3,4,5].map(n=><Star key={n} size={15} style={{color:'#facc15'}} fill="#facc15"/>)}</div>
                <p style={{fontSize:'14px',color:'var(--text-secondary)',lineHeight:1.8,margin:'0 0 20px 0',fontStyle:'italic'}}>"{t.texte}"</p>
                <div style={{display:'flex',alignItems:'center',gap:'12px',paddingTop:'18px',borderTop:'1px solid var(--border)'}}>
                  <img src={t.img} alt={t.nom} style={{width:'42px',height:'42px',borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>
                  <div>
                    <p style={{fontSize:'14px',fontWeight:900,color:'var(--text-primary)',margin:0}}>{t.nom}</p>
                    <p style={{fontSize:'11px',color:'var(--text-secondary)',margin:'3px 0 0 0'}}>{t.titre}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section style={{padding:'112px 0',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#9a3c0a 0%,var(--orange) 50%,#e06010 100%)'}}/>
        <div style={{position:'absolute',inset:0,opacity:0.07,backgroundImage:'radial-gradient(circle,white 1.5px,transparent 1.5px)',backgroundSize:'24px 24px'}}/>
        <div style={{position:'absolute',top:'-30%',right:'-5%',width:'500px',height:'500px',borderRadius:'50%',background:'radial-gradient(circle,rgba(255,255,255,0.2),transparent 65%)',filter:'blur(40px)'}}/>
        <div style={{position:'relative',maxWidth:'800px',margin:'0 auto',padding:'0 24px',textAlign:'center'}}>
          <Reveal>
            <div style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'8px 20px',borderRadius:'99px',fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.08em',color:'white',background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.25)',marginBottom:'24px'}}>
              <Zap size={12}/>Rejoignez 12 000+ professionnels dans le monde
            </div>
            <h2 style={{fontSize:'clamp(2.5rem,5vw,4rem)',fontWeight:900,color:'white',margin:'0 0 20px 0',lineHeight:1.08,textShadow:'0 4px 24px rgba(0,0,0,0.2)'}}>
              La securite au travail commence par la formation
            </h2>
            <p style={{fontSize:'1.15rem',color:'rgba(255,255,255,0.85)',margin:'0 0 48px 0',maxWidth:'560px',marginLeft:'auto',marginRight:'auto',lineHeight:1.8}}>
              Aucune inscription. Aucun abonnement. 500+ ressources gratuites dans 9 secteurs. Alertes sécurité en temps réel. Tout est accessible immediatement.
            </p>
            <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'16px'}}>
              <Link href="/secteurs" style={{display:'inline-flex',alignItems:'center',gap:'10px',padding:'16px 40px',borderRadius:'18px',fontWeight:900,fontSize:'15px',color:'var(--orange)',textDecoration:'none',background:'white',boxShadow:'0 12px 40px rgba(0,0,0,0.2)',transition:'transform 0.2s, box-shadow 0.2s'}}
                onMouseEnter={e=>Object.assign((e.currentTarget as HTMLElement).style,{transform:'scale(1.05)',boxShadow:'0 20px 50px rgba(0,0,0,0.3)'})}
                onMouseLeave={e=>Object.assign((e.currentTarget as HTMLElement).style,{transform:'scale(1)',boxShadow:'0 12px 40px rgba(0,0,0,0.2)'})}>
                Trouver une formation <ArrowRight size={17}/>
              </Link>
              <Link href="/marketplace" style={{display:'inline-flex',alignItems:'center',gap:'10px',padding:'16px 40px',borderRadius:'18px',fontWeight:700,fontSize:'15px',color:'white',textDecoration:'none',background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.35)',transition:'all 0.2s'}}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.22)'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.15)'}>
                <Shield size={16}/>Marketplace EPI
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ 3 SERVICES ═══════ */}
      <section style={{padding:'96px 0',background:'var(--bg-main)'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 24px'}}>
          <Reveal style={{textAlign:'center',marginBottom:'60px'}}>
            <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--orange)',marginBottom:'12px'}}>Nos services</p>
            <h2 style={{fontSize:'clamp(2rem,4vw,3rem)',fontWeight:900,color:'var(--text-primary)',margin:0,lineHeight:1.1}}>Un ecosysteme complet pour la securite</h2>
          </Reveal>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'28px'}}>
            {[
              {icon:BookOpen,titre:'Formations gratuites',   desc:'Acces illimité a 500+ modules de formation couvrant tous les risques professionnels, sans abonnement requis.',href:'/secteurs',    cta:'Explorer le catalogue',color:'#2563eb',img:'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500&q=80'},
              {icon:Bell,    titre:'Alertes securite',        desc:'Système d'alertes en temps réel pour votre secteur et votre région. Ne soyez jamais pris au dépourvu.',href:'/alertes',      cta:'Voir les alertes',    color:'#dc2626',img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80'},
              {icon:Shield,  titre:'Marketplace EPI',         desc:'Equipements de protection individuelle certifiés, disponibles a l'achat avec livraison directe pour vos équipes.',href:'/marketplace',cta:'Acceder au marketplace',color:'#16a34a',img:'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80'},
            ].map((item,i)=>{const Icon=item.icon;return(
              <Reveal key={i} delay={i*120} className="hover-lift" style={{borderRadius:'28px',overflow:'hidden',border:'1px solid var(--border)',background:'var(--bg-card)',cursor:'pointer'}}>
                <div style={{height:'200px',overflow:'hidden',position:'relative'}}>
                  <img src={item.img} alt={item.titre} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.7s'}} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='scale(1.06)'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='scale(1)'}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 30%,rgba(0,0,0,0.5) 100%)'}}/>
                  <div style={{position:'absolute',top:'16px',left:'16px',width:'48px',height:'48px',borderRadius:'14px',background:'white',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(0,0,0,0.2)'}}>
                    <Icon size={22} style={{color:item.color}}/>
                  </div>
                </div>
                <div style={{padding:'24px'}}>
                  <div style={{height:'3px',width:'48px',borderRadius:'99px',background:item.color,marginBottom:'16px'}}/>
                  <h3 style={{fontSize:'1.2rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 10px 0'}}>{item.titre}</h3>
                  <p style={{fontSize:'14px',color:'var(--text-secondary)',lineHeight:1.75,margin:'0 0 20px 0'}}>{item.desc}</p>
                  <Link href={item.href} style={{display:'inline-flex',alignItems:'center',gap:'6px',fontSize:'13px',fontWeight:700,color:item.color,textDecoration:'none',padding:'10px 18px',borderRadius:'12px',background:item.color+'12',border:'1px solid '+item.color+'20',transition:'all 0.2s'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=item.color+'20'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=item.color+'12'}>
                    {item.cta} <ArrowRight size={13}/>
                  </Link>
                </div>
              </Reveal>
            )})}
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  )
}
