'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SECTEURS } from '@/lib/secteurs-data'
import { Play, FileText, Image, BookOpen, ArrowLeft, Clock, ChevronRight, Shield, Users, Star, Filter, CheckCircle } from 'lucide-react'

const IMGS: Record<string,string> = {
  'construction-btp':         'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=80',
  'industrie-manufacturiere': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400&q=80',
  'sante-medical':            'https://images.unsplash.com/photo-1584515933487-779824d29309?w=1400&q=80',
  'agriculture':              'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1400&q=80',
  'transport-logistique':     'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1400&q=80',
  'mines-carrieres':          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1400&q=80',
  'energie':                  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1400&q=80',
  'chimie-pharmacie':         'https://images.unsplash.com/photo-1616400619175-5beda3a17896?w=1400&q=80',
  'bureaux-tertiaire':        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80',
  'restauration-hotellerie':  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=80',
  'commerce-distribution':    'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1400&q=80',
  'education-formation':      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1400&q=80',
  'sport-loisirs':            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80',
  'numerique-it':             'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=80',
  'maritime-peche':           'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=1400&q=80',
  'aerien':                   'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=80',
  'foret-environnement':      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&q=80',
  'securite-defense':         'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1400&q=80',
}

type NiveauType = 'Debutant'|'Intermediaire'|'Avance'
type ContentType = 'video'|'document'|'image'|'text'

interface Module {
  id: number
  numero: string
  titre: string
  description: string
  niveau: NiveauType
  duree: string
  types: ContentType[]
  vues: number
  slug: string
}

const NIVEAUX_COLOR: Record<NiveauType,string> = {
  Debutant:     '#22c55e',
  Intermediaire:'#f59e0b',
  Avance:       '#ef4444',
}

const TYPE_ICONS: Record<ContentType,any> = {
  video:    Play,
  document: FileText,
  image:    Image,
  text:     BookOpen,
}

const TYPE_LABELS: Record<ContentType,string> = {
  video:    'Vidéo',
  document: 'Document',
  image:    'Images',
  text:     'Cours texte',
}

const MOCK_MODULES: Module[] = [
  { id:1,  numero:'01', titre:'Introduction et fondamentaux de la sécurité',        description:'Les bases essentielles de la sécurité au travail, réglementation et obligations de l employeur et du salarié.',                                         niveau:'Debutant',     duree:'20 min', types:['video','text'],           vues:2341, slug:'module-introduction' },
  { id:2,  numero:'02', titre:'Équipements de protection individuelle (EPI)',        description:'Identification, utilisation et entretien des EPI adaptés à chaque risque. Choisir le bon équipement selon la situation.',                                   niveau:'Debutant',     duree:'35 min', types:['video','document','image'], vues:1892, slug:'module-epi' },
  { id:3,  numero:'03', titre:'Identification et évaluation des risques',           description:'Méthodes d analyse des risques professionnels, construction du document unique d évaluation (DUER) et plans d action.',                                       niveau:'Debutant',     duree:'25 min', types:['text','document'],         vues:1654, slug:'module-risques' },
  { id:4,  numero:'04', titre:'Gestion des situations d urgence',                   description:'Procédures d urgence, évacuation, premiers secours et gestion de crise. Pratique des gestes qui sauvent.',                                                   niveau:'Intermediaire', duree:'40 min', types:['video','text','image'],   vues:987,  slug:'module-urgence' },
  { id:5,  numero:'05', titre:'Prévention des accidents du travail',                description:'Analyse des causes d accidents, mise en place de mesures préventives et culture de la sécurité en entreprise.',                                               niveau:'Intermediaire', duree:'30 min', types:['video','text'],           vues:1543, slug:'module-prevention' },
  { id:6,  numero:'06', titre:'Réglementation et obligations légales',              description:'Cadre juridique de la sécurité au travail, rôle du CHSCT, inspections du travail et sanctions en cas de manquement.',                                        niveau:'Intermediaire', duree:'45 min', types:['document','text'],         vues:876,  slug:'module-reglementation' },
  { id:7,  numero:'07', titre:'Ergonomie et prévention des TMS',                    description:'Troubles musculo-squelettiques, gestes et postures adaptés, aménagement du poste de travail pour réduire les risques.',                                      niveau:'Intermediaire', duree:'28 min', types:['video','image','text'],   vues:1120, slug:'module-ergonomie' },
  { id:8,  numero:'08', titre:'Méthodes avancées d analyse des accidents',          description:'Arbre des causes, méthode RCAT, retour d expérience et mise en place d un système de management de la sécurité (SMS).',                                      niveau:'Avance',       duree:'55 min', types:['video','document','text'], vues:654,  slug:'module-analyse' },
]

