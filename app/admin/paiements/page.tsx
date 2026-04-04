'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CreditCard, CheckCircle, X, Eye, EyeOff, Zap, ExternalLink } from 'lucide-react'

const PROVIDER_CONFIG: Record<string, {
  logo: string
  color: string
  docs: string
  fields: { key: string; label: string; placeholder: string; help?: string }[]
}> = {
  stripe: {
    logo: '💳', color: '#6772E5',
    docs: 'https://dashboard.stripe.com/apikeys',
    fields: [
      { key: 'public_key', label: 'Publishable Key', placeholder: 'pk_test_...', help: 'Cle publique (commence par pk_test_ en test)' },
      { key: 'secret_key', label: 'Secret Key', placeholder: 'sk_test_...', help: 'Cle secrete (commence par sk_test_ en test)' },
      { key: 'webhook_secret', label: 'Webhook Secret', placeholder: 'whsec_...', help: 'Depuis Stripe Dashboard > Developers > Webhooks' },
    ]
  },
  paypal: {
    logo: '🅿️', color: '#003087',
    docs: 'https://developer.paypal.com/dashboard/applications',
    fields: [
      { key: 'client_id', label: 'Client ID', placeholder: 'AX...', help: 'Depuis PayPal Developer > My Apps > App credentials' },
      { key: 'client_secret', label: 'Client Secret', placeholder: 'EK...', help: 'Secret correspondant au Client ID' },
    ]
  },
  fedapay: {
    logo: '🌍', color: '#00A86B',
    docs: 'https://docs.fedapay.com',
    fields: [
      { key: 'public_key', label: 'Public Key', placeholder: 'pk_sandbox_...', help: 'Depuis FedaPay Dashboard > API Keys' },
      { key: 'secret_key', label: 'Secret Key', placeholder: 'sk_sandbox_...', help: 'Cle secrete FedaPay' },
      { key: 'webhook_secret', label: 'Webhook Secret', placeholder: 'whsec_...', help: 'Pour valider les notifications de paiement' },
    ]
  },
  kakiapay: {
    logo: '🟢', color: '#00C896',
    docs: 'https://kkiapay.me/documentation/',
    fields: [
      { key: 'api_key', label: 'API Key', placeholder: 'kk_...', help: 'Depuis votre espace KkiaPay > Parametres > API' },
      { key: 'secret_key', label: 'Secret Key', placeholder: 'sk_...', help: 'Cle secrete pour signer les requetes' },
      { key: 'sandbox_key', label: 'Sandbox Key (test)', placeholder: 'kk_sandbox_...', help: 'Cle de test KkiaPay' },
    ]
  },
  mtn_momo: {
    logo: '📱', color: '#FFCB00',
    docs: 'https://momodeveloper.mtn.com/',
    fields: [
      { key: 'subscription_key', label: 'Subscription Key', placeholder: 'Ocp-Apim-Subscription-Key', help: 'Depuis MTN MoMo Developer Portal' },
      { key: 'api_key', label: 'API Key', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', help: 'UUID genere lors de la creation du user' },
      { key: 'user_id', label: 'API User ID', placeholder: 'UUID v4', help: 'ID utilisateur API MTN MoMo' },
      { key: 'environment', label: 'Environnement', placeholder: 'sandbox ou mtncongo', help: 'sandbox pour les tests' },
    ]
  },
  orange_money: {
    logo: '🟠', color: '#FF6600',
    docs: 'https://docs.developer.orange.com/',
    fields: [
      { key: 'merchant_key', label: 'Merchant Key', placeholder: 'Votre cle marchand', help: 'Fournie par Orange lors de l inscription' },
      { key: 'api_username', label: 'API Username', placeholder: 'username', help: 'Identifiant API Orange Money' },
      { key: 'api_password', label: 'API Password', placeholder: '••••••••', help: 'Mot de passe API Orange Money' },
    ]
  },
  moov_money: {
    logo: '🔵', color: '#0066CC',
    docs: 'https://dev.moov-africa.bj',
    fields: [
      { key: 'api_key', label: 'API Key', placeholder: 'Votre cle API Moov', help: 'Fournie par Moov Africa' },
      { key: 'merchant_id', label: 'Merchant ID', placeholder: 'ID marchand', help: 'Votre identifiant marchand Moov' },
      { key: 'callback_url', label: 'Callback URL', placeholder: 'https://votre-site.com/api/moov/callback', help: 'URL de notification apres paiement' },
    ]
  },
  wave: {
    logo: '🌊', color: '#1EBCF0',
    docs: 'https://docs.wave.com/business-payments',
    fields: [
      { key: 'api_key', label: 'API Key', placeholder: 'wave_sn_prod_...', help: 'Depuis Wave Business > Integrations > API Keys' },
      { key: 'webhook_secret', label: 'Webhook Secret', placeholder: 'ws_...', help: 'Pour valider les webhooks Wave' },
    ]
  },
}

const PROVIDER_ORDER = ['fedapay', 'kakiapay', 'mtn_momo', 'orange_money', 'moov_money', 'wave', 'stripe', 'paypal']

export default function PaiementsPage() {
  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [testing, setTesting] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<Record<string, string>>({})

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('payment_configs').select('*').order('provider')
    const sorted = PROVIDER_ORDER
      .map(p => data?.find((c: any) => c.provider === p))
      .filter(Boolean)
    setConfigs(sorted as any[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function saveConfig() {
    setSaving(true)
    const cfg = PROVIDER_CONFIG[editing.provider]
    const config_json: Record<string, string> = {}
    if (cfg) {
      cfg.fields.forEach(f => {
        config_json[f.key] = editing[f.key] || ''
      })
    }
    await supabase.from('payment_configs').update({
      actif: editing.actif,
      mode: editing.mode,
      config_json,
    }).eq('id', editing.id)
    setMsg(`${editing.nom_affichage} configure avec succes !`)
    setEditing(null)
    load()
    setTimeout(() => setMsg(''), 3000)
    setSaving(false)
  }

  async function toggleActive(config: any) {
    const cfg = PROVIDER_CONFIG[config.provider]
    const hasKeys = cfg?.fields.some(f => config.config_json?.[f.key])
    if (!config.actif && !hasKeys) {
      setMsg(`⚠️ Configurez d'abord les cles API de ${config.nom_affichage} avant de l'activer.`)
      setTimeout(() => setMsg(''), 4000)
      openEdit(config)
      return
    }
    await supabase.from('payment_configs').update({ actif: !config.actif }).eq('id', config.id)
    load()
  }

  function openEdit(config: any) {
    const cfg = PROVIDER_CONFIG[config.provider]
    const editData: any = { ...config }
    if (cfg) {
      cfg.fields.forEach(f => {
        editData[f.key] = config.config_json?.[f.key] || ''
      })
    }
    setEditing(editData)
  }

  async function testConnection(config: any) {
    setTesting(config.provider)
    await new Promise(r => setTimeout(r, 1500))
    const hasKeys = PROVIDER_CONFIG[config.provider]?.fields.some(f => config.config_json?.[f.key])
    setTestResult(prev => ({
      ...prev,
      [config.provider]: hasKeys
        ? '✅ Cles configurees — test de connexion requis en production'
        : '❌ Aucune cle API configuree'
    }))
    setTesting(null)
    setTimeout(() => setTestResult(prev => {
      const n = { ...prev }
      delete n[config.provider]
      return n
    }), 5000)
  }

  const africaProviders = configs.filter(c =>
    ['fedapay', 'kakiapay', 'mtn_momo', 'orange_money', 'moov_money', 'wave'].includes(c.provider)
  )
  const intlProviders = configs.filter(c => ['stripe', 'paypal'].includes(c.provider))

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-white">Configuration des paiements</h1>
        <p className="text-white/40 text-sm">Configurez les passerelles de paiement pour les abonnements et commandes</p>
      </div>

      <div className="card p-4 mb-6 border-blue-500/20 bg-blue-500/5">
        <div className="flex items-start gap-3">
          <Zap size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium text-sm mb-1">Integration prete a connecter</p>
            <p className="text-white/50 text-sm">
              Toutes les passerelles sont preparees. Ajoutez vos cles API quand vous etes pret.
              Les paiements restent desactives tant qu&apos;une passerelle n&apos;est pas configuree et activee.
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
        <div className="space-y-8">

          <div>
            <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
              🌍 <span>Paiements Afrique de l&apos;Ouest</span>
              <span className="badge badge-safe text-[10px]">Recommandes</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {africaProviders.map(config => (
                <ProviderCard
                  key={config.id}
                  config={config}
                  onEdit={() => openEdit(config)}
                  onToggle={() => toggleActive(config)}
                  onTest={() => testConnection(config)}
                  testing={testing === config.provider}
                  testResult={testResult[config.provider]}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display font-bold text-white mb-4">💳 Paiements Internationaux</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {intlProviders.map(config => (
                <ProviderCard
                  key={config.id}
                  config={config}
                  onEdit={() => openEdit(config)}
                  onToggle={() => toggleActive(config)}
                  onTest={() => testConnection(config)}
                  testing={testing === config.provider}
                  testResult={testResult[config.provider]}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 px-4 py-6 overflow-y-auto">
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 w-full max-w-lg my-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                <span className="text-2xl">{PROVIDER_CONFIG[editing.provider]?.logo || '💰'}</span>
                {editing.nom_affichage}
              </h2>
              <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="input-label">Mode d&apos;operation</label>
                <select
                  value={editing.mode}
                  onChange={e => setEditing({ ...editing, mode: e.target.value })}
                  className="input-field"
                >
                  <option value="test">Test (Sandbox) — Aucune vraie transaction</option>
                  <option value="production">Production (Live) — Vraies transactions</option>
                </select>
                {editing.mode === 'production' && (
                  <p className="text-orange-400 text-xs mt-1">
                    ⚠️ Mode production actif — les vraies transactions seront traitees.
                  </p>
                )}
              </div>

              {PROVIDER_CONFIG[editing.provider]?.fields.map(field => (
                <div key={field.key}>
                  <label className="input-label">{field.label}</label>
                  <div className="relative">
                    <input
                      type={showKeys[field.key] ? 'text' : 'password'}
                      value={editing[field.key] || ''}
                      onChange={e => setEditing({ ...editing, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showKeys[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {field.help && <p className="text-white/30 text-xs mt-1">{field.help}</p>}
                </div>
              ))}

              {PROVIDER_CONFIG[editing.provider]?.docs && (
                <a
                  href={PROVIDER_CONFIG[editing.provider].docs}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-blue-400 text-sm hover:text-blue-300 transition-colors"
                >
                  <ExternalLink size={14} />
                  Voir la documentation officielle {editing.nom_affichage}
                </a>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, actif: !editing.actif })}
                  className={`w-11 h-6 rounded-full transition-all ${editing.actif ? 'bg-orange-500' : 'bg-navy-600'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${editing.actif ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm text-white/70">Activer ce moyen de paiement</span>
              </div>

              <div className="p-3 bg-navy-700 rounded-xl">
                <p className="text-white/40 text-xs">
                  🔒 Les cles sont stockees de facon securisee. Ne partagez jamais vos cles secretes.
                  Utilisez toujours le mode test avant la production.
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

function ProviderCard({ config, onEdit, onToggle, onTest, testing, testResult }: any) {
  const cfg = PROVIDER_CONFIG[config.provider]
  const hasKeys = cfg?.fields.some((f: any) => config.config_json?.[f.key])

  return (
    <div className={`card p-5 transition-all ${config.actif ? 'border-green-500/20' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-navy-700 flex items-center justify-center text-2xl flex-shrink-0">
            {cfg?.logo || '💰'}
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{config.nom_affichage}</h3>
            <p className="text-white/40 text-xs mt-0.5">{config.description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`badge text-[10px] ${config.actif ? 'badge-safe' : ''}`}
            style={!config.actif ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' } : {}}
          >
            {config.actif ? '● Actif' : '○ Inactif'}
          </span>
          <span className="badge badge-info text-[10px]">{config.mode}</span>
        </div>
      </div>

      <div className={`flex items-center gap-2 text-xs mb-4 px-3 py-2 rounded-lg ${
        hasKeys ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'
      }`}>
        {hasKeys
          ? <><CheckCircle size={12} />Cles API configurees</>
          : <><div className="w-3 h-3 rounded-full border border-white/20" />Aucune cle API — configuration requise</>
        }
      </div>

      {testResult && (
        <div className="text-xs mb-3 px-3 py-2 rounded-lg bg-navy-700 text-white/70">
          {testResult}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs hover:bg-blue-500/20 transition-all"
        >
          <CreditCard size={12} />Configurer
        </button>

        {cfg?.docs && (
          <a
            href={cfg.docs}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 text-white/40 rounded-lg text-xs hover:bg-white/10 hover:text-white transition-all"
          >
            <ExternalLink size={11} />Docs
          </a>
        )}

        <button
          onClick={onTest}
          disabled={testing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-lg text-xs hover:bg-purple-500/20 transition-all"
        >
          {testing ? '...' : '🔌 Tester'}
        </button>

        <button
          onClick={onToggle}
          className={`ml-auto px-3 py-1.5 rounded-lg text-xs transition-all ${
            config.actif
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
          }`}
        >
          {config.actif ? 'Desactiver' : 'Activer'}
        </button>
      </div>
    </div>
  )
}
