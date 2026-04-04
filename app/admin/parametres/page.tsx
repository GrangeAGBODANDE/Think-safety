'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export default function ParametresPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    const { data } = await supabase.from('site_settings').select('*')
    if (data) {
      const s: Record<string, string> = {}
      data.forEach(row => { s[row.key] = row.value })
      setSettings(s)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function saveSetting(key: string, value: string) {
    await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() })
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  async function saveAll() {
    setSaving(true)
    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() })
      )
    )
    setMsg('Parametres sauvegardes !')
    setTimeout(() => setMsg(''), 3000)
    setSaving(false)
  }

  const isMaintenance = settings['maintenance_mode'] === 'true'
  const isInscriptionOuverte = settings['inscription_ouverte'] !== 'false'

  if (loading) return <div className="p-6 text-white/40">Chargement...</div>

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

      {/* Mode maintenance — alerte visible */}
      {isMaintenance && (
        <div className="mb-5 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-start gap-3">
          <AlertTriangle size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-orange-400 font-bold text-sm">Mode maintenance actif</p>
            <p className="text-orange-300/70 text-xs mt-0.5">Le site public affiche une page de maintenance. Seuls les admins peuvent acceder au site.</p>
          </div>
        </div>
      )}

      <div className="space-y-5">

        {/* Informations generales */}
        <div className="card p-5 space-y-4">
          <h2 className="font-display font-bold text-white">Informations du site</h2>
          {[
            { key: 'site_nom', label: 'Nom du site', placeholder: 'Think Safety' },
            { key: 'email_contact', label: 'Email de contact', placeholder: 'contact@...' },
          ].map(f => (
            <div key={f.key}>
              <label className="input-label">{f.label}</label>
              <input
                type="text"
                value={settings[f.key] || ''}
                onChange={e => setSettings(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="input-field"
              />
            </div>
          ))}
        </div>

        {/* Options */}
        <div className="card p-5 space-y-4">
          <h2 className="font-display font-bold text-white">Options</h2>

          {/* Mode maintenance */}
          <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
            isMaintenance
              ? 'bg-orange-500/10 border-orange-500/30'
              : 'bg-navy-700 border-white/5'
          }`}>
            <div>
              <p className="text-white text-sm font-medium">Mode maintenance</p>
              <p className="text-white/40 text-xs mt-0.5">
                {isMaintenance
                  ? '⚠️ Actif — le site public est inaccessible'
                  : 'Desactive l\'acces public temporairement'}
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                const newVal = isMaintenance ? 'false' : 'true'
                await saveSetting('maintenance_mode', newVal)
                setMsg(newVal === 'true' ? '⚠️ Mode maintenance active !' : '✅ Site remis en ligne !')
                setTimeout(() => setMsg(''), 4000)
              }}
              className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ${isMaintenance ? 'bg-orange-500' : 'bg-navy-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${isMaintenance ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Inscriptions */}
          <div className="flex items-center justify-between p-4 bg-navy-700 rounded-xl border border-white/5">
            <div>
              <p className="text-white text-sm font-medium">Inscriptions ouvertes</p>
              <p className="text-white/40 text-xs mt-0.5">Permet aux nouveaux utilisateurs de s&apos;inscrire</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                const newVal = isInscriptionOuverte ? 'false' : 'true'
                await saveSetting('inscription_ouverte', newVal)
              }}
              className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ${isInscriptionOuverte ? 'bg-orange-500' : 'bg-navy-600'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${isInscriptionOuverte ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <button onClick={saveAll} disabled={saving} className="btn-primary py-3 px-8">
          <CheckCircle size={16} />
          {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
        </button>
      </div>
    </div>
  )
}