export default function SecteurPage() {
  const params = useParams()
  const slug = params.slug as string
  const secteur = SECTEURS.find(s => s.slug === slug)
  const [filtre, setFiltre] = useState<'tous'|NiveauType>('tous')

  if (!secteur) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-main)'}}>
      <div style={{textAlign:'center'}}>
        <p style={{color:'var(--text-secondary)',marginBottom:'16px'}}>Secteur non trouvé</p>
        <Link href="/secteurs" style={{padding:'10px 24px',borderRadius:'12px',background:'var(--orange)',color:'white',textDecoration:'none',fontWeight:700}}>Voir tous les secteurs</Link>
      </div>
    </div>
  )

  const img = IMGS[secteur.slug]
  const filtered = filtre === 'tous' ? MOCK_MODULES : MOCK_MODULES.filter(m => m.niveau === filtre)
  const totalDuree = MOCK_MODULES.reduce((acc, m) => acc + parseInt(m.duree), 0)

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section style={{paddingTop:'64px',position:'relative',overflow:'hidden',minHeight:'340px',display:'flex',alignItems:'flex-end'}}>
        <div style={{position:'absolute',inset:0}}>
          {img
            ? <img src={img} alt={secteur.nom} style={{width:'100%',height:'100%',objectFit:'cover',filter:'brightness(0.28) saturate(0.6)'}}/>
            : <div style={{width:'100%',height:'100%',background:`linear-gradient(135deg,${secteur.couleur}30,#0a1628)`}}/>}
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(6,13,26,1) 0%,rgba(6,13,26,0.55) 60%,rgba(6,13,26,0.2) 100%)'}}/>
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:'4px',background:`linear-gradient(to right,${secteur.couleur},${secteur.couleur}50,transparent)`}}/>
        </div>
        <div style={{position:'relative',maxWidth:'1280px',margin:'0 auto',padding:'40px 24px 44px',width:'100%'}}>
          <Link href="/secteurs" style={{display:'inline-flex',alignItems:'center',gap:'6px',color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,textDecoration:'none',marginBottom:'20px'}}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='white'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.5)'}>
            <ArrowLeft size={14}/> Tous les secteurs
          </Link>
          <div style={{display:'flex',alignItems:'flex-end',gap:'32px',flexWrap:'wrap'}}>
            <div style={{flex:1,minWidth:'280px'}}>
              <div style={{height:'3px',width:'48px',borderRadius:'99px',background:secteur.couleur,marginBottom:'16px'}}/>
              <h1 style={{fontSize:'clamp(1.8rem,4vw,3rem)',fontWeight:900,color:'white',margin:'0 0 12px 0',lineHeight:1.05,letterSpacing:'-0.02em'}}>{secteur.nom}</h1>
              <p style={{fontSize:'1rem',color:'rgba(255,255,255,0.6)',margin:'0 0 16px 0',maxWidth:'560px',lineHeight:1.75}}>{secteur.description}</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                {secteur.risques.map(r => (
                  <span key={r} style={{padding:'4px 12px',borderRadius:'8px',fontSize:'11px',fontWeight:700,color:secteur.couleur,background:secteur.couleur+'22',border:'1px solid '+secteur.couleur+'35'}}>{r}</span>
                ))}
              </div>
            </div>
            <div style={{display:'flex',gap:'16px',flexShrink:0,flexWrap:'wrap'}}>
              {[
                {val:MOCK_MODULES.length,label:'Modules',icon:BookOpen},
                {val:totalDuree+' min',label:'Durée totale',icon:Clock},
                {val:'100%',label:'Gratuit',icon:Shield},
              ].map((s,i) => {
                const Icon = s.icon
                return (
                  <div key={i} style={{padding:'14px 18px',borderRadius:'18px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',backdropFilter:'blur(10px)',textAlign:'center',minWidth:'90px'}}>
                    <Icon size={16} style={{color:secteur.couleur,marginBottom:'6px'}}/>
                    <div style={{fontSize:'1.3rem',fontWeight:900,color:'white',lineHeight:1}}>{s.val}</div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,0.45)',marginTop:'3px'}}>{s.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FILTRES ═══ */}
      <div style={{position:'sticky',top:'64px',zIndex:40,background:'var(--bg-card)',borderBottom:'1px solid var(--border)',backdropFilter:'blur(20px)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'12px 24px',display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',fontWeight:700,color:'var(--text-secondary)',marginRight:'8px'}}>
            <Filter size={13}/> Niveau :
          </div>
          {(['tous','Debutant','Intermediaire','Avance'] as const).map(n => (
            <button key={n} onClick={()=>setFiltre(n)}
              style={{padding:'6px 14px',borderRadius:'99px',fontSize:'12px',fontWeight:700,border:'1px solid',cursor:'pointer',transition:'all 0.2s',
                background: filtre===n ? (n==='tous'?'var(--orange)':NIVEAUX_COLOR[n as NiveauType]) : 'var(--bg-secondary)',
                color: filtre===n ? 'white' : 'var(--text-secondary)',
                borderColor: filtre===n ? (n==='tous'?'var(--orange)':NIVEAUX_COLOR[n as NiveauType]) : 'var(--border)',
              }}>
              {n==='tous' ? 'Tous les modules' : n}
              {n!=='tous' && <span style={{marginLeft:'4px',opacity:0.7}}>({MOCK_MODULES.filter(m=>m.niveau===n).length})</span>}
            </button>
          ))}
          <div style={{marginLeft:'auto',fontSize:'12px',color:'var(--text-secondary)',fontWeight:600}}>
            {filtered.length} module{filtered.length>1?'s':''} disponible{filtered.length>1?'s':''}
          </div>
        </div>
      </div>

      {/* ═══ MODULES ═══ */}
      <main style={{maxWidth:'1280px',margin:'0 auto',padding:'40px 24px 96px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr',gap:'16px'}}>
          {filtered.map((m, i) => {
            const niveauColor = NIVEAUX_COLOR[m.niveau]
            return (
              <Link key={m.id} href={`/secteurs/${slug}/${m.slug}`} style={{textDecoration:'none',display:'block'}}>
                <div className="hover-lift" style={{borderRadius:'20px',border:'1px solid var(--border)',background:'var(--bg-card)',padding:'0',overflow:'hidden',transition:'all 0.3s ease',cursor:'pointer'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=secteur.couleur+'60';(e.currentTarget as HTMLElement).style.transform='translateY(-3px)';(e.currentTarget as HTMLElement).style.boxShadow='0 12px 32px rgba(0,0,0,0.12)'}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--border)';(e.currentTarget as HTMLElement).style.transform='translateY(0)';(e.currentTarget as HTMLElement).style.boxShadow='none'}}>
                  {/* Accent top */}
                  <div style={{height:'3px',background:`linear-gradient(to right,${secteur.couleur},${secteur.couleur}40,transparent)`}}/>

                  <div style={{padding:'20px 24px',display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap'}}>
                    {/* Numéro */}
                    <div style={{width:'52px',height:'52px',borderRadius:'16px',background:secteur.couleur+'18',border:'2px solid '+secteur.couleur+'30',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <span style={{fontSize:'15px',fontWeight:900,color:secteur.couleur}}>{m.numero}</span>
                    </div>

                    {/* Contenu principal */}
                    <div style={{flex:1,minWidth:'200px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px',flexWrap:'wrap'}}>
                        <span style={{padding:'3px 10px',borderRadius:'99px',fontSize:'10px',fontWeight:700,color:niveauColor,background:niveauColor+'18',border:'1px solid '+niveauColor+'30'}}>{m.niveau}</span>
                        {/* Types de contenu */}
                        {m.types.map(t => {
                          const Icon = TYPE_ICONS[t]
                          return (
                            <span key={t} style={{display:'inline-flex',alignItems:'center',gap:'3px',padding:'3px 8px',borderRadius:'6px',fontSize:'10px',fontWeight:600,color:'var(--text-secondary)',background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
                              <Icon size={9}/>{TYPE_LABELS[t]}
                            </span>
                          )
                        })}
                      </div>
                      <h3 style={{fontSize:'15px',fontWeight:900,color:'var(--text-primary)',margin:'0 0 6px 0',lineHeight:1.35}}>{m.titre}</h3>
                      <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:0,lineHeight:1.6,display:'-webkit-box',WebkitLineClamp:1,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{m.description}</p>
                    </div>

                    {/* Méta droite */}
                    <div style={{display:'flex',alignItems:'center',gap:'20px',flexShrink:0}}>
                      <div style={{textAlign:'center'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',fontWeight:600,color:'var(--text-secondary)',marginBottom:'2px'}}>
                          <Clock size={11}/>{m.duree}
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'11px',color:'var(--text-secondary)'}}>
                          <Users size={10}/>{m.vues.toLocaleString()} vues
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 18px',borderRadius:'12px',background:secteur.couleur+'18',border:'1px solid '+secteur.couleur+'30',fontSize:'13px',fontWeight:700,color:secteur.couleur,whiteSpace:'nowrap'}}>
                        Commencer <ChevronRight size={14}/>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Info gratuit */}
        <div style={{marginTop:'32px',padding:'20px 24px',borderRadius:'16px',background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.2)',display:'flex',alignItems:'center',gap:'12px'}}>
          <CheckCircle size={18} style={{color:'#22c55e',flexShrink:0}}/>
          <p style={{fontSize:'14px',color:'var(--text-secondary)',margin:0}}>
            <strong style={{color:'var(--text-primary)'}}>Tous les modules sont gratuits</strong> — Aucune inscription requise. Accès immédiat à tous les contenus (vidéos, documents, images et cours texte).
          </p>
        </div>
      </main>

      {/* ═══ CTA ═══ */}
      <section style={{padding:'56px 0',background:`linear-gradient(135deg,${secteur.couleur}12,${secteur.couleur}04)`,borderTop:'1px solid var(--border)'}}>
        <div style={{maxWidth:'700px',margin:'0 auto',padding:'0 24px',textAlign:'center'}}>
          <h2 style={{fontSize:'1.5rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 10px 0'}}>Explorer d&apos;autres secteurs</h2>
          <p style={{fontSize:'14px',color:'var(--text-secondary)',margin:'0 0 24px 0',lineHeight:1.7}}>
            Think Safety couvre 18 secteurs professionnels avec des ressources gratuites.
          </p>
          <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/secteurs" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 24px',borderRadius:'14px',fontSize:'14px',fontWeight:700,color:'white',textDecoration:'none',background:'var(--orange)'}}>
              Tous les secteurs
            </Link>
            <Link href="/alertes" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 24px',borderRadius:'14px',fontSize:'14px',fontWeight:700,color:'var(--text-primary)',textDecoration:'none',background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
              Alertes sécurité
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}