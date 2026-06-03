'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SECTEURS } from '@/lib/secteurs-data'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, FileText, BookOpen, Play, CheckSquare, Square, Volume2, Share2, Lock, Download, Image as ImgIcon, Clock, Users } from 'lucide-react'

interface Mod {
  id: number; numero: string; titre: string; slug: string
  libre: boolean; types: string[]; youtubeId: string | null
  docs: string[]; duree: string; vues: number
}

const MODS: Mod[] = [
  { id:1, numero:'01', titre:'Introduction et fondamentaux',                       slug:'module-introduction',   libre:true,  types:['text'],                    youtubeId:null,           docs:[],                                    duree:'20 min', vues:2341 },
  { id:2, numero:'02', titre:'Équipements de protection individuelle (EPI)',       slug:'module-epi',            libre:false, types:['video','document','image'], youtubeId:'jNQXAC9IVRw',  docs:['Guide EPI complet.pdf'],              duree:'35 min', vues:1892 },
  { id:3, numero:'03', titre:'Identification et évaluation des risques',          slug:'module-risques',        libre:false, types:['text','document'],          youtubeId:null,           docs:['Modèle DUER.pdf','Fiche risques.pdf'], duree:'25 min', vues:1654 },
  { id:4, numero:'04', titre:'Gestion des situations d urgence',                  slug:'module-urgence',        libre:false, types:['video','text','image'],     youtubeId:'jNQXAC9IVRw',  docs:[],                                    duree:'40 min', vues:987  },
  { id:5, numero:'05', titre:'Prévention des accidents du travail',               slug:'module-prevention',     libre:false, types:['video','text'],             youtubeId:'jNQXAC9IVRw',  docs:[],                                    duree:'30 min', vues:1543 },
  { id:6, numero:'06', titre:'Réglementation et obligations légales',             slug:'module-reglementation', libre:false, types:['document','text'],          youtubeId:null,           docs:['Code travail HSE.pdf'],               duree:'45 min', vues:876  },
  { id:7, numero:'07', titre:'Ergonomie et prévention des TMS',                   slug:'module-ergonomie',      libre:false, types:['video','image','text'],     youtubeId:'jNQXAC9IVRw',  docs:[],                                    duree:'28 min', vues:1120 },
  { id:8, numero:'08', titre:'Méthodes avancées d analyse des accidents',         slug:'module-analyse',        libre:false, types:['video','document','text'],  youtubeId:'jNQXAC9IVRw',  docs:['Méthode RCAT.pdf'],                  duree:'55 min', vues:654  },
]

const IMGS: Record<string,string> = {
  'construction-btp':         'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
  'industrie-manufacturiere': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80',
  'sante-medical':            'https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200&q=80',
  'agriculture':              'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80',
  'transport-logistique':     'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=80',
  'mines-carrieres':          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80',
  'energie':                  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&q=80',
  'chimie-pharmacie':         'https://images.unsplash.com/photo-1616400619175-5beda3a17896?w=1200&q=80',
  'bureaux-tertiaire':        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
  'restauration-hotellerie':  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
  'commerce-distribution':    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1200&q=80',
  'education-formation':      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80',
  'sport-loisirs':            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
  'numerique-it':             'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
  'maritime-peche':           'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=1200&q=80',
  'aerien':                   'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80',
  'foret-environnement':      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80',
  'securite-defense':         'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80',
}

const TYPE_META: Record<string,{icon:any,label:string,color:string}> = {
  video:    { icon:Play,     label:'Vidéo',    color:'#ef4444' },
  document: { icon:FileText, label:'Document', color:'#3b82f6' },
  image:    { icon:ImgIcon,  label:'Images',   color:'#8b5cf6' },
  text:     { icon:BookOpen, label:'Cours',    color:'#22c55e' },
}

