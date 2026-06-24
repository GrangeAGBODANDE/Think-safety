'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CheckCircle, Building2, Award, ChevronRight, Shield, BookOpen, Star, Zap, Lock, ArrowRight } from 'lucide-react'

const MARKETPLACE_PLANS = [
  {
    id: 'starter',
    nom: 'Starter',
    desc: 'Idéal pour débuter sur la marketplace',
    prix_mensuel: 15000,
    prix_annuel: 150000,
    couleur: '#3b82f6',
    features: [
      '5 annonces produits actives',
      'Fiche produit standard',
      'Accès au catalogue acheteurs',
      'Support par email',
      'Statistiques de base',
    ],
    non_inclus: [
      'Mise en avant prioritaire',
      'Fiche produit enrichie',
      'Badge "Vendeur certifié"',
    ],
  },
  {
    id: 'professionnel',
    nom: 'Professionnel',
    desc: 'Pour les entreprises actives',
    prix_mensuel: 35000,
    prix_annuel: 350000,
    couleur: '#D4500F',
    badge: 'Le plus populaire',
    features: [
      '25 annonces produits actives',
      'Fiche produit enrichie (specs, images, docs)',
      'Mise en avant dans les résultats',
      'Badge "Vendeur vérifié"',
      'Statistiques avancées',
      'Support prioritaire',
      'Lien vers votre site web',
    ],
    non_inclus: [
      'Espace entreprise dédié',
      'API d\'intégration catalogue',
    ],
  },
  {
    id: 'entreprise',
    nom: 'Entreprise',
    desc: 'Solution complète pour grands comptes',
    prix_mensuel: 75000,
    prix_annuel: 700000,
    couleur: '#8b5cf6',
    features: [
      'Annonces illimitées',
      'Espace entreprise personnalisé',
      'Fiche produit Teltonika-style (specs complètes)',
      'Badge "Partenaire officiel"',
      'API d\'intégration catalogue',
      'Account manager dédié',
      'Rapport mensuel de performance',
      'Formation équipe commerciale incluse',
    ],
    non_inclus: [],
  },
]

const CERTIF_SECTEURS = [
  { nom: 'Construction & BTP',          prix: 25000, icon: '🏗️', couleur: '#FF6B35' },
  { nom: 'Santé & Médical',             prix: 30000, icon: '🏥', couleur: '#00C896' },
  { nom: 'Industrie Manufacturière',    prix: 25000, icon: '⚙️', couleur: '#6C63FF' },
  { nom: 'Transport & Logistique',      prix: 20000, icon: '🚛', couleur: '#FF9800' },
  { nom: 'Énergie (Pétrole, Gaz)',      prix: 35000, icon: '⚡', couleur: '#FFD700' },
  { nom: 'Chimie & Pharmacie',          prix: 30000, icon: '🧪', couleur: '#E91E63' },
  { nom: 'Mines & Carrières',           prix: 35000, icon: '⛏️', couleur: '#795548' },
  { nom: 'Agriculture & Élevage',       prix: 20000, icon: '🌾', couleur: '#8BC34A' },
]

function formatPrix(p: number) {
  return p.toLocaleString('fr-FR') + ' F CFA'
}

