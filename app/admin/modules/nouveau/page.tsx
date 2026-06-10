'use client'
import { useState, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SECTEURS } from '@/lib/secteurs-data'
import dynamic from 'next/dynamic'
import { ArrowLeft, Save, Plus, Trash2, Zap, ChevronDown } from 'lucide-react'

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false, loading: () => (
  <div style={{padding:'20px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-secondary)',fontSize:'13px'}}>Chargement éditeur...</div>
)})

// ── Composants définis HORS du composant principal (évite cursor loss) ──
interface FieldProps { label: string; children: React.ReactNode }
const Field = ({ label, children }: FieldProps) => (
  <div style={{marginBottom:'18px'}}>
    <label style={{fontSize:'11px',fontWeight:700,color:'var(--text-secondary)',display:'block',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</label>
    {children}
  </div>
)
const iStyle: React.CSSProperties = {
  width:'100%',padding:'10px 14px',borderRadius:'10px',
  border:'1px solid var(--border)',background:'var(--bg-secondary)',
  color:'var(--text-primary)',fontSize:'13px',outline:'none',
  boxSizing:'border-box',fontFamily:'inherit',transition:'border-color 0.15s'
}

// ── Templates par défaut ──
const DEFAULT_MODS = [
  { numero:'01', titre:'Introduction et fondamentaux de la sécurité',    libre:true,  types:['text'],                    duree:'20 min', ordre:1 },
  { numero:'02', titre:'Équipements de protection individuelle (EPI)',   libre:false, types:['video','document','image'], duree:'35 min', ordre:2 },
  { numero:'03', titre:'Identification et évaluation des risques',      libre:false, types:['text','document'],          duree:'25 min', ordre:3 },
  { numero:'04', titre:'Gestion des situations d urgence',              libre:false, types:['video','text','image'],     duree:'40 min', ordre:4 },
  { numero:'05', titre:'Prévention des accidents du travail',           libre:false, types:['video','text'],             duree:'30 min', ordre:5 },
  { numero:'06', titre:'Réglementation et obligations légales',         libre:false, types:['document','text'],          duree:'45 min', ordre:6 },
  { numero:'07', titre:'Ergonomie et prévention des TMS',               libre:false, types:['video','image','text'],     duree:'28 min', ordre:7 },
  { numero:'08', titre:'Méthodes avancées d analyse des accidents',     libre:false, types:['video','document','text'],  duree:'55 min', ordre:8 },
]

function autoSlug(titre: string) {
  return titre.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim()
}

function NouveauModuleContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const defaultSect  = searchParams.get('secteur') || ''
  const secteur      = SECTEURS.find(s => s.slug === defaultSect)

  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')
  const [error,   setError]   = useState('')
  const [seeding, setSeeding] = useState(false)

  const [secteurSlug,  setSecteurSlug]  = useState(defaultSect)
  const [numero,       setNumero]       = useState('')
  const [titre,        setTitre]        = useState('')
  const [slug,         setSlug]         = useState('')
  const [description,  setDescription]  = useState('')
  const [contenu,      setContenu]      = useState('<p>Saisir le contenu du module ici...</p>')
  const [libre,        setLibre]        = useState(true)
  const [statut,       setStatut]       = useState('published')
  const [types,        setTypes]        = useState<string[]>(['text'])
  const [youtubeId,    setYoutubeId]    = useState('')
  const [duree,        setDuree]        = useState('')
  const [ordre,        setOrdre]        = useState(1)
  const [docs, setDocs] = useState<{titre:string,url:string,pages:string,taille:string}[]>([])

  const selectedSect = SECTEURS.find(s => s.slug === secteurSlug)

  const toggleType = useCallback((t: string) => {
    setTypes(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t])
  }, [])

  const handleTitreChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setTitre(v)
    setSlug(autoSlug(v))
  }, [])

  const applyTemplate = useCallback((tpl: typeof DEFAULT_MODS[0]) => {
    setNumero(tpl.numero)
    setTitre(tpl.titre)
    setSlug(`module-${autoSlug(tpl.titre).split('-').slice(0,3).join('-')}`)
    setTypes(tpl.types)
    setLibre(tpl.libre)
    setDuree(tpl.duree)
    setOrdre(tpl.ordre)
    setContenu(`<h2>1. Introduction</h2><p>Contenu du module ${tpl.numero} — ${tpl.titre}</p><blockquote><p>Point clé à retenir pour ce module.</p></blockquote><h2>2. Développement</h2><p>Développez ici le contenu principal...</p><h2>3. Approfondissons</h2><p>Réfléchissons ensemble à l'application pratique...</p>`)
  }, [])

  // Seed tous les modules par défaut pour un secteur
  const seedDefaults = async () => {
    if (!secteurSlug) { setError('Choisissez un secteur avant d\'importer.'); return }
    if (!confirm(`Créer les 8 modules par défaut pour ${selectedSect?.nom} ?`)) return
    setSeeding(true)
    const inserts = DEFAULT_MODS.map(m => ({
      secteur_slug: secteurSlug,
      numero: m.numero,
      titre: m.titre,
      slug: `${secteurSlug}-${autoSlug(m.titre).split('-').slice(0,3).join('-')}`,
      description: `Module ${m.numero} — ${selectedSect?.nom}`,
      libre: m.libre,
      types: m.types,
      duree: m.duree,
      ordre: m.ordre,
      statut: 'published',
      contenu_texte: `<h2>1. Introduction</h2><p>Contenu du module ${m.numero}.</p>`,
      vues: 0,
    }))
    const { error: err } = await supabase.from('modules').insert(inserts)
    setSeeding(false)
    if (err) { setError(err.message); return }
    setMsg('8 modules créés avec succès !')
    setTimeout(() => router.push('/admin/modules'), 1500)
  }

  const handleSave = async () => {
    if (!secteurSlug || !titre || !slug) { setError('Secteur, titre et slug sont obligatoires.'); return }
    setSaving(true); setError('')
    const { data: mod, error: err } = await supabase.from('modules').insert({
      secteur_slug: secteurSlug, numero, titre, slug, description,
      libre, statut, types, youtube_id: youtubeId, duree,
      contenu_texte: contenu, ordre, vues: 0,
    }).select().single()
    if (err) { setError(err.message); setSaving(false); return }
    if (docs.length > 0 && mod) {
      await supabase.from('module_documents').insert(
        docs.filter(d=>d.titre).map(d => ({
          module_id: mod.id, titre: d.titre, url: d.url||null,
          pages: d.pages ? Number(d.pages) : null, taille: d.taille||null
        }))
      )
    }
    setSaving(false)
    setMsg('Module créé !')
    setTimeout(() => router.push('/admin/modules'), 1500)
  }

  const TYPE_OPTS = [
    {v:'text',     l:'Cours texte',    c:'#22c55e'},
    {v:'video',    l:'Vidéo YouTube',  c:'#ef4444'},
    {v:'document', l:'Document PDF',   c:'#3b82f6'},
    {v:'image',    l:'Images',         c:'#8b5cf6'},
  ]

  return (
    <div style={{padding:'24px',maxWidth:'1100px'}}>

      {msg && <div style={{position:'fixed',top:'80px',right:'24px',padding:'12px 20px',borderRadius:'12px',background:'#22c55e',color:'white',fontSize:'13px',fontWeight:700,zIndex:50,boxShadow:'0 8px 24px rgba(0,0,0,0.2)'}}>{msg}</div>}

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'24px',flexWrap:'wrap'}}>
        <Link href="/admin/modules" style={{display:'flex',alignItems:'center',gap:'5px',padding:'7px 12px',borderRadius:'9px',border:'1px solid var(--border)',color:'var(--text-secondary)',textDecoration:'none',fontSize:'12px'}}>
          <ArrowLeft size={13}/> Retour
        </Link>
        <h1 style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',margin:0}}>Nouveau module</h1>
        <button onClick={handleSave} disabled={saving}
          style={{marginLeft:'auto',display:'inline-flex',alignItems:'center',gap:'6px',padding:'9px 18px',borderRadius:'11px',background:'var(--orange)',color:'white',border:'none',fontSize:'13px',fontWeight:700,cursor:saving?'not-allowed':'pointer',opacity:saving?0.7:1}}>
          <Save size={13}/>{saving?'Enregistrement...':'Enregistrer le module'}
        </button>
      </div>

      {error && <div style={{padding:'12px 14px',borderRadius:'10px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',marginBottom:'16px',color:'#ef4444',fontSize:'13px'}}>{error}</div>}

      {/* TEMPLATES RAPIDES */}
      <div style={{padding:'16px',borderRadius:'14px',border:'1px solid var(--border)',background:'var(--bg-card)',marginBottom:'24px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px',flexWrap:'wrap',gap:'8px'}}>
          <div>
            <p style={{fontSize:'12px',fontWeight:700,color:'var(--text-secondary)',margin:'0 0 2px 0',textTransform:'uppercase',letterSpacing:'0.06em'}}>
              <Zap size={11} style={{marginRight:'4px',verticalAlign:'middle'}}/> Démarrage rapide
            </p>
            <p style={{fontSize:'12px',color:'var(--text-secondary)',margin:0}}>Cliquez sur un modèle pour pré-remplir le formulaire, ou importez les 8 en une fois.</p>
          </div>
          <button onClick={seedDefaults} disabled={seeding||!secteurSlug}
            style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'7px 14px',borderRadius:'9px',background:'var(--orange)',color:'white',border:'none',fontSize:'12px',fontWeight:700,cursor:seeding||!secteurSlug?'not-allowed':'pointer',opacity:seeding||!secteurSlug?0.5:1}}>
            <Zap size={12}/>{seeding?'Import...':'Importer les 8 modules d\'un coup'}
          </button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'8px'}}>
          {DEFAULT_MODS.map(m => (
            <button key={m.numero} onClick={()=>applyTemplate(m)}
              style={{padding:'10px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--bg-secondary)',cursor:'pointer',textAlign:'left',transition:'all 0.15s'}}
              onMouseEnter={e=>Object.assign((e.currentTarget as HTMLElement).style,{borderColor:'var(--orange)',background:'rgba(212,80,15,0.06)'})}
              onMouseLeave={e=>Object.assign((e.currentTarget as HTMLElement).style,{borderColor:'var(--border)',background:'var(--bg-secondary)'})}>
              <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'3px'}}>
                <span style={{fontSize:'10px',fontWeight:900,color:'var(--orange)',background:'rgba(212,80,15,0.12)',padding:'1px 6px',borderRadius:'5px'}}>{m.numero}</span>
                {m.libre && <span style={{fontSize:'9px',fontWeight:700,color:'#22c55e',background:'rgba(34,197,94,0.1)',padding:'1px 5px',borderRadius:'4px'}}>Gratuit</span>}
              </div>
              <p style={{fontSize:'12px',fontWeight:600,color:'var(--text-primary)',margin:'0 0 2px 0',lineHeight:1.3}}>{m.titre.substring(0,45)}{m.titre.length>45?'...':''}</p>
              <p style={{fontSize:'10px',color:'var(--text-secondary)',margin:0}}>{m.duree} · {m.types.join(', ')}</p>
            </button>
          ))}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 290px',gap:'20px',alignItems:'start'}}>

        {/* COLONNE PRINCIPALE */}
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>

          {/* Infos de base */}
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'20px'}}>
            <p style={{fontSize:'11px',fontWeight:700,color:'var(--text-secondary)',margin:'0 0 14px 0',textTransform:'uppercase',letterSpacing:'0.06em'}}>Informations du module</p>

            <Field label="Secteur *">
              <div style={{position:'relative'}}>
                <select value={secteurSlug} onChange={e=>setSecteurSlug(e.target.value)}
                  style={{...iStyle,paddingRight:'28px',appearance:'none',cursor:'pointer'}}>
                  <option value="">— Choisir un secteur —</option>
                  {SECTEURS.map(s => <option key={s.slug} value={s.slug}>{s.nom}</option>)}
                </select>
                <ChevronDown size={12} style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',color:'var(--text-secondary)',pointerEvents:'none'}}/>
              </div>
            </Field>

            <div style={{display:'grid',gridTemplateColumns:'100px 1fr',gap:'12px'}}>
              <Field label="N° ordre">
                <input value={numero} onChange={e=>setNumero(e.target.value)} placeholder="01" style={iStyle}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                  onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
              </Field>
              <Field label="Titre du module *">
                <input value={titre} onChange={handleTitreChange} placeholder="Ex: Introduction et fondamentaux..." style={iStyle}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                  onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
              </Field>
            </div>

            <Field label="Slug URL (auto-généré) *">
              <input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="module-introduction" style={iStyle}
                onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
            </Field>

            <Field label="Description courte">
              <textarea value={description} onChange={e=>setDescription(e.target.value)}
                placeholder="Description visible dans la liste..." rows={3}
                style={{...iStyle,resize:'vertical',lineHeight:1.6}}
                onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
            </Field>

            {types.includes('video') && (
              <Field label="ID ou URL YouTube">
                <input value={youtubeId} onChange={e=>setYoutubeId(e.target.value)}
                  placeholder="Ex: dQw4w9WgXcQ ou https://youtube.com/watch?v=..." style={iStyle}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                  onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
              </Field>
            )}
          </div>

          {/* Éditeur de contenu */}
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'20px'}}>
            <p style={{fontSize:'11px',fontWeight:700,color:'var(--text-secondary)',margin:'0 0 14px 0',textTransform:'uppercase',letterSpacing:'0.06em'}}>Contenu du cours</p>
            <RichEditor value={contenu} onChange={setContenu} color={selectedSect?.couleur||'var(--orange)'}/>
          </div>

          {/* Documents */}
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'20px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
              <p style={{fontSize:'11px',fontWeight:700,color:'var(--text-secondary)',margin:0,textTransform:'uppercase',letterSpacing:'0.06em'}}>Documents PDF joints</p>
              <button onClick={()=>setDocs(d=>[...d,{titre:'',url:'',pages:'',taille:''}])}
                style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'5px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-secondary)',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>
                <Plus size={11}/> Ajouter
              </button>
            </div>
            {docs.length === 0 ? (
              <p style={{fontSize:'12px',color:'var(--text-secondary)',textAlign:'center',padding:'12px',opacity:0.6}}>Aucun document — cliquez Ajouter</p>
            ) : docs.map((doc, i) => (
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 70px 80px auto',gap:'8px',marginBottom:'8px',alignItems:'center'}}>
                <input value={doc.titre} onChange={e=>setDocs(d=>d.map((x,j)=>j===i?{...x,titre:e.target.value}:x))}
                  placeholder="Titre du document" style={{...iStyle,fontSize:'12px',padding:'7px 10px'}}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                  onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                <input value={doc.url} onChange={e=>setDocs(d=>d.map((x,j)=>j===i?{...x,url:e.target.value}:x))}
                  placeholder="URL du PDF" style={{...iStyle,fontSize:'12px',padding:'7px 10px'}}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                  onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                <input value={doc.pages} onChange={e=>setDocs(d=>d.map((x,j)=>j===i?{...x,pages:e.target.value}:x))}
                  placeholder="Pages" type="number" style={{...iStyle,fontSize:'12px',padding:'7px 10px'}}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                  onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                <input value={doc.taille} onChange={e=>setDocs(d=>d.map((x,j)=>j===i?{...x,taille:e.target.value}:x))}
                  placeholder="Ex: 2.1 MB" style={{...iStyle,fontSize:'12px',padding:'7px 10px'}}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                  onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                <button onClick={()=>setDocs(d=>d.filter((_,j)=>j!==i))}
                  style={{padding:'7px',borderRadius:'8px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.08)',cursor:'pointer',display:'flex',alignItems:'center'}}>
                  <Trash2 size={12} style={{color:'#ef4444'}}/>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* COLONNE DROITE */}
        <div style={{display:'flex',flexDirection:'column',gap:'14px',position:'sticky',top:'80px'}}>

          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'18px'}}>
            <p style={{fontSize:'11px',fontWeight:700,color:'var(--text-secondary)',margin:'0 0 12px 0',textTransform:'uppercase',letterSpacing:'0.06em'}}>Publication</p>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:'13px',color:'var(--text-primary)'}}>Statut</span>
                <select value={statut} onChange={e=>setStatut(e.target.value)}
                  style={{padding:'5px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}>
                  <option value="published">✓ Publié</option>
                  <option value="draft">✏ Brouillon</option>
                </select>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:'13px',color:'var(--text-primary)'}}>Accès</span>
                <select value={libre?'libre':'membre'} onChange={e=>setLibre(e.target.value==='libre')}
                  style={{padding:'5px 10px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}>
                  <option value="libre">🔓 Gratuit</option>
                  <option value="membre">🔒 Membres</option>
                </select>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:'13px',color:'var(--text-primary)'}}>Durée</span>
                <input value={duree} onChange={e=>setDuree(e.target.value)} placeholder="25 min"
                  style={{width:'80px',padding:'5px 8px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                  onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{fontSize:'13px',color:'var(--text-primary)'}}>Ordre</span>
                <input value={ordre} onChange={e=>setOrdre(Number(e.target.value))} type="number" min={1}
                  style={{width:'60px',padding:'5px 8px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'12px',outline:'none'}}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                  onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
              </div>
            </div>
          </div>

          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'18px'}}>
            <p style={{fontSize:'11px',fontWeight:700,color:'var(--text-secondary)',margin:'0 0 10px 0',textTransform:'uppercase',letterSpacing:'0.06em'}}>Types de contenu</p>
            {TYPE_OPTS.map(t => {
              const active = types.includes(t.v)
              return (
                <button key={t.v} onClick={()=>toggleType(t.v)}
                  style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 10px',borderRadius:'9px',border:'1px solid',width:'100%',marginBottom:'5px',cursor:'pointer',transition:'all 0.15s',
                    background: active ? t.c+'12' : 'var(--bg-secondary)',
                    borderColor: active ? t.c+'40' : 'var(--border)',
                    color: active ? t.c : 'var(--text-secondary)'}}>
                  <div style={{width:'8px',height:'8px',borderRadius:'50%',background:active?t.c:'var(--border)',transition:'all 0.15s'}}/>
                  <span style={{fontSize:'12px',fontWeight:active?700:400}}>{t.l}</span>
                  {active && <span style={{marginLeft:'auto',fontSize:'10px'}}>✓</span>}
                </button>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}

export default function NouveauModulePage() {
  return (
    <Suspense fallback={<div style={{padding:'40px',color:'var(--text-secondary)'}}>Chargement...</div>}>
      <NouveauModuleContent/>
    </Suspense>
  )
}