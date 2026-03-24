'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Shield, Mail, Lock, Eye, EyeOff, User, LogIn } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [regData, setRegData] = useState({ prenom: '', nom: '', email: '', password: '' })

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email: loginData.email, password: loginData.password })
    if (err) setError(err.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signUp({
      email: regData.email,
      password: regData.password,
      options: { data: { prenom: regData.prenom, nom: regData.nom } },
    })
    if (err) setError(err.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-navy-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--orange)' }}>
              <Shield size={22} className="text-white" fill="white" />
            </div>
            <span className="font-display text-xl font-bold text-white">THINK <span style={{ color: 'var(--orange)' }}>SAFETY</span></span>
          </Link>
          <h1 className="text-2xl font-bold font-display text-white">{tab === 'login' ? 'Connexion' : 'Creer un compte'}</h1>
          <p className="text-white/50 text-sm mt-1">{tab === 'login' ? 'Acces a votre espace formation' : 'Gratuit, sans engagement'}</p>
        </div>

        <div className="bg-navy-800 border border-white/5 rounded-2xl p-8">
          <div className="flex gap-1 mb-6 bg-navy-700 rounded-xl p-1">
            {(['login', 'register'] as const).map((t) => (
              <button key={t} onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-navy-800 text-white shadow-sm' : 'text-white/50 hover:text-white'}`}>
                {t === 'login' ? 'Se connecter' : "S'inscrire"}
              </button>
            ))}
          </div>

          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="input-label">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input type="email" required value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} placeholder="votre@email.com" className="input-field pl-9" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="input-label mb-0">Mot de passe</label>
                  <Link href="/auth/reset" className="text-xs hover:underline" style={{ color: 'var(--orange)' }}>Oublie ?</Link>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input type={show ? 'text' : 'password'} required value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} placeholder="Votre mot de passe" className="input-field pl-9 pr-10" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
                <LogIn size={16} />{loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Prenom</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input type="text" required value={regData.prenom} onChange={(e) => setRegData({ ...regData, prenom: e.target.value })} placeholder="Jean" className="input-field pl-9" />
                  </div>
                </div>
                <div>
                  <label className="input-label">Nom</label>
                  <input type="text" required value={regData.nom} onChange={(e) => setRegData({ ...regData, nom: e.target.value })} placeholder="Dupont" className="input-field" />
                </div>
              </div>
              <div>
                <label className="input-label">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input type="email" required value={regData.email} onChange={(e) => setRegData({ ...regData, email: e.target.value })} placeholder="votre@email.com" className="input-field pl-9" />
                </div>
              </div>
              <div>
                <label className="input-label">Mot de passe</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input type={show ? 'text' : 'password'} required minLength={8} value={regData.password} onChange={(e) => setRegData({ ...regData, password: e.target.value })} placeholder="Minimum 8 caracteres" className="input-field pl-9 pr-10" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
                <Shield size={16} />{loading ? 'Creation...' : 'Creer mon compte - Gratuit'}
              </button>
            </form>
          )}
          <p className="text-center text-white/30 text-xs mt-5">
            En continuant, vous acceptez nos <Link href="/cgu" className="hover:text-white underline">CGU</Link>
          </p>
        </div>
        <p className="text-center text-white/40 text-sm mt-5">
          <Link href="/" className="hover:text-white transition-colors">&larr; Retour au site</Link>
        </p>
      </div>
    </main>
  )
}
