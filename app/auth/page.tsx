'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSelector from '@/components/LanguageSelector'
import { SECTEURS } from '@/lib/secteurs-data'
import { Shield, Mail, Lock, Eye, EyeOff, User, LogIn, Building2, ChevronRight, ChevronLeft } from 'lucide-react'

type Step = 'type' | 'form'
type UserType = 'apprenant' | 'entreprise' | null

export default function AuthPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [step, setStep] = useState<Step>('type')
  const [userType, setUserType] = useState<UserType>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const [success, setSuccess] = useState('')

  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [regData, setRegData] = useState({
    prenom: '', nom: '', email: '', password: '',
    entreprise_nom: '', domaine_activite: '', telephone: '', localisation: '',
  })

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    })
    if (err) setError(err.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase.auth.signUp({
      email: regData.email,
      password: regData.password,
      options: {
        data: { prenom: regData.prenom, nom: regData.nom },
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    })

    if (err) { setError(err.message); setLoading(false); return }

    if (userType === 'entreprise' && data.user) {
      await new Promise(r => setTimeout(r, 1500))
      await supabase.from('profiles').update({
        is_seller: true,
        secteur_activite: regData.domaine_activite,
      }).eq('id', data.user.id)
      await supabase.from('seller_profiles').insert({
        user_id: data.user.id,
        entreprise_nom: regData.entreprise_nom,
        domaine_activite: regData.domaine_activite,
        telephone: regData.telephone,
        localisation: regData.localisation,
        email_contact: regData.email,
      })
    }

    setSuccess(t('auth.confirm_sent'))
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--bg-main)' }}>
      <div className="w-full max-w-md">

        {/* Header avec langue + thème */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--orange)' }}>
              <Shield size={20} className="text-white" fill="white" />
            </div>
            <span className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              THINK <span style={{ color: 'var(--orange)' }}>SAFETY</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>

        <div className="card p-8">

          {/* Tabs */}
          <div className="flex gap-1 mb-6 rounded-xl p-1" style={{ background: 'var(--bg-secondary)' }}>
            {(['login', 'register'] as const).map((t_) => (
              <button
                key={t_}
                onClick={() => {
                  setTab(t_)
                  setError('')
                  setStep('type')
                  setUserType(null)
                  setSuccess('')
                }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={tab === t_
                  ? { background: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-card)' }
                  : { color: 'var(--text-secondary)' }
                }
              >
                {t_ === 'login' ? t('auth.login') : t('auth.register')}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 text-sm">
              <p className="font-medium mb-1">✅ {success}</p>
              <button onClick={() => setTab('login')} className="underline text-xs">{t('auth.go_login')}</button>
            </div>
          )}

          {/* LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="input-label">{t('auth.email')}</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                  <input type="email" required value={loginData.email}
                    onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="votre@email.com" className="input-field pl-9" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="input-label mb-0">{t('auth.password')}</label>
                  <Link href="/auth/reset" className="text-xs hover:underline" style={{ color: 'var(--orange)' }}>
                    {t('auth.forgot')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                  <input type={show ? 'text' : 'password'} required value={loginData.password}
                    onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Votre mot de passe" className="input-field pl-9 pr-10" />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-secondary)' }}>
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
                <LogIn size={16} />{loading ? t('auth.connecting') : t('auth.login')}
              </button>
            </form>
          )}

          {/* REGISTER - STEP 1 */}
          {tab === 'register' && step === 'type' && !success && (
            <div className="space-y-3">
              <p className="text-sm text-center mb-5" style={{ color: 'var(--text-secondary)' }}>{t('auth.profile')}</p>

              <button
                onClick={() => { setUserType('apprenant'); setStep('form') }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left"
                style={userType === 'apprenant'
                  ? { borderColor: 'var(--orange)', background: 'rgba(212,80,15,0.08)' }
                  : { borderColor: 'var(--border)' }
                }
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,80,15,0.12)' }}>
                  <User size={22} style={{ color: 'var(--orange)' }} />
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{t('auth.learner')}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{t('auth.learner_desc')}</p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} className="ml-auto flex-shrink-0" />
              </button>

              <button
                onClick={() => { setUserType('entreprise'); setStep('form') }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left"
                style={userType === 'entreprise'
                  ? { borderColor: '#2196F3', background: 'rgba(33,150,243,0.08)' }
                  : { borderColor: 'var(--border)' }
                }
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(33,150,243,0.12)' }}>
                  <Building2 size={22} className="text-blue-500" />
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{t('auth.company')}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{t('auth.company_desc')}</p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} className="ml-auto flex-shrink-0" />
              </button>
            </div>
          )}

          {/* REGISTER - STEP 2 */}
          {tab === 'register' && step === 'form' && !success && (
            <form onSubmit={handleRegister} className="space-y-4">
              <button type="button" onClick={() => setStep('type')}
                className="flex items-center gap-2 text-sm mb-2 transition-colors"
                style={{ color: 'var(--text-secondary)' }}>
                <ChevronLeft size={14} />{t('auth.back')}
              </button>

              <div className="flex items-center gap-2 p-3 rounded-xl border mb-4"
                style={userType === 'entreprise'
                  ? { borderColor: 'rgba(33,150,243,0.3)', background: 'rgba(33,150,243,0.06)' }
                  : { borderColor: 'rgba(212,80,15,0.3)', background: 'rgba(212,80,15,0.06)' }
                }>
                {userType === 'entreprise'
                  ? <Building2 size={16} className="text-blue-500" />
                  : <User size={16} style={{ color: 'var(--orange)' }} />}
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {userType === 'entreprise' ? t('auth.company') : t('auth.learner')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">{t('auth.firstname')} *</label>
                  <input type="text" required value={regData.prenom}
                    onChange={e => setRegData({ ...regData, prenom: e.target.value })}
                    placeholder="Jean" className="input-field" />
                </div>
                <div>
                  <label className="input-label">{t('auth.lastname')} *</label>
                  <input type="text" required value={regData.nom}
                    onChange={e => setRegData({ ...regData, nom: e.target.value })}
                    placeholder="Dupont" className="input-field" />
                </div>
              </div>

              {userType === 'entreprise' && (
                <>
                  <div>
                    <label className="input-label">{t('auth.company_name')} *</label>
                    <input type="text" required value={regData.entreprise_nom}
                      onChange={e => setRegData({ ...regData, entreprise_nom: e.target.value })}
                      placeholder="SafeEquip SARL" className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">{t('auth.activity')} *</label>
                    <select required value={regData.domaine_activite}
                      onChange={e => setRegData({ ...regData, domaine_activite: e.target.value })}
                      className="input-field">
                      <option value="">Choisir...</option>
                      {SECTEURS.map(s => <option key={s.slug} value={s.slug}>{s.icon} {s.nom}</option>)}
                    </select>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{t('auth.one_domain')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="input-label">{t('auth.phone')}</label>
                      <input type="tel" value={regData.telephone}
                        onChange={e => setRegData({ ...regData, telephone: e.target.value })}
                        placeholder="+229 97 XX XX XX" className="input-field" />
                    </div>
                    <div>
                      <label className="input-label">{t('auth.location')}</label>
                      <input type="text" value={regData.localisation}
                        onChange={e => setRegData({ ...regData, localisation: e.target.value })}
                        placeholder="Cotonou, Benin" className="input-field" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="input-label">{t('auth.email')} *</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                  <input type="email" required value={regData.email}
                    onChange={e => setRegData({ ...regData, email: e.target.value })}
                    placeholder="votre@email.com" className="input-field pl-9" />
                </div>
              </div>
              <div>
                <label className="input-label">{t('auth.password')} *</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                  <input type={show ? 'text' : 'password'} required minLength={8}
                    value={regData.password}
                    onChange={e => setRegData({ ...regData, password: e.target.value })}
                    placeholder="Minimum 8 caracteres" className="input-field pl-9 pr-10" />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-secondary)' }}>
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
                <Shield size={16} />{loading ? t('auth.creating') : t('auth.create_account')}
              </button>
            </form>
          )}

          <p className="text-center text-xs mt-5" style={{ color: 'var(--text-secondary)' }}>
            {t('auth.terms')}{' '}
            <Link href="/cgu" className="hover:underline" style={{ color: 'var(--orange)' }}>{t('auth.terms_link')}</Link>
          </p>
        </div>

        <p className="text-center text-sm mt-5">
          <Link href="/" className="hover:underline transition-colors" style={{ color: 'var(--text-secondary)' }}>
            ← {t('auth.back_to_site')}
          </Link>
        </p>
      </div>
    </main>
  )
}
