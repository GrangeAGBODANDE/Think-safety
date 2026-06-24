'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { SECTEURS } from '@/lib/secteurs-data'
import { CheckCircle, ChevronLeft, Shield, Lock, Plus, Trash2, Upload, X, ChevronDown } from 'lucide-react'

const CATEGORIES = ['EPI','Formation','Service HSE','Detection','Incendie','Signalisation','Premiers secours','Autre']

const SPEC_TEMPLATES: Record<string, Record<string, Record<string,string>>> = {
  'EPI': {
    'Caractéristiques générales': { 'Matière principale':'', 'Poids':'', 'Taille(s) disponible(s)':'', 'Couleur(s)':'' },
    'Performances': { 'Norme CE':'', 'Niveau de protection':'', 'Résistance':'', 'Durée de vie estimée':'' },
    'Utilisation': { 'Secteur d\'application':'', 'Conditions d\'utilisation':'', 'Entretien':'' },
  },
  'Detection': {
    'Spécifications techniques': { 'Type de détection':'', 'Plage de mesure':'', 'Précision':'', 'Alimentation':'', 'Autonomie':'' },
    'Connectivité': { 'Interface':'', 'Protocole':'', 'Portée':'', 'Fréquence':'' },
    'Conditions de fonctionnement': { 'Température':'', 'Humidité':'', 'Indice de protection IP':'', 'Dimensions':'' },
  },
  'Incendie': {
    'Spécifications': { 'Type':'', 'Capacité / Poids':'', 'Agent extincteur':'', 'Pression':'', 'Portée jet':'' },
    'Certifications': { 'Norme':'', 'Classe de feu':'', 'Marquage CE':'' },
    'Installation': { 'Mode de fixation':'', 'Température de stockage':'', 'Durée de vie':'' },
  },
  'Formation': {
    'Détails formation': { 'Durée':'', 'Format':'', 'Niveau requis':'', 'Nb participants max':'' },
    'Contenu': { 'Modules couverts':'', 'Langue':'', 'Support inclus':'', 'Certification délivrée':'' },
    'Organisation': { 'Lieu':'', 'Modalités':'', 'Prérequis':'' },
  },
}

const iStyle: React.CSSProperties = {
  width:'100%', padding:'10px 14px', borderRadius:'10px',
  border:'1px solid var(--border)', background:'var(--bg-secondary)',
  color:'var(--text-primary)', fontSize:'13px', outline:'none',
  boxSizing:'border-box', fontFamily:'inherit',
}

