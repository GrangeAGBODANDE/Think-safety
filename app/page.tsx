'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight, Bell, AlertTriangle, BookOpen, Shield, ChevronDown } from 'lucide-react'

const Scene3D = dynamic(() => import('@/components/Scene3D'), { ssr: false, loading: () => (
  <div style={{position:'fixed',inset:0,background:'#060d1a',display:'flex',alignItems:'center',justifyContent:'center',zIndex:0}}>
    <div style={{textAlign:'center'}}>
      <div style={{width:'60px',height:'60px',border:'3px solid rgba(212,80,15,0.3)',borderTop:'3px solid #d4500f',borderRadius:'50%',margin:'0 auto 16px',animation:'spin 1s linear infinite'}} />
      <p style={{color:'rgba(255,255,255,0.4)',fontSize:'12px',letterSpacing:'0.1em',textTransform:'uppercase'}}>Chargement de l expérience 3D</p>
    </div>
  </div>
)})

export default function HomePage() {
  const [hero, setHero] = useState<any>(null)
  const [alerte, setAlerte] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from('courses').select('id,slug,titre,description_courte,secteur_slug').eq('statut','published').limit(1)
      if (c?.length) setHero(c[0])
      const { data: a } = await supabase.from('alertes').select('*').eq('statut','active').limit(1)
      if (a?.length) setAlerte(a[0])
      setTimeout(() => setLoaded(true), 400)
    }
    load()
  }, [])

  const fadeStyle = (d = 0) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? 'translateY(0)' : 'translateY(24px)',
    transition: 'opacity 0.8s ease '+d+'ms, transform 0.8s ease '+d+'ms',
  })

  return (
    <div style={{background:'#060d1a',minHeight:'100vh',position:'relative',overflow:'hidden'}}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>

      {/* 3D Canvas en fond */}
      <Scene3D />

      {/* Overlay HTML au-dessus du canvas */}
      <div style={{position:'relative',zIndex:10,pointerEvents:'none'}}>
        <div style={{pointerEvents:'auto'}}>
          <Navbar />
        </div>

        {alerte && (
          <div style={{pointerEvents:'auto',background:'#c0392b',padding:'10px 24px',display:'flex',alignItems:'center',gap:'12px'}}>
            <AlertTriangle size={14} color="white" />
            <span style={{color:'white',fontSize:'14px',fontWeight:700,flex:1}}>Alerte : {alerte.titre}</span>
            <Link href="/alertes" style={{color:'rgba(255,255,255,0.7)',fontSize:'12px',textDecoration:'underline'}}>Voir</Link>
          </div>
        )}

        {/* Contenu hero — côté gauche */}
        <div style={{minHeight:'calc(100vh - 64px)',display:'flex',alignItems:'center',padding:'80px 6% 80px',maxWidth:'580px',pointerEvents:'none'}}>
          <div>
            <div style={{...fadeStyle(0),pointerEvents:'auto'}}>
              <span style={{
                display:'inline-flex',alignItems:'center',gap:'8px',
                background:'var(--orange)',color:'white',
                padding:'8px 18px',borderRadius:'99px',
                fontSize:'11px',fontWeight:900,
                textTransform:'uppercase',letterSpacing:'0.08em',
                marginBottom:'28px',
                boxShadow:'0 4px 24px rgba(212,80,15,0.5)',
              }}>
                <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'white',animation:'pulse 1.2s ease-in-out infinite'}} />
                Plateforme de formation
              </span>
            </div>

            <h1 style={{...fadeStyle(80),color:'white',fontSize:'clamp(2.4rem,5vw,4.2rem)',fontWeight:900,lineHeight:1.05,letterSpacing:'-0.03em',marginBottom:'20px',pointerEvents:'auto'}}>
              {hero?.titre || (<>La securite au<br /><span style={{background:'linear-gradient(90deg,#f97316,#d4500f)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>travail en 3D</span><br />pour tous</>)}
            </h1>

            <p style={{...fadeStyle(160),color:'rgba(255,255,255,0.6)',fontSize:'1.05rem',lineHeight:1.8,marginBottom:'32px',maxWidth:'420px',pointerEvents:'auto'}}>
              Deplacez votre souris pour explorer les secteurs autour de vous. Attrappez les cartes, interagissez avec l'espace.
            </p>

            <div style={{...fadeStyle(240),display:'flex',gap:'12px',flexWrap:'wrap',pointerEvents:'auto'}}>
              <Link href="/secteurs" style={{
                display:'inline-flex',alignItems:'center',gap:'8px',
                background:'var(--orange)',color:'white',
                padding:'14px 30px',borderRadius:'18px',
                fontWeight:900,fontSize:'14px',textDecoration:'none',
                boxShadow:'0 8px 30px rgba(212,80,15,0.5)',
                transition:'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='scale(1.05)'; (e.currentTarget as HTMLElement).style.boxShadow='0 12px 40px rgba(212,80,15,0.6)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow='0 8px 30px rgba(212,80,15,0.5)' }}
              >
                Explorer les formations <ArrowRight size={15} />
              </Link>
              <Link href="/marketplace" style={{
                display:'inline-flex',alignItems:'center',gap:'8px',
                color:'rgba(255,255,255,0.85)',
                padding:'14px 28px',borderRadius:'18px',
                fontWeight:700,fontSize:'14px',textDecoration:'none',
                background:'rgba(255,255,255,0.06)',
                border:'1px solid rgba(255,255,255,0.12)',
                transition:'all 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.06)' }}
              >
                <Shield size={14} /> Marketplace EPI
              </Link>
              <Link href="/alertes" style={{
                display:'inline-flex',alignItems:'center',gap:'8px',
                color:'rgba(255,255,255,0.7)',
                padding:'14px 24px',borderRadius:'18px',
                fontWeight:700,fontSize:'14px',textDecoration:'none',
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.08)',
              }}>
                <Bell size={14} /> Alertes
              </Link>
            </div>
          </div>
        </div>

        {/* Hint bas de page */}
        <div style={{position:'fixed',bottom:'28px',left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',opacity:0.35,pointerEvents:'none'}}>
          <span style={{color:'white',fontSize:'9px',letterSpacing:'0.2em',textTransform:'uppercase'}}>Bougez votre souris</span>
          <div style={{width:'1px',height:'36px',background:'linear-gradient(to bottom,rgba(212,80,15,0.8),transparent)'}} />
        </div>

        {/* Liens navigation rapide — côté droit */}
        <div style={{position:'fixed',right:'28px',top:'50%',transform:'translateY(-50%)',display:'flex',flexDirection:'column',gap:'10px',zIndex:20,pointerEvents:'auto'}}>
          {[
            {href:'/secteurs',icon:BookOpen,label:'Formations'},
            {href:'/alertes',icon:Bell,label:'Alertes'},
            {href:'/marketplace',icon:Shield,label:'EPI'},
          ].map((item,i) => {
            const Icon = item.icon
            return (
              <Link key={i} href={item.href} title={item.label} style={{
                width:'44px',height:'44px',borderRadius:'14px',
                display:'flex',alignItems:'center',justifyContent:'center',
                background:'rgba(255,255,255,0.06)',
                border:'1px solid rgba(255,255,255,0.1)',
                color:'rgba(255,255,255,0.6)',
                backdropFilter:'blur(12px)',
                transition:'all 0.2s ease',
                textDecoration:'none',
              }}
              onMouseEnter={e => { Object.assign((e.currentTarget as HTMLElement).style, {background:'rgba(212,80,15,0.3)',borderColor:'rgba(212,80,15,0.5)',color:'white'}) }}
              onMouseLeave={e => { Object.assign((e.currentTarget as HTMLElement).style, {background:'rgba(255,255,255,0.06)',borderColor:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)'}) }}
              >
                <Icon size={18} />
              </Link>
            )
          })}
        </div>

      </div>
    </div>
  )
}
