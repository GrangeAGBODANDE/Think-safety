'use client'
import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

export default function ParametresPage() {
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    site_nom: 'Think Safety',
    site_description: 'Plateforme gratuite de formation securite',
    email_contact: 'contact@think-safety.io',
    pays_principal: 'Benin',
    devise: 'FCFA',
    maintenance: false,
    inscription_ouverte: true,
  })

  function save() {
    setMsg('Parametres sauvegardes !')
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-white">Parametres</h1>
        <p className="text-white/40 text-sm">Configuration generale de la plateforme</p>
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
          <CheckCircle size={14} />{msg}
        </div>
      )}

      <div className="space-y-5">
        <div className="card p-5 space-y-4">
          <h2 className="font-display font-bold text-white">Informations du site</h2>
          {[
            { label: 'Nom du site', key: 'site_nom', placeholder: 'Think Safety' },
            { label: 'Description', key: 'site_description', placeholder: 'Description...' },
            { label: 'Email de contact', key: 'email_contact', placeholder: 'contact@...' },
            { label: 'Pays principal', key: 'pays_principal', placeholder: 'Benin' },
            { label: 'Devise', key: 'devise', placeholder: 'FCFA' },
          ].map(f => (
            <div key={f.key}>
              <label className="input-label">{f.label}</label>
              <input
                type="text"
                value={(form as any)[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="input-field"
              />
            </div>
          ))}
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-display font-bold text-white">Options</h2>
          {[
            { label: 'Mode maintenance', key: 'maintenance', desc: 'Desactive l\'acces public temporairement' },
            { label: 'Inscriptions ouvertes', key: 'inscription_ouverte', desc: 'Permet aux nouveaux utilisateurs de s\'inscrire' },
          ].map(opt => (
            <div key={opt.key} className="flex items-center justify-between p-4 bg-navy-700 rounded-xl">
              <div>
                <p className="text-white text-sm font-medium">{opt.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{opt.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, [opt.key]: !(form as any)[opt.key] })}
                className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ${(form as any)[opt.key] ? 'bg-orange-500' : 'bg-navy-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${(form as any)[opt.key] ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>

        <button onClick={save} className="btn-primary py-3 px-8">
          <CheckCircle size={16} />Sauvegarder les modifications
        </button>
      </div>
    </div>
  )
}
