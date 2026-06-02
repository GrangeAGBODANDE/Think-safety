'use client'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight, Shield, Globe, Users, Heart, Target, Award, CheckCircle, ExternalLink, TrendingUp, Eye } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{background:'var(--bg-main)'}}>
      <Navbar/>

      {/* HERO */}
      <section style={{paddingTop:'96px',paddingBottom:'80px',background:'linear-gradient(135deg,#0a1628 0%,#0d1f3c 100%)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,opacity:0.04,backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',backgroundSize:'56px 56px'}}/>
        <div style={{position:'absolute',top:'-20%',right:'-10%',width:'500px',height:'500px',borderRadius:'50%',background:'radial-gradient(circle,rgba(212,80,15,0.12),transparent 65%)',filter:'blur(60px)'}}/>
        <div style={{maxWidth:'900px',margin:'0 auto',padding:'0 24px',textAlign:'center',position:'relative'}}>
          <span style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'8px 18px',borderRadius:'99px',fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.08em',color:'white',background:'rgba(212,80,15,0.25)',border:'1px solid rgba(212,80,15,0.4)',marginBottom:'28px'}}>
            <Shield size={12}/> Notre histoire
          </span>
          <h1 style={{fontSize:'clamp(2.4rem,5vw,4rem)',fontWeight:900,color:'white',lineHeight:1.05,letterSpacing:'-0.03em',marginBottom:'24px'}}>
            Nee d une conviction :<br/>
            <span style={{background:'linear-gradient(90deg,#fb923c,#f97316)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>chaque vie compte au travail</span>
          </h1>
          <p style={{fontSize:'1.1rem',color:'rgba(255,255,255,0.65)',lineHeight:1.85,maxWidth:'680px',margin:'0 auto 40px auto'}}>
            Think Safety est nee de la rencontre entre des experts de la securite professionnelle et des passionnes de technologie, unis par une meme conviction : la formation en securite au travail doit etre gratuite, accessible et pratique pour tous.
          </p>
          <div style={{display:'flex',justifyContent:'center',gap:'40px',flexWrap:'wrap'}}>
            {[{v:'2024',l:'Annee de creation'},{v:'500+',l:'Ressources gratuites'},{v:'9',l:'Secteurs couverts'},{v:'12k+',l:'Utilisateurs'}].map((s,i)=>(
              <div key={i} style={{textAlign:'center'}}>
                <div style={{fontSize:'2rem',fontWeight:900,color:'white'}}>{s.v}</div>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',marginTop:'4px'}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GENESE */}
      <section style={{padding:'96px 0',background:'var(--bg-main)'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto',padding:'0 24px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'80px',alignItems:'center'}}>
            <div>
              <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--orange)',marginBottom:'16px'}}>La genese du projet</p>
              <h2 style={{fontSize:'clamp(1.8rem,3.5vw,2.8rem)',fontWeight:900,color:'var(--text-primary)',lineHeight:1.1,marginBottom:'24px'}}>
                Un probleme reel. Une reponse concrete.
              </h2>
              <p style={{fontSize:'1rem',color:'var(--text-secondary)',lineHeight:1.85,marginBottom:'20px'}}>
                Face au constat que des milliers de travailleurs sont victimes chaque annee d accidents evitables par manque de formation, <strong style={{color:'var(--text-primary)'}}>Grange AGBODANDE</strong>, ingenieur avec plus de 10 ans d experience en securite EPI, a imagine cette plateforme : rendre la formation securite aussi simple et gratuite qu une recherche sur internet.
              </p>
              <p style={{fontSize:'1rem',color:'var(--text-secondary)',lineHeight:1.85,marginBottom:'20px'}}>
                Il s est entoure d experts du terrain et de la technologie, dont <strong style={{color:'var(--text-primary)'}}>Djlo ALOHOU</strong>, developpeur full-stack et directeur technique, pour concevoir et developper la plateforme.
              </p>
              <p style={{fontSize:'1rem',color:'var(--text-secondary)',lineHeight:1.85,marginBottom:'36px'}}>
                Aujourd hui, Think Safety propose plus de 500 ressources gratuites dans 9 secteurs professionnels, des alertes securite en temps reel et un marketplace d equipements de protection, accessible depuis n importe quel appareil dans le monde.
              </p>
              <div style={{display:'flex',gap:'16px',flexWrap:'wrap'}}>
                <Link href="/secteurs" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 24px',borderRadius:'14px',fontSize:'14px',fontWeight:700,color:'white',textDecoration:'none',background:'var(--orange)'}}>
                  Explorer la plateforme <ArrowRight size={14}/>
                </Link>
                <Link href="/marketplace" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 24px',borderRadius:'14px',fontSize:'14px',fontWeight:700,color:'var(--text-primary)',textDecoration:'none',background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
                  Marketplace EPI
                </Link>
              </div>
            </div>
            <div style={{position:'relative'}}>
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&q=80" alt="Equipe Think Safety" style={{width:'100%',height:'440px',objectFit:'cover',borderRadius:'28px'}}/>
              <div style={{position:'absolute',bottom:'-16px',left:'-16px',padding:'18px 22px',borderRadius:'18px',background:'var(--bg-card)',border:'1px solid var(--border)',boxShadow:'0 12px 32px rgba(0,0,0,0.12)'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{width:'40px',height:'40px',borderRadius:'12px',background:'rgba(212,80,15,0.12)',display:'flex',alignItems:'center',justifyContent:'center'}}><Shield size={18} style={{color:'var(--orange)'}}/></div>
                  <div>
                    <p style={{fontSize:'13px',fontWeight:900,color:'var(--text-primary)',margin:0}}>Mission securite</p>
                    <p style={{fontSize:'11px',color:'var(--text-secondary)',margin:'2px 0 0 0'}}>Gratuit pour tous, partout</p>
                  </div>
                </div>
              </div>
              <div style={{position:'absolute',top:'-16px',right:'-16px',padding:'14px 18px',borderRadius:'16px',background:'var(--orange)',boxShadow:'0 8px 24px rgba(212,80,15,0.4)'}}>
                <div style={{fontSize:'1.8rem',fontWeight:900,color:'white',lineHeight:1}}>10+</div>
                <div style={{fontSize:'10px',color:'rgba(255,255,255,0.85)',marginTop:'2px'}}>ans d experience</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EQUIPE */}
      <section style={{padding:'96px 0',background:'var(--bg-secondary)'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto',padding:'0 24px'}}>
          <div style={{textAlign:'center',marginBottom:'64px'}}>
            <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--orange)',marginBottom:'12px'}}>Les fondateurs</p>
            <h2 style={{fontSize:'clamp(1.8rem,3.5vw,2.8rem)',fontWeight:900,color:'var(--text-primary)',margin:0,lineHeight:1.1}}>Les visages derriere Think Safety</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'32px'}}>

            {/* Grange */}
            <div style={{borderRadius:'28px',overflow:'hidden',border:'1px solid var(--border)',background:'var(--bg-card)',boxShadow:'0 8px 32px rgba(0,0,0,0.08)'}}>
              <div style={{height:'120px',background:'linear-gradient(135deg,rgba(249,115,22,0.2),rgba(249,115,22,0.05))',position:'relative'}}>
                <div style={{position:'absolute',top:'16px',right:'16px',padding:'4px 10px',borderRadius:'99px',fontSize:'10px',fontWeight:900,color:'white',background:'#f97316',textTransform:'uppercase',letterSpacing:'0.06em'}}>Fondateur</div>
                <div style={{width:'90px',height:'90px',borderRadius:'50%',overflow:'hidden',border:'4px solid var(--bg-card)',boxShadow:'0 8px 20px rgba(0,0,0,0.15)',position:'absolute',bottom:'-45px',left:'28px'}}>
                  <img src="/grange.jpg" alt="Grange AGBODANDE" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top center',filter:'brightness(1.05) contrast(1.05)'}}/>
                </div>
              </div>
              <div style={{padding:'56px 28px 28px 28px'}}>
                <h3 style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 4px 0'}}>Grange AGBODANDE</h3>
                <p style={{fontSize:'13px',fontWeight:700,color:'#f97316',margin:'0 0 16px 0'}}>Fondateur & Manager</p>
                <p style={{fontSize:'13px',color:'var(--text-secondary)',lineHeight:1.8,margin:'0 0 20px 0'}}>
                  Ingenieur expert en reseaux et administration de serveurs, Grange cumule plus de 10 ans d experience dans le domaine de la securite EPI et des systemes d information. Passionne par la prevention des risques professionnels, il est le moteur de la creation de Think Safety avec une vision claire : rendre la formation en securite au travail accessible gratuitement a tous, partout dans le monde.
                </p>
                <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'20px'}}>
                  {['Securite EPI','Administration Serveur','Reseaux & Systemes','Gestion de Projet','Formation Pro','Audit Securite'].map((c,j)=>(
                    <span key={j} style={{padding:'4px 10px',borderRadius:'99px',fontSize:'11px',fontWeight:600,color:'#f97316',background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.2)'}}>{c}</span>
                  ))}
                </div>
                <div style={{paddingTop:'16px',borderTop:'1px solid var(--border)'}}>
                  <a href="mailto:contact@thinkssafety.com" style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'8px 14px',borderRadius:'10px',fontSize:'12px',fontWeight:700,color:'#f97316',textDecoration:'none',background:'rgba(249,115,22,0.08)',border:'1px solid rgba(249,115,22,0.2)'}}>
                    <ExternalLink size={12}/>Contacter
                  </a>
                </div>
              </div>
            </div>

            {/* Djlo */}
            <div style={{borderRadius:'28px',overflow:'hidden',border:'1px solid var(--border)',background:'var(--bg-card)',boxShadow:'0 8px 32px rgba(0,0,0,0.08)'}}>
              <div style={{height:'120px',background:'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(59,130,246,0.05))',position:'relative'}}>
                <div style={{position:'absolute',top:'16px',right:'16px',padding:'4px 10px',borderRadius:'99px',fontSize:'10px',fontWeight:900,color:'white',background:'#3b82f6',textTransform:'uppercase',letterSpacing:'0.06em'}}>Tech Lead</div>
                <div style={{width:'90px',height:'90px',borderRadius:'50%',overflow:'hidden',border:'4px solid var(--bg-card)',boxShadow:'0 8px 20px rgba(0,0,0,0.15)',position:'absolute',bottom:'-45px',left:'28px'}}>
                  <img src="/djlo.jpg" alt="Djlo ALOHOU" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top center',filter:'brightness(1.05) contrast(1.05)'}}/>
                </div>
              </div>
              <div style={{padding:'56px 28px 28px 28px'}}>
                <h3 style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 4px 0'}}>Djlo ALOHOU</h3>
                <p style={{fontSize:'13px',fontWeight:700,color:'#3b82f6',margin:'0 0 16px 0'}}>Directeur Technique & Developpeur Full Stack</p>
                <p style={{fontSize:'13px',color:'var(--text-secondary)',lineHeight:1.8,margin:'0 0 20px 0'}}>
                  Developpeur full-stack et expert IoT/FMS, Djlo est le bras technique de Think Safety. Fondateur de DJLOTECH Society et Directeur Technique chez REEXOM SARL, il a concu et developpe la totalite de la plateforme. Son expertise couvre le developpement web, l integration IoT, les Fleet Management Systems (FMS) et l architecture logicielle cloud.
                </p>
                <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'20px'}}>
                  {['Next.js / React','IoT & FMS','Supabase & Cloud','GPS & Teltonika','Architecture API','Securite Web'].map((c,j)=>(
                    <span key={j} style={{padding:'4px 10px',borderRadius:'99px',fontSize:'11px',fontWeight:600,color:'#3b82f6',background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.2)'}}>{c}</span>
                  ))}
                </div>
                <div style={{display:'flex',gap:'8px',paddingTop:'16px',borderTop:'1px solid var(--border)'}}>
                  <a href="https://portfolio-djlo.vercel.app/" target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'8px 14px',borderRadius:'10px',fontSize:'12px',fontWeight:700,color:'#3b82f6',textDecoration:'none',background:'rgba(59,130,246,0.08)',border:'1px solid rgba(59,130,246,0.2)'}}>
                    <ExternalLink size={12}/>Portfolio
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section style={{padding:'96px 0',background:'var(--bg-main)'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto',padding:'0 24px'}}>
          <div style={{textAlign:'center',marginBottom:'60px'}}>
            <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--orange)',marginBottom:'12px'}}>Ce qui nous guide</p>
            <h2 style={{fontSize:'clamp(1.8rem,3.5vw,2.8rem)',fontWeight:900,color:'var(--text-primary)',margin:0,lineHeight:1.1}}>Nos valeurs fondamentales</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'20px'}}>
            {[
              {icon:Heart,  titre:'Accessibilite',  desc:'Toutes nos ressources sont 100% gratuites et disponibles sans inscription. La securite ne devrait pas avoir de prix.',color:'#ef4444'},
              {icon:Globe,  titre:'Universalite',   desc:'Pense pour etre utilise partout dans le monde, dans tous les secteurs et dans toutes les langues.',color:'#3b82f6'},
              {icon:Target, titre:'Pertinence',     desc:'Chaque contenu est valide par des experts du terrain. Rien de generique, des ressources vraiment utiles.',color:'#f97316'},
              {icon:Shield, titre:'Fiabilite',      desc:'Nous veillons a la qualite et a la mise a jour permanente de nos ressources pour garantir une information exacte.',color:'#22c55e'},
            ].map((v,i)=>{const Icon=v.icon;return(
              <div key={i} style={{padding:'28px 22px',borderRadius:'22px',border:'1px solid var(--border)',background:'var(--bg-card)',textAlign:'center'}}>
                <div style={{width:'52px',height:'52px',borderRadius:'16px',background:v.color+'15',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px auto'}}>
                  <Icon size={24} style={{color:v.color}}/>
                </div>
                <h3 style={{fontSize:'1rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 10px 0'}}>{v.titre}</h3>
                <p style={{fontSize:'13px',color:'var(--text-secondary)',lineHeight:1.7,margin:0}}>{v.desc}</p>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section style={{padding:'80px 0',background:'var(--bg-secondary)'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto',padding:'0 24px'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px'}}>
            {[
              {icon:TrendingUp,titre:'Impact mesurable',    desc:'Les utilisateurs qui suivent nos formations rapportent en moyenne 40% de reduction des incidents sur leur lieu de travail.',color:'#22c55e'},
              {icon:Users,     titre:'Communaute active',   desc:'Rejoignez des milliers de professionnels de la securite qui partagent leurs experiences et bonnes pratiques.',color:'#3b82f6'},
              {icon:Eye,       titre:'Suivi de progression',desc:'Visualisez vos avancees, obtenez vos attestations de formation et partagez vos accomplissements.',color:'#a855f7'},
            ].map((item,i)=>{const Icon=item.icon;return(
              <div key={i} style={{padding:'28px',borderRadius:'22px',border:'1px solid var(--border)',background:'var(--bg-card)',display:'flex',gap:'16px',alignItems:'flex-start'}}>
                <div style={{width:'48px',height:'48px',borderRadius:'14px',background:item.color+'15',border:'1px solid '+item.color+'25',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Icon size={22} style={{color:item.color}}/>
                </div>
                <div>
                  <h3 style={{fontSize:'1rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 8px 0'}}>{item.titre}</h3>
                  <p style={{fontSize:'13px',color:'var(--text-secondary)',lineHeight:1.7,margin:0}}>{item.desc}</p>
                </div>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'80px 0',background:'linear-gradient(135deg,#b84500,var(--orange),#e06010)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,opacity:0.07,backgroundImage:'radial-gradient(circle,white 1.5px,transparent 1.5px)',backgroundSize:'24px 24px'}}/>
        <div style={{maxWidth:'700px',margin:'0 auto',padding:'0 24px',textAlign:'center',position:'relative'}}>
          <h2 style={{fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:900,color:'white',margin:'0 0 16px 0',lineHeight:1.1}}>
            Notre objectif : zero accident evitable
          </h2>
          <p style={{fontSize:'1.05rem',color:'rgba(255,255,255,0.85)',margin:'0 0 36px 0',maxWidth:'560px',marginLeft:'auto',marginRight:'auto',lineHeight:1.8}}>
            Chaque formation suivie, c est un risque de moins. Chaque travailleur forme, c est une vie preservee. C est pour cela que Think Safety est et restera toujours gratuit.
          </p>
          <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/secteurs" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'14px 32px',borderRadius:'16px',fontSize:'14px',fontWeight:900,color:'var(--orange)',textDecoration:'none',background:'white',boxShadow:'0 8px 28px rgba(0,0,0,0.2)'}}>
              Trouver une formation <ArrowRight size={15}/>
            </Link>
            <Link href="/alertes" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'14px 28px',borderRadius:'16px',fontSize:'14px',fontWeight:700,color:'white',textDecoration:'none',background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.35)'}}>
              Alertes securite
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section style={{padding:'80px 0',background:'var(--bg-main)'}}>
        <div style={{maxWidth:'700px',margin:'0 auto',padding:'0 24px',textAlign:'center'}}>
          <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--orange)',marginBottom:'12px'}}>Contact</p>
          <h2 style={{fontSize:'clamp(1.8rem,3.5vw,2.6rem)',fontWeight:900,color:'var(--text-primary)',margin:'0 0 16px 0',lineHeight:1.1}}>
            Une question ou une suggestion ?
          </h2>
          <p style={{fontSize:'1rem',color:'var(--text-secondary)',margin:'0 0 32px 0',lineHeight:1.8}}>
            Think Safety est un projet communautaire. Vos retours nous aident a ameliorer la plateforme. Contactez-nous pour partager vos idees, signaler un probleme ou proposer du contenu.
          </p>
          <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
            <a href="mailto:contact@thinkssafety.com" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 24px',borderRadius:'14px',fontSize:'14px',fontWeight:700,color:'white',textDecoration:'none',background:'var(--orange)'}}>
              Nous contacter
            </a>
            <Link href="/marketplace" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 24px',borderRadius:'14px',fontSize:'14px',fontWeight:700,color:'var(--text-primary)',textDecoration:'none',background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
              Devenir partenaire marketplace
            </Link>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  )
}
