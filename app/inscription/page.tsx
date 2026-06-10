'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Shield, Eye, EyeOff, CheckCircle, ChevronRight, ChevronLeft, User, MapPin, Briefcase } from 'lucide-react'

const PAYS = [
  'Bénin','Togo','Burkina Faso',"Côte d'Ivoire",'Ghana','Nigeria','Niger',
  'Mali','Sénégal','Guinée','Cameroun','Congo','Gabon','Madagascar',
  'Mauritanie','Sierra Leone','Liberia','Gambie','Guinée-Bissau',
  'Cabo Verde','France','Belgique','Suisse','Canada','Autre',
]

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
  'Responsable HSE / Sécurité','Directeur / Manager','Chef de chantier',
  'Technicien / Ouvrier','Médecin / Infirmier','Enseignant / Formateur',
  'Ingénieur','RH / DRH','Commercial / Commercial','Entrepreneur / Indépendant',
  'Étudiant','Autre',
]

const iStyle: React.CSSProperties = {
  width:'100%', padding:'11px 14px', borderRadius:'11px',
  border:'1px solid var(--border)', background:'var(--bg-secondary)',
  color:'var(--text-primary)', fontSize:'14px', outline:'none',
  boxSizing:'border-box', fontFamily:'inherit', transition:'border-color 0.15s',
  appearance:'none',
}

const Field = ({ label, required, children }: { label:string; required?:boolean; children:React.ReactNode }) => (
  <div style={{marginBottom:'14px'}}>
    <label style={{fontSize:'12px',fontWeight:600,color:'var(--text-secondary)',display:'block',marginBottom:'5px'}}>
      {label}{required && <span style={{color:'var(--orange)',marginLeft:'2px'}}>*</span>}
    </label>
    {children}
  </div>
)

function InscriptionContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirect     = searchParams.get('redirect') || '/secteurs'

  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  // Étape 1 — Compte
  const [prenom,    setPrenom]    = useState('')
  const [nom,       setNom]       = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')

  // Étape 2 — Localisation
  const [pays,      setPays]      = useState('Bénin')
  const [ville,     setVille]     = useState('')
  const [telephone, setTelephone] = useState('')
  const [genre,     setGenre]     = useState('')

  // Étape 3 — Profil pro
  const [profession,  setProfession]  = useState('')
  const [secteur,     setSecteur]     = useState('')
  const [organisation,setOrganisation]= useState('')
  const [niveau,      setNiveau]      = useState('debutant')

  const validateStep1 = () => {
    if (!prenom || !email || !password) { setError('Prénom, email et mot de passe sont obligatoires.'); return false }
    if (password.length < 6) { setError('Mot de passe : 6 caractères minimum.'); return false }
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
        data: {
          full_name: `${prenom} ${nom}`.trim(),
          prenom, nom, pays, ville, telephone, genre,
          profession, secteur_activite: secteur,
          organisation, niveau_experience: niveau,
        }
      }
    })
    if (err) { setError(err.message); setLoading(false); return }

    // Mettre à jour le profil avec toutes les données
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email, prenom, nom, pays, ville, telephone, genre,
        profession, secteur_activite: secteur,
        organisation, niveau_experience: niveau,
        role: 'user',
      })
    }

    setLoading(false)
    if (data.session) {
      router.push(redirect)
    } else {
      setSuccess(true)
    }
  }

  const STEPS = [
    { n:1, label:'Compte',       icon:User       },
    { n:2, label:'Localisation', icon:MapPin     },
    { n:3, label:'Profil pro',   icon:Briefcase  },
  ]

  if (success) return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 64px)',padding:'24px'}}>
        <div style={{maxWidth:'420px',width:'100%',padding:'40px',borderRadius:'24px',background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.25)',textAlign:'center'}}>
          <CheckCircle size={48} style={{color:'#22c55e',marginBottom:'16px'}}/>
          <h2 style={{fontSize:'1.3rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 10px 0'}}>Compte créé !</h2>
          <p style={{fontSize:'14px',color:'var(--text-secondary)',marginBottom:'20px',lineHeight:1.7}}>
            Un lien de confirmation a été envoyé à <strong>{email}</strong>. Cliquez dessus pour activer votre compte.
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

          {/* Indicateur d'étapes */}
          <div style={{display:'flex',alignItems:'center',marginBottom:'24px',gap:'0'}}>
            {STEPS.map((s, i) => {
              const done    = step > s.n
              const active  = step === s.n
              const Icon    = s.icon
              return (
                <div key={s.n} style={{display:'flex',alignItems:'center',flex:1}}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',flex:'0 0 auto'}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s',
                      background: done ? '#22c55e' : active ? 'var(--orange)' : 'var(--bg-secondary)',
                      border: `2px solid ${done ? '#22c55e' : active ? 'var(--orange)' : 'var(--border)'}`,
                    }}>
                      {done
                        ? <CheckCircle size={16} style={{color:'white'}}/>
                        : <Icon size={15} style={{color: active ? 'white' : 'var(--text-secondary)'}}/>}
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

            {/* ── ÉTAPE 1 : COMPTE ── */}
            {step === 1 && (
              <>
                <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 16px 0'}}>Informations de connexion</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  <Field label="Prénom" required>
                    <input value={prenom} onChange={e=>setPrenom(e.target.value)} placeholder="Jean" style={iStyle}
                      onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                      onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                  </Field>
                  <Field label="Nom">
                    <input value={nom} onChange={e=>setNom(e.target.value)} placeholder="Dupont" style={iStyle}
                      onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                      onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                  </Field>
                </div>
                <Field label="Adresse email" required>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@exemple.com" style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                    onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </Field>
                <Field label="Mot de passe" required>
                  <div style={{position:'relative'}}>
                    <input type={showPwd?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                      onKeyDown={e=>e.key==='Enter'&&goNext()} placeholder="6 caractères minimum"
                      style={{...iStyle,paddingRight:'42px'}}
                      onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                      onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                    <button onClick={()=>setShowPwd(!showPwd)} style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)'}}>
                      {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </Field>
              </>
            )}

            {/* ── ÉTAPE 2 : LOCALISATION ── */}
            {step === 2 && (
              <>
                <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 16px 0'}}>Votre localisation</p>
                <Field label="Pays" required>
                  <select value={pays} onChange={e=>setPays(e.target.value)} style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                    onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}>
                    {PAYS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  <Field label="Ville / Commune">
                    <input value={ville} onChange={e=>setVille(e.target.value)} placeholder="Cotonou" style={iStyle}
                      onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                      onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                  </Field>
                  <Field label="Téléphone">
                    <input value={telephone} onChange={e=>setTelephone(e.target.value)} placeholder="+229 00 00 00 00" style={iStyle}
                      onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                      onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                  </Field>
                </div>
                <Field label="Genre">
                  <select value={genre} onChange={e=>setGenre(e.target.value)} style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                    onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}>
                    <option value="">— Non renseigné —</option>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                    <option value="autre">Autre</option>
                  </select>
                </Field>
              </>
            )}

            {/* ── ÉTAPE 3 : PROFIL PRO ── */}
            {step === 3 && (
              <>
                <p style={{fontSize:'13px',fontWeight:700,color:'var(--text-primary)',margin:'0 0 16px 0'}}>Votre profil professionnel</p>
                <Field label="Profession / Poste">
                  <select value={profession} onChange={e=>setProfession(e.target.value)} style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                    onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}>
                    <option value="">— Choisir —</option>
                    {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Secteur d'activité">
                  <select value={secteur} onChange={e=>setSecteur(e.target.value)} style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                    onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}>
                    <option value="">— Choisir votre secteur —</option>
                    {SECTEURS_LISTE.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Organisation / Entreprise">
                  <input value={organisation} onChange={e=>setOrganisation(e.target.value)} placeholder="Nom de votre entreprise ou organisation" style={iStyle}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                    onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                </Field>
                <Field label="Niveau en sécurité professionnelle">
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
                    {[
                      {v:'debutant',     l:'Débutant',      c:'#22c55e', desc:'Je commence'},
                      {v:'intermediaire',l:'Intermédiaire',  c:'#f59e0b', desc:'Quelques bases'},
                      {v:'avance',       l:'Avancé',        c:'#ef4444', desc:'Expert terrain'},
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
              </>
            )}

            {/* Navigation étapes */}
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