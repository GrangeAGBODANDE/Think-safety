'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Pencil, CheckCircle, X, Plus, Trash2 } from 'lucide-react'

export default function AbonnementsAdminPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('subscription_plans').select('*').order('ordre')
    setPlans(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true)
    if (editing.id) {
      await supabase.from('subscription_plans').update({
        nom: editing.nom,
        description: editing.description,
        prix_mensuel: parseInt(editing.prix_mensuel) || 0,
        prix_annuel: parseInt(editing.prix_annuel) || 0,
        limite_annonces: parseInt(editing.limite_annonces) || 5,
        acces_commandes: editing.acces_commandes,
        acces_details_commandes: editing.acces_details_commandes,
        actif: editing.actif,
        fonctionnalites: editing.fonctionnalites_text?.split('\n').filter((f: string) => f.trim()) || [],
      }).eq('id', editing.id)
    } else {
      await supabase.from('subscription_plans').insert({
        nom: editing.nom,
        slug: editing.nom.toLowerCase().replace(/\s+/g, '-'),
        description: editing.description,
        prix_mensuel: parseInt(editing.prix_mensuel) || 0,
        prix_annuel: parseInt(editing.prix_annuel) || 0,
        limite_annonces: parseInt(editing.limite_annonces) || 5,
        acces_commandes: editing.acces_commandes,
        acces_details_commandes: editing.acces_details_commandes,
        actif: editing.actif,
        fonctionnalites: editing.fonctionnalites_text?.split('\n').filter((f: string) => f.trim()) || [],
        ordre: plans.length + 1,
      })
    }
    setMsg('Plan sauvegarde !')
    setEditing(null)
    load()
    setTimeout(() => setMsg(''), 3000)
    setSaving(false)
  }

  async function deletePlan(id: string) {
    if (!confirm('Supprimer ce plan ?')) return
    await supabase.from('subscription_plans').delete().eq('id', id)
    load()
  }

  const planColors: Record<string, string> = {
    gratuit: '#8B949E', basic: '#2196F3', professionnel: '#FF6B35', entreprise: '#9C27B0'
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Plans d&apos;abonnement</h1>
          <p className="text-white/40 text-sm">Configurez les offres pour les entreprises</p>
        </div>
        <button onClick={() => setEditing({ nom: '', description: '', prix_mensuel: 0, prix_annuel: 0, limite_annonces: 5, acces_commandes: true, acces_details_commandes: false, actif: true, fonctionnalites_text: '' })}
          className="btn-primary py-2 px-5 text-sm">
          <Plus size={15} />Nouveau plan
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
          <CheckCircle size={14} />{msg}
        </div>
      )}

      {loading ? (
        <div className="text-white/40 p-8 text-center">Chargement...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {plans.map(plan => {
            const color = planColors[plan.slug] || '#FF6B35'
            return (
              <div key={plan.id} className="card p-5" style={!plan.actif ? { opacity: 0.5 } : {}}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-white text-lg">{plan.nom}</h3>
                      {!plan.actif && <span className="badge badge-danger text-[10px]">Inactif</span>}
                    </div>
                    <p className="text-white/40 text-sm mt-0.5">{plan.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing({ ...plan, fonctionnalites_text: (plan.fonctionnalites || []).join('\n') })}
                      className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => deletePlan(plan.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-navy-700 rounded-xl p-3">
                    <p className="text-white/40 text-xs">Prix mensuel</p>
                    <p className="text-white font-bold" style={{ color }}>
                      {plan.prix_mensuel === 0 ? 'Gratuit' : `${plan.prix_mensuel.toLocaleString()} FCFA`}
                    </p>
                  </div>
                  <div className="bg-navy-700 rounded-xl p-3">
                    <p className="text-white/40 text-xs">Prix annuel</p>
                    <p className="text-white font-bold" style={{ color }}>
                      {plan.prix_annuel === 0 ? 'Gratuit' : `${plan.prix_annuel.toLocaleString()} FCFA`}
                    </p>
                  </div>
                  <div className="bg-navy-700 rounded-xl p-3">
                    <p className="text-white/40 text-xs">Limite annonces</p>
                    <p className="text-white font-bold">{plan.limite_annonces >= 999 ? 'Illimitees' : plan.limite_annonces}</p>
                  </div>
                  <div className="bg-navy-700 rounded-xl p-3">
                    <p className="text-white/40 text-xs">Details commandes</p>
                    <p className={`font-bold text-sm ${plan.acces_details_commandes ? 'text-green-400' : 'text-red-400'}`}>
                      {plan.acces_details_commandes ? '✓ Oui' : '✗ Non'}
                    </p>
                  </div>
                </div>

                {(plan.fonctionnalites || []).length > 0 && (
                  <ul className="space-y-1">
                    {plan.fonctionnalites.slice(0, 4).map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-white/50">
                        <CheckCircle size={11} style={{ color }} />{f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal edition */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 w-full max-w-lg my-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-white text-lg">{editing.id ? 'Modifier' : 'Nouveau'} plan</h2>
              <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="input-label">Nom du plan *</label>
                <input type="text" value={editing.nom} onChange={e => setEditing({...editing, nom: e.target.value})} placeholder="Professionnel" className="input-field" />
              </div>
              <div>
                <label className="input-label">Description</label>
                <input type="text" value={editing.description || ''} onChange={e => setEditing({...editing, description: e.target.value})} placeholder="Pour les entreprises en croissance" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Prix mensuel (FCFA)</label>
                  <input type="number" value={editing.prix_mensuel} onChange={e => setEditing({...editing, prix_mensuel: e.target.value})} placeholder="15000" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Prix annuel (FCFA)</label>
                  <input type="number" value={editing.prix_annuel} onChange={e => setEditing({...editing, prix_annuel: e.target.value})} placeholder="150000" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Limite annonces</label>
                  <input type="number" value={editing.limite_annonces} onChange={e => setEditing({...editing, limite_annonces: e.target.value})} placeholder="20" className="input-field" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setEditing({...editing, acces_commandes: !editing.acces_commandes})}
                    className={`w-11 h-6 rounded-full transition-all ${editing.acces_commandes ? 'bg-orange-500' : 'bg-navy-600'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${editing.acces_commandes ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-sm text-white/70">Acces aux commandes</span>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setEditing({...editing, acces_details_commandes: !editing.acces_details_commandes})}
                    className={`w-11 h-6 rounded-full transition-all ${editing.acces_details_commandes ? 'bg-orange-500' : 'bg-navy-600'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${editing.acces_details_commandes ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-sm text-white/70">Details complets des commandes (telephone, email, adresse)</span>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setEditing({...editing, actif: !editing.actif})}
                    className={`w-11 h-6 rounded-full transition-all ${editing.actif ? 'bg-orange-500' : 'bg-navy-600'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${editing.actif ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <span className="text-sm text-white/70">Plan actif (visible aux entreprises)</span>
                </div>
              </div>
              <div>
                <label className="input-label">Fonctionnalites (une par ligne)</label>
                <textarea value={editing.fonctionnalites_text || ''} onChange={e => setEditing({...editing, fonctionnalites_text: e.target.value})}
                  rows={5} placeholder="20 annonces&#10;Acces details commandes&#10;Support email" className="input-field resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center py-2.5">
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
