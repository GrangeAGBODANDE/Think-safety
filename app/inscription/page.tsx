'use client'
import { useState, Suspense, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Shield, Eye, EyeOff, CheckCircle, ChevronRight, ChevronLeft, User, MapPin, Briefcase, Search, X } from 'lucide-react'

// ── Données ──
const PAYS_VILLES: Record<string, string[]> = {
  'Bénin': ['Cotonou','Porto-Novo','Parakou','Abomey-Calavi','Bohicon','Kandi','Lokossa','Ouidah','Djougou','Abomey','Natitingou','Malanville'],
  'Togo': ['Lomé','Sokodé','Kara','Atakpamé','Kpalimé','Bassar','Tsévié','Aného','Mango','Dapaong'],
  'Burkina Faso': ['Ouagadougou','Bobo-Dioulasso','Koudougou','Ouahigouya','Banfora','Tenkodogo','Fada N Gourma','Dédougou'],
  "Côte d'Ivoire": ['Abidjan','Bouaké','Daloa','Yamoussoukro','Korhogo','Man','San-Pédro','Gagnoa','Divo','Abengourou'],
  'Ghana': ['Accra','Kumasi','Tamale','Sekondi-Takoradi','Ashaiman','Sunyani','Cape Coast','Obuasi'],
  'Nigeria': ['Lagos','Abuja','Kano','Ibadan','Kaduna','Port Harcourt','Benin City','Maiduguri','Zaria','Aba'],
  'Niger': ['Niamey','Zinder','Maradi','Tahoua','Agadez','Dosso','Tessaoua','Diffa'],
  'Mali': ['Bamako','Ségou','Mopti','Koulikoro','Kayes','Gao','Kidal','Sikasso'],
  'Sénégal': ['Dakar','Thiès','Rufisque','Kaolack','Ziguinchor','Saint-Louis','Diourbel','Louga','Tambacounda'],
  'Guinée': ['Conakry','Kankan','Kindia','Labé','Guéckédou','Nzérékoré','Mamou','Kissidougou'],
  'Cameroun': ['Yaoundé','Douala','Garoua','Bamenda','Maroua','Bafoussam','Ngaoundéré','Bertoua'],
  'Congo': ['Brazzaville','Pointe-Noire','Dolisie','Nkayi','Impfondo','Sibiti'],
  'Gabon': ['Libreville','Port-Gentil','Franceville','Oyem','Moanda','Mouila','Lambaréné'],
  'Madagascar': ['Antananarivo','Toamasina','Antsirabe','Fianarantsoa','Mahajanga','Toliara'],
  'Mauritanie': ['Nouakchott','Nouadhibou','Rosso','Kaédi','Zouerate','Kiffa'],
  'Sierra Leone': ['Freetown','Bo','Kenema','Makeni','Koidu'],
  'Liberia': ['Monrovia','Gbarnga','Kakata','Bensonville','Harper'],
  'Gambie': ['Banjul','Serekunda','Brikama','Bakau','Farafenni'],
  'Guinée-Bissau': ['Bissau','Bafatá','Gabú','Bissorã','Bolama'],
  'Cabo Verde': ['Praia','Mindelo','Santa Maria','Assomada','Porto Novo'],
  'France': ['Paris','Lyon','Marseille','Toulouse','Bordeaux','Lille','Nantes','Strasbourg','Montpellier','Nice'],
  'Belgique': ['Bruxelles','Anvers','Gand','Charleroi','Liège','Bruges','Namur'],
  'Suisse': ['Genève','Zurich','Berne','Lausanne','Bâle','Lucerne'],
  'Canada': ['Montréal','Toronto','Vancouver','Ottawa','Calgary','Québec City'],
  'Autre': [],
}

const PAYS_LISTE = Object.keys(PAYS_VILLES)

const SECTEURS_LISTE = [
  'Construction & BTP','Industrie Manufacturière','Santé & Médical',
  'Agriculture & Élevage','Transport & Logistique','Mines & Carrières',
  'Énergie (Électricité, Pétrole, Gaz)','Chimie & Pharmacie',
  'Bureaux & Tertiaire','Restauration & Hôtellerie','Commerce & Distribution',
  'Éducation & Formation','Sport & Loisirs','Numérique & IT',
  'Maritime & Pêche','Transport Aérien','Forêt & Environnement',
  'Sécurité & Défense','Autre',
]

