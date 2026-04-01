'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CreditCard, CheckCircle, X, Eye, EyeOff, Zap } from 'lucide-react'

const PROVIDER_LOGOS: Record<string, string> = {
  stripe: '💳',
  paypal: '🅿️',
  mtn_momo: '📱',
  orange_money: '🟠',
  moov_money: '🔵',
  wave: '🌊',
}

export default function PaiementsPage() {
  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('payment_configs').select('*').order('provider')
    setConfigs(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function saveConfig() {
    setSaving(true)
    const config_json = {
      api_key: editing.api_key || '',
      secret_key: editing.secret_key || '',
      webhook_secret: editing.webhook_secret || '',
      endpoint: editing.endpoint || '',
      extra: editing.extra || '',
    }
    await supabase.from('payment_configs').update({
      actif: editing.actif,
      mode: editing.mode,
      config_json,
    }).eq('id', editing.id)
    setMsg('Configuration sauvegardee !')
    setEditing(null)
    load()
    setTimeout(() => setMsg(''), 3000)
    setSaving(false)
  }

  async function toggleActive(config: any) {
    await supabase.from('payment_configs').update({ actif: !config.actif }).eq('id', config.id)
    load()
  }

  const openEdit = (config: any) => {
    setEditing({
      ...config,
      api_key: config.config_json?.api_key || '',
      secret_key: config.config_json?.secret_key || '',
      webhook_secret: config.config_json?.webhook_secret || '',
      endpoint: config.config_json?.endpoint || '',
      extra: config.config_json?.extra || '',
    })
  }

  const providerDocs: Record<string, string> = {
    stripe: 'https://dashboard.stripe.com/apikeys',
    paypal: 'https://developer.paypal.com/home',
    mtn_momo: 'https://momodeveloper.mtn.com/',
    orange_money: 'https://developer.orange.com/apis/orange-money-webpay-bf',
    moov_money: 'https://dev.moov-africa.bj/',
    wave: 'https://docs.wave.com/',
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-white">Configuration des paiements</h1>
        <p className="text-white/40 text-sm">Configurez les passerelles de paiement pour les abonnements</p>
      </div>

      {/* Banniere info */}
      <div className="card p-4 mb-6 border-blue-500/20 bg-blue-500/5">
        <div className="flex items-start gap-3">
          <Zap size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium text-sm mb-1">Integration pret a connecter</p>
            <p className="text-white/50 text-sm">
              Toutes les passerelles sont preparees. Ajoutez vos cles API quand vous etes pret a activer les paiements. 
              Les transactions resteront desactivees tant qu&apos;une passerelle n&apos;est pas activee.
            </p>
          </div>
        </div>
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
          <CheckCircle size={14} />{msg}
        </div>
      )}

      {loading ? (
        <div className="text-white/40 p-8 text-center">Chargement...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {configs.map(config => (
            <div key={config.id} className={`card p-5 ${config.actif ? 'border-green-500/20 bg-green-500/3' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-navy-700 flex items-center justify-center text-2xl">
                    {PROVIDER_LOGOS[config.provider] || '💰'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{config.nom_affichage}</h3>
                    <p className="text-white/40 text-xs mt-0.5">{config.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge text-[10px] ${config.actif ? 'badge-safe' : ''}`} style={!config.actif ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' } : {}}>
                    {config.actif ? 'Actif' : 'Inactif'}
                  </span>
                  <span className="badge badge-info text-[10px]">{config.mode}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={() => openEdit(config)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs hover:bg-blue-500/20 transition-all">
                    <CreditCard size={12} />Configurer
                  </button>
                  {providerDocs[config.provider] && (
                    <a href={providerDocs[config.provider]} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white/40 rounded-lg text-xs hover:bg-white/10 hover:text-white transition-all">
                      Docs API
                    </a>
                  )}
                </div>
                <button onClick={() => toggleActive(config)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${config.actif ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}>
                  {config.actif ? 'Desactiver' : 'Activer'}
                </button>
              </div>

              {config.actif && config.config_json?.api_key && (
                <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle size={12} />Cles API configurees
                </div>
              )}
              {!config.config_json?.api_key && (
                <div className="mt-3 text-xs text-white/30">
                  Aucune cle API configuree
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal configuration */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 w-full max-w-lg my-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                <span className="text-2xl">{PROVIDER_LOGOS[editing.provider]}</span>
                {editing.nom_affichage}
              </h2>
              <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="input-label">Mode</label>
                <select value={editing.mode} onChange={e => setEditing({...editing, mode: e.target.value})} className="input-field">
                  <option value="test">Test (sandbox)</option>
                  <option value="production">Production (live)</option>
                </select>
                {editing.mode === 'production' && (
                  <p className="text-orange-400 text-xs mt-1">⚠️ Mode production — les vraies transactions seront traitees.</p>
                )}
              </div>

              {[
                { key: 'api_key', label: 'Cle API / Public Key', placeholder: 'pk_test_...' },
                { key: 'secret_key', label: 'Cle secrete / Secret Key', placeholder: 'sk_test_...' },
                { key: 'webhook_secret', label: 'Webhook Secret (optionnel)', placeholder: 'whsec_...' },
                { key: 'endpoint', label: 'Endpoint URL (si applicable)', placeholder: 'https://...' },
              ].map(field => (
                <div key={field.key}>
                  <label className="input-label">{field.label}</label>
                  <div className="relative">
                    <input
                      type={showKeys[field.key] ? 'text' : 'password'}
                      value={(editing as any)[field.key] || ''}
                      onChange={e => setEditing({...editing, [field.key]: e.target.value})}
                      placeholder={field.placeholder}
                      className="input-field pr-10"
                    />
                    <button type="button" onClick={() => setShowKeys({...showKeys, [field.key]: !showKeys[field.key]})}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                      {showKeys[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setEditing({...editing, actif: !editing.actif})}
                  className={`w-11 h-6 rounded-full transition-all ${editing.actif ? 'bg-orange-500' : 'bg-navy-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${editing.actif ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm text-white/70">Activer ce moyen de paiement</span>
              </div>

              <div className="p-3 bg-navy-700 rounded-xl">
                <p className="text-white/40 text-xs">
                  Les cles sont chiffrees et stockees de facon securisee. Ne partagez jamais vos cles secretes.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={saveConfig} disabled={saving} className="btn-primary flex-1 justify-center py-2.5">
                <CheckCircle size={14} />{saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button onClick={() => setEditing(null)} className="btn-secondary py-2.5 px-4">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
