'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SECTEURS } from '@/lib/secteurs-data'
import { ChevronLeft, ChevronRight, Download, FileText, BookOpen, Play, CheckSquare, Square, Volume2, Share2 } from 'lucide-react'

const MODULES_DATA = [
  { id:1, numero:'01', titre:'Introduction et fondamentaux de la sécurité',     slug:'module-introduction' },
  { id:2, numero:'02', titre:'Équipements de protection individuelle (EPI)',     slug:'module-epi' },
  { id:3, numero:'03', titre:'Identification et évaluation des risques',        slug:'module-risques' },
  { id:4, numero:'04', titre:'Gestion des situations d urgence',                slug:'module-urgence' },
  { id:5, numero:'05', titre:'Prévention des accidents du travail',             slug:'module-prevention' },
  { id:6, numero:'06', titre:'Réglementation et obligations légales',           slug:'module-reglementation' },
  { id:7, numero:'07', titre:'Ergonomie et prévention des TMS',                 slug:'module-ergonomie' },
  { id:8, numero:'08', titre:'Méthodes avancées d analyse des accidents',       slug:'module-analyse' },
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

const paraNum = (n: number, color: string) => (
  <span style={{float:'right',fontSize:'11px',fontWeight:700,color:'var(--text-secondary)',marginTop:'4px',marginLeft:'8px',opacity:0.5}}>{n}</span>
)

export default function ModulePage() {
  const params = useParams()
  const router = useRouter()
  const slug    = params.slug    as string
  const module  = params.module  as string

  const secteur = SECTEURS.find(s => s.slug === slug)
  const modIdx  = MODULES_DATA.findIndex(m => m.slug === module)
  const mod     = MODULES_DATA[modIdx]
  const prev    = MODULES_DATA[modIdx - 1]
  const next    = MODULES_DATA[modIdx + 1]

  const [objectifChecked, setObjectifChecked] = useState(false)
  const [objectifTexte,   setObjectifTexte]   = useState('')
  const [dateTerminee,    setDateTerminee]     = useState('')

  if (!secteur || !mod) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-main)'}}>
      <div style={{textAlign:'center'}}>
        <p style={{color:'var(--text-secondary)',marginBottom:'16px'}}>Module non trouvé</p>
        <Link href={`/secteurs/${slug}`} style={{padding:'10px 24px',borderRadius:'12px',background:'var(--orange)',color:'white',textDecoration:'none',fontWeight:700}}>Retour au secteur</Link>
      </div>
    </div>
  )

  const img = IMGS[slug]
  const c   = secteur.couleur

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar />

      {/* ═══ HERO IMAGE + NUMÉRO ═══ */}
      <div style={{paddingTop:'64px'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',height:'240px',overflow:'hidden'}}>
          {/* Image gauche */}
          <div style={{position:'relative',overflow:'hidden'}}>
            {img
              ? <img src={img} alt={secteur.nom} style={{width:'100%',height:'100%',objectFit:'cover',filter:'brightness(0.65) saturate(0.7)'}}/>
              : <div style={{width:'100%',height:'100%',background:`linear-gradient(135deg,${c}30,#0a1628)`}}/>}
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to right,transparent 60%,rgba(6,13,26,0.5))'}}/>
          </div>
          {/* Badge numéro droite */}
          <div style={{background:`linear-gradient(135deg,${c},${c}cc)`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'8px'}}>
            <span style={{fontSize:'4.5rem',fontWeight:900,color:'white',lineHeight:1,letterSpacing:'-0.04em'}}>{mod.numero}</span>
            <div style={{width:'48px',height:'3px',background:'rgba(255,255,255,0.5)',borderRadius:'99px'}}/>
          </div>
        </div>
      </div>

      {/* ═══ CORPS PRINCIPAL ═══ */}
      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 24px',display:'grid',gridTemplateColumns:'1fr 300px',gap:'48px',alignItems:'start'}}>

        {/* CONTENU GAUCHE */}
        <article style={{paddingTop:'40px',paddingBottom:'96px'}}>
          {/* Fil d ariane */}
          <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'var(--text-secondary)',marginBottom:'24px',flexWrap:'wrap'}}>
            <Link href="/secteurs" style={{color:'var(--text-secondary)',textDecoration:'none'}}>Secteurs</Link>
            <ChevronRight size={12}/>
            <Link href={`/secteurs/${slug}`} style={{color:'var(--text-secondary)',textDecoration:'none'}}>{secteur.nom}</Link>
            <ChevronRight size={12}/>
            <span style={{color:'var(--text-primary)',fontWeight:600}}>Leçon {mod.numero}</span>
          </div>

          {/* Label leçon */}
          <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.15em',color:c,margin:'0 0 8px 0'}}>Leçon {mod.numero}</p>

          {/* Titre */}
          <h1 style={{fontSize:'clamp(1.6rem,3vw,2.4rem)',fontWeight:900,color:'var(--text-primary)',margin:'0 0 20px 0',lineHeight:1.15}}>{mod.titre}</h1>

          {/* Boutons édition */}
          <div style={{display:'flex',gap:'8px',marginBottom:'40px',flexWrap:'wrap'}}>
            <button style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'7px 14px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-secondary)',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
              <FileText size={13}/> Édition numérique
            </button>
            <button style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'7px 14px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-secondary)',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>
              <FileText size={13}/> Édition imprimée
            </button>
          </div>

          {/* ── INTRODUCTION ── */}
          <p style={{fontSize:'1rem',lineHeight:1.9,color:'var(--text-secondary)',marginBottom:'24px'}}>
            {paraNum(1, c)}
            Chaque jour, des millions de travailleurs prennent des risques sans en être pleinement conscients. La sécurité au travail ne s&apos;improvise pas — elle s&apos;apprend, se pratique et devient une culture au quotidien. Ce module vous donne les bases essentielles pour protéger votre vie et celle de vos collègues.
          </p>
          <p style={{fontSize:'1rem',lineHeight:1.9,color:'var(--text-secondary)',marginBottom:'36px'}}>
            {paraNum(2, c)}
            Selon l&apos;Organisation Internationale du Travail (OIT), plus de 2,3 millions de personnes meurent chaque année d&apos;accidents ou de maladies liés au travail. La quasi-totalité de ces décès sont évitables grâce à une formation adaptée et une culture de la sécurité ancrée dans chaque organisation.
          </p>

          {/* ── SECTION 1 ── */}
          <h2 style={{fontSize:'1.15rem',fontWeight:900,color:c,margin:'0 0 16px 0',paddingTop:'8px',borderTop:'1px solid var(--border)'}}>
            1. Pourquoi la sécurité au travail est-elle essentielle ?
          </h2>
          <p style={{fontSize:'1rem',lineHeight:1.9,color:'var(--text-secondary)',marginBottom:'20px'}}>
            {paraNum(3, c)}
            La sécurité au travail protège d&apos;abord la santé et la vie des travailleurs. Mais elle a aussi un impact économique majeur : un accident grave coûte en moyenne 40 000€ à une entreprise, sans compter les pertes humaines et les traumatismes durables sur les équipes.
          </p>
          <p style={{fontSize:'1rem',lineHeight:1.9,color:'var(--text-secondary)',marginBottom:'32px'}}>
            {paraNum(4, c)}
            Travailler dans un environnement sûr améliore également la productivité, la motivation et la fidélisation des employés. Les entreprises qui investissent dans la sécurité constatent en moyenne une réduction de 40% de leurs accidents et une amélioration de 25% de leur productivité globale.
          </p>

          {/* ── IMAGE EMBARQUÉE ── */}
          <div style={{marginBottom:'32px',borderRadius:'16px',overflow:'hidden',border:'1px solid var(--border)'}}>
            <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80" alt="Sécurité sur chantier" style={{width:'100%',height:'220px',objectFit:'cover'}}/>
            <div style={{padding:'12px 16px',background:'var(--bg-card)',borderTop:'1px solid var(--border)'}}>
              <p style={{fontSize:'12px',color:'var(--text-secondary)',margin:0,fontStyle:'italic'}}>Des travailleurs équipés d&apos;EPI conformes sur un chantier de construction. La prévention commence par le bon équipement.</p>
            </div>
          </div>

          {/* ── SECTION 2 ── */}
          <h2 style={{fontSize:'1.15rem',fontWeight:900,color:c,margin:'0 0 16px 0',paddingTop:'8px',borderTop:'1px solid var(--border)'}}>
            2. Les principales causes d&apos;accidents du travail
          </h2>
          <p style={{fontSize:'1rem',lineHeight:1.9,color:'var(--text-secondary)',marginBottom:'20px'}}>
            {paraNum(5, c)}
            Les accidents ne surviennent jamais par hasard. Ils résultent généralement d&apos;une combinaison de facteurs : facteurs humains (négligence, fatigue, manque de formation), facteurs organisationnels (procédures absentes ou mal appliquées) et facteurs techniques (matériels défectueux ou inadaptés).
          </p>

          {/* Bloc citation */}
          <div style={{marginBottom:'32px',padding:'20px 24px',borderRadius:'12px',background:c+'10',borderLeft:'4px solid '+c}}>
            <p style={{fontSize:'1rem',lineHeight:1.8,color:'var(--text-primary)',margin:0,fontStyle:'italic',fontWeight:500}}>
              &laquo; La sécurité n&apos;est pas une priorité parmi d&apos;autres — c&apos;est une condition préalable à toute activité professionnelle. &raquo;
            </p>
            <p style={{fontSize:'12px',color:c,fontWeight:700,margin:'8px 0 0 0'}}>— Directive-cadre européenne 89/391/CEE</p>
          </div>

          <p style={{fontSize:'1rem',lineHeight:1.9,color:'var(--text-secondary)',marginBottom:'32px'}}>
            {paraNum(6, c)}
            La méthode des 5M (Main-d&apos;œuvre, Méthode, Matière, Milieu, Matériel) est un outil reconnu pour identifier les causes racines d&apos;un accident. Elle permet d&apos;analyser systématiquement chaque facteur contributif et de mettre en place des mesures correctives durables.
          </p>

          {/* ── SECTION 3 ── */}
          <h2 style={{fontSize:'1.15rem',fontWeight:900,color:c,margin:'0 0 16px 0',paddingTop:'8px',borderTop:'1px solid var(--border)'}}>
            3. Vos droits et obligations en matière de sécurité
          </h2>
          <p style={{fontSize:'1rem',lineHeight:1.9,color:'var(--text-secondary)',marginBottom:'20px'}}>
            {paraNum(7, c)}
            Tout travailleur a le <strong style={{color:'var(--text-primary)'}}>droit de retrait</strong> : il peut quitter son poste sans sanctions si la situation présente un danger grave et imminent pour sa vie ou sa santé. Ce droit fondamental est inscrit dans le Code du travail et ne peut en aucun cas être contesté par l&apos;employeur.
          </p>

          {/* Vidéo embarquée */}
          <div style={{marginBottom:'32px'}}>
            <p style={{fontSize:'1rem',lineHeight:1.9,color:'var(--text-secondary)',marginBottom:'16px'}}>
              {paraNum(8, c)}
              La vidéo suivante illustre concrètement comment exercer son droit de retrait. <strong style={{color:c}}>Regarder la VIDÉO</strong> et répondre à ces questions :
            </p>
            <ul style={{margin:'0 0 16px 0',paddingLeft:'24px',display:'flex',flexDirection:'column',gap:'8px'}}>
              <li style={{fontSize:'14px',color:'var(--text-secondary)',lineHeight:1.7}}>Dans quelles situations le droit de retrait s&apos;applique-t-il ?</li>
              <li style={{fontSize:'14px',color:'var(--text-secondary)',lineHeight:1.7}}>Quelles sont les démarches à suivre pour l&apos;exercer correctement ?</li>
            </ul>
            {/* Thumbnail vidéo */}
            <div style={{display:'inline-flex',borderRadius:'12px',overflow:'hidden',border:'1px solid var(--border)',cursor:'pointer',maxWidth:'280px'}}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(0,0,0,0.15)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.boxShadow='none'}>
              <div style={{width:'120px',height:'80px',position:'relative',flexShrink:0,background:'#1a2a4a',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{width:'36px',height:'36px',borderRadius:'50%',background:c,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px '+c+'60'}}>
                  <Play size={14} style={{color:'white',marginLeft:'2px'}} fill="white"/>
                </div>
              </div>
              <div style={{padding:'10px 12px',background:'var(--bg-card)'}}>
                <p style={{fontSize:'12px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 4px 0',lineHeight:1.3}}>Le droit de retrait au travail</p>
                <p style={{fontSize:'11px',color:c,margin:0,fontWeight:600}}>VIDÉO · 3:45</p>
              </div>
            </div>
          </div>

          <p style={{fontSize:'1rem',lineHeight:1.9,color:'var(--text-secondary)',marginBottom:'36px'}}>
            {paraNum(9, c)}
            L&apos;employeur, de son côté, est tenu de fournir des équipements conformes, d&apos;organiser des formations régulières et d&apos;évaluer les risques via le Document Unique d&apos;Évaluation des Risques Professionnels (DUERP). Ce document doit être mis à jour au minimum une fois par an.
          </p>

          {/* ── APPROFONDISSONS ── */}
          <div style={{marginBottom:'40px',paddingTop:'32px',borderTop:'2px solid var(--border)'}}>
            <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.2em',color:'var(--text-secondary)',margin:'0 0 20px 0'}}>Approfondissons</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',alignItems:'start'}}>
              <p style={{fontSize:'1rem',lineHeight:1.9,color:'var(--text-secondary)',margin:0}}>
                Explorons ensemble comment certaines entreprises ont transformé leur culture sécurité, pourquoi cela bénéficie à tous les niveaux de l&apos;organisation, et comment vous pouvez devenir un acteur actif de la prévention dans votre équipe.
              </p>
              <div style={{borderRadius:'14px',overflow:'hidden',position:'relative',height:'140px'}}>
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80" alt="Culture sécurité" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 60%)'}}/>
                <p style={{position:'absolute',bottom:'10px',left:'12px',color:'white',fontSize:'11px',fontWeight:700,margin:0}}>Culture sécurité en entreprise</p>
              </div>
            </div>
          </div>

          <h2 style={{fontSize:'1.15rem',fontWeight:900,color:c,margin:'0 0 16px 0',paddingTop:'8px',borderTop:'1px solid var(--border)'}}>
            4. Comment agir au quotidien ?
          </h2>
          <p style={{fontSize:'1rem',lineHeight:1.9,color:'var(--text-secondary)',marginBottom:'20px'}}>
            {paraNum(10, c)}
            La sécurité commence par des gestes simples : signaler immédiatement tout incident ou situation dangereuse, même mineur. Un presque-accident est un avertissement précieux. Ne jamais ignorer un signal d&apos;alarme ou contourner une procédure de sécurité, même sous pression de temps.
          </p>
          <ul style={{margin:'0 0 32px 0',paddingLeft:'24px',display:'flex',flexDirection:'column',gap:'10px'}}>
            {[
              'Inspecter votre poste de travail en début de journée',
              'Porter systématiquement les EPI adaptés à vos tâches',
              'Participer activement aux exercices d urgence',
              'Signaler toute dégradation de matériel ou condition dangereuse',
            ].map((item, i) => (
              <li key={i} style={{fontSize:'14px',color:'var(--text-secondary)',lineHeight:1.7}}>{item}</li>
            ))}
          </ul>

          {/* ── FIN DE LEÇON ── */}
          <div style={{marginTop:'48px',padding:'24px',borderRadius:'16px',background:'var(--bg-card)',border:'1px solid var(--border)'}}>
            <p style={{fontSize:'12px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--text-secondary)',margin:'0 0 16px 0'}}>Leçon terminée le</p>
            <input
              type="date"
              value={dateTerminee}
              onChange={e=>setDateTerminee(e.target.value)}
              style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'14px',marginBottom:'24px',boxSizing:'border-box'}}
            />
            <div style={{padding:'20px',borderRadius:'12px',background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
              <p style={{fontSize:'14px',fontWeight:900,color:'var(--text-primary)',margin:'0 0 14px 0'}}>Mon objectif</p>
              <label style={{display:'flex',alignItems:'flex-start',gap:'10px',cursor:'pointer',marginBottom:'12px'}}>
                <button onClick={()=>setObjectifChecked(!objectifChecked)} style={{background:'none',border:'none',padding:0,cursor:'pointer',marginTop:'1px',flexShrink:0}}>
                  {objectifChecked
                    ? <CheckSquare size={18} style={{color:c}}/>
                    : <Square size={18} style={{color:'var(--text-secondary)'}}/>}
                </button>
                <span style={{fontSize:'14px',color:'var(--text-secondary)',lineHeight:1.6}}>Commencer le module suivant dès cette semaine.</span>
              </label>
              <div>
                <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:'0 0 8px 0'}}>Autre objectif :</p>
                <textarea
                  value={objectifTexte}
                  onChange={e=>setObjectifTexte(e.target.value)}
                  placeholder="Notez votre objectif personnel..."
                  style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-main)',color:'var(--text-primary)',fontSize:'13px',resize:'vertical',minHeight:'80px',boxSizing:'border-box',fontFamily:'inherit'}}
                />
              </div>
            </div>
          </div>

          {/* ── NAVIGATION PRÉCÉDENT / SUIVANT ── */}
          <div style={{display:'flex',justifyContent:'space-between',marginTop:'40px',gap:'16px',flexWrap:'wrap'}}>
            {prev ? (
              <Link href={`/secteurs/${slug}/${prev.slug}`} style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 20px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-primary)',textDecoration:'none',fontSize:'13px',fontWeight:700,transition:'all 0.2s'}}
                onMouseEnter={e=>Object.assign((e.currentTarget as HTMLElement).style,{borderColor:c,color:c})}
                onMouseLeave={e=>Object.assign((e.currentTarget as HTMLElement).style,{borderColor:'var(--border)',color:'var(--text-primary)'})}>
                <ChevronLeft size={16}/> Précédent
              </Link>
            ) : <div/>}
            {next && (
              <Link href={`/secteurs/${slug}/${next.slug}`} style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 20px',borderRadius:'12px',background:c,color:'white',textDecoration:'none',fontSize:'13px',fontWeight:700,boxShadow:'0 4px 16px '+c+'40'}}>
                Suivant <ChevronRight size={16}/>
              </Link>
            )}
          </div>

          {/* ── À DÉCOUVRIR AUSSI ── */}
          <div style={{marginTop:'48px',paddingTop:'32px',borderTop:'1px solid var(--border)'}}>
            <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.15em',color:'var(--text-secondary)',margin:'0 0 20px 0'}}>À découvrir aussi</p>
            <div style={{display:'flex',flexDirection:'column',gap:'1px',border:'1px solid var(--border)',borderRadius:'12px',overflow:'hidden'}}>
              {[
                {img:'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&q=80', titre:'Les EPI adaptés à votre secteur', type:'', desc:'Guide pratique pour choisir et entretenir vos équipements de protection.', video:false},
                {img:'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=200&q=80', titre:'Gestion d une situation de crise', type:'(2:53)', desc:'Comment réagir efficacement lors d un incident grave.', video:true},
                {img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&q=80', titre:'Le DUERP expliqué simplement', type:'', desc:'Tout ce que vous devez savoir sur le document unique d évaluation.', video:false},
              ].map((item, i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:'16px',padding:'14px 16px',background:'var(--bg-card)',cursor:'pointer',transition:'background 0.2s'}}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg-secondary)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='var(--bg-card)'}>
                  <div style={{width:'72px',height:'54px',borderRadius:'8px',overflow:'hidden',flexShrink:0,position:'relative',background:'var(--bg-secondary)'}}>
                    <img src={item.img} alt={item.titre} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    {item.video && (
                      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.4)'}}>
                        <Play size={16} style={{color:'white'}} fill="white"/>
                      </div>
                    )}
                  </div>
                  <div>
                    <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:'0 0 2px 0',lineHeight:1.5}}>{item.desc}</p>
                    <p style={{fontSize:'13px',fontWeight:700,color:c,margin:0}}>{item.titre} {item.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* ═══ SIDEBAR DROITE ═══ */}
        <aside style={{paddingTop:'40px',position:'sticky',top:'80px'}}>

          {/* Miniature module */}
          <div style={{borderRadius:'14px',overflow:'hidden',border:'1px solid var(--border)',marginBottom:'24px'}}>
            <div style={{height:'120px',position:'relative',background:c+'20',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {img && <img src={img} alt={secteur.nom} style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.5}}/>}
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 100%)'}}/>
              <div style={{position:'absolute',bottom:'10px',left:'12px',right:'12px'}}>
                <p style={{color:'white',fontSize:'12px',fontWeight:900,margin:0,lineHeight:1.3}}>{secteur.nom}</p>
                <p style={{color:'rgba(255,255,255,0.6)',fontSize:'10px',margin:'3px 0 0 0'}}>Leçon {mod.numero} sur {MODULES_DATA.length}</p>
              </div>
            </div>
          </div>

          {/* Téléchargement */}
          <div style={{padding:'16px',borderRadius:'14px',border:'1px solid var(--border)',background:'var(--bg-card)',marginBottom:'20px'}}>
            <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--text-secondary)',margin:'0 0 12px 0'}}>Téléchargement</p>
            <div style={{display:'flex',gap:'8px'}}>
              <button style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',padding:'12px 8px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',cursor:'pointer',transition:'all 0.2s'}}
                onMouseEnter={e=>Object.assign((e.currentTarget as HTMLElement).style,{borderColor:c,background:c+'10'})}
                onMouseLeave={e=>Object.assign((e.currentTarget as HTMLElement).style,{borderColor:'var(--border)',background:'var(--bg-secondary)'})}>
                <FileText size={18} style={{color:'var(--text-secondary)'}}/>
                <span style={{fontSize:'10px',fontWeight:600,color:'var(--text-secondary)'}}>PDF</span>
              </button>
              <button style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',padding:'12px 8px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',cursor:'pointer',transition:'all 0.2s'}}
                onMouseEnter={e=>Object.assign((e.currentTarget as HTMLElement).style,{borderColor:c,background:c+'10'})}
                onMouseLeave={e=>Object.assign((e.currentTarget as HTMLElement).style,{borderColor:'var(--border)',background:'var(--bg-secondary)'})}>
                <Volume2 size={18} style={{color:'var(--text-secondary)'}}/>
                <span style={{fontSize:'10px',fontWeight:600,color:'var(--text-secondary)'}}>Audio</span>
              </button>
              <button style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',padding:'12px 8px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',cursor:'pointer',transition:'all 0.2s'}}
                onMouseEnter={e=>Object.assign((e.currentTarget as HTMLElement).style,{borderColor:c,background:c+'10'})}
                onMouseLeave={e=>Object.assign((e.currentTarget as HTMLElement).style,{borderColor:'var(--border)',background:'var(--bg-secondary)'})}>
                <Share2 size={18} style={{color:'var(--text-secondary)'}}/>
                <span style={{fontSize:'10px',fontWeight:600,color:'var(--text-secondary)'}}>Partager</span>
              </button>
            </div>
          </div>

          {/* Table des matières */}
          <div style={{borderRadius:'14px',border:'1px solid var(--border)',background:'var(--bg-card)',overflow:'hidden'}}>
            <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <p style={{fontSize:'11px',fontWeight:900,textTransform:'uppercase',letterSpacing:'0.12em',color:'var(--text-secondary)',margin:0}}>Table des matières</p>
              <BookOpen size={14} style={{color:'var(--text-secondary)'}}/>
            </div>
            <div style={{maxHeight:'400px',overflowY:'auto'}}>
              {MODULES_DATA.map(m => (
                <Link key={m.id} href={`/secteurs/${slug}/${m.slug}`}
                  style={{display:'block',padding:'10px 16px',borderBottom:'1px solid var(--border)',textDecoration:'none',background: m.slug===module ? c+'15' : 'transparent',transition:'background 0.2s'}}
                  onMouseEnter={e=>{ if(m.slug!==module)(e.currentTarget as HTMLElement).style.background='var(--bg-secondary)' }}
                  onMouseLeave={e=>{ if(m.slug!==module)(e.currentTarget as HTMLElement).style.background='transparent' }}>
                  <p style={{fontSize:'10px',fontWeight:700,color: m.slug===module ? c : 'var(--text-secondary)',margin:'0 0 2px 0',textTransform:'uppercase',letterSpacing:'0.08em'}}>
                    Leçon {m.numero}
                  </p>
                  <p style={{fontSize:'12px',fontWeight: m.slug===module ? 700 : 500,color: m.slug===module ? 'var(--text-primary)' : 'var(--text-secondary)',margin:0,lineHeight:1.4}}>
                    {m.titre}
                  </p>
                </Link>
              ))}
            </div>
          </div>

        </aside>
      </div>

      <Footer />
    </div>
  )
}