const PROFESSIONS = [
  'Responsable HSE / Sécurité','Directeur / Manager','Chef de chantier / Site',
  'Technicien / Ouvrier','Médecin / Infirmier / Soignant','Enseignant / Formateur',
  'Ingénieur','Ressources Humaines','Commercial / Ventes',
  'Entrepreneur / Indépendant','Consultant','Étudiant / Stagiaire','Autre',
]

// ── Composant de sélection avec recherche ──
interface SearchSelectProps {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
  emptyMsg?: string
}

function SearchSelect({ value, onChange, options, placeholder, emptyMsg }: SearchSelectProps) {
  const [open,   setOpen]   = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))

  return (
    <div ref={ref} style={{position:'relative'}}>
      <div onClick={()=>setOpen(!open)}
        style={{width:'100%',padding:'11px 14px',borderRadius:'11px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:value?'var(--text-primary)':'var(--text-secondary)',fontSize:'14px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',boxSizing:'border-box',userSelect:'none',
          borderColor: open ? 'var(--orange)' : 'var(--border)'}}>
        <span>{value || placeholder}</span>
        <ChevronRight size={14} style={{transform:open?'rotate(90deg)':'rotate(0)',transition:'transform 0.2s',color:'var(--text-secondary)'}}/>
      </div>
      {open && (
        <div style={{position:'absolute',top:'100%',left:0,right:0,zIndex:100,marginTop:'4px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-card)',boxShadow:'0 8px 32px rgba(0,0,0,0.15)',overflow:'hidden'}}>
          {/* Recherche */}
          <div style={{padding:'8px',borderBottom:'1px solid var(--border)',position:'relative'}}>
            <Search size={13} style={{position:'absolute',left:'20px',top:'50%',transform:'translateY(-50%)',color:'var(--text-secondary)'}}/>
            <input autoFocus value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Rechercher..."
              style={{width:'100%',padding:'8px 8px 8px 32px',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'13px',outline:'none',boxSizing:'border-box'}}/>
            {search && <button onClick={()=>setSearch('')} style={{position:'absolute',right:'16px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)'}}>
              <X size={12}/>
            </button>}
          </div>
          {/* Options */}
          <div style={{maxHeight:'200px',overflowY:'auto'}}>
            {filtered.length === 0 ? (
              <div style={{padding:'16px',textAlign:'center',fontSize:'13px',color:'var(--text-secondary)'}}>{emptyMsg || 'Aucun résultat'}</div>
            ) : filtered.map(o => (
              <div key={o} onClick={()=>{ onChange(o); setOpen(false); setSearch('') }}
                style={{padding:'10px 14px',fontSize:'14px',cursor:'pointer',color:o===value?'var(--orange)':'var(--text-primary)',background:o===value?'var(--orange)10':'transparent',fontWeight:o===value?700:400,transition:'background 0.1s'}}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg-secondary)'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=o===value?'rgba(212,80,15,0.06)':'transparent'}>
                {o}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Styles communs ──
const iStyle: React.CSSProperties = {
  width:'100%', padding:'11px 14px', borderRadius:'11px',
  border:'1px solid var(--border)', background:'var(--bg-secondary)',
  color:'var(--text-primary)', fontSize:'14px', outline:'none',
  boxSizing:'border-box', fontFamily:'inherit', transition:'border-color 0.15s',
}

const Field = ({ label, required, children }: { label:string; required?:boolean; children:React.ReactNode }) => (
  <div style={{marginBottom:'14px'}}>
    <label style={{fontSize:'12px',fontWeight:600,color:'var(--text-secondary)',display:'block',marginBottom:'5px'}}>
      {label}{required && <span style={{color:'var(--orange)',marginLeft:'2px'}}>*</span>}
    </label>
    {children}
  </div>
)

// ── Composant principal ──
function InscriptionContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirect     = searchParams.get('redirect') || '/secteurs'

  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  // Étape 1
  const [prenom,   setPrenom]   = useState('')
  const [nom,      setNom]      = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  // Étape 2 — Localisation (géolocalisée automatiquement)
  const [pays,      setPays]      = useState('Bénin')
  const [ville,     setVille]     = useState('')
  const [telephone, setTelephone] = useState('')
  const [genre,     setGenre]     = useState('')
  const [geoLoading, setGeoLoading] = useState(false)

  // Étape 3
  const [profession, setProfession] = useState('')
  const [secteur,    setSecteur]    = useState('')
  const [niveau,     setNiveau]     = useState('debutant')

  // Géolocalisation auto au chargement
  useEffect(() => {
    setGeoLoading(true)
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        if (data.country_name) {
          // Trouver le pays dans notre liste
          const paysMatch = PAYS_LISTE.find(p =>
            p.toLowerCase().includes(data.country_name.toLowerCase()) ||
            data.country_name.toLowerCase().includes(p.toLowerCase())
          )
          if (paysMatch) setPays(paysMatch)
        }
        if (data.city) {
          setVille(data.city)
        }
      })
      .catch(() => {}) // Silencieux si pas de géoloc
      .finally(() => setGeoLoading(false))
  }, [])

  const villesDuPays = PAYS_VILLES[pays] || []

  const validateStep1 = () => {
    if (!prenom || !email || !password) { setError('Prénom, email et mot de passe sont obligatoires.'); return false }
    if (password.length < 6) { setError('Mot de passe : 6 caractères minimum.'); return false }
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailReg.test(email)) { setError('Adresse email invalide.'); return false }
    return true
  }

  const goNext = () => {
    setError('')
    if (step === 1 && !validateStep1()) return
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setLoading(true); setError('')
    const { data, error: err } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: `${prenom} ${nom}`.trim(), prenom, nom }
      }
    })
    if (err) { setError(err.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id, email, prenom, nom,
        pays, ville, telephone, genre,
        profession, secteur_activite: secteur,
        niveau_experience: niveau, role: 'user',
      })
    }
    setLoading(false)
    if (data.session) { router.push(redirect) } else { setSuccess(true) }
  }

  const STEPS = [
    { n:1, label:'Compte',       icon:User      },
    { n:2, label:'Localisation', icon:MapPin    },
    { n:3, label:'Profil pro',   icon:Briefcase },
  ]

  if (success) return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 64px)',padding:'24px'}}>
        <div style={{maxWidth:'420px',width:'100%',padding:'40px',borderRadius:'24px',background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.25)',textAlign:'center'}}>
          <CheckCircle size={48} style={{color:'#22c55e',marginBottom:'16px'}}/>
          <h2 style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 10px 0'}}>Compte créé !</h2>
          <p style={{fontSize:'14px',color:'var(--text-secondary)',marginBottom:'20px',lineHeight:1.7}}>
            Un email de confirmation a été envoyé à <strong>{email}</strong>. Cliquez sur le lien pour activer votre compte.
          </p>
          <Link href={`/connexion?redirect=${redirect}`} style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'11px 24px',borderRadius:'12px',background:'var(--orange)',color:'white',textDecoration:'none',fontWeight:700,fontSize:'14px'}}>
            Se connecter <ChevronRight size={14}/>
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 64px)',padding:'24px 16px'}}>
        <div style={{width:'100%',maxWidth:'480px'}}>

          {/* Logo */}
          <div style={{textAlign:'center',marginBottom:'28px'}}>
            <div style={{width:'52px',height:'52px',borderRadius:'16px',background:'var(--orange)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',boxShadow:'0 8px 24px rgba(212,80,15,0.3)'}}>
              <Shield size={24} style={{color:'white'}}/>
            </div>
            <h1 style={{fontSize:'1.5rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 4px 0'}}>Créer un compte</h1>
            <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:0}}>Accès gratuit à toutes les formations</p>
          </div>

          {/* Indicateur étapes */}
          <div style={{display:'flex',alignItems:'center',marginBottom:'24px'}}>
            {STEPS.map((s, i) => {
              const done   = step > s.n
              const active = step === s.n
              const Icon   = s.icon
              return (
                <div key={s.n} style={{display:'flex',alignItems:'center',flex:1}}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',flex:'0 0 auto'}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s',
                      background: done ? '#22c55e' : active ? 'var(--orange)' : 'var(--bg-secondary)',
                      border: `2px solid ${done ? '#22c55e' : active ? 'var(--orange)' : 'var(--border)'}`,
                    }}>
                      {done ? <CheckCircle size={16} style={{color:'white'}}/> : <Icon size={15} style={{color: active ? 'white' : 'var(--text-secondary)'}}/>}
                    </div>
                    <span style={{fontSize:'10px',fontWeight:active||done?700:400,color:active?'var(--orange)':done?'#22c55e':'var(--text-secondary)',marginTop:'4px',whiteSpace:'nowrap'}}>{s.label}</span>
                  </div>
                  {i < STEPS.length-1 && (
                    <div style={{flex:1,height:'2px',background: step > s.n ? '#22c55e' : 'var(--border)',margin:'0 8px',marginBottom:'16px',transition:'background 0.3s'}}/>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'20px',padding:'28px'}}>
            {error && (
              <div style={{padding:'10px 14px',borderRadius:'9px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',marginBottom:'16px'}}>
                <p style={{fontSize:'13px',color:'#ef4444',margin:0}}>{error}</p>
              </div>
            )}

            {/* ÉTAPE 1 — COMPTE */}
            {step === 1 && (
              <>
                <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 16px 0'}}>Informations de connexion</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  <Field label="Prénom" required>
                    <input value={prenom} onChange={e=>setPrenom(e.target.value)} placeholder="Jean" style={iStyle}
                      onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                  </Field>
                  <Field label="Nom">
                    <input value={nom} onChange={e=>setNom(e.target.value)} placeholder="Dupont" style={iStyle}
                      onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                  </Field>
                </div>
                <Field label="Adresse email" required>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@exemple.com" style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </Field>
                <Field label="Mot de passe" required>
                  <div style={{position:'relative'}}>
                    <input type={showPwd?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                      onKeyDown={e=>e.key==='Enter'&&goNext()} placeholder="6 caractères minimum"
                      style={{...iStyle,paddingRight:'42px'}}
                      onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                    <button onClick={()=>setShowPwd(!showPwd)} style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)'}}>
                      {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </Field>
              </>
            )}

            {/* ÉTAPE 2 — LOCALISATION */}
            {step === 2 && (
              <>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
                  <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:0}}>Votre localisation</p>
                  {geoLoading && <span style={{fontSize:'11px',color:'var(--orange)'}}>📍 Détection en cours...</span>}
                  {!geoLoading && pays && <span style={{fontSize:'11px',color:'#22c55e'}}>📍 Localisé automatiquement</span>}
                </div>

                <Field label="Pays" required>
                  <SearchSelect value={pays} onChange={v=>{setPays(v);setVille('')}} options={PAYS_LISTE} placeholder="Choisir votre pays"/>
                </Field>

                <Field label="Ville / Commune">
                  {villesDuPays.length > 0 ? (
                    <SearchSelect value={ville} onChange={setVille} options={villesDuPays} placeholder={`Ville (${villesDuPays.length} villes disponibles)`} emptyMsg="Ville non trouvée — saisissez manuellement"/>
                  ) : (
                    <input value={ville} onChange={e=>setVille(e.target.value)} placeholder="Votre ville" style={iStyle}
                      onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                  )}
                </Field>

                <Field label="Téléphone">
                  <input value={telephone} onChange={e=>setTelephone(e.target.value)} placeholder="+229 00 00 00 00" style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')} onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </Field>

                <Field label="Genre">
                  <div style={{display:'flex',gap:'8px'}}>
                    {[{v:'homme',l:'Homme'},{v:'femme',l:'Femme'},{v:'autre',l:'Autre/Non précisé'}].map(g => (
                      <button key={g.v} onClick={()=>setGenre(g.v)}
                        style={{flex:1,padding:'9px 6px',borderRadius:'9px',border:'2px solid',cursor:'pointer',fontSize:'12px',fontWeight:600,transition:'all 0.15s',
                          borderColor: genre===g.v ? 'var(--orange)' : 'var(--border)',
                          background:  genre===g.v ? 'rgba(212,80,15,0.08)' : 'var(--bg-secondary)',
                          color:       genre===g.v ? 'var(--orange)' : 'var(--text-secondary)'}}>
                        {g.l}
                      </button>
                    ))}
                  </div>
                </Field>
              </>
            )}

            {/* ÉTAPE 3 — PROFIL PRO */}
            {step === 3 && (
              <>
                <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 16px 0'}}>Votre profil professionnel</p>
                <p style={{fontSize:'12px',color:'var(--text-secondary)',margin:'-8px 0 14px 0',lineHeight:1.6}}>
                  Ces informations nous permettent de personnaliser vos formations. Vous pourrez les modifier dans votre profil.
                </p>

                <Field label="Profession / Poste">
                  <SearchSelect value={profession} onChange={setProfession} options={PROFESSIONS} placeholder="Votre profession"/>
                </Field>

                <Field label="Secteur d'activité">
                  <SearchSelect value={secteur} onChange={setSecteur} options={SECTEURS_LISTE} placeholder="Votre secteur"/>
                </Field>

                <Field label="Niveau en sécurité professionnelle">
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
                    {[
                      {v:'debutant',     l:'Débutant',     c:'#22c55e', desc:'Je commence'},
                      {v:'intermediaire',l:'Intermédiaire', c:'#f59e0b', desc:'Quelques bases'},
                      {v:'avance',       l:'Avancé',       c:'#ef4444', desc:'Expert terrain'},
                    ].map(n => (
                      <button key={n.v} onClick={()=>setNiveau(n.v)}
                        style={{padding:'10px 8px',borderRadius:'10px',border:'2px solid',cursor:'pointer',textAlign:'center',transition:'all 0.15s',
                          borderColor: niveau===n.v ? n.c : 'var(--border)',
                          background:  niveau===n.v ? n.c+'15' : 'var(--bg-secondary)',
                          color:       niveau===n.v ? n.c : 'var(--text-secondary)'}}>
                        <div style={{fontSize:'11px',fontWeight:700}}>{n.l}</div>
                        <div style={{fontSize:'10px',opacity:0.7}}>{n.desc}</div>
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Info marketplace */}
                <div style={{padding:'12px 14px',borderRadius:'10px',background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.2)',marginTop:'4px'}}>
                  <p style={{fontSize:'11px',color:'var(--text-secondary)',margin:0,lineHeight:1.6}}>
                    💼 <strong style={{color:'var(--text-primary)'}}>Vous représentez une entreprise ?</strong> Créez d&apos;abord votre compte personnel, puis souscrivez à un abonnement Marketplace depuis votre espace pour publier vos produits EPI.
                  </p>
                </div>
              </>
            )}

            {/* Navigation */}
            <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
              {step > 1 && (
                <button onClick={()=>{setError('');setStep(s=>s-1)}}
                  style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'11px 16px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>
                  <ChevronLeft size={14}/> Précédent
                </button>
              )}
              {step < 3 ? (
                <button onClick={goNext}
                  style={{flex:1,display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'6px',padding:'11px',borderRadius:'12px',background:'var(--orange)',color:'white',border:'none',fontSize:'14px',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(212,80,15,0.25)'}}>
                  Continuer <ChevronRight size={14}/>
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading}
                  style={{flex:1,display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'6px',padding:'11px',borderRadius:'12px',background:'var(--orange)',color:'white',border:'none',fontSize:'14px',fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,boxShadow:'0 4px 14px rgba(212,80,15,0.25)'}}>
                  <CheckCircle size={15}/>{loading ? 'Création...' : 'Créer mon compte'}
                </button>
              )}
            </div>

            <p style={{textAlign:'center',fontSize:'12px',color:'var(--text-secondary)',margin:'14px 0 0 0'}}>
              Déjà un compte ?{' '}
              <Link href={`/connexion?redirect=${redirect}`} style={{color:'var(--orange)',fontWeight:700,textDecoration:'none'}}>Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InscriptionPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'var(--bg-main)'}}/>}>
      <InscriptionContent/>
    </Suspense>
  )
}