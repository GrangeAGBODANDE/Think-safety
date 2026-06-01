'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronRight, Play, AlertTriangle, ArrowRight, Clock, Shield, BookOpen, Bell, Lock, Users, CheckCircle, Zap, Star } from 'lucide-react'

const SECTEURS = [
  { slug: 'construction-btp',         nom: 'Construction & BTP',  img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=80', count: 48 },
  { slug: 'sante-medical',            nom: 'Sante Medical',        img: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=700&q=80', count: 36 },
  { slug: 'industrie-manufacturiere', nom: 'Industrie',            img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=700&q=80', count: 52 },
  { slug: 'transport-logistique',     nom: 'Transport',            img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=700&q=80', count: 29 },
  { slug: 'agriculture',              nom: 'Agriculture',          img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=700&q=80', count: 31 },
  { slug: 'mines-carrieres',          nom: 'Mines',                img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=700&q=80', count: 24 },
  { slug: 'petrole-gaz',              nom: 'Petrole & Gaz',        img: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=700&q=80', count: 27 },
  { slug: 'bureaux-services',         nom: 'Bureaux Services',     img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80', count: 41 },
  { slug: 'education-formation',      nom: 'Education',            img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=700&q=80', count: 33 },
]

const VIDEO_PH = [
  { secteur: 'Construction & BTP', titre: 'Securite sur chantier - Fondamentaux', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80' },
  { secteur: 'Industrie',          titre: 'Gestes et postures en atelier',        img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80' },
  { secteur: 'Transport',          titre: 'Prevention des accidents routiers',    img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80' },
]

function Card3D({ children, style = {}, className = '' }: any) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (e: React.MouseEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.transform = 'perspective(900px) rotateX('+(-y*8)+'deg) rotateY('+(x*8)+'deg) translateZ(12px)'
    ref.current.style.transition = 'transform 0.1s ease'
  }
  const leave = () => {
    if (!ref.current) return
    ref.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
    ref.current.style.transition = 'transform 0.5s ease'
  }
  return <div ref={ref} className={className} style={{transformStyle:'preserve-3d',...style}} onMouseMove={move} onMouseLeave={leave}>{children}</div>
}

export default function HomePage() {
  const [hero, setHero] = useState<any>(null)
  const [selection, setSelection] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [alerte, setAlerte] = useState<any>(null)
  const [imgIndex, setImgIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const heroImgs = [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80',
  ]

  useEffect(() => {
    const t = setInterval(() => setImgIndex(i => (i+1) % heroImgs.length), 5500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from('courses').select('id,slug,titre,description_courte,image_couverture,secteur_slug').eq('statut','published').order('created_at',{ascending:false}).limit(7)
      if (c?.length) { setHero(c[0]); setSelection(c.slice(1,7)) }
      const { data: v } = await supabase.from('course_lessons').select('id,titre,youtube_url,duree_minutes,course_id,courses(slug,titre,image_couverture,secteur_slug)').eq('type','video').not('youtube_url','is',null).limit(6)
      setVideos(v || [])
      const { data: a } = await supabase.from('alertes').select('*').eq('statut','active').order('created_at',{ascending:false}).limit(1)
      if (a?.length) setAlerte(a[0])
      setTimeout(() => setLoaded(true), 60)
    }
    load()
  }, [])

  function ytId(url: string) {
    const m = (url||'').match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return m ? m[1] : null
  }

  const show = (d = 0) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? 'translateY(0)' : 'translateY(30px)',
    transition: 'opacity 0.7s ease '+d+'ms, transform 0.7s ease '+d+'ms',
  })

  const gl = (op = 0.06) => ({
    background: 'rgba(255,255,255,'+op+')',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
  })

  return (
    <div className="min-h-screen" style={{background:'#060d1a'}}>
      <Navbar />
      <div className="pt-16">

        {alerte && (
          <Link href="/alertes" className="flex items-center gap-3 px-6 py-3 hover:no-underline hover:opacity-90" style={{background:'#c0392b'}}>
            <AlertTriangle size={14} className="text-white animate-pulse flex-shrink-0" />
            <span className="text-white text-sm font-bold flex-1">Alerte : {alerte.titre}</span>
            <ChevronRight size={14} className="text-white flex-shrink-0" />
          </Link>
        )}

        {/* ══════════════ HERO ══════════════ */}
        <div className="relative overflow-hidden" style={{minHeight:'100vh',background:'linear-gradient(135deg,#060d1a 0%,#0d1b35 50%,#060d1a 100%)'}}>
          {heroImgs.map((img,i) => (
            <div key={i} className="absolute inset-0" style={{opacity:i===imgIndex?0.18:0,transition:'opacity 1.5s ease'}}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}

          {/* Orbs decoratifs */}
          <div className="absolute pointer-events-none" style={{top:'-10%',left:'-5%',width:'500px',height:'500px',borderRadius:'50%',background:'radial-gradient(circle,rgba(212,80,15,0.18),transparent 70%)',filter:'blur(40px)',animation:'float1 8s ease-in-out infinite'}} />
          <div className="absolute pointer-events-none" style={{top:'20%',right:'-5%',width:'400px',height:'400px',borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,0.12),transparent 70%)',filter:'blur(50px)',animation:'float2 10s ease-in-out infinite'}} />
          <div className="absolute pointer-events-none" style={{bottom:'5%',left:'35%',width:'350px',height:'350px',borderRadius:'50%',background:'radial-gradient(circle,rgba(212,80,15,0.1),transparent 70%)',filter:'blur(60px)',animation:'float3 12s ease-in-out infinite'}} />

          <div className="relative max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12" style={{minHeight:'100vh',paddingTop:'5rem',paddingBottom:'4rem'}}>

            {/* TEXTE GAUCHE */}
            <div className="flex-1 z-10" style={{maxWidth:'560px'}}>
              <div className="flex flex-wrap gap-2 mb-8" style={show(0)}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider text-white" style={{background:'var(--orange)',boxShadow:'0 4px 20px rgba(212,80,15,0.5),0 0 0 1px rgba(212,80,15,0.3)'}}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Plateforme securite
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white" style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)'}}>
                  <CheckCircle size={11} style={{color:'#4ade80'}} /> 100% gratuit
                </span>
              </div>

              <h1 style={{...show(80),color:'white',fontSize:'clamp(2.4rem,5.5vw,4.2rem)',fontWeight:900,lineHeight:1.05,letterSpacing:'-0.03em',marginBottom:'1.4rem'}}>
                {hero?.titre || (<>La securite au<br /><span style={{background:'linear-gradient(90deg,var(--orange),#f97316)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>travail accessible</span><br />a tous</>)}
              </h1>

              <p style={{...show(160),color:'rgba(255,255,255,0.6)',fontSize:'1.05rem',lineHeight:1.8,marginBottom:'2rem',maxWidth:'450px'}}>
                {hero?.description_courte || 'Formations certifiees, alertes en temps reel et ressources pratiques pour tous les secteurs.'}
              </p>

              <div className="flex flex-wrap gap-3 mb-10" style={show(240)}>
                <Link href={hero?'/cours/'+hero.slug:'/secteurs'} className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm text-white hover:no-underline overflow-hidden relative" style={{background:'linear-gradient(135deg,var(--orange),#e05f0c)',boxShadow:'0 8px 30px rgba(212,80,15,0.45),0 1px 0 rgba(255,255,255,0.1) inset'}}>
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'linear-gradient(135deg,rgba(255,255,255,0.15),transparent)'}} />
                  {hero?'Voir la formation':'Commencer gratuitement'} <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/secteurs" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm text-white hover:no-underline transition-all" style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',backdropFilter:'blur(10px)'}}>
                  <BookOpen size={14} /> Parcourir
                </Link>
              </div>

              {/* Indicateurs hero */}
              <div className="flex gap-2" style={show(320)}>
                {heroImgs.map((_,i) => (
                  <button key={i} onClick={()=>setImgIndex(i)} style={{height:'3px',width:i===imgIndex?'32px':'8px',background:i===imgIndex?'var(--orange)':'rgba(255,255,255,0.2)',borderRadius:'99px',transition:'all 0.5s ease'}} />
                ))}
              </div>
            </div>

            {/* CARTE 3D HERO DROITE */}
            <div className="flex-1 flex justify-center lg:justify-end z-10 w-full lg:w-auto" style={show(300)}>
              <div style={{width:'100%',maxWidth:'420px',perspective:'1200px'}}>
                <Card3D style={{borderRadius:'28px',overflow:'hidden',boxShadow:'0 40px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.06)',background:'linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))'}}>
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{height:'220px',background:'#0d1b35'}}>
                    {hero?.image_couverture
                      ? <img src={hero.image_couverture} alt="" className="w-full h-full object-cover" style={{opacity:0.7}} />
                      : <img src={heroImgs[imgIndex]} alt="" className="w-full h-full object-cover" style={{opacity:0.5}} />}
                    <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(6,13,26,0.9) 0%,transparent 60%)'}} />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black text-white" style={{background:'var(--orange)',boxShadow:'0 4px 12px rgba(212,80,15,0.5)'}}>A la une</span>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full" style={{background:'rgba(0,0,0,0.5)',backdropFilter:'blur(10px)'}}>
                      <Star size={11} style={{color:'#facc15'}} fill="#facc15" />
                      <span className="text-white text-xs font-bold">4.9</span>
                    </div>
                  </div>
                  {/* Contenu carte */}
                  <div className="p-5" style={{background:'rgba(6,13,26,0.8)',backdropFilter:'blur(20px)'}}>
                    <p className="text-xs font-black uppercase tracking-wider mb-2" style={{color:'var(--orange)'}}>{hero?.secteur_slug?.replace(/-/g,' ') || 'Formation securite'}</p>
                    <h3 className="font-black text-base text-white leading-snug mb-4">{hero?.titre || 'Securite au travail - Fondamentaux'}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-1">
                          {['#4ade80','#60a5fa','#f472b6'].map((c,i) => <div key={i} className="w-6 h-6 rounded-full border-2 border-gray-800" style={{background:c}} />)}
                        </div>
                        <span className="text-xs" style={{color:'rgba(255,255,255,0.5)'}}>+12k apprenants</span>
                      </div>
                      <Link href={hero?'/cours/'+hero.slug:'/secteurs'} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white hover:no-underline" style={{background:'var(--orange)',boxShadow:'0 4px 12px rgba(212,80,15,0.4)'}}>
                        Voir <ArrowRight size={11} />
                      </Link>
                    </div>
                  </div>
                  {/* Stats flotttantes */}
                  <div className="grid grid-cols-3 divide-x" style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                    {[{v:'500+',l:'Cours'},{v:'18',l:'Secteurs'},{v:'24/7',l:'Alertes'}].map((s,i) => (
                      <div key={i} className="py-3 text-center" style={{background:'rgba(6,13,26,0.6)'}}>
                        <div className="text-sm font-black text-white">{s.v}</div>
                        <div className="text-[10px]" style={{color:'rgba(255,255,255,0.4)'}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </Card3D>

                {/* Badge flottant */}
                <div className="absolute -bottom-4 -left-4 hidden lg:flex items-center gap-3 px-4 py-3 rounded-2xl" style={{...gl(0.08),boxShadow:'0 16px 40px rgba(0,0,0,0.4)',animation:'float1 6s ease-in-out infinite'}}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(74,222,128,0.15)'}}>
                    <CheckCircle size={18} style={{color:'#4ade80'}} />
                  </div>
                  <div>
                    <div className="text-white text-xs font-black">Certification</div>
                    <div style={{color:'rgba(255,255,255,0.5)',fontSize:'10px'}}>Reconnue en Afrique</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
            <div className="text-white text-xs font-medium" style={{letterSpacing:'0.15em'}}>SCROLL</div>
            <div className="w-px h-12 overflow-hidden" style={{background:'rgba(255,255,255,0.15)'}}>
              <div className="w-full h-1/2 bg-white" style={{animation:'scrollLine 1.5s ease-in-out infinite'}} />
            </div>
          </div>
        </div>

        {/* ══════════════ TICKER ══════════════ */}
        <div className="border-y overflow-hidden" style={{borderColor:'rgba(255,255,255,0.06)',background:'rgba(255,255,255,0.02)'}}>
          <div className="flex items-stretch">
            <div className="flex-shrink-0 flex items-center px-6 py-3 border-r" style={{borderColor:'rgba(255,255,255,0.06)'}}>
              <span className="font-black text-xs uppercase tracking-widest" style={{color:'var(--orange)'}}>Secteurs</span>
            </div>
            <div className="overflow-hidden flex-1 py-3 px-4">
              <div className="flex gap-8 items-center" style={{animation:'scroll 22s linear infinite',whiteSpace:'nowrap',width:'max-content'}}>
                {[...SECTEURS,...SECTEURS].map((s,i) => (
                  <Link key={i} href={'/secteurs/'+s.slug} className="inline-flex items-center gap-2 text-xs font-semibold hover:no-underline group flex-shrink-0" style={{color:'rgba(255,255,255,0.4)'}}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0 group-hover:scale-150 transition-transform" style={{background:'var(--orange)'}} />
                    <span className="group-hover:text-orange-400 transition-colors">{s.nom}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════ STATS 3D ══════════════ */}
        <section className="py-16 relative overflow-hidden" style={{background:'linear-gradient(135deg,#0a1628 0%,#0d1b35 50%,#0a1628 100%)'}}>
          <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:'radial-gradient(rgba(212,80,15,0.08) 1px,transparent 1px)',backgroundSize:'32px 32px'}} />
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[
              {icon:BookOpen,val:'500+',label:'Formations disponibles',color:'#f97316',glow:'rgba(249,115,22,0.3)'},
              {icon:Shield,  val:'18',  label:'Secteurs professionnels',color:'#60a5fa',glow:'rgba(96,165,250,0.3)'},
              {icon:Users,   val:'12k+',label:'Apprenants actifs',      color:'#4ade80',glow:'rgba(74,222,128,0.3)'},
              {icon:Bell,    val:'24/7',label:'Alertes en temps reel',  color:'#c084fc',glow:'rgba(192,132,252,0.3)'},
            ].map((s,i) => {
              const Icon = s.icon
              return (
                <Card3D key={i} className="p-6 rounded-3xl text-center relative overflow-hidden cursor-default" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',boxShadow:'0 20px 40px rgba(0,0,0,0.3)'}}>
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{background:'radial-gradient(circle at 50% 0%,'+s.glow+',transparent 70%)'}} />
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'rgba(255,255,255,0.05)',boxShadow:'0 8px 20px '+s.glow+',inset 0 1px 0 rgba(255,255,255,0.1)'}}>
                    <Icon size={24} style={{color:s.color}} />
                  </div>
                  <div style={{color:'white',fontSize:'2rem',fontWeight:900,lineHeight:1,marginBottom:'6px'}}>{s.val}</div>
                  <div style={{color:'rgba(255,255,255,0.55)',fontSize:'12px',fontWeight:600,lineHeight:1.4}}>{s.label}</div>
                </Card3D>
              )
            })}
          </div>
        </section>

        {/* ══════════════ SELECTION 3D ══════════════ */}
        {selection.length > 0 && (
          <section className="py-16 relative" style={{background:'linear-gradient(180deg,#060d1a 0%,#080f1f 100%)'}}>
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-2"><div className="h-px w-8" style={{background:'var(--orange)'}} /><p className="text-xs font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>A la une</p></div>
                  <h2 className="text-3xl font-black" style={{color:'white'}}>Formations en vedette</h2>
                </div>
                <Link href="/secteurs" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-orange-400 hover:no-underline" style={{background:'rgba(212,80,15,0.1)',border:'1px solid rgba(212,80,15,0.2)'}}>Tout voir <ArrowRight size={13} /></Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {selection.slice(0,6).map((c,i) => (
                  <Card3D key={c.id} style={{borderRadius:'24px',overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,0.5)',cursor:'pointer'}}>
                    <Link href={'/cours/'+c.slug} className="block hover:no-underline group">
                      <div className="relative overflow-hidden" style={{height:'180px',background:'#0d1b35'}}>
                        {c.image_couverture
                          ? <img src={c.image_couverture} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" style={{opacity:0.8}} />
                          : <div className="w-full h-full flex items-center justify-center" style={{background:'rgba(255,255,255,0.03)'}}><Shield size={40} style={{color:'rgba(255,255,255,0.1)'}} /></div>}
                        <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(6,13,26,0.95) 0%,rgba(6,13,26,0.3) 60%,transparent 100%)'}} />
                        {i === 0 && <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black text-white uppercase" style={{background:'var(--orange)'}}>Populaire</div>}
                      </div>
                      <div className="p-5" style={{background:'rgba(255,255,255,0.04)',backdropFilter:'blur(10px)',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                        <p className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{color:'var(--orange)'}}>{c.secteur_slug?.replace(/-/g,' ')}</p>
                        <h3 className="font-bold text-sm leading-snug mb-3 text-white group-hover:text-orange-300 transition-colors line-clamp-2">{c.titre}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(n => <Star key={n} size={10} style={{color:'#facc15'}} fill="#facc15" />)}
                            <span className="text-[10px] ml-1" style={{color:'rgba(255,255,255,0.4)'}}>4.9</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold" style={{color:'rgba(255,255,255,0.5)'}}>Gratuit <CheckCircle size={11} style={{color:'#4ade80'}} /></div>
                        </div>
                      </div>
                    </Link>
                  </Card3D>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══════════════ COMMENT CA MARCHE ══════════════ */}
        <section className="py-20 relative overflow-hidden" style={{background:'linear-gradient(135deg,#0a1628,#080f1f)'}}>
          <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:'radial-gradient(rgba(255,255,255,0.02) 1px,transparent 1px)',backgroundSize:'40px 40px'}} />
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-2 mb-3"><div className="h-px w-8" style={{background:'var(--orange)'}} /><p className="text-xs font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>Simple & Efficace</p><div className="h-px w-8" style={{background:'var(--orange)'}} /></div>
              <h2 className="text-3xl font-black text-white">Comment ca marche ?</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 relative">
              <div className="absolute top-1/2 left-1/4 right-1/4 h-px hidden sm:block" style={{background:'linear-gradient(to right,rgba(212,80,15,0.2),rgba(212,80,15,0.5),rgba(212,80,15,0.2))',transform:'translateY(-50%)'}} />
              {[
                {n:'01',icon:BookOpen,titre:'Choisissez votre secteur',desc:'Parcourez nos 9 domaines et selectionnez le secteur qui correspond a votre metier.',color:'#f97316'},
                {n:'02',icon:Play,     titre:'Suivez les formations',  desc:'Regardez les videos, lisez les ressources et progressez a votre propre rythme.',color:'#60a5fa'},
                {n:'03',icon:Shield,   titre:'Protegez vos equipes',   desc:'Appliquez les bonnes pratiques et utilisez les alertes pour prevenir les accidents.',color:'#4ade80'},
              ].map((s,i) => {
                const Icon = s.icon
                return (
                  <Card3D key={i} className="relative p-7 rounded-3xl text-center" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',boxShadow:'0 20px 50px rgba(0,0,0,0.4)'}}>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white" style={{background:'var(--orange)',boxShadow:'0 4px 16px rgba(212,80,15,0.5)'}}>
                      {s.n}
                    </div>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mt-4 mb-5" style={{background:'rgba(255,255,255,0.04)',boxShadow:'0 8px 24px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.08)'}}>
                      <Icon size={26} style={{color:s.color}} />
                    </div>
                    <h3 className="font-black text-base text-white mb-2">{s.titre}</h3>
                    <p className="text-sm leading-relaxed" style={{color:'rgba(255,255,255,0.45)'}}>{s.desc}</p>
                  </Card3D>
                )
              })}
            </div>
          </div>
        </section>

        {/* ══════════════ SECTEURS 3D ══════════════ */}
        <section className="py-16" style={{background:'#060d1a'}}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2"><div className="h-px w-8" style={{background:'var(--orange)'}} /><p className="text-xs font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>9 domaines</p></div>
                <h2 className="text-3xl font-black text-white">Choisissez votre secteur</h2>
              </div>
              <Link href="/secteurs" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-orange-400 hover:no-underline" style={{background:'rgba(212,80,15,0.1)',border:'1px solid rgba(212,80,15,0.2)'}}>Voir tout <ArrowRight size={13} /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {SECTEURS.slice(0,2).map(s => (
                <Card3D key={s.slug} className="sm:col-span-1 lg:col-span-1" style={{borderRadius:'22px',overflow:'hidden',aspectRatio:'1',cursor:'pointer',boxShadow:'0 20px 50px rgba(0,0,0,0.5)'}}>
                  <Link href={'/secteurs/'+s.slug} className="block relative w-full h-full hover:no-underline group" style={{minHeight:'160px'}}>
                    <img src={s.img} alt={s.nom} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.2) 60%,transparent 100%)'}} />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{background:'linear-gradient(135deg,rgba(212,80,15,0.3),rgba(212,80,15,0.1))'}} />
                    <div className="absolute bottom-0 left-0 right-0 p-3.5">
                      <p className="text-white text-xs font-black">{s.nom}</p>
                      <p style={{color:'rgba(255,255,255,0.5)',fontSize:'10px',marginTop:'2px'}}>{s.count} formations</p>
                    </div>
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{background:'var(--orange)'}}><ArrowRight size={12} className="text-white" /></div>
                  </Link>
                </Card3D>
              ))}
              {SECTEURS.slice(2).map(s => (
                <Card3D key={s.slug} style={{borderRadius:'20px',overflow:'hidden',aspectRatio:'1',cursor:'pointer',boxShadow:'0 16px 40px rgba(0,0,0,0.5)'}}>
                  <Link href={'/secteurs/'+s.slug} className="block relative w-full h-full hover:no-underline group" style={{minHeight:'130px'}}>
                    <img src={s.img} alt={s.nom} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0" style={{background:'linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.15) 70%,transparent 100%)'}} />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{background:'rgba(212,80,15,0.2)'}} />
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <p className="text-white text-[11px] font-black">{s.nom}</p>
                    </div>
                  </Link>
                </Card3D>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ VIDEOS 3D ══════════════ */}
        <section className="py-16 relative" style={{background:'linear-gradient(180deg,#080f1f,#060d1a)'}}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2"><div className="h-px w-8" style={{background:'var(--orange)'}} /><p className="text-xs font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>Apprendre en video</p></div>
                <h2 className="text-3xl font-black text-white">Videos de formation</h2>
              </div>
              {videos.length > 0 && <Link href="/secteurs" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-orange-400 hover:no-underline" style={{background:'rgba(212,80,15,0.1)',border:'1px solid rgba(212,80,15,0.2)'}}>Tout voir <ArrowRight size={13} /></Link>}
            </div>
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {videos.slice(0,6).map((v,i) => {
                  const id=ytId(v.youtube_url); const thumb=id?'https://img.youtube.com/vi/'+id+'/mqdefault.jpg':(v.courses as any)?.image_couverture; const cSlug=(v.courses as any)?.slug
                  return (
                    <Card3D key={v.id} style={{borderRadius:'22px',overflow:'hidden',boxShadow:'0 20px 50px rgba(0,0,0,0.5)',cursor:'pointer'}}>
                      <Link href={'/cours/'+cSlug+'?lecon='+v.id} className="block hover:no-underline group">
                        <div className="relative overflow-hidden" style={{aspectRatio:'16/9',background:'#0d1b35'}}>
                          {thumb && <img src={thumb} alt={v.titre} className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105" />}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{background:'rgba(0,0,0,0.4)'}}>
                            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{background:'var(--orange)',boxShadow:'0 8px 24px rgba(212,80,15,0.6)'}}><Play size={20} className="text-white" fill="white" style={{marginLeft:'3px'}} /></div>
                          </div>
                          {v.duree_minutes>0 && <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1.5" style={{background:'rgba(0,0,0,0.75)'}}><Clock size={10}/>{v.duree_minutes}min</div>}
                        </div>
                        <div className="p-5" style={{background:'rgba(255,255,255,0.03)',backdropFilter:'blur(10px)',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                          <p className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{color:'var(--orange)'}}>{(v.courses as any)?.secteur_slug?.replace(/-/g,' ')}</p>
                          <h4 className="font-bold text-sm text-white leading-snug line-clamp-2 group-hover:text-orange-300 transition-colors">{v.titre}</h4>
                        </div>
                      </Link>
                    </Card3D>
                  )
                })}
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                  {VIDEO_PH.map((p,i) => (
                    <div key={i} className="rounded-3xl overflow-hidden opacity-40" style={{border:'1px solid rgba(255,255,255,0.05)'}}>
                      <div className="relative" style={{aspectRatio:'16/9'}}>
                        <img src={p.img} alt="" className="w-full h-full object-cover" style={{filter:'brightness(0.2)'}} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)'}}><Lock size={18} style={{color:'rgba(255,255,255,0.4)'}} /></div>
                          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{color:'rgba(255,255,255,0.4)',background:'rgba(255,255,255,0.05)'}}>Bientot disponible</span>
                        </div>
                      </div>
                      <div className="p-4" style={{background:'rgba(255,255,255,0.03)'}}>
                        <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{color:'rgba(255,255,255,0.3)'}}>{p.secteur}</p>
                        <h4 className="font-bold text-sm" style={{color:'rgba(255,255,255,0.4)'}}>{p.titre}</h4>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="py-12 rounded-3xl text-center" style={{background:'rgba(212,80,15,0.05)',border:'1px solid rgba(212,80,15,0.15)'}}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:'rgba(212,80,15,0.1)'}}><Play size={24} style={{color:'var(--orange)'}} /></div>
                  <h3 className="font-black text-lg text-white mb-2">Videos de formation a venir</h3>
                  <p className="text-sm mb-6 max-w-sm mx-auto" style={{color:'rgba(255,255,255,0.4)'}}>Notre equipe prepare des contenus video de haute qualite pour chaque secteur.</p>
                  <Link href="/secteurs" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white hover:no-underline" style={{background:'var(--orange)'}}>Explorer les formations <ArrowRight size={14} /></Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════ CTA 3D ══════════════ */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0" style={{background:'linear-gradient(135deg,#b84500 0%,#d4500f 40%,#e8630e 100%)'}} />
          <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:'radial-gradient(rgba(255,255,255,0.06) 1.5px,transparent 1.5px)',backgroundSize:'24px 24px'}} />
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(255,255,255,0.15),transparent 70%)',filter:'blur(40px)'}} />
          <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full pointer-events-none" style={{background:'radial-gradient(circle,rgba(0,0,0,0.3),transparent 70%)',filter:'blur(40px)'}} />
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6 text-xs font-black uppercase tracking-wider text-white" style={{background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.2)'}}>
              <Zap size={12} /> Rejoignez 12 000+ professionnels
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight" style={{textShadow:'0 4px 24px rgba(0,0,0,0.25)'}}>
              La securite commence<br />par la formation
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-md mx-auto">Formations gratuites. Alertes en temps reel. Marketplace EPI certifie.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/secteurs" className="inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl font-black text-sm hover:no-underline transition-all hover:scale-105" style={{background:'white',color:'var(--orange)',boxShadow:'0 12px 40px rgba(0,0,0,0.3),0 0 0 1px rgba(255,255,255,0.5)'}}>
                Commencer maintenant <ArrowRight size={15} />
              </Link>
              <Link href="/alertes" className="inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl font-bold text-sm hover:no-underline text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all">
                <Bell size={15} /> Alertes securite
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════ 3 ACTIONS 3D ══════════════ */}
        <section className="py-16" style={{background:'linear-gradient(180deg,#060d1a,#080f1f)'}}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-2"><div className="h-px w-8" style={{background:'var(--orange)'}} /><p className="text-xs font-black uppercase tracking-widest" style={{color:'var(--orange)'}}>Notre plateforme</p><div className="h-px w-8" style={{background:'var(--orange)'}} /></div>
              <h2 className="text-3xl font-black text-white">Tout ce dont vous avez besoin</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                {icon:BookOpen,titre:'Formations gratuites',desc:'Acces libre a des centaines de formations certifiees pour chaque secteur professionnel.',href:'/secteurs',cta:'Explorer',glow:'rgba(249,115,22,0.15)',color:'#f97316'},
                {icon:Bell,    titre:'Alertes securite',    desc:'Notifications en temps reel des incidents, risques et nouvelles reglementations.',href:'/alertes',cta:'Voir les alertes',glow:'rgba(239,68,68,0.15)',color:'#ef4444'},
                {icon:Shield,  titre:'Marketplace EPI',    desc:'Equipements de protection certifies disponibles pour toutes les industries.',href:'/marketplace',cta:'Acceder',glow:'rgba(34,197,94,0.15)',color:'#22c55e'},
              ].map((item,i) => {
                const Icon = item.icon
                return (
                  <Card3D key={i} style={{borderRadius:'28px',overflow:'hidden',boxShadow:'0 24px 60px rgba(0,0,0,0.5)',cursor:'pointer'}}>
                    <Link href={item.href} className="block p-7 hover:no-underline group relative" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)'}}>
                      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{background:'radial-gradient(circle at 50% 0%,'+item.glow+',transparent 60%)'}} />
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative" style={{background:'rgba(255,255,255,0.04)',boxShadow:'0 8px 20px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.08)'}}>
                        <Icon size={26} style={{color:item.color}} />
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{boxShadow:'0 0 20px '+item.glow}} />
                      </div>
                      <h3 className="font-black text-lg text-white mb-3 group-hover:text-orange-300 transition-colors">{item.titre}</h3>
                      <p className="text-sm leading-relaxed mb-6" style={{color:'rgba(255,255,255,0.4)',lineHeight:'1.75'}}>{item.desc}</p>
                      <div className="inline-flex items-center gap-2 text-sm font-black group-hover:gap-3 transition-all" style={{color:'var(--orange)'}}>
                        {item.cta} <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </Card3D>
                )
              })}
            </div>
          </div>
        </section>

      </div>

      <style>{`
        @keyframes scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
        @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-25px)} }
        @keyframes scrollLine { 0%{transform:translateY(-100%)} 100%{transform:translateY(200%)} }
      `}</style>

      <Footer />
    </div>
  )
}