export default function ModulePage() {
  const params  = useParams()
  const slug    = params.slug   as string
  const modSlug = params.module as string

  const secteur = SECTEURS.find(s => s.slug === slug)
  const modIdx  = MODS.findIndex(m => m.slug === modSlug)
  const mod     = MODS[modIdx]
  const prev    = MODS[modIdx - 1]
  const next    = MODS[modIdx + 1]

  const [user,           setUser]           = useState<any>(null)
  const [authLoading,    setAuthLoading]    = useState(true)
  const [objChecked,     setObjChecked]     = useState(false)
  const [objTexte,       setObjTexte]       = useState('')
  const [dateTerminee,   setDateTerminee]   = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setAuthLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  if (!secteur || !mod) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-main)'}}>
      <div style={{textAlign:'center'}}>
        <p style={{color:'var(--text-secondary)',marginBottom:'16px'}}>Module introuvable</p>
        <Link href={`/secteurs/${slug}`} style={{padding:'10px 24px',borderRadius:'12px',background:'var(--orange)',color:'white',textDecoration:'none',fontWeight:700}}>Retour</Link>
      </div>
    </div>
  )

  const img      = IMGS[slug]
  const c        = secteur.couleur
  const hasAccess = mod.libre || !!user
  const decouvrir = MODS.filter(m => m.slug !== modSlug).slice(0, 3)

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar />

      {/* ══ HERO ══ */}
      <div style={{paddingTop:'64px'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',height:'220px',overflow:'hidden'}}>
          <div style={{position:'relative',overflow:'hidden'}}>
            {img ? <img src={img} alt={secteur.nom} style={{width:'100%',height:'100%',objectFit:'cover',filter:'brightness(0.55) saturate(0.7)'}}/>
                 : <div style={{width:'100%',height:'100%',background:`linear-gradient(135deg,${c}30,#0a1628)`}}/>}
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to right,transparent 60%,rgba(6,13,26,0.5))'}}/>
          </div>
          <div style={{background:`linear-gradient(135deg,${c},${c}bb)`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'8px',position:'relative'}}>
            <span style={{fontSize:'4rem',fontWeight:900,color:'white',lineHeight:1,letterSpacing:'-0.04em'}}>{mod.numero}</span>
            <div style={{width:'40px',height:'3px',background:'rgba(255,255,255,0.45)',borderRadius:'99px'}}/>
            {!mod.libre && (
              <div style={{position:'absolute',top:'10px',right:'10px',display:'flex',alignItems:'center',gap:'4px',padding:'4px 8px',borderRadius:'8px',fontSize:'10px',fontWeight:700,color:'white',background:'rgba(0,0,0,0.3)'}}>
                <Lock size={10}/> Membres
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ CORPS ══ */}
      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 24px',display:'grid',gridTemplateColumns:'1fr 300px',gap:'48px',alignItems:'start'}}>

        {/* CONTENU GAUCHE */}
        <article style={{paddingTop:'36px',paddingBottom:'96px'}}>

          {/* Fil d ariane */}
          <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'var(--text-secondary)',marginBottom:'20px',flexWrap:'wrap'}}>
            <Link href="/secteurs" style={{color:'var(--text-secondary)',textDecoration:'none'}}>Secteurs</Link>
            <ChevronRight size={12}/>
            <Link href={`/secteurs/${slug}`} style={{color:'var(--text-secondary)',textDecoration:'none'}}>{secteur.nom}</Link>
            <ChevronRight size={12}/>
            <span style={{color:'var(--text-primary)',fontWeight:600}}>Leçon {mod.numero}</span>
          </div>

          {/* Label + titre */}
          <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.15em',color:c,margin:'0 0 8px 0'}}>Leçon {mod.numero}</p>
          <h1 style={{fontSize:'clamp(1.5rem,3vw,2.3rem)',fontWeight:900,color:'var(--text-primary)',margin:'0 0 16px 0',lineHeight:1.15}}>{mod.titre}</h1>

          {/* Badges type de contenu */}
          <div style={{display:'flex',gap:'6px',marginBottom:'20px',flexWrap:'wrap'}}>
            {mod.types.map(t => {
              const meta = TYPE_META[t]
              const Icon = meta.icon
              return (
                <span key={t} style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'4px 10px',borderRadius:'8px',fontSize:'11px',fontWeight:700,color:meta.color,background:meta.color+'15',border:'1px solid '+meta.color+'25'}}>
                  <Icon size={11}/>{meta.label}
                </span>
              )
            })}
            <span style={{marginLeft:'auto',display:'inline-flex',alignItems:'center',gap:'4px',fontSize:'11px',color:'var(--text-secondary)'}}>
              <Clock size={11}/>{mod.duree} · <Users size={11}/>{mod.vues.toLocaleString()} vues
            </span>
          </div>

          {/* Boutons édition */}
          <div style={{display:'flex',gap:'8px',marginBottom:'36px',flexWrap:'wrap'}}>
            <button style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'7px 14px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-secondary)',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
              <FileText size={13}/> Édition numérique
            </button>
            <button style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'7px 14px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-secondary)',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
              <FileText size={13}/> Édition imprimée
            </button>
          </div>

          {/* ── INTRO (toujours visible) ── */}
          <p style={{fontSize:'1rem',lineHeight:1.9,color:'var(--text-secondary)',marginBottom:'24px'}}>
            Chaque jour, des millions de travailleurs prennent des risques sans en être pleinement conscients. La sécurité au travail ne s&apos;improvise pas — elle s&apos;apprend, se pratique et devient une culture au quotidien. Ce module vous donne les bases essentielles pour protéger votre vie et celle de vos collègues.
          </p>

          {/* ══ AUTH GATE pour modules protégés ══ */}
          {!hasAccess && !authLoading && (
            <div style={{position:'relative',marginTop:'8px'}}>
              {/* Aperçu flouté */}
              <div style={{filter:'blur(5px)',pointerEvents:'none',userSelect:'none',maxHeight:'180px',overflow:'hidden',opacity:0.5}}>
                <h2 style={{fontSize:'1.1rem',fontWeight:900,color:c,margin:'0 0 12px 0'}}>1. Pourquoi la sécurité au travail est-elle essentielle ?</h2>
                <p style={{fontSize:'1rem',lineHeight:1.9,color:'var(--text-secondary)'}}>La sécurité au travail protège la santé et la vie des travailleurs. Elle a aussi un impact économique majeur : un accident grave coûte en moyenne 40 000€ à une entreprise...</p>
                <p style={{fontSize:'1rem',lineHeight:1.9,color:'var(--text-secondary)'}}>Travailler dans un environnement sûr améliore la productivité, la motivation et la fidélisation des employés. Les entreprises qui investissent...</p>
              </div>
              {/* Gradient */}
              <div style={{position:'absolute',inset:0,background:`linear-gradient(to bottom, transparent 0%, var(--bg-main) 70%)`}}/>
              {/* Gate card */}
              <div style={{position:'relative',zIndex:2,display:'flex',justifyContent:'center',paddingTop:'16px'}}>
                <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'24px',padding:'36px 32px',textAlign:'center',maxWidth:'420px',width:'100%',boxShadow:'0 24px 64px rgba(0,0,0,0.15)'}}>
                  <div style={{width:'56px',height:'56px',borderRadius:'18px',background:c+'20',border:'1px solid '+c+'30',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px auto'}}>
                    <Lock size={24} style={{color:c}}/>
                  </div>
                  <h3 style={{fontSize:'1.2rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 10px 0'}}>Module réservé aux membres</h3>
                  <p style={{fontSize:'14px',color:'var(--text-secondary)',margin:'0 0 24px 0',lineHeight:1.7}}>
                    Créez un compte <strong style={{color:'var(--text-primary)'}}>gratuit</strong> pour accéder à tous les modules de formation, sans limitation.
                  </p>
                  <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                    <Link href="/inscription" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',padding:'13px 24px',borderRadius:'14px',fontSize:'14px',fontWeight:700,color:'white',textDecoration:'none',background:c,boxShadow:'0 6px 20px '+c+'40'}}>
                      Créer un compte gratuit
                    </Link>
                    <Link href="/connexion" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',padding:'13px 24px',borderRadius:'14px',fontSize:'14px',fontWeight:700,color:'var(--text-primary)',textDecoration:'none',background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
                      J&apos;ai déjà un compte — Se connecter
                    </Link>
                  </div>
                  <p style={{fontSize:'11px',color:'var(--text-secondary)',margin:'16px 0 0 0'}}>
                    Le module d&apos;introduction est accessible gratuitement sans compte.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ══ CONTENU COMPLET (si accès) ══ */}
          {hasAccess && (
            <>
              {/* Section 1 */}
              <h2 style={{fontSize:'1.1rem',fontWeight:900,color:c,margin:'0 0 14px 0',paddingTop:'8px',borderTop:'1px solid var(--border)'}}>
                1. Pourquoi la sécurité au travail est-elle essentielle ?
              </h2>
              <p style={{fontSize:'1rem',lineHeight:1.9,color:'var(--text-secondary)',marginBottom:'20px'}}>
                La sécurité au travail protège la santé et la vie des travailleurs. Elle a aussi un impact économique majeur : un accident grave coûte en moyenne 40 000€ à une entreprise, sans compter les pertes humaines et les traumatismes durables sur les équipes.
              </p>

              {/* Vidéo embarquée (si disponible) */}
              {mod.youtubeId && mod.types.includes('video') && (
                <div style={{marginBottom:'32px',borderRadius:'16px',overflow:'hidden',border:'1px solid var(--border)'}}>
                  <div style={{padding:'10px 14px',background:'var(--bg-card)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:'6px'}}>
                    <Play size={13} style={{color:'#ef4444'}}/>
                    <span style={{fontSize:'12px',fontWeight:700,color:'var(--text-secondary)'}}>Vidéo de formation — regardez avant de continuer</span>
                  </div>
                  <div style={{position:'relative',paddingBottom:'56.25%',height:0,background:'#000'}}>
                    <iframe
                      src={`https://www.youtube.com/embed/${mod.youtubeId}?rel=0&modestbranding=1`}
                      title={mod.titre}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}}
                    />
                  </div>
                </div>
              )}

              {/* Image embarquée (si disponible) */}
              {mod.types.includes('image') && (
                <div style={{marginBottom:'32px',borderRadius:'16px',overflow:'hidden',border:'1px solid var(--border)'}}>
                  <img src={img || `https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80`} alt={mod.titre} style={{width:'100%',height:'220px',objectFit:'cover'}}/>
                  <div style={{padding:'10px 16px',background:'var(--bg-card)',borderTop:'1px solid var(--border)'}}>
                    <p style={{fontSize:'12px',color:'var(--text-secondary)',margin:0,fontStyle:'italic'}}>Illustration pratique — {secteur.nom}</p>
                  </div>
                </div>
              )}

              {/* Section 2 */}
              <h2 style={{fontSize:'1.1rem',fontWeight:900,color:c,margin:'0 0 14px 0',paddingTop:'8px',borderTop:'1px solid var(--border)'}}>
                2. Les principales causes d&apos;accidents du travail
              </h2>
              <p style={{fontSize:'1rem',lineHeight:1.9,color:'var(--text-secondary)',marginBottom:'20px'}}>
                Les accidents ne surviennent jamais par hasard. Ils résultent d&apos;une combinaison de facteurs : humains (négligence, fatigue, manque de formation), organisationnels (procédures absentes ou mal appliquées) et techniques (matériels défectueux ou inadaptés).
              </p>

              {/* Bloc citation */}
              <div style={{marginBottom:'32px',padding:'18px 22px',borderRadius:'12px',background:c+'10',borderLeft:'4px solid '+c}}>
                <p style={{fontSize:'1rem',lineHeight:1.8,color:'var(--text-primary)',margin:0,fontStyle:'italic',fontWeight:500}}>
                  &laquo; La sécurité n&apos;est pas une priorité parmi d&apos;autres — c&apos;est une condition préalable à toute activité professionnelle. &raquo;
                </p>
                <p style={{fontSize:'12px',color:c,fontWeight:700,margin:'8px 0 0 0'}}>— Directive-cadre européenne 89/391/CEE</p>
              </div>

              {/* Section 3 */}
              <h2 style={{fontSize:'1.1rem',fontWeight:900,color:c,margin:'0 0 14px 0',paddingTop:'8px',borderTop:'1px solid var(--border)'}}>
                3. Comment agir au quotidien ?
              </h2>
              <ul style={{margin:'0 0 32px 0',paddingLeft:'22px',display:'flex',flexDirection:'column',gap:'10px'}}>
                {['Inspecter votre poste de travail en début de journée',
                  'Porter systématiquement les EPI adaptés à vos tâches',
                  'Participer activement aux exercices d urgence',
                  'Signaler toute dégradation de matériel ou condition dangereuse',
                  'Ne jamais contourner une procédure de sécurité, même sous pression'
                ].map((item, i) => (
                  <li key={i} style={{fontSize:'14px',color:'var(--text-secondary)',lineHeight:1.7}}>{item}</li>
                ))}
              </ul>

              {/* Approfondissons */}
              <div style={{marginBottom:'40px',padding:'24px',borderRadius:'16px',background:'var(--bg-card)',border:'1px solid var(--border)',borderLeft:'4px solid '+c}}>
                <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.15em',color:'var(--text-secondary)',margin:'0 0 12px 0'}}>Approfondissons</p>
                <p style={{fontSize:'14px',lineHeight:1.8,color:'var(--text-secondary)',margin:0}}>
                  Réfléchissons ensemble à votre contexte professionnel. Quels risques identifiez-vous dans votre secteur ? Comment pouvez-vous contribuer à une meilleure culture de sécurité dans votre équipe ? Les prochains modules vous donneront des outils concrets pour y répondre.
                </p>
              </div>

              {/* Documents (si disponibles) */}
              {mod.docs.length > 0 && (
                <div style={{marginBottom:'36px'}}>
                  <p style={{fontSize:'12px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text-secondary)',margin:'0 0 12px 0'}}>Documents du module</p>
                  <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                    {mod.docs.map((doc, i) => (
                      <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-card)'}}>
                        <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'rgba(239,68,68,0.12)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <FileText size={16} style={{color:'#ef4444'}}/>
                        </div>
                        <span style={{flex:1,fontSize:'13px',fontWeight:600,color:'var(--text-primary)'}}>{doc}</span>
                        <button style={{display:'flex',alignItems:'center',gap:'5px',padding:'6px 12px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-secondary)',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
                          <Download size={12}/>PDF
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fin de leçon */}
              <div style={{marginTop:'48px',padding:'24px',borderRadius:'16px',background:'var(--bg-card)',border:'1px solid var(--border)'}}>
                <p style={{fontSize:'12px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text-secondary)',margin:'0 0 12px 0'}}>Leçon terminée le</p>
                <input type="date" value={dateTerminee} onChange={e=>setDateTerminee(e.target.value)}
                  style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'14px',marginBottom:'20px',boxSizing:'border-box'}}/>
                <div style={{padding:'18px',borderRadius:'12px',background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
                  <p style={{fontSize:'14px',fontWeight:900,color:'var(--text-primary)',margin:'0 0 12px 0'}}>Mon objectif</p>
                  <label style={{display:'flex',alignItems:'flex-start',gap:'10px',cursor:'pointer',marginBottom:'10px'}}>
                    <button onClick={()=>setObjChecked(!objChecked)} style={{background:'none',border:'none',padding:0,cursor:'pointer',marginTop:'1px',flexShrink:0}}>
                      {objChecked ? <CheckSquare size={18} style={{color:c}}/> : <Square size={18} style={{color:'var(--text-secondary)'}}/>}
                    </button>
                    <span style={{fontSize:'13px',color:'var(--text-secondary)',lineHeight:1.6}}>Commencer le module suivant cette semaine.</span>
                  </label>
                  <textarea value={objTexte} onChange={e=>setObjTexte(e.target.value)} placeholder="Autre objectif..."
                    style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-main)',color:'var(--text-primary)',fontSize:'13px',resize:'vertical',minHeight:'72px',boxSizing:'border-box',fontFamily:'inherit'}}/>
                </div>
              </div>
            </>
          )}

          {/* Navigation Précédent / Suivant */}
          <div style={{display:'flex',justifyContent:'space-between',marginTop:'40px',gap:'16px',flexWrap:'wrap'}}>
            {prev ? (
              <Link href={`/secteurs/${slug}/${prev.slug}`}
                style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 20px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-primary)',textDecoration:'none',fontSize:'13px',fontWeight:700}}>
                <ChevronLeft size={16}/> Précédent
              </Link>
            ) : <div/>}
            {next && (
              <Link href={`/secteurs/${slug}/${next.slug}`}
                style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 20px',borderRadius:'12px',background:c,color:'white',textDecoration:'none',fontSize:'13px',fontWeight:700,boxShadow:'0 4px 16px '+c+'40'}}>
                {next.libre ? '' : <Lock size={12}/>}
                Suivant — {next.titre.substring(0,30)}... <ChevronRight size={16}/>
              </Link>
            )}
          </div>

          {/* ══ À DÉCOUVRIR AUSSI ══ */}
          <div style={{marginTop:'56px',paddingTop:'32px',borderTop:'1px solid var(--border)'}}>
            <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.15em',color:'var(--text-secondary)',margin:'0 0 16px 0'}}>À découvrir aussi</p>
            <div style={{display:'flex',flexDirection:'column',gap:'1px',border:'1px solid var(--border)',borderRadius:'14px',overflow:'hidden'}}>
              {decouvrir.map(m => (
                <Link key={m.id} href={`/secteurs/${slug}/${m.slug}`} style={{display:'flex',alignItems:'center',gap:'16px',padding:'14px 16px',background:'var(--bg-card)',textDecoration:'none',transition:'background 0.2s',borderBottom:'1px solid var(--border)'}}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg-secondary)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='var(--bg-card)'}>
                  <div style={{width:'48px',height:'36px',borderRadius:'8px',background:c+'20',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontSize:'13px',fontWeight:900,color:c}}>{m.numero}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 2px 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.titre}</p>
                    <div style={{display:'flex',gap:'6px'}}>
                      {m.types.slice(0,2).map(t => {
                        const meta = TYPE_META[t]; const Icon = meta.icon
                        return <span key={t} style={{display:'inline-flex',alignItems:'center',gap:'3px',fontSize:'10px',color:meta.color}}><Icon size={9}/>{meta.label}</span>
                      })}
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'11px',fontWeight:700,flexShrink:0,color:m.libre?'#22c55e':'var(--text-secondary)'}}>
                    {m.libre ? 'Gratuit' : <><Lock size={10}/>Membre</>}
                    <ChevronRight size={12} style={{color:c}}/>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </article>

        {/* ══ SIDEBAR ══ */}
        <aside style={{paddingTop:'36px',position:'sticky',top:'80px'}}>

          {/* Miniature secteur */}
          <div style={{borderRadius:'14px',overflow:'hidden',border:'1px solid var(--border)',marginBottom:'20px'}}>
            <div style={{height:'110px',position:'relative',background:c+'20'}}>
              {img && <img src={img} alt={secteur.nom} style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.45}}/>}
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 100%)'}}/>
              <div style={{position:'absolute',bottom:'10px',left:'12px',right:'12px'}}>
                <p style={{color:'white',fontSize:'12px',fontWeight:900,margin:0}}>{secteur.nom}</p>
                <p style={{color:'rgba(255,255,255,0.55)',fontSize:'10px',margin:'2px 0 0 0'}}>Leçon {mod.numero} / {MODS.length}</p>
              </div>
            </div>
          </div>

          {/* Téléchargement */}
          <div style={{padding:'14px',borderRadius:'14px',border:'1px solid var(--border)',background:'var(--bg-card)',marginBottom:'16px'}}>
            <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text-secondary)',margin:'0 0 10px 0'}}>Téléchargement</p>
            <div style={{display:'flex',gap:'6px'}}>
              {[{icon:FileText,label:'PDF'},{icon:Volume2,label:'Audio'},{icon:Share2,label:'Partager'}].map(({icon:Icon,label}) => (
                <button key={label} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'5px',padding:'10px 6px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',cursor:'pointer',transition:'all 0.2s'}}
                  onMouseEnter={e=>Object.assign((e.currentTarget as HTMLElement).style,{borderColor:c,background:c+'10'})}
                  onMouseLeave={e=>Object.assign((e.currentTarget as HTMLElement).style,{borderColor:'var(--border)',background:'var(--bg-secondary)'})}>
                  <Icon size={16} style={{color:'var(--text-secondary)'}}/>
                  <span style={{fontSize:'10px',fontWeight:600,color:'var(--text-secondary)'}}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Table des matières */}
          <div style={{borderRadius:'14px',border:'1px solid var(--border)',background:'var(--bg-card)',overflow:'hidden'}}>
            <div style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text-secondary)',margin:0}}>Table des matières</p>
              <BookOpen size={13} style={{color:'var(--text-secondary)'}}/>
            </div>
            <div style={{maxHeight:'380px',overflowY:'auto'}}>
              {MODS.map(m => {
                const isActive = m.slug === modSlug
                return (
                  <Link key={m.id} href={`/secteurs/${slug}/${m.slug}`}
                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderBottom:'1px solid var(--border)',textDecoration:'none',background:isActive?c+'15':'transparent',transition:'background 0.2s'}}
                    onMouseEnter={e=>{ if(!isActive)(e.currentTarget as HTMLElement).style.background='var(--bg-secondary)' }}
                    onMouseLeave={e=>{ if(!isActive)(e.currentTarget as HTMLElement).style.background='transparent' }}>
                    <span style={{width:'26px',height:'26px',borderRadius:'8px',background:isActive?c+'30':'var(--bg-secondary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:900,color:isActive?c:'var(--text-secondary)',flexShrink:0}}>
                      {m.numero}
                    </span>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:'12px',fontWeight:isActive?700:500,color:isActive?'var(--text-primary)':'var(--text-secondary)',margin:0,lineHeight:1.35,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {m.titre}
                      </p>
                    </div>
                    {!m.libre && <Lock size={10} style={{color:'var(--text-secondary)',flexShrink:0,opacity:0.5}}/>}
                  </Link>
                )
              })}
            </div>
          </div>

        </aside>
      </div>

      <Footer />
    </div>
  )
}