const Field = ({ label, required, children, hint }: { label:string; required?:boolean; children:React.ReactNode; hint?:string }) => (
  <div style={{marginBottom:'16px'}}>
    <label style={{fontSize:'11px',fontWeight:700,color:'var(--text-secondary)',display:'block',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.05em'}}>
      {label}{required && <span style={{color:'var(--orange)',marginLeft:'2px'}}>*</span>}
    </label>
    {children}
    {hint && <p style={{fontSize:'11px',color:'var(--text-secondary)',margin:'4px 0 0 0',opacity:0.7}}>{hint}</p>}
  </div>
)

function autoSlug(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim()
    + '-' + Date.now().toString().slice(-4)
}

export default function PublierPage() {
  const router = useRouter()
  const [submitted,  setSubmitted]  = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [checking,   setChecking]   = useState(true)
  const [profile,    setProfile]    = useState<any>(null)
  const [user,       setUser]       = useState<any>(null)
  const [error,      setError]      = useState('')
  const [step,       setStep]       = useState(1)
  const [uploadingImg, setUploadingImg] = useState(false)

  // Form basique
  const [titre,       setTitre]       = useState('')
  const [categorie,   setCategorie]   = useState('')
  const [secteurSlug, setSecteurSlug] = useState('')
  const [descCourte,  setDescCourte]  = useState('')
  const [description, setDescription] = useState('')
  const [prix,        setPrix]        = useState('')
  const [prixType,    setPrixType]    = useState('fixe')
  const [negociable,  setNegociable]  = useState(false)
  const [localisation,setLocalisation]= useState('')
  const [livraison,   setLivraison]   = useState(false)
  const [stock,       setStock]       = useState('')
  const [unite,       setUnite]       = useState('unité')
  const [garantie,    setGarantie]    = useState('')
  const [marque,      setMarque]      = useState('')
  const [modele,      setModele]      = useState('')
  const [reference,   setReference]   = useState('')
  const [images,      setImages]      = useState<string[]>([])
  const [tags,        setTags]        = useState<string[]>([])
  const [tagInput,    setTagInput]    = useState('')
  const [certifs,     setCertifs]     = useState<string[]>([])
  const [certifInput, setCertifInput] = useState('')
  const [caracts,     setCaracts]     = useState<string[]>([''])
  const [videoUrl,    setVideoUrl]    = useState('')

  // Vendeur
  const [vendNom,  setVendNom]  = useState('')
  const [vendTel,  setVendTel]  = useState('')
  const [vendEmail,setVendEmail]= useState('')
  const [vendWa,   setVendWa]   = useState('')
  const [vendOrg,  setVendOrg]  = useState('')

  // Spécifications dynamiques
  const [specs, setSpecs] = useState<Record<string, Record<string,string>>>({})
  const [newCatName, setNewCatName] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/connexion?redirect=/marketplace/publier'); return }
      setUser(data.user)
      supabase.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: p }) => {
        setProfile(p)
        if (p) {
          setVendNom(`${p.prenom||''} ${p.nom||''}`.trim())
          setVendEmail(data.user.email||'')
          setVendTel(p.telephone||'')
          setLocalisation(p.ville ? `${p.ville}, ${p.pays||'Bénin'}` : (p.pays||'Bénin'))
        }
        setChecking(false)
      })
    })
  }, [router])

  // Appliquer template specs selon catégorie
  useEffect(() => {
    if (categorie && SPEC_TEMPLATES[categorie]) {
      setSpecs(SPEC_TEMPLATES[categorie])
    }
  }, [categorie])

  const isAdmin  = profile && ['admin','superadmin','moderateur'].includes(profile.role)
  const isSeller = profile?.is_seller === true
  const canPublish = isAdmin || isSeller

  const uploadImage = async (file: File) => {
    setUploadingImg(true)
    const path = `marketplace/${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage.from('modules-images').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: url } = supabase.storage.from('modules-images').getPublicUrl(data.path)
      setImages(imgs => [...imgs, url.publicUrl])
    }
    setUploadingImg(false)
  }

  const setSpecVal = (cat: string, key: string, val: string) => {
    setSpecs(s => ({ ...s, [cat]: { ...s[cat], [key]: val } }))
  }
  const addSpecRow = (cat: string) => {
    setSpecs(s => ({ ...s, [cat]: { ...s[cat], 'Nouvelle propriété': '' } }))
  }
  const removeSpecRow = (cat: string, key: string) => {
    setSpecs(s => { const c = {...s[cat]}; delete c[key]; return {...s, [cat]: c} })
  }
  const addSpecCat = () => {
    if (!newCatName.trim()) return
    setSpecs(s => ({ ...s, [newCatName.trim()]: {} }))
    setNewCatName('')
  }
  const removeSpecCat = (cat: string) => {
    setSpecs(s => { const n = {...s}; delete n[cat]; return n })
  }

  const handleSubmit = async () => {
    if (!titre || !categorie || !vendNom) { setError('Titre, catégorie et nom vendeur obligatoires.'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.from('marketplace_annonces').insert({
      titre, categorie, secteur_slug: secteurSlug,
      description_courte: descCourte, description,
      prix: prix ? Number(prix) : null,
      prix_type: prixType, negociable, localisation, livraison,
      stock: stock ? Number(stock) : null,
      unite, garantie, marque, modele, reference,
      images, tags, certifications: certifs,
      caracteristiques: caracts.filter(Boolean),
      specifications: specs,
      video_url: videoUrl,
      slug: autoSlug(titre),
      vendeur_id: user?.id,
      vendeur_nom: vendNom,
      vendeur_telephone: vendTel,
      vendeur_email: vendEmail,
      vendeur_whatsapp: vendWa,
      vendeur_organisation: vendOrg,
      vendeur_certifie: isSeller || isAdmin,
      status: isAdmin ? 'approved' : 'pending',
      vues: 0, likes: 0, note: 0, nb_avis: 0,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSubmitted(true)
  }

  if (checking) return <div style={{minHeight:'100vh',background:'var(--bg-main)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-secondary)'}}>Vérification...</div>

  if (!canPublish) return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'80vh',padding:'24px'}}>
        <div style={{textAlign:'center',maxWidth:'420px'}}>
          <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'rgba(239,68,68,0.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
            <Lock size={28} style={{color:'#ef4444'}}/>
          </div>
          <h2 style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 10px 0'}}>Accès restreint</h2>
          <p style={{fontSize:'14px',color:'var(--text-secondary)',margin:'0 0 24px 0',lineHeight:1.7}}>
            Pour publier sur la marketplace, vous devez souscrire à un abonnement entreprise.
          </p>
          <div style={{display:'flex',gap:'10px',justifyContent:'center'}}>
            <Link href="/marketplace" style={{padding:'10px 20px',borderRadius:'12px',border:'1px solid var(--border)',color:'var(--text-primary)',textDecoration:'none',fontSize:'13px',fontWeight:600}}>Retour</Link>
            <Link href="/abonnements" style={{padding:'10px 20px',borderRadius:'12px',background:'var(--orange)',color:'white',textDecoration:'none',fontSize:'13px',fontWeight:700}}>Voir les abonnements</Link>
          </div>
        </div>
      </div>
    </div>
  )

  if (submitted) return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'80vh',padding:'24px'}}>
        <div style={{textAlign:'center',maxWidth:'440px',padding:'40px',borderRadius:'24px',background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.25)'}}>
          <CheckCircle size={48} style={{color:'#22c55e',marginBottom:'16px'}}/>
          <h2 style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 10px 0'}}>
            {isAdmin ? 'Annonce publiée !' : 'Annonce soumise !'}
          </h2>
          <p style={{fontSize:'14px',color:'var(--text-secondary)',margin:'0 0 24px 0',lineHeight:1.7}}>
            {isAdmin ? 'Votre annonce est maintenant visible sur la marketplace.' : 'Votre annonce est en cours de validation. Elle sera visible sous 24h.'}
          </p>
          <div style={{display:'flex',gap:'10px',justifyContent:'center'}}>
            <Link href="/marketplace" style={{padding:'11px 22px',borderRadius:'13px',background:'var(--orange)',color:'white',textDecoration:'none',fontSize:'13px',fontWeight:700}}>Voir la marketplace</Link>
            <button onClick={()=>{setSubmitted(false);setTitre('');setStep(1)}} style={{padding:'11px 22px',borderRadius:'13px',border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-primary)',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>
              Nouvelle annonce
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const STEPS = ['Informations','Spécifications','Médias','Vendeur & Prix']

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>
      <div style={{maxWidth:'900px',margin:'0 auto',padding:'80px 24px 96px'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'28px'}}>
          <Link href="/marketplace" style={{display:'flex',alignItems:'center',gap:'5px',padding:'7px 12px',borderRadius:'9px',border:'1px solid var(--border)',color:'var(--text-secondary)',textDecoration:'none',fontSize:'12px'}}>
            <ChevronLeft size={13}/> Retour
          </Link>
          <h1 style={{fontSize:'1.4rem',fontWeight:900,color:'var(--text-primary)',margin:0}}>Publier une annonce</h1>
        </div>

        {/* Indicateur étapes */}
        <div style={{display:'flex',gap:'0',marginBottom:'32px',background:'var(--bg-card)',borderRadius:'14px',border:'1px solid var(--border)',overflow:'hidden'}}>
          {STEPS.map((s, i) => (
            <button key={i} onClick={()=>setStep(i+1)}
              style={{flex:1,padding:'12px 8px',fontSize:'12px',fontWeight:step===i+1?700:500,border:'none',borderRight:i<3?'1px solid var(--border)':'none',cursor:'pointer',transition:'all 0.2s',
                background: step===i+1 ? 'var(--orange)' : step>i+1 ? 'rgba(34,197,94,0.08)' : 'transparent',
                color:      step===i+1 ? 'white'         : step>i+1 ? '#22c55e'                : 'var(--text-secondary)'}}>
              {step>i+1 ? '✓ ' : `${i+1}. `}{s}
            </button>
          ))}
        </div>

        {error && <div style={{padding:'12px 16px',borderRadius:'10px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',marginBottom:'20px',color:'#ef4444',fontSize:'13px'}}>{error}</div>}

        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'16px',padding:'28px',marginBottom:'20px'}}>

          {/* ── ÉTAPE 1 : INFORMATIONS ── */}
          {step===1 && (
            <>
              <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 20px 0'}}>Informations générales du produit</p>
              <Field label="Titre du produit" required>
                <input value={titre} onChange={e=>setTitre(e.target.value)} placeholder="Ex: Casque de sécurité EN 397 - Taille universelle" style={iStyle}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
              </Field>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <Field label="Catégorie" required>
                  <div style={{position:'relative'}}>
                    <select value={categorie} onChange={e=>setCategorie(e.target.value)} style={{...iStyle,appearance:'none',paddingRight:'28px',cursor:'pointer'}}>
                      <option value="">— Choisir —</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={12} style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',color:'var(--text-secondary)',pointerEvents:'none'}}/>
                  </div>
                </Field>
                <Field label="Secteur d'activité">
                  <div style={{position:'relative'}}>
                    <select value={secteurSlug} onChange={e=>setSecteurSlug(e.target.value)} style={{...iStyle,appearance:'none',paddingRight:'28px',cursor:'pointer'}}>
                      <option value="">— Tous secteurs —</option>
                      {SECTEURS.map(s => <option key={s.slug} value={s.slug}>{s.nom}</option>)}
                    </select>
                    <ChevronDown size={12} style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',color:'var(--text-secondary)',pointerEvents:'none'}}/>
                  </div>
                </Field>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>
                <Field label="Marque">
                  <input value={marque} onChange={e=>setMarque(e.target.value)} placeholder="Ex: Honeywell" style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </Field>
                <Field label="Modèle">
                  <input value={modele} onChange={e=>setModele(e.target.value)} placeholder="Ex: H-700" style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </Field>
                <Field label="Référence">
                  <input value={reference} onChange={e=>setReference(e.target.value)} placeholder="Réf. fabricant" style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </Field>
              </div>
              <Field label="Description courte" hint="Affiché dans les listes et en intro de la fiche produit">
                <textarea value={descCourte} onChange={e=>setDescCourte(e.target.value)} rows={2} placeholder="Résumez votre produit en 1-2 phrases..."
                  style={{...iStyle,resize:'vertical',lineHeight:1.6}}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
              </Field>
              <Field label="Description complète">
                <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={5} placeholder="Description détaillée : utilisation, avantages, contexte..."
                  style={{...iStyle,resize:'vertical',lineHeight:1.6}}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
              </Field>
              <Field label="Points clés (caractéristiques)" hint="Une caractéristique par ligne, affichées avec des coches ✓">
                {caracts.map((c,i) => (
                  <div key={i} style={{display:'flex',gap:'6px',marginBottom:'6px'}}>
                    <input value={c} onChange={e=>setCaracts(cs=>cs.map((x,j)=>j===i?e.target.value:x))} placeholder={`Ex: Résistance aux chocs EN 397`} style={{...iStyle,flex:1}}
                      onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                    {caracts.length>1 && <button onClick={()=>setCaracts(cs=>cs.filter((_,j)=>j!==i))} style={{padding:'8px',borderRadius:'8px',border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.08)',cursor:'pointer',display:'flex',alignItems:'center'}}>
                      <X size={12} style={{color:'#ef4444'}}/>
                    </button>}
                  </div>
                ))}
                <button onClick={()=>setCaracts(cs=>[...cs,''])} style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'6px 12px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-secondary)',fontSize:'12px',fontWeight:600,cursor:'pointer',marginTop:'4px'}}>
                  <Plus size={11}/> Ajouter un point clé
                </button>
              </Field>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <Field label="Certifications & Normes" hint="Ex: EN 397, ISO 9001, CE">
                  <div style={{display:'flex',gap:'6px',marginBottom:'8px'}}>
                    <input value={certifInput} onChange={e=>setCertifInput(e.target.value)}
                      onKeyDown={e=>{ if(e.key==='Enter'&&certifInput.trim()){setCertifs(c=>[...c,certifInput.trim()]);setCertifInput('')}}}
                      placeholder="Taper et Entrée..." style={{...iStyle,flex:1}}
                      onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                    <button onClick={()=>{if(certifInput.trim()){setCertifs(c=>[...c,certifInput.trim()]);setCertifInput('')}}}
                      style={{padding:'8px 12px',borderRadius:'9px',background:'var(--orange)',color:'white',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:700}}>+</button>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>
                    {certifs.map((c,i) => (
                      <span key={i} style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'3px 8px',borderRadius:'6px',fontSize:'11px',fontWeight:700,color:'#22c55e',background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)'}}>
                        {c}<button onClick={()=>setCertifs(cs=>cs.filter((_,j)=>j!==i))} style={{background:'none',border:'none',cursor:'pointer',padding:0,color:'#22c55e',lineHeight:1}}><X size={9}/></button>
                      </span>
                    ))}
                  </div>
                </Field>
                <Field label="Tags de recherche" hint="Ex: casque, protection, BTP">
                  <div style={{display:'flex',gap:'6px',marginBottom:'8px'}}>
                    <input value={tagInput} onChange={e=>setTagInput(e.target.value)}
                      onKeyDown={e=>{ if(e.key==='Enter'&&tagInput.trim()){setTags(t=>[...t,tagInput.trim()]);setTagInput('')}}}
                      placeholder="Taper et Entrée..." style={{...iStyle,flex:1}}
                      onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                    <button onClick={()=>{if(tagInput.trim()){setTags(t=>[...t,tagInput.trim()]);setTagInput('')}}}
                      style={{padding:'8px 12px',borderRadius:'9px',background:'var(--orange)',color:'white',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:700}}>+</button>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>
                    {tags.map((t,i) => (
                      <span key={i} style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'3px 8px',borderRadius:'6px',fontSize:'11px',fontWeight:600,color:'var(--text-secondary)',background:'var(--bg-secondary)',border:'1px solid var(--border)'}}>
                        {t}<button onClick={()=>setTags(ts=>ts.filter((_,j)=>j!==i))} style={{background:'none',border:'none',cursor:'pointer',padding:0,color:'var(--text-secondary)',lineHeight:1}}><X size={9}/></button>
                      </span>
                    ))}
                  </div>
                </Field>
              </div>
            </>
          )}

          {/* ── ÉTAPE 2 : SPÉCIFICATIONS ── */}
          {step===2 && (
            <>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
                <div>
                  <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 4px 0'}}>Spécifications techniques</p>
                  <p style={{fontSize:'12px',color:'var(--text-secondary)',margin:0}}>
                    {categorie && SPEC_TEMPLATES[categorie] ? `Template "${categorie}" pré-rempli — modifiez selon votre produit.` : 'Ajoutez des catégories et leurs paramètres.'}
                  </p>
                </div>
              </div>

              {Object.entries(specs).map(([cat, rows]) => (
                <div key={cat} style={{marginBottom:'20px',border:'1px solid var(--border)',borderRadius:'12px',overflow:'hidden'}}>
                  <div style={{padding:'10px 14px',background:'rgba(212,80,15,0.06)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{fontSize:'12px',fontWeight:900,color:'var(--orange)',textTransform:'uppercase',letterSpacing:'0.06em'}}>{cat}</span>
                    <button onClick={()=>removeSpecCat(cat)} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',padding:0}}><Trash2 size={13}/></button>
                  </div>
                  {Object.entries(rows).map(([key, val]) => (
                    <div key={key} style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:'0',borderBottom:'1px solid var(--border)'}}>
                      <input defaultValue={key}
                        onBlur={e=>{ if(e.target.value!==key){ const v=rows[key]; removeSpecRow(cat,key); setSpecs(s=>({...s,[cat]:{...s[cat],[e.target.value]:v}})) }}}
                        style={{...iStyle,borderRadius:'0',border:'none',borderRight:'1px solid var(--border)',fontSize:'12px',color:'var(--text-secondary)'}}/>
                      <input value={val} onChange={e=>setSpecVal(cat,key,e.target.value)} placeholder="Valeur..."
                        style={{...iStyle,borderRadius:'0',border:'none',fontSize:'12px'}}/>
                      <button onClick={()=>removeSpecRow(cat,key)} style={{padding:'0 12px',border:'none',borderLeft:'1px solid var(--border)',background:'transparent',cursor:'pointer',color:'#ef4444'}}><X size={12}/></button>
                    </div>
                  ))}
                  <button onClick={()=>addSpecRow(cat)} style={{width:'100%',padding:'8px',border:'none',background:'var(--bg-secondary)',color:'var(--text-secondary)',fontSize:'12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'5px'}}>
                    <Plus size={11}/> Ajouter une propriété
                  </button>
                </div>
              ))}

              {/* Nouvelle catégorie */}
              <div style={{display:'flex',gap:'8px'}}>
                <input value={newCatName} onChange={e=>setNewCatName(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&addSpecCat()}
                  placeholder="Nom de la nouvelle catégorie de specs..."
                  style={{...iStyle,flex:1}} onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                <button onClick={addSpecCat} style={{padding:'10px 16px',borderRadius:'10px',background:'var(--orange)',color:'white',border:'none',fontSize:'13px',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>
                  <Plus size={13} style={{display:'inline',verticalAlign:'middle',marginRight:'4px'}}/>Ajouter catégorie
                </button>
              </div>
            </>
          )}

          {/* ── ÉTAPE 3 : MÉDIAS ── */}
          {step===3 && (
            <>
              <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 20px 0'}}>Photos et médias du produit</p>
              <Field label="Photos du produit" hint="Ajoutez jusqu'à 8 photos. La première sera l'image principale.">
                <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',padding:'20px',borderRadius:'12px',border:'2px dashed var(--border)',background:'var(--bg-secondary)',cursor:'pointer',fontSize:'13px',color:'var(--text-secondary)',fontWeight:600,marginBottom:'12px'}}>
                  <Upload size={18}/>{uploadingImg ? 'Upload en cours...' : 'Cliquer pour ajouter des photos'}
                  <input type="file" accept="image/*" multiple style={{display:'none'}} disabled={uploadingImg||images.length>=8}
                    onChange={async e=>{ const files=Array.from(e.target.files||[]); for(const f of files) if(images.length<8) await uploadImage(f) }}/>
                </label>
                {images.length > 0 && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px'}}>
                    {images.map((img,i) => (
                      <div key={i} style={{position:'relative',borderRadius:'10px',overflow:'hidden',aspectRatio:'1',border:'1px solid var(--border)'}}>
                        <img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        {i===0 && <div style={{position:'absolute',top:'4px',left:'4px',padding:'2px 6px',borderRadius:'5px',background:'var(--orange)',color:'white',fontSize:'9px',fontWeight:700}}>Principal</div>}
                        <button onClick={()=>setImages(imgs=>imgs.filter((_,j)=>j!==i))}
                          style={{position:'absolute',top:'4px',right:'4px',width:'22px',height:'22px',borderRadius:'50%',background:'rgba(0,0,0,0.6)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <X size={11} style={{color:'white'}}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>
              <Field label="Lien vidéo YouTube" hint="URL complète d'une vidéo de démonstration (optionnel)">
                <input value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." style={iStyle}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
              </Field>
            </>
          )}

          {/* ── ÉTAPE 4 : VENDEUR & PRIX ── */}
          {step===4 && (
            <>
              <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 20px 0'}}>Prix et informations vendeur</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <Field label="Prix (F CFA)" hint="Laissez vide pour 'Prix sur demande'">
                  <input type="number" value={prix} onChange={e=>setPrix(e.target.value)} placeholder="0" style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </Field>
                <Field label="Type de prix">
                  <div style={{position:'relative'}}>
                    <select value={prixType} onChange={e=>setPrixType(e.target.value)} style={{...iStyle,appearance:'none',paddingRight:'28px',cursor:'pointer'}}>
                      <option value="fixe">Prix fixe</option>
                      <option value="devis">Sur devis</option>
                      <option value="location">Location</option>
                      <option value="abonnement">Abonnement</option>
                    </select>
                    <ChevronDown size={12} style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',color:'var(--text-secondary)',pointerEvents:'none'}}/>
                  </div>
                </Field>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>
                <Field label="Stock disponible">
                  <input type="number" value={stock} onChange={e=>setStock(e.target.value)} placeholder="Quantité" style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </Field>
                <Field label="Unité">
                  <input value={unite} onChange={e=>setUnite(e.target.value)} placeholder="unité, boîte, lot..." style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </Field>
                <Field label="Garantie">
                  <input value={garantie} onChange={e=>setGarantie(e.target.value)} placeholder="Ex: 2 ans" style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </Field>
              </div>
              <div style={{display:'flex',gap:'16px',marginBottom:'16px'}}>
                <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',fontSize:'13px',color:'var(--text-secondary)'}}>
                  <input type="checkbox" checked={negociable} onChange={e=>setNegociable(e.target.checked)} style={{width:'16px',height:'16px'}}/>
                  Prix négociable
                </label>
                <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',fontSize:'13px',color:'var(--text-secondary)'}}>
                  <input type="checkbox" checked={livraison} onChange={e=>setLivraison(e.target.checked)} style={{width:'16px',height:'16px'}}/>
                  Livraison disponible
                </label>
              </div>
              <div style={{height:'1px',background:'var(--border)',margin:'20px 0'}}/>
              <p style={{fontSize:'12px',fontWeight:700,color:'var(--text-secondary)',margin:'0 0 14px 0',textTransform:'uppercase',letterSpacing:'0.05em'}}>Coordonnées vendeur</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <Field label="Nom complet" required>
                  <input value={vendNom} onChange={e=>setVendNom(e.target.value)} placeholder="Votre nom" style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </Field>
                <Field label="Organisation">
                  <input value={vendOrg} onChange={e=>setVendOrg(e.target.value)} placeholder="Votre entreprise" style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </Field>
                <Field label="Téléphone">
                  <input value={vendTel} onChange={e=>setVendTel(e.target.value)} placeholder="+229 00 00 00 00" style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </Field>
                <Field label="WhatsApp">
                  <input value={vendWa} onChange={e=>setVendWa(e.target.value)} placeholder="+229 00 00 00 00" style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </Field>
                <Field label="Email">
                  <input type="email" value={vendEmail} onChange={e=>setVendEmail(e.target.value)} placeholder="email@exemple.com" style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </Field>
                <Field label="Localisation">
                  <input value={localisation} onChange={e=>setLocalisation(e.target.value)} placeholder="Ville, Pays" style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </Field>
              </div>
              {!isAdmin && (
                <div style={{padding:'12px 16px',borderRadius:'10px',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',marginTop:'8px'}}>
                  <p style={{fontSize:'12px',color:'var(--text-secondary)',margin:0,lineHeight:1.6}}>
                    ⚠️ Votre annonce sera soumise à validation avant publication (sous 24h). Les administrateurs vérifieront la conformité du produit aux normes HSE.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <div style={{display:'flex',justifyContent:'space-between',gap:'12px'}}>
          {step > 1 ? (
            <button onClick={()=>setStep(s=>s-1)} style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'11px 20px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-card)',color:'var(--text-primary)',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>
              <ChevronLeft size={14}/> Précédent
            </button>
          ) : <div/>}
          {step < 4 ? (
            <button onClick={()=>setStep(s=>s+1)} style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'11px 24px',borderRadius:'12px',background:'var(--orange)',color:'white',border:'none',fontSize:'13px',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(212,80,15,0.25)'}}>
              Continuer <ChevronDown size={14} style={{transform:'rotate(-90deg)'}}/>
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'11px 24px',borderRadius:'12px',background:'var(--orange)',color:'white',border:'none',fontSize:'13px',fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,boxShadow:'0 4px 14px rgba(212,80,15,0.25)'}}>
              <CheckCircle size={14}/>{loading ? 'Publication...' : 'Publier l\'annonce'}
            </button>
          )}
        </div>
      </div>
      <Footer/>
    </div>
  )
}