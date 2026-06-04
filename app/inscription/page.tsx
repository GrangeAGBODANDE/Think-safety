'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Shield, Eye, EyeOff, CheckCircle } from 'lucide-react'

function InscriptionContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirect     = searchParams.get('redirect') || '/secteurs'

  const [nom,      setNom]      = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  const handleSubmit = async () => {
    if (!nom || !email || !password) { setError('Veuillez remplir tous les champs.'); return }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return }
    setLoading(true); setError('')
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nom } }
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    // Si email confirmation désactivée → session directe
    if (data.session) {
      router.push(redirect)
    } else {
      // Email confirmation requise
      setSuccess(true)
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar />
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 64px)',padding:'24px'}}>
        <div style={{width:'100%',maxWidth:'420px'}}>
          <div style={{textAlign:'center',marginBottom:'36px'}}>
            <div style={{width:'56px',height:'56px',borderRadius:'18px',background:'var(--orange)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px auto',boxShadow:'0 8px 24px rgba(212,80,15,0.35)'}}>
              <Shield size={26} style={{color:'white'}}/>
            </div>
            <h1 style={{fontSize:'1.6rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 6px 0'}}>Créer un compte</h1>
            <p style={{fontSize:'14px',color:'var(--text-secondary)',margin:0}}>Accès gratuit à toutes les formations</p>
          </div>

          {success ? (
            <div style={{padding:'32px',borderRadius:'20px',background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',textAlign:'center'}}>
              <CheckCircle size={40} style={{color:'#22c55e',marginBottom:'16px'}}/>
              <h3 style={{fontSize:'1.1rem',fontWeight:700,color:'var(--text-primary)',margin:'0 0 8px 0'}}>Vérifiez votre email</h3>
              <p style={{fontSize:'14px',color:'var(--text-secondary)',margin:'0 0 16px 0',lineHeight:1.7}}>
                Un lien de confirmation a été envoyé à <strong>{email}</strong>. Cliquez dessus pour activer votre compte.
              </p>
              <Link href="/connexion" style={{display:'inline-block',padding:'10px 24px',borderRadius:'12px',background:'var(--orange)',color:'white',textDecoration:'none',fontWeight:700,fontSize:'14px'}}>
                Se connecter après confirmation
              </Link>
            </div>
          ) : (
            <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'20px',padding:'32px'}}>
              {error && (
                <div style={{padding:'12px 16px',borderRadius:'10px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',marginBottom:'20px'}}>
                  <p style={{fontSize:'13px',color:'#ef4444',margin:0}}>{error}</p>
                </div>
              )}
              <div style={{marginBottom:'16px'}}>
                <label style={{fontSize:'13px',fontWeight:600,color:'var(--text-secondary)',display:'block',marginBottom:'6px'}}>Nom complet</label>
                <input type="text" value={nom} onChange={e=>setNom(e.target.value)} placeholder="Jean Dupont"
                  style={{width:'100%',padding:'12px 14px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                  onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
              </div>
              <div style={{marginBottom:'16px'}}>
                <label style={{fontSize:'13px',fontWeight:600,color:'var(--text-secondary)',display:'block',marginBottom:'6px'}}>Adresse email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@exemple.com"
                  style={{width:'100%',padding:'12px 14px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                  onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
              </div>
              <div style={{marginBottom:'24px'}}>
                <label style={{fontSize:'13px',fontWeight:600,color:'var(--text-secondary)',display:'block',marginBottom:'6px'}}>Mot de passe</label>
                <div style={{position:'relative'}}>
                  <input type={showPwd?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&handleSubmit()} placeholder="6 caractères minimum"
                    style={{width:'100%',padding:'12px 44px 12px 14px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
                    onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                    onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                  <button onClick={()=>setShowPwd(!showPwd)} style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)'}}>
                    {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <div style={{marginBottom:'24px',padding:'14px',borderRadius:'12px',background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.15)'}}>
                {['Accès à tous les modules de formation','Alertes sécurité en temps réel','Totalement gratuit, sans carte bancaire'].map((item,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:i<2?'6px':0}}>
                    <CheckCircle size={12} style={{color:'#22c55e',flexShrink:0}}/>
                    <span style={{fontSize:'12px',color:'var(--text-secondary)'}}>{item}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleSubmit} disabled={loading}
                style={{width:'100%',padding:'13px',borderRadius:'13px',border:'none',background:'var(--orange)',color:'white',fontSize:'14px',fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,boxShadow:'0 4px 16px rgba(212,80,15,0.3)',marginBottom:'16px'}}>
                {loading ? 'Création...' : 'Créer mon compte gratuit'}
              </button>
              <p style={{textAlign:'center',fontSize:'13px',color:'var(--text-secondary)',margin:0}}>
                Déjà un compte ?{' '}
                <Link href={`/connexion?redirect=${redirect}`} style={{color:'var(--orange)',fontWeight:700,textDecoration:'none'}}>Se connecter</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function InscriptionPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'var(--bg-main)'}}/>}>
      <InscriptionContent />
    </Suspense>
  )
}