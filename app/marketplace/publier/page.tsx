'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { CheckCircle, ChevronLeft } from 'lucide-react'

export default function PublierPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ titre: '', categorie: '', description: '', prix: '', localisation: '', telephone: '', email: '' })
  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  if (submitted) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="text-white text-2xl font-bold font-display mb-2">Annonce soumise !</h1>
          <p className="text-white/50 text-sm mb-6">Votre annonce est en cours de moderation. Validation sous 24-48h.</p>
          <Link href="/marketplace" className="btn-primary">Voir le marketplace</Link>
        </div>
      </div>
    )
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
            <h1 className="section-title text-white mb-1">Publier une annonce</h1>
            <p className="text-white/50 text-sm">Gratuit - Validation sous 24-48h</p>
          </div>
          <div className="card p-6 space-y-5">
            <div>
              <label className="input-label">Titre de l&apos;annonce *</label>
              <input type="text" value={form.titre} onChange={(e) => u('titre', e.target.value)} placeholder="Ex: Kit EPI complet BTP" className="input-field" />
            </div>
            <div>
              <label className="input-label">Categorie *</label>
              <select value={form.categorie} onChange={(e) => u('categorie', e.target.value)} className="input-field">
                <option value="">Choisir une categorie</option>
                <option>EPI</option>
                <option>Formation</option>
                <option>Service HSE</option>
                <option>Detection</option>
                <option>Incendie</option>
                <option>Signalisation</option>
                <option>Premiers secours</option>
                <option>Autre</option>
              </select>
            </div>
            <div>
              <label className="input-label">Description *</label>
              <textarea value={form.description} onChange={(e) => u('description', e.target.value)} rows={4} placeholder="Decrivez votre produit ou service..." className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Prix (FCFA)</label>
                <input type="number" value={form.prix} onChange={(e) => u('prix', e.target.value)} placeholder="0 = Sur devis" className="input-field" />
              </div>
              <div>
                <label className="input-label">Localisation</label>
                <input type="text" value={form.localisation} onChange={(e) => u('localisation', e.target.value)} placeholder="Cotonou" className="input-field" />
              </div>
            </div>
            <div>
              <label className="input-label">Telephone *</label>
              <input type="tel" value={form.telephone} onChange={(e) => u('telephone', e.target.value)} placeholder="+229 97 XX XX XX" className="input-field" />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input type="email" value={form.email} onChange={(e) => u('email', e.target.value)} placeholder="votre@email.com" className="input-field" />
            </div>
            <button onClick={() => { if (form.titre && form.categorie && form.description && form.telephone) setSubmitted(true) }}
              className="btn-primary w-full justify-center py-3 mt-2">
              <CheckCircle size={16} />Soumettre l&apos;annonce
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
