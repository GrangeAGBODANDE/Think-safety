'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Shield, Eye, EyeOff } from 'lucide-react'

function ConnexionContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirect     = searchParams.get('redirect') || '/secteurs'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setError('Email ou mot de passe incorrect.'); return }
    router.push(redirect)
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}` },
    })
    if (err) { setError('Connexion Google impossible pour le moment.'); setGoogleLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-main)'}}>
      <Navbar />
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 64px)',padding:'24px'}}>
        <div style={{width:'100%',maxWidth:'400px'}}>
          <div style={{textAlign:'center',marginBottom:'36px'}}>
            <div style={{width:'56px',height:'56px',borderRadius:'18px',background:'var(--orange)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px auto',boxShadow:'0 8px 24px rgba(212,80,15,0.35)'}}>
              <Shield size={26} style={{color:'white'}}/>
            </div>
            <h1 style={{fontSize:'1.6rem',fontWeight:900,color:'var(--text-primary)',margin:'0 0 6px 0'}}>Bon retour !</h1>
            <p style={{fontSize:'14px',color:'var(--text-secondary)',margin:0}}>Connectez-vous pour accéder à vos formations</p>
          </div>

          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'20px',padding:'32px'}}>
            {error && (
              <div style={{padding:'12px 16px',borderRadius:'10px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',marginBottom:'20px'}}>
                <p style={{fontSize:'13px',color:'#ef4444',margin:0}}>{error}</p>
              </div>
            )}

            <button onClick={handleGoogleLogin} disabled={googleLoading}
              style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',padding:'12px',borderRadius:'13px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'14px',fontWeight:600,cursor:googleLoading?'not-allowed':'pointer',opacity:googleLoading?0.7:1,marginBottom:'20px'}}>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33z"/>
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58z"/>
              </svg>
              {googleLoading ? 'Connexion...' : 'Continuer avec Google'}
            </button>

            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
              <div style={{flex:1,height:'1px',background:'var(--border)'}}/>
              <span style={{fontSize:'12px',color:'var(--text-secondary)'}}>ou</span>
              <div style={{flex:1,height:'1px',background:'var(--border)'}}/>
            </div>

            <div style={{marginBottom:'16px'}}>
              <label style={{fontSize:'13px',fontWeight:600,color:'var(--text-secondary)',display:'block',marginBottom:'6px'}}>Adresse email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleSubmit()} placeholder="email@exemple.com"
                style={{width:'100%',padding:'12px 14px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
                onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
            </div>
            <div style={{marginBottom:'10px'}}>
              <label style={{fontSize:'13px',fontWeight:600,color:'var(--text-secondary)',display:'block',marginBottom:'6px'}}>Mot de passe</label>
              <div style={{position:'relative'}}>
                <input type={showPwd?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&handleSubmit()} placeholder="Votre mot de passe"
                  style={{width:'100%',padding:'12px 44px 12px 14px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text-primary)',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
                  onFocus={e=>(e.currentTarget.style.borderColor='var(--orange)')}
                  onBlur={e=>(e.currentTarget.style.borderColor='var(--border)')}/>
                <button onClick={()=>setShowPwd(!showPwd)} style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)'}}>
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <div style={{textAlign:'right',marginBottom:'24px'}}>
              <span style={{fontSize:'12px',color:'var(--text-secondary)'}}>Mot de passe oublié ? Contactez le support.</span>
            </div>
            <button onClick={handleSubmit} disabled={loading}
              style={{width:'100%',padding:'13px',borderRadius:'13px',border:'none',background:'var(--orange)',color:'white',fontSize:'14px',fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,boxShadow:'0 4px 16px rgba(212,80,15,0.3)',marginBottom:'16px'}}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            <p style={{textAlign:'center',fontSize:'13px',color:'var(--text-secondary)',margin:0}}>
              Pas encore de compte ?{' '}
              <Link href="/inscription" style={{color:'var(--orange)',fontWeight:700,textDecoration:'none'}}>Créer un compte gratuit</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'var(--bg-main)'}}/>}>
      <ConnexionContent />
    </Suspense>
  )
}