'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Shield, Mail, CheckCircle, ArrowLeft } from 'lucide-react'

export default function ResetPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    })
    if (err) setError(err.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--orange)' }}>
              <Shield size={22} className="text-white" fill="white" />
            </div>
            <span className="font-display text-xl font-bold text-white">THINK <span style={{ color: 'var(--orange)' }}>SAFETY</span></span>
          </Link>
        </div>
        <div className="bg-navy-800 border border-white/5 rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <h2 className="text-white font-bold font-display text-xl mb-2">Email envoye !</h2>
              <p className="text-white/50 text-sm mb-6">Lien envoye a <strong className="text-white">{email}</strong>. Verifiez vos spams.</p>
              <Link href="/auth" className="btn-primary w-full justify-center py-3">Retour a la connexion</Link>
            </div>
          ) : (
            <div>
              <Link href="/auth" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
                <ArrowLeft size={14} />Retour
              </Link>
              <h1 className="text-white font-bold font-display text-xl mb-1">Mot de passe oublie</h1>
              <p className="text-white/50 text-sm mb-6">Entrez votre email pour recevoir un lien de reinitialisation.</p>
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
              )}
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="input-label">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="input-field pl-9" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
