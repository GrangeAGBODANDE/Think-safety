'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { SECTEURS } from '@/lib/secteurs-data'
import { CheckCircle, ChevronLeft, Shield, Lock } from 'lucide-react'

const CATEGORIES = ['EPI', 'Formation', 'Service HSE', 'Detection', 'Incendie', 'Signalisation', 'Premiers secours', 'Autre']

export default function PublierPage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    titre: '', categorie: '', secteur_slug: '', description: '',
    prix: '', prix_type: 'fixe', localisation: '',
    vendeur_nom: '', telephone: '', email: '', whatsapp: '',
  })

  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth'); return }
      setUser(data.user)
      supabase.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: p }) => {
        setProfile(p)
        if (p) {
          setForm(prev => ({
            ...prev,
            vendeur_nom: `${p.prenom || ''} ${p.nom || ''}`.trim(),
            email: data.user.email || '',
          }))
        }
        setChecking(false)
      })
    })
  }, [router])

  const isAdmin = profile && ['admin', 'superadmin', 'moderateur'].includes(profile.role)
  const isSeller = profile?.is_seller === true
  const canPublish = isAdmin || isSeller

  if (checking) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <p className="text-white/50">Verification...</p>
      </div>
    )
  }

  if (!canPublish) {
    return (
      <div className="min-h-screen bg-navy-900">
        <Navbar />
        <div className="pt-20 flex items-center justify-center px-4 min-h-screen">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-red-400" />
            </div>
            <h2 className="text-white font-bold font-display text-xl mb-2">Acces restreint</h2>
            <p className="text-white/50 text-sm mb-6">
              Seules les entreprises inscrites et les administrateurs peuvent publier des annonces sur le marketplace.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/marketplace" className="btn-secondary py-2 px-5">Retour</Link>
              <Link href="/auth" className="btn-primary py-2 px-5">Creer un compte entreprise</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="text-white text-2xl font-bold font-display mb-2">
            {isAdmin ? 'Annonce publiee !' : 'Annonce soumise !'}
          </h1>
          <p className="text-white/50 text-sm mb-6">
            {isAdmin
              ? 'Votre annonce est immediatement visible sur le marketplace.'
              : 'Votre annonce est en cours de moderation. Validation sous 24-48h.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/marketplace" className="btn-primary">Voir le marketplace</Link>
            {isAdmin && <Link href="/admin/marketplace" className="btn-secondary">Gerer les annonces</Link>}
          </div>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titre || !form.categorie || !form.description) {
      setError('Titre, categorie et description sont obligatoires.')
      return
    }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('marketplace_annonces').insert({
      titre: form.titre,
      categorie: form.categorie,
      secteur_slug: form.secteur_slug || null,
      description: form.description,
      prix: form.prix ? parseInt(form.prix) : 0,
      prix_type: form.prix_type,
      localisation: form.localisation,
      vendeur_nom: form.vendeur_nom,
      vendeur_telephone: form.telephone,
      vendeur_email: form.email,
      vendeur_whatsapp: form.whatsapp,
      vendeur_certifie: isAdmin,
      status: isAdmin ? 'approved' : 'pending',
    })

    if (err) { setError(err.message); setLoading(false); return }
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-xl mx-auto px-4">
          <div className="py-8">
            <Link href="/marketplace" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
              <ChevronLeft size={14} />Retour au marketplace
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="section-title text-white mb-1">Publier une annonce</h1>
                <p className="text-white/50 text-sm">
                  {isAdmin ? 'Publication directe en tant qu\'administrateur.' : 'Validation sous 24-48h par notre equipe.'}
                </p>
              </div>
              {isAdmin && <span className="badge badge-orange text-xs mt-1">Admin</span>}
            </div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="card p-6 space-y-5">
            <div>
              <label className="input-label">Titre *</label>
              <input type="text" value={form.titre} onChange={e => u('titre', e.target.value)} placeholder="Ex: Kit EPI complet BTP" className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Categorie *</label>
                <select value={form.categorie} onChange={e => u('categorie', e.target.value)} className="input-field">
                  <option value="">Choisir...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Secteur</label>
                <select value={form.secteur_slug} onChange={e => u('secteur_slug', e.target.value)} className="input-field">
                  <option value="">Tous secteurs</option>
                  {SECTEURS.map(s => <option key={s.slug} value={s.slug}>{s.icon} {s.nom}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="input-label">Description *</label>
              <textarea value={form.description} onChange={e => u('description', e.target.value)} rows={4} placeholder="Decrivez votre produit ou service..." className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Prix (FCFA)</label>
                <input type="number" value={form.prix} onChange={e => u('prix', e.target.value)} placeholder="0 = Sur devis" className="input-field" />
              </div>
              <div>
                <label className="input-label">Type de prix</label>
                <select value={form.prix_type} onChange={e => u('prix_type', e.target.value)} className="input-field">
                  <option value="fixe">Prix fixe</option>
                  <option value="devis">Sur devis</option>
                  <option value="location">Location</option>
                  <option value="abonnement">Abonnement</option>
                </select>
              </div>
            </div>
            <div className="border-t border-white/5 pt-4">
              <p className="text-white/40 text-xs uppercase tracking-widest font-mono mb-3">Contact</p>
              <div className="space-y-3">
                <div>
                  <label className="input-label">Nom / Entreprise</label>
                  <input type="text" value={form.vendeur_nom} onChange={e => u('vendeur_nom', e.target.value)} className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Telephone *</label>
                    <input type="tel" value={form.telephone} onChange={e => u('telephone', e.target.value)} placeholder="+229 97 XX XX XX" className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">WhatsApp</label>
                    <input type="tel" value={form.whatsapp} onChange={e => u('whatsapp', e.target.value)} placeholder="+229 97 XX XX XX" className="input-field" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Email</label>
                    <input type="email" value={form.email} onChange={e => u('email', e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Localisation</label>
                    <input type="text" value={form.localisation} onChange={e => u('localisation', e.target.value)} placeholder="Cotonou, Benin" className="input-field" />
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading || !profile} className="btn-primary w-full justify-center py-3">
              <CheckCircle size={16} />
              {loading ? 'Publication...' : isAdmin ? 'Publier maintenant' : 'Soumettre pour validation'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