export default function AbonnementsPage() {
  const [billing, setBilling] = useState<'mensuel'|'annuel'>('mensuel')
  const [tab, setTab] = useState<'marketplace'|'certifications'>('marketplace')

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>

      {/* ══ HERO ══ */}
      <section style={{paddingTop:'96px',paddingBottom:'64px',background:'linear-gradient(135deg,#0a1628 0%,#0d1f3c 100%)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,opacity:0.04,backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',backgroundSize:'56px 56px'}}/>
        <div style={{position:'absolute',top:'-20%',right:'-10%',width:'500px',height:'500px',borderRadius:'50%',background:'radial-gradient(circle,rgba(212,80,15,0.1),transparent 65%)',filter:'blur(60px)'}}/>

        <div style={{maxWidth:'800px',margin:'0 auto',padding:'0 24px',textAlign:'center',position:'relative'}}>
          <span style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'7px 16px',borderRadius:'99px',fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.08em',color:'white',background:'rgba(212,80,15,0.2)',border:'1px solid rgba(212,80,15,0.35)',marginBottom:'20px'}}>
            <Shield size={11}/> Plans & Abonnements
          </span>
          <h1 style={{fontSize:'clamp(2rem,5vw,3.5rem)',fontWeight:900,color:'white',lineHeight:1.05,letterSpacing:'-0.03em',margin:'0 0 16px 0'}}>
            Deux façons de s&apos;engager
          </h1>
          <p style={{fontSize:'1rem',color:'rgba(255,255,255,0.6)',maxWidth:'580px',margin:'0 auto 32px',lineHeight:1.75}}>
            Les formations sont <strong style={{color:'white'}}>100% gratuites</strong> pour tous. Les abonnements concernent uniquement les entreprises marketplace et les certifications professionnelles.
          </p>

          {/* Tabs */}
          <div style={{display:'inline-flex',background:'rgba(255,255,255,0.06)',borderRadius:'14px',padding:'4px',border:'1px solid rgba(255,255,255,0.1)'}}>
            <button onClick={()=>setTab('marketplace')}
              style={{padding:'10px 24px',borderRadius:'10px',fontSize:'13px',fontWeight:700,border:'none',cursor:'pointer',transition:'all 0.2s',
                background: tab==='marketplace' ? 'var(--orange)' : 'transparent',
                color:      tab==='marketplace' ? 'white'         : 'rgba(255,255,255,0.6)',
                boxShadow:  tab==='marketplace' ? '0 4px 14px rgba(212,80,15,0.4)' : 'none',
              }}>
              <Building2 size={13} style={{display:'inline',marginRight:'6px',verticalAlign:'middle'}}/>
              Marketplace Entreprises
            </button>
            <button onClick={()=>setTab('certifications')}
              style={{padding:'10px 24px',borderRadius:'10px',fontSize:'13px',fontWeight:700,border:'none',cursor:'pointer',transition:'all 0.2s',
                background: tab==='certifications' ? '#8b5cf6' : 'transparent',
                color:      tab==='certifications' ? 'white'   : 'rgba(255,255,255,0.6)',
                boxShadow:  tab==='certifications' ? '0 4px 14px rgba(139,92,246,0.4)' : 'none',
              }}>
              <Award size={13} style={{display:'inline',marginRight:'6px',verticalAlign:'middle'}}/>
              Certifications
            </button>
          </div>
        </div>
      </section>

      <main style={{maxWidth:'1200px',margin:'0 auto',padding:'64px 24px 96px'}}>

        {/* ══ TAB MARKETPLACE ══ */}
        {tab === 'marketplace' && (
          <>
            {/* Info */}
            <div style={{textAlign:'center',marginBottom:'48px'}}>
              <h2 style={{fontSize:'1.5rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 12px 0'}}>Publiez vos produits EPI sur Think Safety</h2>
              <p style={{fontSize:'15px',color:'var(--text-secondary)',maxWidth:'600px',margin:'0 auto 24px',lineHeight:1.7}}>
                Rejoignez la marketplace de référence pour les équipements de sécurité en Afrique de l&apos;Ouest. Touchez des milliers de professionnels HSE.
              </p>

              {/* Toggle mensuel/annuel */}
              <div style={{display:'inline-flex',alignItems:'center',gap:'12px',padding:'8px 16px',borderRadius:'12px',background:'var(--bg-card)',border:'1px solid var(--border)'}}>
                <button onClick={()=>setBilling('mensuel')}
                  style={{padding:'6px 16px',borderRadius:'8px',fontSize:'13px',fontWeight:700,border:'none',cursor:'pointer',
                    background: billing==='mensuel' ? 'var(--orange)' : 'transparent',
                    color:      billing==='mensuel' ? 'white'         : 'var(--text-secondary)'}}>
                  Mensuel
                </button>
                <button onClick={()=>setBilling('annuel')}
                  style={{padding:'6px 16px',borderRadius:'8px',fontSize:'13px',fontWeight:700,border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',
                    background: billing==='annuel' ? 'var(--orange)' : 'transparent',
                    color:      billing==='annuel' ? 'white'         : 'var(--text-secondary)'}}>
                  Annuel
                  <span style={{fontSize:'10px',padding:'2px 6px',borderRadius:'5px',background:'rgba(34,197,94,0.15)',color:'#22c55e',fontWeight:900}}>-17%</span>
                </button>
              </div>
            </div>

            {/* Plans */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:'24px',marginBottom:'48px'}}>
              {MARKETPLACE_PLANS.map(plan => {
                const prix = billing==='mensuel' ? plan.prix_mensuel : plan.prix_annuel
                const isPopular = !!plan.badge
                return (
                  <div key={plan.id} style={{borderRadius:'24px',border:`2px solid ${isPopular ? plan.couleur : 'var(--border)'}`,background:'var(--bg-card)',overflow:'hidden',position:'relative',transition:'all 0.3s'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-4px)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='translateY(0)'}>
                    {/* Accent top */}
                    <div style={{height:'4px',background:`linear-gradient(to right,${plan.couleur},${plan.couleur}60)`}}/>
                    {isPopular && (
                      <div style={{position:'absolute',top:'20px',right:'20px',padding:'4px 12px',borderRadius:'99px',background:plan.couleur,color:'white',fontSize:'10px',fontWeight:900}}>
                        ⭐ {plan.badge}
                      </div>
                    )}
                    <div style={{padding:'28px'}}>
                      <h3 style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 6px 0'}}>{plan.nom}</h3>
                      <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:'0 0 20px 0'}}>{plan.desc}</p>
                      <div style={{marginBottom:'24px'}}>
                        <span style={{fontSize:'2.2rem',fontWeight:900,color:'var(--text-primary)'}}>{formatPrix(prix)}</span>
                        <span style={{fontSize:'13px',color:'var(--text-secondary)',marginLeft:'6px'}}>/ {billing==='mensuel'?'mois':'an'}</span>
                        {billing==='annuel' && <div style={{fontSize:'11px',color:'#22c55e',fontWeight:600,marginTop:'4px'}}>Soit {formatPrix(Math.round(plan.prix_annuel/12))} / mois</div>}
                      </div>

                      <Link href="/connexion"
                        style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',padding:'12px',borderRadius:'14px',fontSize:'14px',fontWeight:700,color:'white',textDecoration:'none',marginBottom:'24px',
                          background: plan.couleur,
                          boxShadow: `0 4px 16px ${plan.couleur}40`}}>
                        Souscrire <ChevronRight size={14}/>
                      </Link>

                      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                        {plan.features.map((f,i) => (
                          <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'8px',fontSize:'13px',color:'var(--text-secondary)'}}>
                            <CheckCircle size={14} style={{color:'#22c55e',flexShrink:0,marginTop:'1px'}}/>
                            {f}
                          </div>
                        ))}
                        {plan.non_inclus.map((f,i) => (
                          <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'8px',fontSize:'13px',color:'var(--text-secondary)',opacity:0.4}}>
                            <div style={{width:'14px',height:'14px',borderRadius:'50%',border:'1.5px solid var(--border)',flexShrink:0,marginTop:'1px'}}/>
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Comment ça marche */}
            <div style={{padding:'40px',borderRadius:'24px',background:'var(--bg-card)',border:'1px solid var(--border)',marginBottom:'32px'}}>
              <h3 style={{fontSize:'1.1rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 24px 0',textAlign:'center'}}>Comment rejoindre la marketplace ?</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'20px'}}>
                {[
                  {n:'01', title:'Créez votre compte', desc:'Inscrivez-vous gratuitement sur Think Safety en tant que particulier.', icon:'👤'},
                  {n:'02', title:'Choisissez un plan', desc:'Sélectionnez le plan marketplace adapté à votre volume de ventes.', icon:'📋'},
                  {n:'03', title:'Complétez votre profil entreprise', desc:'Renseignez les informations de votre entreprise et vos certifications.', icon:'🏢'},
                  {n:'04', title:'Publiez vos produits', desc:'Ajoutez vos EPI avec fiches techniques complètes et commencez à vendre.', icon:'🚀'},
                ].map(s => (
                  <div key={s.n} style={{textAlign:'center',padding:'20px'}}>
                    <div style={{fontSize:'2rem',marginBottom:'8px'}}>{s.icon}</div>
                    <div style={{fontSize:'10px',fontWeight:900,color:'var(--orange)',marginBottom:'6px',letterSpacing:'0.1em'}}>ÉTAPE {s.n}</div>
                    <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 6px 0'}}>{s.title}</p>
                    <p style={{fontSize:'12px',color:'var(--text-secondary)',margin:0,lineHeight:1.6}}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA contact */}
            <div style={{padding:'32px',borderRadius:'20px',background:`linear-gradient(135deg,rgba(212,80,15,0.12),rgba(212,80,15,0.04))`,border:'1px solid rgba(212,80,15,0.25)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'16px'}}>
              <div>
                <p style={{fontSize:'15px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 4px 0'}}>Vous avez des questions sur les abonnements ?</p>
                <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:0}}>Notre équipe vous répond sous 24h pour vous accompagner dans votre démarche.</p>
              </div>
              <a href="mailto:contact@thinkssafety.com"
                style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'11px 22px',borderRadius:'13px',background:'var(--orange)',color:'white',textDecoration:'none',fontSize:'13px',fontWeight:700,boxShadow:'0 4px 14px rgba(212,80,15,0.3)',whiteSpace:'nowrap'}}>
                Nous contacter <ArrowRight size={13}/>
              </a>
            </div>
          </>
        )}

        {/* ══ TAB CERTIFICATIONS ══ */}
        {tab === 'certifications' && (
          <>
            {/* Info */}
            <div style={{textAlign:'center',marginBottom:'48px'}}>
              <div style={{width:'60px',height:'60px',borderRadius:'20px',background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.25)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
                <Award size={28} style={{color:'#8b5cf6'}}/>
              </div>
              <h2 style={{fontSize:'1.5rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 12px 0'}}>Certifications professionnelles</h2>
              <p style={{fontSize:'15px',color:'var(--text-secondary)',maxWidth:'640px',margin:'0 auto',lineHeight:1.75}}>
                Tous les cours sont <strong style={{color:'var(--text-primary)'}}>gratuits</strong>. La certification est optionnelle et payante — elle valide officiellement vos compétences en sécurité professionnelle par secteur d&apos;activité.
              </p>
            </div>

            {/* Parcours */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'16px',marginBottom:'48px'}}>
              {[
                {step:'1',icon:'📚',title:'Suivez les cours gratuitement',desc:'Accédez à tous les modules de votre secteur sans payer. Apprenez à votre rythme, sur n\'importe quel appareil.',color:'#22c55e'},
                {step:'2',icon:'✅',title:'Complétez tous les modules',desc:'Terminez l\'ensemble des modules du secteur pour débloquer l\'accès à la certification.',color:'var(--orange)'},
                {step:'3',icon:'🏆',title:'Passez et obtenez votre certificat',desc:'Payez la certification, passez l\'examen en ligne et recevez votre certificat numérique reconnu.',color:'#8b5cf6'},
              ].map(s => (
                <div key={s.step} style={{padding:'24px',borderRadius:'18px',border:'1px solid var(--border)',background:'var(--bg-card)',textAlign:'center',position:'relative'}}>
                  <div style={{position:'absolute',top:'16px',right:'16px',width:'24px',height:'24px',borderRadius:'50%',background:s.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:900,color:s.color}}>
                    {s.step}
                  </div>
                  <div style={{fontSize:'2.5rem',marginBottom:'12px'}}>{s.icon}</div>
                  <h3 style={{fontSize:'14px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 8px 0'}}>{s.title}</h3>
                  <p style={{fontSize:'12px',color:'var(--text-secondary)',margin:0,lineHeight:1.6}}>{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Secteurs avec prix */}
            <h3 style={{fontSize:'1.1rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 20px 0'}}>Certifications disponibles par secteur</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'14px',marginBottom:'40px'}}>
              {CERTIF_SECTEURS.map(s => (
                <div key={s.nom} style={{borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)',padding:'18px 20px',display:'flex',alignItems:'center',gap:'14px',transition:'all 0.2s'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=s.couleur+'50';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.transform='translateY(0)'}}>
                  <div style={{width:'44px',height:'44px',borderRadius:'12px',background:s.couleur+'15',border:'1px solid '+s.couleur+'25',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',flexShrink:0}}>
                    {s.icon}
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 3px 0'}}>{s.nom}</p>
                    <p style={{fontSize:'11px',color:'var(--text-secondary)',margin:0,display:'flex',alignItems:'center',gap:'4px'}}>
                      <Lock size={9}/> Après completion gratuite des modules
                    </p>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:'14px',fontWeight:900,color:s.couleur}}>{formatPrix(s.prix)}</div>
                    <div style={{fontSize:'10px',color:'var(--text-secondary)'}}>certification</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Badge Microsoft-style */}
            <div style={{padding:'40px',borderRadius:'24px',background:'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(139,92,246,0.03))',border:'1px solid rgba(139,92,246,0.2)',marginBottom:'32px',textAlign:'center'}}>
              <div style={{fontSize:'3rem',marginBottom:'16px'}}>🎓</div>
              <h3 style={{fontSize:'1.2rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 12px 0'}}>Des certifications qui comptent</h3>
              <p style={{fontSize:'14px',color:'var(--text-secondary)',maxWidth:'560px',margin:'0 auto 24px',lineHeight:1.8}}>
                Inspirées du modèle Microsoft Learn, nos certifications attestent de vos compétences sectorielles en sécurité professionnelle. Elles sont partageables sur LinkedIn, téléchargeables en PDF et vérifiables en ligne.
              </p>
              <div style={{display:'flex',flexWrap:'wrap',gap:'12px',justifyContent:'center'}}>
                {['Badge numérique vérifiable','PDF officiel Think Safety','Partage LinkedIn intégré','QR code d\'authenticité','Valable 2 ans'].map((f,i) => (
                  <span key={i} style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'6px 14px',borderRadius:'99px',fontSize:'12px',fontWeight:600,color:'#8b5cf6',background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)'}}>
                    <CheckCircle size={11}/>{f}
                  </span>
                ))}
              </div>
            </div>

            {/* Disponible bientôt */}
            <div style={{padding:'24px 32px',borderRadius:'16px',background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.2)',display:'flex',alignItems:'center',gap:'16px'}}>
              <Zap size={20} style={{color:'#f59e0b',flexShrink:0}}/>
              <div>
                <p style={{fontSize:'14px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 4px 0'}}>Certifications — Disponibles prochainement</p>
                <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:0}}>
                  Le système de certification est en cours de développement. En attendant, suivez les cours gratuitement et soyez parmi les premiers certifiés à son lancement.
                </p>
              </div>
              <Link href="/secteurs" style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'10px 18px',borderRadius:'11px',background:'#f59e0b',color:'white',textDecoration:'none',fontSize:'13px',fontWeight:700,whiteSpace:'nowrap',flexShrink:0}}>
                Commencer <ChevronRight size={13}/>
              </Link>
            </div>
          </>
        )}

      </main>
      <Footer/>
    </div>
  )
}