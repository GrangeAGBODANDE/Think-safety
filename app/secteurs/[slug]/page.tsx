'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SECTEURS } from '@/lib/secteurs-data'
import { Play, FileText, HelpCircle, ChevronRight, ChevronDown, ArrowLeft, Download, Clock, Eye, BookOpen, Shield } from 'lucide-react'

const IMGS: Record<string, string> = {
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

const MOCK_VIDEOS = [
  { id: 1, titre: 'Introduction a la securite - Les fondamentaux', duree: '18 min', niveau: 'Debutant', vues: 2341, color: '#22c55e' },
  { id: 2, titre: 'Les equipements de protection individuelle', duree: '24 min', niveau: 'Debutant', vues: 1892, color: '#22c55e' },
  { id: 3, titre: 'Gestion des risques sur le terrain', duree: '31 min', niveau: 'Intermediaire', vues: 987, color: '#f59e0b' },
  { id: 4, titre: 'Procedures urgence et evacuation', duree: '20 min', niveau: 'Intermediaire', vues: 1543, color: '#f59e0b' },
  { id: 5, titre: 'Analyse des accidents - Methodes avancees', duree: '42 min', niveau: 'Avance', vues: 654, color: '#ef4444' },
]

const MOCK_DOCS = [
  { id: 1, titre: 'Guide complet EPI', pages: 42, taille: '2.1 MB', type: 'PDF' },
  { id: 2, titre: 'Fiche reflexe urgences', pages: 4, taille: '0.3 MB', type: 'PDF' },
  { id: 3, titre: 'Check-list inspection securite', pages: 8, taille: '0.5 MB', type: 'PDF' },
  { id: 4, titre: 'Procedure evacuation incendie', pages: 12, taille: '0.8 MB', type: 'PDF' },
]

const MOCK_FAQ = [
  { id: 1, q: 'Quels EPI sont obligatoires dans ce secteur ?', r: 'Les EPI obligatoires varient selon les risques identifies. En general : casque, chaussures de securite, gilet haute visibilite, gants adaptes et protection oculaire selon les taches.' },
  { id: 2, q: 'A quelle frequence faire les formations securite ?', r: 'Formation initiale a l embauche, recyclage annuel ou bisannuel selon les risques, et formation specifique a chaque changement de poste.' },
  { id: 3, q: 'Comment rediger un document unique d evaluation des risques ?', r: 'Le DUER doit identifier tous les risques, les evaluer selon frequence et gravite, definir les mesures de prevention et etre mis a jour au moins une fois par an.' },
  { id: 4, q: 'Que faire en cas d accident du travail ?', r: 'Alerter les secours, prodiguer les premiers secours, securiser la zone, prevenir le superieur hierarchique, rediger le registre des accidents et declarer a la CNSS dans les 48h.' },
]

export default function SecteurPage() {
  const params = useParams()
  const slug = params.slug as string
  const secteur = SECTEURS.find(s => s.slug === slug)
  const [tab, setTab] = useState<'videos'|'documents'|'faq'>('videos')
  const [openFaq, setOpenFaq] = useState<number|null>(null)

  if (!secteur) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg-main)'}}>
      <div className="text-center">
        <p style={{color:'var(--text-secondary)',marginBottom:'16px'}}>Secteur non trouvé</p>
        <Link href="/secteurs" style={{padding:'10px 24px',borderRadius:'12px',background:'var(--orange)',color:'white',textDecoration:'none',fontWeight:700}}>Voir tous les secteurs</Link>
      </div>
    </div>
  )

  const img = IMGS[secteur.slug]

  return (
    <div className="min-h-screen" style={{background:'var(--bg-main)'}}>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section style={{paddingTop:'64px',position:'relative',overflow:'hidden',minHeight:'320px',display:'flex',alignItems:'flex-end'}}>
        {/* Background image */}
        <div style={{position:'absolute',inset:0}}>
          {img
            ? <img src={img} alt={secteur.nom} style={{width:'100%',height:'100%',objectFit:'cover',filter:'brightness(0.3) saturate(0.6)'}}/>
            : <div style={{width:'100%',height:'100%',background:`linear-gradient(135deg,${secteur.couleur}30,#0a1628)`}}/>
          }
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(6,13,26,1) 0%,rgba(6,13,26,0.5) 60%,rgba(6,13,26,0.2) 100%)'}}/>
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:'4px',background:`linear-gradient(to right,${secteur.couleur},${secteur.couleur}50,transparent)`}}/>
        </div>

        <div style={{position:'relative',maxWidth:'1280px',margin:'0 auto',padding:'40px 24px 40px',width:'100%'}}>
          <Link href="/secteurs" style={{display:'inline-flex',alignItems:'center',gap:'6px',color:'rgba(255,255,255,0.55)',fontSize:'13px',fontWeight:600,textDecoration:'none',marginBottom:'20px',transition:'color 0.2s'}}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='white'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.55)'}>
            <ArrowLeft size={14}/> Tous les secteurs
          </Link>

          <div style={{display:'flex',alignItems:'flex-end',gap:'24px',flexWrap:'wrap'}}>
            <div style={{flex:1,minWidth:'300px'}}>
              {/* Accent bar */}
              <div style={{height:'3px',width:'48px',borderRadius:'99px',background:secteur.couleur,marginBottom:'16px'}}/>
              <h1 style={{fontSize:'clamp(2rem,4vw,3.2rem)',fontWeight:900,color:'white',margin:'0 0 12px 0',lineHeight:1.05,letterSpacing:'-0.02em'}}>
                {secteur.nom}
              </h1>
              <p style={{fontSize:'1rem',color:'rgba(255,255,255,0.65)',margin:'0 0 16px 0',maxWidth:'580px',lineHeight:1.75}}>
                {secteur.description}
              </p>
              {/* Tags risques */}
              <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                {secteur.risques.map(r => (
                  <span key={r} style={{padding:'5px 12px',borderRadius:'8px',fontSize:'11px',fontWeight:700,color:secteur.couleur,background:secteur.couleur+'20',border:'1px solid '+secteur.couleur+'35'}}>
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={{display:'flex',gap:'20px',flexShrink:0}}>
              {[
                {val:secteur.nb_contenus+'+',label:'Ressources'},
                {val:MOCK_VIDEOS.length,label:'Vidéos'},
                {val:MOCK_DOCS.length,label:'Documents'},
                {val:MOCK_FAQ.length,label:'FAQ'},
              ].map((s,i) => (
                <div key={i} style={{textAlign:'center',padding:'12px 16px',borderRadius:'16px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',backdropFilter:'blur(10px)'}}>
                  <div style={{fontSize:'1.4rem',fontWeight:900,color:'white',lineHeight:1}}>{s.val}</div>
                  <div style={{fontSize:'10px',color:'rgba(255,255,255,0.5)',marginTop:'3px'}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TABS ═══ */}
      <div style={{position:'sticky',top:'64px',zIndex:40,background:'var(--bg-card)',borderBottom:'1px solid var(--border)',backdropFilter:'blur(20px)'}}>
        <div style={{maxWidth:'1280px',margin:'0 auto',padding:'0 24px',display:'flex',gap:'4px'}}>
          {([
            {id:'videos'   as const, label:'Vidéos',    Icon:Play,      count:MOCK_VIDEOS.length},
            {id:'documents'as const, label:'Documents',  Icon:FileText,  count:MOCK_DOCS.length},
            {id:'faq'      as const, label:'FAQ',        Icon:HelpCircle,count:MOCK_FAQ.length},
          ]).map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{display:'flex',alignItems:'center',gap:'8px',padding:'16px 20px',fontSize:'14px',fontWeight:600,border:'none',borderBottom:'2px solid',cursor:'pointer',background:'transparent',transition:'all 0.2s',
                color: tab===t.id ? secteur.couleur : 'var(--text-secondary)',
                borderBottomColor: tab===t.id ? secteur.couleur : 'transparent',
              }}>
              <t.Icon size={15}/>
              {t.label}
              <span style={{padding:'2px 7px',borderRadius:'99px',fontSize:'10px',fontWeight:700,background:tab===t.id?secteur.couleur+'20':'var(--bg-secondary)',color:tab===t.id?secteur.couleur:'var(--text-secondary)'}}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ CONTENU ═══ */}
      <main style={{maxWidth:'1280px',margin:'0 auto',padding:'40px 24px 96px'}}>

        {/* VIDEOS */}
        {tab==='videos' && (
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'28px',flexWrap:'wrap',gap:'12px'}}>
              <div>
                <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--orange)',marginBottom:'6px'}}>Catalogue vidéo</p>
                <h2 style={{fontSize:'1.5rem',fontWeight:900,color:'var(--text-primary)',margin:0}}>Formations vidéo — {secteur.nom}</h2>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',fontWeight:600,color:'var(--text-secondary)'}}>
                <Shield size={13} style={{color:'#22c55e'}}/> Toutes les vidéos sont gratuites
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'20px'}}>
              {MOCK_VIDEOS.map(v => (
                <div key={v.id} className="hover-lift" style={{borderRadius:'20px',overflow:'hidden',border:'1px solid var(--border)',background:'var(--bg-card)',cursor:'pointer',transition:'all 0.3s'}}>
                  {/* Thumbnail placeholder */}
                  <div style={{height:'180px',position:'relative',background:`linear-gradient(135deg,${secteur.couleur}20,${secteur.couleur}08)`,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                    <div style={{width:'64px',height:'64px',borderRadius:'50%',background:secteur.couleur,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 8px 24px ${secteur.couleur}60`,transition:'transform 0.3s'}}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='scale(1.1)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='scale(1)'}>
                      <Play size={24} style={{color:'white',marginLeft:'3px'}} fill="white"/>
                    </div>
                    <div style={{position:'absolute',bottom:'10px',right:'10px',display:'flex',alignItems:'center',gap:'4px',padding:'4px 10px',borderRadius:'8px',fontSize:'11px',fontWeight:700,color:'white',background:'rgba(0,0,0,0.65)'}}>
                      <Clock size={10}/>{v.duree}
                    </div>
                    <div style={{position:'absolute',top:'10px',left:'10px',padding:'3px 10px',borderRadius:'99px',fontSize:'10px',fontWeight:700,color:v.color,background:v.color+'20',border:'1px solid '+v.color+'30'}}>
                      {v.niveau}
                    </div>
                  </div>
                  {/* Info */}
                  <div style={{padding:'16px'}}>
                    <h3 style={{fontSize:'14px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 10px 0',lineHeight:1.4}}>{v.titre}</h3>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',color:'var(--text-secondary)'}}>
                        <Eye size={12}/>{v.vues.toLocaleString()} vues
                      </div>
                      <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',fontWeight:700,color:secteur.couleur}}>
                        Regarder <ChevronRight size={13}/>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
        {tab==='documents' && (
          <div>
            <div style={{marginBottom:'28px'}}>
              <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--orange)',marginBottom:'6px'}}>Ressources documentaires</p>
              <h2 style={{fontSize:'1.5rem',fontWeight:900,color:'var(--text-primary)',margin:0}}>Documents — {secteur.nom}</h2>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'12px',maxWidth:'800px'}}>
              {MOCK_DOCS.map((d,i) => (
                <div key={d.id} className="hover-lift" style={{borderRadius:'16px',border:'1px solid var(--border)',background:'var(--bg-card)',padding:'16px 20px',display:'flex',alignItems:'center',gap:'16px',transition:'all 0.3s'}}>
                  {/* Icon */}
                  <div style={{width:'48px',height:'48px',borderRadius:'14px',background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <FileText size={20} style={{color:'#ef4444'}}/>
                  </div>
                  {/* Info */}
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:'14px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 4px 0'}}>{d.titre}</p>
                    <p style={{fontSize:'12px',color:'var(--text-secondary)',margin:0}}>{d.type} · {d.pages} pages · {d.taille}</p>
                  </div>
                  {/* Numéro */}
                  <div style={{fontSize:'11px',fontWeight:900,color:'var(--text-secondary)',flexShrink:0,opacity:0.4}}>{String(i+1).padStart(2,'0')}</div>
                  {/* Download */}
                  <button style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',fontWeight:700,cursor:'pointer',flexShrink:0,transition:'all 0.2s'}}
                    onMouseEnter={e=>Object.assign((e.currentTarget as HTMLElement).style,{background:'var(--orange)',color:'white',borderColor:'var(--orange)'})}
                    onMouseLeave={e=>Object.assign((e.currentTarget as HTMLElement).style,{background:'var(--bg-secondary)',color:'var(--text-primary)',borderColor:'var(--border)'})}>
                    <Download size={13}/>Télécharger
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        {tab==='faq' && (
          <div>
            <div style={{marginBottom:'28px'}}>
              <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--orange)',marginBottom:'6px'}}>Questions fréquentes</p>
              <h2 style={{fontSize:'1.5rem',fontWeight:900,color:'var(--text-primary)',margin:0}}>FAQ — {secteur.nom}</h2>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px',maxWidth:'800px'}}>
              {MOCK_FAQ.map(f => (
                <div key={f.id} style={{borderRadius:'16px',border:'1px solid',borderColor:openFaq===f.id?secteur.couleur+'40':'var(--border)',background:'var(--bg-card)',overflow:'hidden',transition:'border-color 0.2s'}}>
                  <button onClick={()=>setOpenFaq(openFaq===f.id?null:f.id)}
                    style={{width:'100%',padding:'18px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'16px',textAlign:'left',background:'transparent',border:'none',cursor:'pointer'}}>
                    <span style={{fontSize:'14px',fontWeight:700,color:'var(--text-primary)',lineHeight:1.4}}>{f.q}</span>
                    <div style={{width:'28px',height:'28px',borderRadius:'8px',background:openFaq===f.id?secteur.couleur+'20':'var(--bg-secondary)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.2s'}}>
                      {openFaq===f.id
                        ? <ChevronDown size={14} style={{color:secteur.couleur}}/>
                        : <ChevronRight size={14} style={{color:'var(--text-secondary)'}}/>}
                    </div>
                  </button>
                  {openFaq===f.id && (
                    <div style={{padding:'0 20px 18px',borderTop:'1px solid var(--border)'}}>
                      <p style={{fontSize:'14px',color:'var(--text-secondary)',lineHeight:1.8,margin:'14px 0 0 0'}}>{f.r}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ═══ CTA BAS DE PAGE ═══ */}
      <section style={{padding:'64px 0',background:`linear-gradient(135deg,${secteur.couleur}15,${secteur.couleur}05)`,borderTop:'1px solid var(--border)'}}>
        <div style={{maxWidth:'700px',margin:'0 auto',padding:'0 24px',textAlign:'center'}}>
          <div style={{width:'52px',height:'52px',borderRadius:'16px',background:secteur.couleur+'20',border:'1px solid '+secteur.couleur+'30',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px auto'}}>
            <BookOpen size={24} style={{color:secteur.couleur}}/>
          </div>
          <h2 style={{fontSize:'1.6rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 12px 0'}}>
            Explorer les autres secteurs
          </h2>
          <p style={{fontSize:'14px',color:'var(--text-secondary)',margin:'0 0 28px 0',lineHeight:1.7}}>
            Think Safety couvre 18 secteurs professionnels avec des ressources gratuites, des alertes en temps réel et des équipements certifiés.
          </p>
          <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/secteurs" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 24px',borderRadius:'14px',fontSize:'14px',fontWeight:700,color:'white',textDecoration:'none',background:'var(--orange)'}}>
              Tous les secteurs <ArrowLeft size={14} style={{transform:'rotate(180deg)'}}/>
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